/**
 * LiveEventService
 * Centralized Live Event Engine for EventFlow.
 * Responsible for maintaining the current state of every LIVE event.
 *
 * Flow:
 * DATA UPDATE -> CENTRAL EVENT STATE -> ALL RELEVANT DASHBOARDS
 */

import {
  EventOperationalLiveState,
  EventOperationalStatus,
  EventCrowdZone,
  MonitoredResource,
  LiveTelemetryValues,
  OperationalAuditEntry,
  TelemetrySourceType,
  CentralUtilizationStatus,
  OperationalAlert,
  AttendeeGuidanceDecision,
  ActionVerificationRecord,
  calculateUtilizationStatus,
  DEFAULT_UTILIZATION_THRESHOLDS,
  UtilizationThresholds,
} from "../types/operational";
import { AppEvent } from "../types/event";
import { getStoredEventById, getAllStoredEvents } from "./eventStorageService";
import { getAllBookings } from "./bookingService";
import { TelemetryHistoryService } from "./telemetryHistoryService";

const LIVE_STATE_STORAGE_KEY = "eventflow_live_state";
const AUDIT_LOG_STORAGE_KEY = "eventflow_live_audit_logs";
const STALE_DATA_THRESHOLD_MS = 60 * 1000; // 60 seconds without tick/update = DATA STALE

// In-memory cache for ultra-fast reactive pub-sub without disk overhead
const memoryLiveStates: Record<string, EventOperationalLiveState> = {};
const listeners: Map<string, Set<(state: EventOperationalLiveState) => void>> = new Map();

function parseNumeric(val: string | number | undefined, defaultVal: number = 0): number {
  if (val === undefined || val === null) return defaultVal;
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/,/g, "").trim();
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? defaultVal : parsed;
}

/**
 * Initializes a default live operational state for an event.
 */
