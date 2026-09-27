import {
  EventOperationalLiveState,
  EventOperationalStatus,
  GateOperationalState,
  GateOperationalStatus,
  TransportOperationalState,
  ParkingOperationalState,
  HospitalityOperationalState,
  OperationalAlert,
  OperationalActionLog,
  EventReadinessChecklist,
} from "../types/operational";
import { AppEvent } from "../types/event";
import { getAllBookings } from "./bookingService";
import { getStoredEventById } from "./eventStorageService";
import { LiveEventService, loadAllLiveStatesFromStorage, persistLiveStatesToStorage } from "./liveEventService";

const LIVE_STATE_STORAGE_KEY = "eventflow_live_state";

function parseNumeric(val: string | number | undefined, defaultVal: number = 0): number {
  if (val === undefined || val === null) return defaultVal;
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/,/g, "").trim();
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? defaultVal : parsed;
}

/**
 * Initializes a structured operational live state from an AppEvent configuration.
 */
export function createDefaultLiveState(event: AppEvent): EventOperationalLiveState {
  return LiveEventService.getEventLiveState(event.id, event);
}

/**
 * Loads all stored operational states from eventflow_live_state.
 */
export function getAllLiveStates(): Record<string, EventOperationalLiveState> {
  return loadAllLiveStatesFromStorage();
}

/**
 * Saves all operational states into eventflow_live_state.
 */
export function saveAllLiveStates(states: Record<string, EventOperationalLiveState>): void {
  persistLiveStatesToStorage(states);
}

/**
 * Retrieves the operational live state for an event, automatically bootstrapping if absent.
 */
export function getEventLiveState(eventId: string, fallbackEvent?: AppEvent): EventOperationalLiveState {
  return LiveEventService.getEventLiveState(eventId, fallbackEvent);
}

/**
 * Saves an updated live state and records it in storage.
 */
export function saveEventLiveState(state: EventOperationalLiveState): EventOperationalLiveState {
  return LiveEventService.updateEventState(state.eventId, () => state, {
    changedBy: state.updatedBy || "Operator",
    sourceType: state.sourceType || "MANUAL",
  });
}

/**
 * Permanently removes the operational live state, gates, hospitality, and alerts for an event.
 */
export function deleteEventLiveState(eventId: string): boolean {
  try {
    const allStates = getAllLiveStates();
    if (allStates[eventId]) {
      delete allStates[eventId];
      saveAllLiveStates(allStates);
      return true;
    }
    return false;
  } catch (err) {
    console.error("Failed to delete event live state:", err);
    return false;
  }
}

/**
 * Records an operational action into the event's action log.
 */
export function recordOperationalAction(
  eventId: string,
  logData: {
    action: string;
    resource: string;
    user: string;
    previousState?: string;
    newState?: string;
    details?: string;
  }
): OperationalActionLog {
  const newLog: OperationalActionLog = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    eventId,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    action: logData.action,
    resource: logData.resource,
    user: logData.user,
    previousState: logData.previousState,
    newState: logData.newState,
    details: logData.details,
  };

  LiveEventService.updateEventState(
    eventId,
    (state) => {
      const updatedActions = [newLog, ...(state.operationalActions || [])].slice(0, 50);
      state.operationalActions = updatedActions;
      state.actions = updatedActions;
      state.updatedBy = logData.user;
    },
    {
      resource: logData.resource,
      oldValue: logData.previousState || "",
      newValue: logData.newState || "",
      changedBy: logData.user,
      reason: logData.action,
      sourceType: "MANUAL",
    }
  );

  return newLog;
}

/**
 * Updates an event's operational lifecycle status (UPCOMING, PREPARING, LIVE, COMPLETED).
 */
export function updateEventStatus(
  eventId: string,
  newStatus: EventOperationalStatus,
  user: string
): EventOperationalLiveState {
  if (newStatus === "LIVE") {
    return LiveEventService.startEvent(eventId, user);
  } else if (newStatus === "PREPARING") {
    return LiveEventService.pauseEvent(eventId, user);
  } else if (newStatus === "COMPLETED") {
    return LiveEventService.completeEvent(eventId, user);
  } else {
    return LiveEventService.updateEventState(
      eventId,
      (state) => {
        state.status = newStatus;
        state.eventStatus = newStatus;
      },
      {
        resource: "Event Lifecycle",
        oldValue: "STATUS_UPDATE",
        newValue: newStatus,
        changedBy: user,
        reason: `Event lifecycle status changed to ${newStatus}`,
        sourceType: "MANUAL",
      }
    );
  }
}

/**
 * Updates a specific gate's operational status.
 */