export function buildInitialEventLiveState(event: AppEvent): EventOperationalLiveState {
  const allBookings = getAllBookings().filter((b) => b.eventId === event.id);
  const ticketsSold = allBookings.reduce((sum, b) => sum + (b.quantity || 1), 0);
  const capacity = parseNumeric(event.capacity, 10000);
  const expectedAttendance = parseNumeric(event.expectedAttendance, Math.max(ticketsSold, 8500));

  let initialStatus: EventOperationalStatus = "PREPARING";
  if (event.statusBadge?.toLowerCase().includes("live") || (event as any).status === "live") {
    initialStatus = "LIVE";
  } else if (event.statusBadge?.toLowerCase().includes("completed")) {
    initialStatus = "COMPLETED";
  } else if (event.statusBadge?.toLowerCase().includes("upcoming")) {
    initialStatus = "UPCOMING";
  }

  const initialAttendees = initialStatus === "LIVE" ? Math.round(expectedAttendance * 0.72) : 0;
  const crowdUtil = capacity > 0 ? Math.round((initialAttendees / capacity) * 100) : 0;

  // 1. Crowd Zones (Zone A, B, C, D)
  const zoneShare = [0.32, 0.28, 0.22, 0.18];
  const zoneNames = [
    "Zone A (North Ingress & Grandstand)",
    "Zone B (East Pavilion & Concourse)",
    "Zone C (West Stand & Club Level)",
    "Zone D (South Gate & Fan Plaza)",
  ];

  const crowdZones: Record<string, EventCrowdZone> = {};
  zoneNames.forEach((zName, i) => {
    const id = `zone-${String.fromCharCode(65 + i).toLowerCase()}`;
    const zCap = Math.round(capacity * zoneShare[i]);
    const zCount = Math.round(initialAttendees * zoneShare[i]);
    const zUtil = zCap > 0 ? Math.round((zCount / zCap) * 100) : 0;
    crowdZones[id] = {
      id,
      name: zName,
      capacity: zCap,
      currentCount: zCount,
      utilization: zUtil,
      status: calculateUtilizationStatus(zUtil),
      arrivalRate: initialStatus === "LIVE" ? Math.round(15 * zoneShare[i] * 4) : 0,
      exitRate: 0,
    };
  });

  // 2. Parking Resources
  const parkingResources: Record<string, MonitoredResource> = {};
  const parkingState: Record<string, any> = {};

  if (event.parking && event.parking.length > 0) {
    event.parking.forEach((p, idx) => {
      const total = parseNumeric(p.capacity, 500);
      const occupied = initialStatus === "LIVE" ? Math.round(total * 0.6) : 0;
      const util = total > 0 ? Math.round((occupied / total) * 100) : 0;
      const resourceId = p.id || `park-${idx}`;

      parkingResources[resourceId] = {
        resourceId,
        eventId: event.id,
        name: p.name || `Parking Zone ${idx + 1}`,
        type: "parking",
        capacity: total,
        currentUsage: occupied,
        utilization: util,
        status: calculateUtilizationStatus(util),
        lastUpdated: new Date().toISOString(),
        assignedZone: `Perimeter Parking Bay ${idx + 1}`,
        details: `Available: ${total - occupied} | Shuttle: ${p.shuttleAvailable ? "Active" : "None"}`,
      };

      parkingState[resourceId] = {
        id: resourceId,
        zoneName: p.name || `Parking Zone ${idx + 1}`,
        totalSpaces: total,
        availableSpaces: total - occupied,
        occupiedSpaces: occupied,
        status: util >= 90 ? "FULL" : util >= 75 ? "NEAR CAPACITY" : util >= 60 ? "FILLING" : "AVAILABLE",
        distanceFromVenue: "350m (4 min walk)",
        entryRoute: "Direct access via North Concourse",
        shuttleAvailable: p.shuttleAvailable ?? true,
        fee: p.fee || "₹200",
      };
    });
  } else {
    const defaultParking = [
      { id: "park-p1", name: "Parking P1 (Main North Boulevard)", cap: 1200 },
      { id: "park-p2", name: "Parking P2 (East Multi-level Bay)", cap: 800 },
      { id: "park-p3", name: "Parking P3 (South Surface Overflow)", cap: 500 },
    ];
    defaultParking.forEach((p) => {
      const occupied = initialStatus === "LIVE" ? Math.round(p.cap * 0.6) : 0;
      const util = Math.round((occupied / p.cap) * 100);
      parkingResources[p.id] = {
        resourceId: p.id,
        eventId: event.id,
        name: p.name,
        type: "parking",
        capacity: p.cap,
        currentUsage: occupied,
        utilization: util,
        status: calculateUtilizationStatus(util),
        lastUpdated: new Date().toISOString(),
        assignedZone: "Perimeter Parking",
        details: `Available: ${p.cap - occupied}`,
      };
      parkingState[p.id] = {
        id: p.id,
        zoneName: p.name,
        totalSpaces: p.cap,
        availableSpaces: p.cap - occupied,
        occupiedSpaces: occupied,
        status: util >= 90 ? "FULL" : util >= 75 ? "NEAR CAPACITY" : util >= 60 ? "FILLING" : "AVAILABLE",
        distanceFromVenue: "400m",
        entryRoute: "Main Boulevard",
        shuttleAvailable: true,
      };
    });
  }

  // 3. Transport Resources
  const transportResources: Record<string, MonitoredResource> = {};
  const transportState: Record<string, any> = {};

  if (event.transport && event.transport.length > 0) {
    event.transport.forEach((t, idx) => {
      const resourceId = `trans-${idx}-${t.type}`;
      const cap = t.type === "metro" ? 1500 : t.type === "shuttle" ? 120 : 300;
      const usage = initialStatus === "LIVE" ? Math.round(cap * 0.55) : 0;
      const util = Math.round((usage / cap) * 100);

      transportResources[resourceId] = {
        resourceId,
        eventId: event.id,
        name: t.title || `Transit Corridor ${idx + 1}`,
        type: "transport",
        capacity: cap,
        currentUsage: usage,
        utilization: util,
        status: calculateUtilizationStatus(util),
        lastUpdated: new Date().toISOString(),
        assignedZone: "Transit Terminal Hub",
        details: t.detail || "Operational",
      };

      transportState[resourceId] = {
        id: resourceId,
        name: t.title,
        type: t.type,
        capacity: cap,
        currentDemand: usage,
        status: util >= 85 ? "ELEVATED" : "NORMAL",
        pickupDropLocation: t.detail,
        operatingWindow: "Full Event Window",
      };
    });
  } else {
    const defaultTransit = [
      { id: "trans-metro-1", name: "Metro Line 3 Underground Corridor", cap: 2000, type: "metro" },
      { id: "trans-shuttle-s1", name: "Electric Feeder Shuttle Loop S1", cap: 160, type: "shuttle" },
      { id: "trans-shuttle-s2", name: "Express Station Connector S2", cap: 140, type: "shuttle" },
    ];
    defaultTransit.forEach((t) => {
      const usage = initialStatus === "LIVE" ? Math.round(t.cap * 0.55) : 0;
      const util = Math.round((usage / t.cap) * 100);
      transportResources[t.id] = {
        resourceId: t.id,
        eventId: event.id,
        name: t.name,
        type: "transport",
        capacity: t.cap,
        currentUsage: usage,
        utilization: util,
        status: calculateUtilizationStatus(util),
        lastUpdated: new Date().toISOString(),
        assignedZone: "Main Transit Bay",
        details: "Direct terminal connection",
      };
      transportState[t.id] = {
        id: t.id,
        name: t.name,
        type: t.type,
        capacity: t.cap,
        currentDemand: usage,
        status: util >= 85 ? "ELEVATED" : "NORMAL",
        pickupDropLocation: "Concourse Terminal",
        operatingWindow: "Continuous",
      };
    });
  }

  // 4. Hospitality & Accommodation Resources
  const hospitalityResources: Record<string, MonitoredResource> = {};
  const hospitalityState: Record<string, any> = {};

  const defaultHospitality = [
    { id: "hosp-dining-1", name: "North Concourse Dining & Beverages Hub", cap: 600, type: "hospitality" as const },
    { id: "hosp-hydration-1", name: "East Concourse Hydration & Relief Station", cap: 350, type: "hospitality" as const },
    { id: "hosp-med-1", name: "Emergency Medical & Paramedic Unit 1", cap: 50, type: "hospitality" as const },
  ];
  defaultHospitality.forEach((h) => {
    const usage = initialStatus === "LIVE" ? Math.round(h.cap * 0.45) : 0;
    const util = Math.round((usage / h.cap) * 100);
    hospitalityResources[h.id] = {
      resourceId: h.id,
      eventId: event.id,
      name: h.name,
      type: "hospitality",
      capacity: h.cap,
      currentUsage: usage,
      utilization: util,
      status: calculateUtilizationStatus(util),
      lastUpdated: new Date().toISOString(),
      assignedZone: "Internal Concourse",
      details: "Fully staffed",
    };
    hospitalityState[h.id] = {
      id: h.id,
      name: h.name,
      category: "Food Zones",
      capacity: h.cap,
      currentDemand: `${usage} pax`,
      status: "Operational",
      location: "Main Concourse",
      operatingHours: "Event Hours",
    };
  });

  const accommodationResources: Record<string, MonitoredResource> = {};
  const defaultAccommodations = [
    { id: "accom-grand-1", name: "Grand Concourse Regency & Suites", cap: 280 },
    { id: "accom-marine-1", name: "Marine Pearl Boutique Hotel", cap: 140 },
  ];
  defaultAccommodations.forEach((a) => {
    const usage = Math.round(a.cap * 0.78);
    const util = Math.round((usage / a.cap) * 100);
    accommodationResources[a.id] = {
      resourceId: a.id,
      eventId: event.id,
      name: a.name,
      type: "accommodation",
      capacity: a.cap,
      currentUsage: usage,
      utilization: util,
      status: calculateUtilizationStatus(util),
      lastUpdated: new Date().toISOString(),
      details: "Official hospitality partner",
    };
  });

  // Gates State compatibility
  const gateStates: Record<string, any> = {};
  if (event.gates && event.gates.length > 0) {
    event.gates.forEach((g, idx) => {
      const gateCount = initialStatus === "LIVE" ? Math.round(initialAttendees / event.gates.length) : 0;
      gateStates[g.id] = {
        id: g.id,
        name: g.name,
        status: g.status === "congested" ? "BUSY" : g.status === "critical" ? "HIGH PRESSURE" : "NORMAL",
        capacity: 150,
        currentCount: gateCount,
        entryRate: initialStatus === "LIVE" ? 18 : 0,
        assignedSections: g.assignedZones || ["General Ingress"],
        allowedTicketGroups: ["all"],
        alternateGateIds: [],
        additionalLanes: 0,
        scanningCapacityMultiplier: 1.0,
        lastUpdated: new Date().toISOString(),
      };
    });
  } else {
    gateStates["gate-main"] = {
      id: "gate-main",
      name: "Gate 1 (Main Ingress)",
      status: "NORMAL",
      capacity: 180,
      currentCount: initialAttendees,
      entryRate: initialStatus === "LIVE" ? 24 : 0,
      assignedSections: ["General Stalls"],
      allowedTicketGroups: ["all"],
      alternateGateIds: [],
      additionalLanes: 0,
      scanningCapacityMultiplier: 1.0,
      lastUpdated: new Date().toISOString(),
    };
  }

  // 5. Macro Telemetry Overview
  const avgParkingUtil =
    Object.values(parkingResources).length > 0
      ? Math.round(
          Object.values(parkingResources).reduce((s, p) => s + p.utilization, 0) /
            Object.values(parkingResources).length
        )
      : 60;
  const avgTransUtil =
    Object.values(transportResources).length > 0
      ? Math.round(
          Object.values(transportResources).reduce((s, t) => s + t.utilization, 0) /
            Object.values(transportResources).length
        )
      : 55;
  const avgHospUtil =
    Object.values(hospitalityResources).length > 0
      ? Math.round(
          Object.values(hospitalityResources).reduce((s, h) => s + h.utilization, 0) /
            Object.values(hospitalityResources).length
        )
      : 45;
  const avgAccomUtil =
    Object.values(accommodationResources).length > 0
      ? Math.round(
          Object.values(accommodationResources).reduce((s, a) => s + a.utilization, 0) /
            Object.values(accommodationResources).length
        )
      : 78;

  const telemetry: LiveTelemetryValues = {
    currentAttendees: initialAttendees,
    arrivalRate: initialStatus === "LIVE" ? 48 : 0,
    exitRate: 0,
    crowdUtilization: crowdUtil,
    parkingUtilization: avgParkingUtil,
    transportUtilization: avgTransUtil,
    hospitalityUtilization: avgHospUtil,
    accommodationUtilization: avgAccomUtil,
    status: calculateUtilizationStatus(crowdUtil),
    lastUpdated: new Date().toISOString(),
    sourceType: "REAL",
  };

  const defaultActionLogs = [
    {
      id: `act-${Date.now()}-init`,
      eventId: event.id,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      action: "Live Event Engine state initialized",
      resource: "Central System",
      user: "System",
      previousState: "UNINITIALIZED",
      newState: initialStatus,
      details: `Capacity: ${capacity.toLocaleString()} | Initial Status: ${initialStatus}`,
    },
  ];

  return {
    eventId: event.id,
    status: initialStatus,
    eventStatus: initialStatus,
    currentAttendees: initialAttendees,
    expectedAttendees: expectedAttendance,
    venueCapacity: capacity,
    crowdZones,
    parkingResources,
    transportResources,
    hospitalityResources,
    accommodationResources,
    alerts: [],
    actions: defaultActionLogs,
    lastUpdated: new Date().toISOString(),
    sourceType: "REAL",
    liveStartedAt: initialStatus === "LIVE" ? new Date(Date.now() - 3600000).toISOString() : undefined,
    telemetry,
    auditLogs: [],
    simulationConfig: {
      isRunning: false,
      arrivalRate: 45,
      exitRate: 5,
      parkingDemandRate: 15,
      transportDemandRate: 20,
      hospitalityDemandRate: 10,
      speedMultiplier: 1,
    },
    // Compatibility fields
    crowdState: {
      totalExpected: expectedAttendance,
      currentAttendance: initialAttendees,
      entryRate: initialStatus === "LIVE" ? 48 : 0,
      exitRate: 0,
      venueCapacity: capacity,
      occupancyPercent: crowdUtil,
    },
    gateStates,
    transportState,
    parkingState,
    hospitalityState,
    activeAlerts: [],
    operationalActions: defaultActionLogs,
    updatedBy: "System",
  };
}