export function updateGateStatus(
  eventId: string,
  gateId: string,
  status: GateOperationalStatus,
  user: string,
  operationalNote?: string
): EventOperationalLiveState {
  return LiveEventService.updateEventState(
    eventId,
    (state) => {
      const gate = state.gateStates[gateId];
      if (!gate) return;
      gate.status = status;
      if (operationalNote !== undefined) {
        gate.operationalNote = operationalNote;
      }
      gate.lastUpdated = new Date().toISOString();
    },
    {
      resource: `Gate ${gateId}`,
      oldValue: "STATUS",
      newValue: status,
      changedBy: user,
      reason: operationalNote || `Gate marked as ${status}`,
      sourceType: "MANUAL",
    }
  );
}

/**
 * Increases or updates gate throughput / lane capacity.
 */
export function updateGateCapacity(
  eventId: string,
  gateId: string,
  additionalLanes: number,
  scanningMultiplier: number,
  user: string
): EventOperationalLiveState {
  return LiveEventService.updateEventState(
    eventId,
    (state) => {
      const gate = state.gateStates[gateId];
      if (!gate) return;
      gate.additionalLanes = additionalLanes;
      gate.scanningCapacityMultiplier = scanningMultiplier;
      gate.lastUpdated = new Date().toISOString();
    },
    {
      resource: `Gate ${gateId}`,
      oldValue: "LANES",
      newValue: `+${additionalLanes} lanes`,
      changedBy: user,
      reason: `Capacity multiplier updated to ${scanningMultiplier}x`,
      sourceType: "MANUAL",
    }
  );
}

/**
 * Updates a transport resource's state.
 */
export function updateTransportState(
  eventId: string,
  transportId: string,
  updates: Partial<TransportOperationalState>,
  user: string
): EventOperationalLiveState {
  return LiveEventService.updateEventState(
    eventId,
    (state) => {
      const current = state.transportState[transportId];
      if (current) {
        state.transportState[transportId] = { ...current, ...updates };
      }
      const monitored = state.transportResources[transportId];
      if (monitored) {
        if (updates.capacity !== undefined) monitored.capacity = updates.capacity;
        if (updates.currentDemand !== undefined) monitored.currentUsage = updates.currentDemand;
        if (monitored.capacity > 0) {
          monitored.utilization = Math.round((monitored.currentUsage / monitored.capacity) * 100);
        }
        if (updates.status) monitored.status = updates.status;
        monitored.lastUpdated = new Date().toISOString();
      }
    },
    {
      resource: `Transit ${transportId}`,
      oldValue: "PREVIOUS",
      newValue: updates.status || String(updates.currentDemand) || "UPDATED",
      changedBy: user,
      reason: updates.notes || "Transport status modified",
      sourceType: "MANUAL",
    }
  );
}

/**
 * Updates parking spaces with strict validation.
 */
export function updateParkingState(
  eventId: string,
  parkingId: string,
  updates: Partial<ParkingOperationalState>,
  user: string
): { state: EventOperationalLiveState; error?: string } {
  const state = getEventLiveState(eventId);
  const current = state.parkingState[parkingId];
  if (!current) return { state };

  const total = updates.totalSpaces !== undefined ? Math.max(0, updates.totalSpaces) : current.totalSpaces;
  let occupied = updates.occupiedSpaces !== undefined ? Math.max(0, updates.occupiedSpaces) : current.occupiedSpaces;
  let available = updates.availableSpaces !== undefined ? Math.max(0, updates.availableSpaces) : current.availableSpaces;

  if (occupied > total) {
    return { state, error: `Occupied spaces (${occupied}) cannot exceed total capacity (${total}).` };
  }

  if (occupied + available > total) {
    available = Math.max(0, total - occupied);
  }

  let autoStatus = current.status;
  if (updates.status) {
    autoStatus = updates.status;
  } else {
    const occRatio = total > 0 ? occupied / total : 0;
    if (occRatio >= 1) autoStatus = "FULL";
    else if (occRatio >= 0.85) autoStatus = "NEAR CAPACITY";
    else if (occRatio >= 0.6) autoStatus = "FILLING";
    else autoStatus = "AVAILABLE";
  }

  const updatedState = LiveEventService.updateEventState(
    eventId,
    (curr) => {
      curr.parkingState[parkingId] = {
        ...current,
        ...updates,
        totalSpaces: total,
        occupiedSpaces: occupied,
        availableSpaces: available,
        status: autoStatus,
      };

      const monitored = curr.parkingResources[parkingId];
      if (monitored) {
        monitored.capacity = total;
        monitored.currentUsage = occupied;
        monitored.utilization = total > 0 ? Math.round((occupied / total) * 100) : 0;
        monitored.status = autoStatus;
        monitored.lastUpdated = new Date().toISOString();
        monitored.details = `Available: ${available}`;
      }
    },
    {
      resource: current.zoneName || `Parking ${parkingId}`,
      oldValue: `${current.availableSpaces} available`,
      newValue: `${available} available (${autoStatus})`,
      changedBy: user,
      reason: "Parking inventory updated",
      sourceType: "MANUAL",
    }
  );

  return { state: updatedState };
}