/**
 * Loads all live states from disk/localStorage
 */
export function loadAllLiveStatesFromStorage(): Record<string, EventOperationalLiveState> {
  try {
    const raw = localStorage.getItem(LIVE_STATE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error("Failed to load live states from storage:", err);
    return {};
  }
}

/**
 * Saves all live states to disk/localStorage
 */
export function persistLiveStatesToStorage(states: Record<string, EventOperationalLiveState>): void {
  try {
    localStorage.setItem(LIVE_STATE_STORAGE_KEY, JSON.stringify(states));
  } catch (err) {
    console.error("Failed to persist live states to storage:", err);
  }
}

/**
 * Evaluates operational alert rules centrally and auto-resolves when normal.
 * Does NOT generate duplicate alerts every second; updates active alerts.
 */
function evaluateAlertRules(state: EventOperationalLiveState): OperationalAlert[] {
  const existingAlerts = [...(state.alerts || state.activeAlerts || [])];
  const nowIso = new Date().toISOString();

  // Helper to find existing alert by rule key
  const findAlert = (ruleKey: string) => existingAlerts.find((a) => a.ruleKey === ruleKey);

  // 1. Parking Resources
  Object.values(state.parkingResources || {}).forEach((res) => {
    const ruleKey = `rule-parking-${res.resourceId}`;
    const alert = findAlert(ruleKey);
    const util = res.utilization;

    if (util > 90) {
      if (!alert) {
        existingAlerts.unshift({
          id: `alt-${Date.now()}-${res.resourceId}`,
          eventId: state.eventId,
          alertType: "Parking Capacity",
          severity: "CRITICAL",
          title: `Parking ${res.name} is near capacity (${util}%)`,
          message: `${res.name} has crossed critical threshold. Overflow redirection recommended.`,
          affectedTransportResource: res.resourceId,
          audience: "All",
          startTime: nowIso,
          createdAt: nowIso,
          createdBy: "Live Alert Engine",
          status: "ACTIVE",
          ruleKey,
        });
      } else if (alert.status !== "ACTIVE" || alert.severity !== "CRITICAL") {
        alert.status = "ACTIVE";
        alert.severity = "CRITICAL";
        alert.title = `Parking ${res.name} is near capacity (${util}%)`;
        alert.message = `${res.name} has crossed critical threshold (${util}%).`;
        alert.resolvedAt = undefined;
      }
    } else if (util > 75) {
      if (!alert) {
        existingAlerts.unshift({
          id: `alt-${Date.now()}-${res.resourceId}`,
          eventId: state.eventId,
          alertType: "Parking Advisory",
          severity: "WARNING",
          title: `Parking ${res.name} is approaching capacity (${util}%)`,
          message: `${res.name} spaces are filling rapidly. Advise inbound drivers to use transit corridors.`,
          affectedTransportResource: res.resourceId,
          audience: "All",
          startTime: nowIso,
          createdAt: nowIso,
          createdBy: "Live Alert Engine",
          status: "ACTIVE",
          ruleKey,
        });
      } else if (alert.status !== "ACTIVE" || alert.severity !== "WARNING") {
        alert.status = "ACTIVE";
        alert.severity = "WARNING";
        alert.title = `Parking ${res.name} is approaching capacity (${util}%)`;
        alert.message = `${res.name} utilization elevated at ${util}%.`;
        alert.resolvedAt = undefined;
      }
    } else {
      // Below 75% -> Auto-resolve if currently active
      if (alert && alert.status === "ACTIVE") {
        alert.status = "RESOLVED";
        alert.resolvedAt = nowIso;
        alert.resolutionNote = `Parking pressure resolved. Utilization normalized to ${util}%.`;
        alert.title = `Parking pressure resolved on ${res.name}`;
      }
    }
  });

  // 2. Transport Resources
  Object.values(state.transportResources || {}).forEach((res) => {
    const ruleKey = `rule-trans-${res.resourceId}`;
    const alert = findAlert(ruleKey);
    const util = res.utilization;

    if (util > 90) {
      if (!alert) {
        existingAlerts.unshift({
          id: `alt-${Date.now()}-${res.resourceId}`,
          eventId: state.eventId,
          alertType: "Transit Surge",
          severity: "CRITICAL",
          title: `Transit pressure critical on ${res.name} (${util}%)`,
          message: `Heavy passenger boarding queues observed. Deploy standby backup vehicles immediately.`,
          affectedTransportResource: res.resourceId,
          audience: "Operators",
          startTime: nowIso,
          createdAt: nowIso,
          createdBy: "Live Alert Engine",
          status: "ACTIVE",
          ruleKey,
        });
      } else if (alert.status !== "ACTIVE" || alert.severity !== "CRITICAL") {
        alert.status = "ACTIVE";
        alert.severity = "CRITICAL";
        alert.title = `Transit pressure critical on ${res.name} (${util}%)`;
        alert.resolvedAt = undefined;
      }
    } else if (util > 80) {
      if (!alert) {
        existingAlerts.unshift({
          id: `alt-${Date.now()}-${res.resourceId}`,
          eventId: state.eventId,
          alertType: "Transit Advisory",
          severity: "WARNING",
          title: `Transit demand elevated on ${res.name} (${util}%)`,
          message: `Platform queue building up. Monitor headways and transit departure bays.`,
          affectedTransportResource: res.resourceId,
          audience: "Operators",
          startTime: nowIso,
          createdAt: nowIso,
          createdBy: "Live Alert Engine",
          status: "ACTIVE",
          ruleKey,
        });
      } else if (alert.status !== "ACTIVE" || alert.severity !== "WARNING") {
        alert.status = "ACTIVE";
        alert.severity = "WARNING";
        alert.title = `Transit demand elevated on ${res.name} (${util}%)`;
        alert.resolvedAt = undefined;
      }
    } else {
      if (alert && alert.status === "ACTIVE") {
        alert.status = "RESOLVED";
        alert.resolvedAt = nowIso;
        alert.resolutionNote = `Transit corridor normalized to ${util}%.`;
        alert.title = `Transit pressure resolved on ${res.name}`;
      }
    }
  });

  // 3. Crowd Zones
  Object.values(state.crowdZones || {}).forEach((zone) => {
    const ruleKey = `rule-zone-${zone.id}`;
    const alert = findAlert(ruleKey);
    const util = zone.utilization;

    if (util > 92) {
      if (!alert) {
        existingAlerts.unshift({
          id: `alt-${Date.now()}-${zone.id}`,
          eventId: state.eventId,
          alertType: "Crowd Surge",
          severity: "CRITICAL",
          title: `Crowd density critical in ${zone.name} (${util}%)`,
          message: `Zone is nearing physical safe limits. Restrict ingress and activate directional concourse signs.`,
          affectedArea: zone.name,
          audience: "All",
          startTime: nowIso,
          createdAt: nowIso,
          createdBy: "Live Alert Engine",
          status: "ACTIVE",
          ruleKey,
        });
      } else if (alert.status !== "ACTIVE" || alert.severity !== "CRITICAL") {
        alert.status = "ACTIVE";
        alert.severity = "CRITICAL";
        alert.title = `Crowd density critical in ${zone.name} (${util}%)`;
        alert.resolvedAt = undefined;
      }
    } else if (util > 80) {
      if (!alert) {
        existingAlerts.unshift({
          id: `alt-${Date.now()}-${zone.id}`,
          eventId: state.eventId,
          alertType: "Crowd Advisory",
          severity: "WARNING",
          title: `High crowd density in ${zone.name} (${util}%)`,
          message: `Ingress rate is outpacing nominal concourse flow. Extra marshals advised.`,
          affectedArea: zone.name,
          audience: "Operators",
          startTime: nowIso,
          createdAt: nowIso,
          createdBy: "Live Alert Engine",
          status: "ACTIVE",
          ruleKey,
        });
      } else if (alert.status !== "ACTIVE" || alert.severity !== "WARNING") {
        alert.status = "ACTIVE";
        alert.severity = "WARNING";
        alert.title = `High crowd density in ${zone.name} (${util}%)`;
        alert.resolvedAt = undefined;
      }
    } else {
      if (alert && alert.status === "ACTIVE") {
        alert.status = "RESOLVED";
        alert.resolvedAt = nowIso;
        alert.resolutionNote = `Zone density returned to safe range (${util}%).`;
        alert.title = `Crowd flow normalized in ${zone.name}`;
      }
    }
  });

  return existingAlerts.slice(0, 30);
}

/**
 * Public LiveEventService Object API
 */
export const LiveEventService = {
  /**
   * Retrieves current central live state for an event.
   * Auto-bootstraps if not yet present in memory or storage.
   */
  getEventLiveState(eventId: string, fallbackEvent?: AppEvent): EventOperationalLiveState {
    if (!eventId) {
      throw new Error("LiveEventService: eventId is required");
    }

    if (memoryLiveStates[eventId]) {
      return memoryLiveStates[eventId];
    }

    // Try storage
    const allStored = loadAllLiveStatesFromStorage();
    if (allStored[eventId]) {
      memoryLiveStates[eventId] = allStored[eventId];
      return memoryLiveStates[eventId];
    }

    // Bootstrap
    const event = fallbackEvent || getStoredEventById(eventId) || getAllStoredEvents().find((e) => e.id === eventId);
    if (!event) {
      // Fallback synthetic event
      const syntheticEvent: AppEvent = {
        id: eventId,
        name: "EventFlow Live Session",
        date: new Date().toISOString().split("T")[0],
        time: "18:00",
        venue: "Main Arena Complex",
        location: "Bengaluru, India",
        district: "Central",
        state: "Karnataka",
        country: "India",
        latitude: 12.9716,
        longitude: 77.5946,
        capacity: 15000,
        expectedAttendance: "12000",
        category: "Concerts",
        description: "Official live monitored session.",
        image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80",
        gates: [],
        zones: [],
        schedule: [],
        transport: [],
        parking: [],
        hospitality: [],
      };
      const initial = buildInitialEventLiveState(syntheticEvent);
      memoryLiveStates[eventId] = initial;
      allStored[eventId] = initial;
      persistLiveStatesToStorage(allStored);
      return initial;
    }

    const initial = buildInitialEventLiveState(event);
    memoryLiveStates[eventId] = initial;
    allStored[eventId] = initial;
    persistLiveStatesToStorage(allStored);
    return initial;
  },

  /**
   * Subscribes a listener to updates for a specific eventId.
   * Returns an unsubscribe callback function.
   */
  subscribe(eventId: string, listener: (state: EventOperationalLiveState) => void): () => void {
    if (!listeners.has(eventId)) {
      listeners.set(eventId, new Set());
    }
    listeners.get(eventId)!.add(listener);

    // Initial dispatch if state exists
    const current = this.getEventLiveState(eventId);
    listener(current);

    return () => {
      this.unsubscribe(eventId, listener);
    };
  },

  /**
   * Unsubscribes a listener.
   */
  unsubscribe(eventId: string, listener: (state: EventOperationalLiveState) => void): void {
    const eventListeners = listeners.get(eventId);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        listeners.delete(eventId);
      }
    }
  },

  /**
   * Notifies all active subscribers of this eventId.
   */
  notifySubscribers(eventId: string, state: EventOperationalLiveState): void {
    const eventListeners = listeners.get(eventId);
    if (eventListeners) {
      eventListeners.forEach((fn) => {
        try {
          fn(state);
        } catch (err) {
          console.error("Subscriber notification error:", err);
        }
      });
    }

    // Broadcast across windows and components
    try {
      window.dispatchEvent(
        new CustomEvent("eventflow_live_state_updated", {
          detail: { eventId, state },
        })
      );
    } catch {
      // ignore
    }
  },

  /**
   * Central update mechanism.
   * Modifies the central event state, recalibrates statuses, updates alerts and audit logs,
   * then publishes to all relevant dashboards simultaneously.
   */
  updateEventState(
    eventId: string,
    mutator: (current: EventOperationalLiveState) => Partial<EventOperationalLiveState> | void,
    meta?: {
      resource?: string;
      oldValue?: string | number;
      newValue?: string | number;
      changedBy?: string;
      reason?: string;
      sourceType?: TelemetrySourceType;
    }
  ): EventOperationalLiveState {
    const current = this.getEventLiveState(eventId);
    const updates = mutator(current) || {};

    const nowIso = new Date().toISOString();
    const source: TelemetrySourceType = meta?.sourceType || (updates as any).sourceType || current.sourceType || "REAL";

    const nextState: EventOperationalLiveState = {
      ...current,
      ...updates,
      lastUpdated: nowIso,
      sourceType: source,
      updatedBy: meta?.changedBy || current.updatedBy || "Operator",
    };

    // Keep compatibility status synced
    if (updates.status) {
      nextState.eventStatus = updates.status;
    } else if (updates.eventStatus) {
      nextState.status = updates.eventStatus;
    }

    // Sync crowd utilization
    if (nextState.currentAttendees !== undefined && nextState.venueCapacity > 0) {
      const occ = Math.round((nextState.currentAttendees / nextState.venueCapacity) * 100);
      nextState.crowdState = {
        ...nextState.crowdState,
        currentAttendance: nextState.currentAttendees,
        occupancyPercent: occ,
        venueCapacity: nextState.venueCapacity,
      };
    }

    // Run central alert rules
    const updatedAlerts = evaluateAlertRules(nextState);
    nextState.alerts = updatedAlerts;
    nextState.activeAlerts = updatedAlerts.filter((a) => a.status === "ACTIVE");

    // Recalibrate live telemetry object
    const parkingList = Object.values(nextState.parkingResources || {});
    const avgParking =
      parkingList.length > 0
        ? Math.round(parkingList.reduce((s, p) => s + p.utilization, 0) / parkingList.length)
        : nextState.telemetry?.parkingUtilization || 0;

    const transList = Object.values(nextState.transportResources || {});
    const avgTrans =
      transList.length > 0
        ? Math.round(transList.reduce((s, t) => s + t.utilization, 0) / transList.length)
        : nextState.telemetry?.transportUtilization || 0;

    const hospList = Object.values(nextState.hospitalityResources || {});
    const avgHosp =
      hospList.length > 0
        ? Math.round(hospList.reduce((s, h) => s + h.utilization, 0) / hospList.length)
        : nextState.telemetry?.hospitalityUtilization || 0;

    const crowdUtil = nextState.crowdState?.occupancyPercent || 0;

    nextState.telemetry = {
      currentAttendees: nextState.currentAttendees,
      arrivalRate: nextState.crowdState?.entryRate || 0,
      exitRate: nextState.crowdState?.exitRate || 0,
      crowdUtilization: crowdUtil,
      parkingUtilization: avgParking,
      transportUtilization: avgTrans,
      hospitalityUtilization: avgHosp,
      accommodationUtilization: nextState.telemetry?.accommodationUtilization || 75,
      status: calculateUtilizationStatus(crowdUtil),
      lastUpdated: nowIso,
      sourceType: source,
    };

    // Record Audit Log if significant change
    if (meta && meta.resource && meta.oldValue !== undefined && meta.newValue !== undefined) {
      const auditEntry: OperationalAuditEntry = {
        id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        eventId,
        resource: meta.resource,
        oldValue: meta.oldValue,
        newValue: meta.newValue,
        changedBy: meta.changedBy || "System",
        reason: meta.reason || "Operational telemetry update",
        sourceType: source,
      };

      nextState.auditLogs = [auditEntry, ...(nextState.auditLogs || [])].slice(0, 50);

      // Also record action log for backward compatibility
      nextState.operationalActions = [
        {
          id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          eventId,
          timestamp: auditEntry.timestamp,
          action: `${meta.resource}: ${meta.oldValue} → ${meta.newValue}`,
          resource: meta.resource,
          user: meta.changedBy || "System",
          previousState: String(meta.oldValue),
          newState: String(meta.newValue),
          details: `Source: ${source} • ${meta.reason || "Updated"}`,
        },
        ...(nextState.operationalActions || []),
      ].slice(0, 50);
      nextState.actions = nextState.operationalActions;
    }

    // Save to memory and storage
    memoryLiveStates[eventId] = nextState;
    const allStored = loadAllLiveStatesFromStorage();
    allStored[eventId] = nextState;
    persistLiveStatesToStorage(allStored);

    // Record time-series historical observation for the prediction engine
    try {
      TelemetryHistoryService.recordObservation(eventId, nextState);
    } catch {
      // ignore
    }

    // Broadcast
    this.notifySubscribers(eventId, nextState);
    return nextState;
  },

  /**
   * Switches event to LIVE mode.
   * All relevant dashboards immediately switch to the same event's LIVE state.
   */
  startEvent(eventId: string, user: string): EventOperationalLiveState {
    const current = this.getEventLiveState(eventId);
    const prevStatus = current.status;

    return this.updateEventState(
      eventId,
      (state) => {
        state.status = "LIVE";
        state.eventStatus = "LIVE";
        state.liveStartedAt = state.liveStartedAt || new Date().toISOString();
        if (state.currentAttendees === 0) {
          state.currentAttendees = Math.round(state.expectedAttendees * 0.65);
        }
        state.crowdState.entryRate = 52;
      },
      {
        resource: "Event Lifecycle",
        oldValue: prevStatus,
        newValue: "LIVE",
        changedBy: user,
        reason: "Organizer activated LIVE operations mode",
        sourceType: "MANUAL",
      }
    );
  },

  /**
   * Pauses event operational mode (PREPARING).
   */
  pauseEvent(eventId: string, user: string): EventOperationalLiveState {
    const current = this.getEventLiveState(eventId);
    const prevStatus = current.status;

    return this.updateEventState(
      eventId,
      (state) => {
        state.status = "PREPARING";
        state.eventStatus = "PREPARING";
      },
      {
        resource: "Event Lifecycle",
        oldValue: prevStatus,
        newValue: "PREPARING",
        changedBy: user,
        reason: "Organizer paused LIVE operations mode",
        sourceType: "MANUAL",
      }
    );
  },

  /**
   * Ends and completes the event.
   */
  completeEvent(eventId: string, user: string): EventOperationalLiveState {
    const current = this.getEventLiveState(eventId);
    const prevStatus = current.status;

    return this.updateEventState(
      eventId,
      (state) => {
        state.status = "COMPLETED";
        state.eventStatus = "COMPLETED";
        state.crowdState.entryRate = 0;
        state.crowdState.exitRate = 60;
      },
      {
        resource: "Event Lifecycle",
        oldValue: prevStatus,
        newValue: "COMPLETED",
        changedBy: user,
        reason: "Organizer marked event as COMPLETED (Dispersal monitoring)",
        sourceType: "MANUAL",
      }
    );
  },

  /**
   * Formats Live Clock centrally.
   * Returns either:
   * - "Event starts in: HH:MM:SS" (if upcoming/preparing)
   * - "LIVE FOR: HH:MM:SS" (if live)
   * - "Event Concluded" (if completed)
   */
  getEventClockDisplay(
    eventDate: string,
    eventTime: string,
    liveStartedAt?: string,
    status?: EventOperationalStatus
  ): { label: string; timeString: string; isLive: boolean } {
    if (status === "COMPLETED") {
      return { label: "EVENT CONCLUDED", timeString: "00:00:00", isLive: false };
    }

    if (status === "LIVE") {
      const startTime = liveStartedAt ? new Date(liveStartedAt).getTime() : Date.now() - 3600000;
      const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
      const hours = Math.floor(elapsedSeconds / 3600);
      const minutes = Math.floor((elapsedSeconds % 3600) / 60);
      const seconds = elapsedSeconds % 60;

      const timeString = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
        seconds
      ).padStart(2, "0")}`;
      return { label: "LIVE FOR", timeString, isLive: true };
    }

    // Upcoming / Starts in calculation
    try {
      const target = new Date(`${eventDate}T${eventTime || "18:00"}`).getTime();
      const diffSeconds = Math.floor((target - Date.now()) / 1000);

      if (diffSeconds <= 0) {
        return { label: "START TIME REACHED", timeString: "00:00:00", isLive: false };
      }

      const hours = Math.floor(diffSeconds / 3600);
      const minutes = Math.floor((diffSeconds % 3600) / 60);
      const seconds = diffSeconds % 60;

      const timeString = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
        seconds
      ).padStart(2, "0")}`;
      return { label: "EVENT STARTS IN", timeString, isLive: false };
    } catch {
      return { label: "STARTS IN", timeString: "02:15:00", isLive: false };
    }
  },

  /**
   * Checks if live data has stopped updating (fail-safe).
   */
  isDataStale(lastUpdatedIso?: string, maxAgeMs: number = STALE_DATA_THRESHOLD_MS): boolean {
    if (!lastUpdatedIso) return false;
    const age = Date.now() - new Date(lastUpdatedIso).getTime();
    return age > maxAgeMs;
  },

  /**
   * Finds an alternative available resource of the same type for an unavailable or full resource.
   */
  suggestAlternativeForResource(
    eventId: string,
    resourceId: string,
    resourceType: "hospitality" | "parking" | "transport" | "accommodation"
  ): { id: string; name: string; details: string } | null {
    const liveState = this.getEventLiveState(eventId);

    if (resourceType === "hospitality") {
      const all = Object.values(liveState.hospitalityResources || {});
      const target = all.find((h) => h.resourceId === resourceId);
      const targetCat = (liveState.hospitalityState?.[resourceId] as any)?.category || "Food Zones";

      const alternative = all.find(
        (h) =>
          h.resourceId !== resourceId &&
          h.status !== "CRITICAL" &&
          (h.status as any) !== "UNAVAILABLE" &&
          (h.status as any) !== "Full" &&
          h.utilization < 85
      );

      if (alternative) {
        return {
          id: alternative.resourceId,
          name: alternative.name,
          details: `${alternative.assignedZone || "Adjacent zone"} • ${alternative.capacity - alternative.currentUsage} capacity available`,
        };
      }
    }

    if (resourceType === "parking") {
      const all = Object.values(liveState.parkingResources || {});
      const alternative = all.find(
        (p) =>
          p.resourceId !== resourceId &&
          p.status !== "CRITICAL" &&
          (p.status as any) !== "FULL" &&
          p.utilization < 85
      );

      if (alternative) {
        return {
          id: alternative.resourceId,
          name: alternative.name,
          details: `${alternative.capacity - alternative.currentUsage} bays free • Direct shuttle to gates`,
        };
      }
    }

    if (resourceType === "transport") {
      const all = Object.values(liveState.transportResources || {});
      const alternative = all.find(
        (t) =>
          t.resourceId !== resourceId &&
          t.status !== "CRITICAL" &&
          (t.status as any) !== "DISRUPTED" &&
          t.utilization < 80
      );

      if (alternative) {
        return {
          id: alternative.resourceId,
          name: alternative.name,
          details: `Headway 4 mins • ${alternative.details || "Nominal load"}`,
        };
      }
    }

    return null;
  },

  /**
   * Creates or updates an Organizer -> Attendee Guidance Decision in central state.
   */
  createGuidanceDecision(
    eventId: string,
    guidance: Omit<AttendeeGuidanceDecision, "id" | "createdAt" | "status">
  ): AttendeeGuidanceDecision {
    const newDecision: AttendeeGuidanceDecision = {
      ...guidance,
      id: `gd-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventId,
      createdAt: new Date().toISOString(),
      status: "ACTIVE",
    };

    this.updateEventState(
      eventId,
      (state) => {
        const existing = state.guidanceDecisions || [];
        // Supersede any older guidance for the same resource
        const superseded = existing.map((g) =>
          g.affectedResourceId === guidance.affectedResourceId ? { ...g, status: "SUPERSEDED" as const } : g
        );
        state.guidanceDecisions = [newDecision, ...superseded].slice(0, 30);
      },
      {
        resource: `Guidance (${guidance.affectedResourceName})`,
        oldValue: "No Guidance",
        newValue: `Alternative: ${guidance.alternativeResourceName || "Notice"}`,
        changedBy: guidance.approvedBy || "Organizer",
        reason: guidance.reason,
        sourceType: "MANUAL",
      }
    );

    return newDecision;
  },

  /**
   * Retrieves all active and past guidance decisions for an event.
   */
  getGuidanceDecisions(eventId: string): AttendeeGuidanceDecision[] {
    const liveState = this.getEventLiveState(eventId);
    return liveState.guidanceDecisions || [];
  },

  /**
   * Resolves a guidance decision when conditions normalize.
   */
  resolveGuidanceDecision(eventId: string, guidanceId: string, resolvedBy: string = "Organizer"): void {
    this.updateEventState(
      eventId,
      (state) => {
        if (!state.guidanceDecisions) return;
        const target = state.guidanceDecisions.find((g) => g.id === guidanceId);
        if (target) {
          target.status = "RESOLVED";
        }
      },
      {
        resource: "Guidance Decision",
        oldValue: "ACTIVE",
        newValue: "RESOLVED",
        changedBy: resolvedBy,
        reason: "Operational conditions normalized; guidance resolved.",
        sourceType: "MANUAL",
      }
    );
  },

  /**
   * Records an Action Verification measurement in central event state.
   */
  recordActionVerification(eventId: string, record: ActionVerificationRecord): ActionVerificationRecord {
    this.updateEventState(
      eventId,
      (state) => {
        const existing = state.verifications || [];
        state.verifications = [record, ...existing.filter((v) => v.actionId !== record.actionId)].slice(0, 30);
      },
      {
        resource: `Verification (${record.actionTitle})`,
        oldValue: `${record.beforeUtilization}%`,
        newValue: `${record.afterUtilization ?? record.beforeUtilization}% (${record.status})`,
        changedBy: "Verification Engine",
        reason: record.impactSummary,
        sourceType: "REAL",
      }
    );

    return record;
  },

  /**
   * Retrieves verification records for an event.
   */
  getVerifications(eventId: string): ActionVerificationRecord[] {
    const liveState = this.getEventLiveState(eventId);
    return liveState.verifications || [];
  },
};