/**
 * Updates a hospitality resource state.
 */
export function updateHospitalityState(
  eventId: string,
  hospitalityId: string,
  updates: Partial<HospitalityOperationalState>,
  user: string
): EventOperationalLiveState {
  return LiveEventService.updateEventState(
    eventId,
    (state) => {
      const current = state.hospitalityState[hospitalityId];
      if (current) {
        state.hospitalityState[hospitalityId] = { ...current, ...updates };
      }
      const monitored = state.hospitalityResources[hospitalityId];
      if (monitored) {
        if (updates.status) monitored.status = updates.status;
        monitored.lastUpdated = new Date().toISOString();
      }
    },
    {
      resource: `Hospitality ${hospitalityId}`,
      oldValue: "PREVIOUS",
      newValue: updates.status || "UPDATED",
      changedBy: user,
      reason: updates.notes || "Hospitality status modified",
      sourceType: "MANUAL",
    }
  );
}

/**
 * Creates and stores an operational alert in shared event state.
 */
export function createOperationalAlert(
  alertData: Omit<OperationalAlert, "id" | "createdAt" | "status">
): OperationalAlert {
  const newAlert: OperationalAlert = {
    ...alertData,
    id: `alt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    status: "ACTIVE",
  };

  LiveEventService.updateEventState(
    alertData.eventId,
    (state) => {
      state.activeAlerts = [newAlert, ...(state.activeAlerts || [])];
      state.alerts = [newAlert, ...(state.alerts || [])];
    },
    {
      resource: alertData.affectedGate || alertData.affectedArea || "Broadcast",
      oldValue: "NONE",
      newValue: alertData.severity,
      changedBy: alertData.createdBy,
      reason: `Published alert: "${alertData.title}"`,
      sourceType: "MANUAL",
    }
  );

  return newAlert;
}

/**
 * Resolves an active operational alert.
 */
export function resolveOperationalAlert(
  eventId: string,
  alertId: string,
  user: string
): EventOperationalLiveState {
  return LiveEventService.updateEventState(
    eventId,
    (state) => {
      const target = (state.activeAlerts || []).find((a) => a.id === alertId);
      if (target) {
        target.status = "RESOLVED";
        target.resolvedAt = new Date().toISOString();
        state.activeAlerts = state.activeAlerts.filter((a) => a.id !== alertId);
      }
    },
    {
      resource: "Alert Center",
      oldValue: "ACTIVE",
      newValue: "RESOLVED",
      changedBy: user,
      reason: `Resolved alert ${alertId}`,
      sourceType: "MANUAL",
    }
  );
}

/**
 * Computes event operational readiness based on actual configuration and stored state.
 */
export function computeEventReadiness(
  event: AppEvent,
  liveState: EventOperationalLiveState
): EventReadinessChecklist {
  const allBookings = getAllBookings().filter((b) => b.eventId === event.id);
  const soldCount = allBookings.reduce((sum, b) => sum + (b.quantity || 1), 0);
  const totalCapacity = parseNumeric(event.capacity, 10000);

  const gatesCount = Object.keys(liveState.gateStates || {}).length;
  const gatesReady = gatesCount > 0;

  const transportCount = Object.keys(liveState.transportState || {}).length;
  const transportReady = transportCount > 0;

  const parkingLots = Object.values(liveState.parkingState || {});
  const totalAvailableParking = parkingLots.reduce((sum, p) => sum + p.availableSpaces, 0);
  const parkingReady = parkingLots.length > 0;

  const hospitalityCount = Object.keys(liveState.hospitalityState || {}).length;
  const hospitalityReady = hospitalityCount > 0;

  const scheduleCount = event.schedule?.length || 0;
  const scheduleReady = scheduleCount > 0;

  const venueReady = Boolean(event.venue && event.location && event.district);
  const ticketReady = totalCapacity > 0;
  const alertsReady = true;

  const items = [venueReady, gatesReady, ticketReady, transportReady, parkingReady, hospitalityReady, scheduleReady, alertsReady];
  const completedCount = items.filter(Boolean).length;
  const overallPercent = Math.round((completedCount / items.length) * 100);

  return {
    venue: {
      isReady: venueReady,
      notes: venueReady ? `Venue & GPS geofence verified: ${event.venue}` : "Missing venue location details.",
    },
    gates: {
      isReady: gatesReady,
      count: gatesCount,
      notes: gatesReady ? `${gatesCount} perimeter gates configured with ticket groups` : "No ingress gates defined.",
    },
    ticketInventory: {
      isReady: ticketReady,
      soldCount,
      totalCapacity,
      notes: `${soldCount} booked / ${totalCapacity} capacity verified`,
    },
    transport: {
      isReady: transportReady,
      activeCount: transportCount,
      notes: transportReady ? `${transportCount} transit lines & shuttle corridors active` : "No transit services listed.",
    },
    parking: {
      isReady: parkingReady,
      availableSpaces: totalAvailableParking,
      notes: parkingReady ? `${parkingLots.length} parking zones (${totalAvailableParking} free spaces)` : "No parking zones mapped.",
    },
    hospitality: {
      isReady: hospitalityReady,
      operationalCount: hospitalityCount,
      notes: hospitalityReady ? `${hospitalityCount} food, medical & hydration services online` : "No on-site services configured.",
    },
    schedule: {
      isReady: scheduleReady,
      itemsCount: scheduleCount,
      notes: scheduleReady ? `${scheduleCount} timeline agenda sessions published` : "Event schedule empty.",
    },
    alerts: {
      isReady: alertsReady,
      activeCount: (liveState.activeAlerts || []).length,
      notes: `${(liveState.activeAlerts || []).length} active operational notices broadcasted`,
    },
    overallPercent,
  };
}

/**
 * Generates rule-based operational suggestions based strictly on stored values.
 * NOT AI-generated.
 */
export function computeRuleBasedSuggestions(
  event: AppEvent,
  liveState: EventOperationalLiveState
): Array<{
  id: string;
  type: "gate" | "parking" | "transport" | "alert" | "capacity";
  text: string;
  severity: "info" | "warning" | "critical";
  recommendation: string;
}> {
  const suggestions: Array<{
    id: string;
    type: "gate" | "parking" | "transport" | "alert" | "capacity";
    text: string;
    severity: "info" | "warning" | "critical";
    recommendation: string;
  }> = [];

  // 1. Check Gates for High Pressure or Congestion
  Object.values(liveState.gateStates || {}).forEach((g) => {
    if (g.status === "HIGH PRESSURE" || g.status === "BUSY") {
      const eligibleAlternates = g.alternateGateIds
        .map((altId) => liveState.gateStates[altId]?.name)
        .filter(Boolean);

      suggestions.push({
        id: `sug-gate-${g.id}`,
        type: "gate",
        text: `Gate "${g.name}" is currently marked as ${g.status}.`,
        severity: g.status === "HIGH PRESSURE" ? "critical" : "warning",
        recommendation:
          eligibleAlternates.length > 0
            ? `Rule suggestion: Consider expanding lanes or advising eligible ticket holders (${g.allowedTicketGroups.join(
                ", "
              )}) towards ${eligibleAlternates.join(" or ")}.`
            : `Rule suggestion: Increase auxiliary scanning lanes or turnstile staff at this gate.`,
      });
    }
  });

  // 2. Check Parking
  Object.values(liveState.parkingState || {}).forEach((p) => {
    if (p.status === "FULL" || p.status === "NEAR CAPACITY" || p.availableSpaces <= 25) {
      suggestions.push({
        id: `sug-park-${p.id}`,
        type: "parking",
        text: `Parking zone "${p.zoneName}" has only ${p.availableSpaces} spaces remaining.`,
        severity: p.status === "FULL" ? "critical" : "warning",
        recommendation: `Rule suggestion: Issue a parking advisory or divert incoming private vehicles to public transit drop-off bays.`,
      });
    }
  });

  // 3. Check Transport Disruption
  Object.values(liveState.transportState || {}).forEach((t) => {
    if (t.status === "DISRUPTED" || t.status === "DELAYED" || t.status === "ELEVATED") {
      suggestions.push({
        id: `sug-trans-${t.id}`,
        type: "transport",
        text: `Transit corridor "${t.name}" is operating at ${t.status} status.`,
        severity: t.status === "DISRUPTED" ? "critical" : "warning",
        recommendation: `Rule suggestion: Dispatch backup shuttle services or notify arriving attendees through an EventFlow alert.`,
      });
    }
  });

  // 4. Check Venue Occupancy
  if (liveState.crowdState.occupancyPercent >= 90) {
    suggestions.push({
      id: `sug-occ-high`,
      type: "capacity",
      text: `Venue occupancy is at ${liveState.crowdState.occupancyPercent}% (${liveState.crowdState.currentAttendance} attendees).`,
      severity: "critical",
      recommendation: `Rule suggestion: Restrict non-ticketed ingress and prepare exit gates for staged dispersal.`,
    });
  }

  return suggestions;
}
