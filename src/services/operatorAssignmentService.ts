import {
  OperatorAssignment,
  OperatorResourceType,
  OperatorActionLogRecord,
  ResolvedOperatorResource,
} from "../types/operator";
import { AppEvent } from "../types/event";
import { OperationalAlert, EventOperationalLiveState } from "../types/operational";
import { getAllStoredEvents, getStoredEventById } from "./eventStorageService";
import {
  getEventLiveState,
  saveEventLiveState,
  updateTransportState,
  updateParkingState,
  updateHospitalityState,
  recordOperationalAction,
} from "./operationalStateService";

const ASSIGNMENTS_STORAGE_KEY = "eventflow_operator_assignments";
const ACTION_LOG_STORAGE_KEY = "eventflow_action_log";
const ACKNOWLEDGED_ALERTS_KEY = "eventflow_operator_acknowledged_alerts";

/**
 * Returns initial default assignments for demo events and operators
 */
function getInitialSeedAssignments(): OperatorAssignment[] {
  const allEvents = getAllStoredEvents();
  if (allEvents.length === 0) return [];

  const assignments: OperatorAssignment[] = [];
  const primaryEvent = allEvents[0];
  const secondEvent = allEvents.length > 1 ? allEvents[1] : allEvents[0];

  // 1. Mumbai Cricket Night / Primary Event Assignments
  // Accommodation Operator
  assignments.push({
    assignmentId: `asg-${primaryEvent.id}-res-accom-grand`,
    operatorId: "usr_demo_operator_accommodation",
    eventId: primaryEvent.id,
    resourceId: "res-accom-hotel-grand",
    resourceType: "accommodation",
    resourceName: "Grand Concourse Regency & Suites",
    permissions: ["VIEW", "UPDATE_STATUS", "UPDATE_CAPACITY", "UPDATE_DEMAND", "ADD_NOTES"],
    status: "ACTIVE",
    assignedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    notes: "Official primary hospitality hotel partner for attendees and tournament guests.",
  });
  assignments.push({
    assignmentId: `asg-${primaryEvent.id}-res-accom-coastal`,
    operatorId: "usr_demo_operator_accommodation",
    eventId: primaryEvent.id,
    resourceId: "res-accom-hotel-coastal",
    resourceType: "accommodation",
    resourceName: "Marine Pearl Boutique Hotel",
    permissions: ["VIEW", "UPDATE_STATUS", "UPDATE_CAPACITY", "UPDATE_DEMAND", "ADD_NOTES"],
    status: "ACTIVE",
    assignedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    notes: "Direct walkway access to South Gate transit shuttles.",
  });

  // Transport Operator -> Shuttle S2 and Shuttle S1
  assignments.push({
    assignmentId: `asg-${primaryEvent.id}-trans-s2`,
    operatorId: "usr_demo_operator", // Marcus Vance
    eventId: primaryEvent.id,
    resourceId: "trans-shuttle-s2",
    resourceType: "transport",
    resourceName: "Express Shuttle S2 (Churchgate / Marine Lines)",
    permissions: ["VIEW", "UPDATE_STATUS", "UPDATE_CAPACITY", "UPDATE_DEMAND", "ADD_NOTES"],
    status: "ACTIVE",
    assignedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    notes: "Primary feeder shuttle route between terminal and South Ingress.",
  });

  assignments.push({
    assignmentId: `asg-${primaryEvent.id}-trans-s1`,
    operatorId: "usr_demo_operator",
    eventId: primaryEvent.id,
    resourceId: "trans-shuttle-s1",
    resourceType: "transport",
    resourceName: "Metro Line 3 Feeder Shuttle",
    permissions: ["VIEW", "UPDATE_STATUS", "UPDATE_CAPACITY", "UPDATE_DEMAND", "ADD_NOTES"],
    status: "ACTIVE",
    assignedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    notes: "Direct connection with Aqua Line underground station.",
  });

  assignments.push({
    assignmentId: `asg-${primaryEvent.id}-trans-s2-role`,
    operatorId: "usr_demo_operator_transport",
    eventId: primaryEvent.id,
    resourceId: "trans-shuttle-s2",
    resourceType: "transport",
    resourceName: "Express Shuttle S2 (Churchgate / Marine Lines)",
    permissions: ["VIEW", "UPDATE_STATUS", "UPDATE_CAPACITY", "UPDATE_DEMAND", "ADD_NOTES"],
    status: "ACTIVE",
    assignedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  });
  assignments.push({
    assignmentId: `asg-${primaryEvent.id}-trans-s1-role`,
    operatorId: "usr_demo_operator_transport",
    eventId: primaryEvent.id,
    resourceId: "trans-shuttle-s1",
    resourceType: "transport",
    resourceName: "Metro Line 3 Feeder Shuttle",
    permissions: ["VIEW", "UPDATE_STATUS", "UPDATE_CAPACITY", "UPDATE_DEMAND", "ADD_NOTES"],
    status: "ACTIVE",
    assignedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  });

  // Parking Operator -> Parking P2 & P1
  assignments.push({
    assignmentId: `asg-${primaryEvent.id}-park-p2`,
    operatorId: "usr_demo_operator_parking",
    eventId: primaryEvent.id,
    resourceId: "park-p2",
    resourceType: "parking",
    resourceName: "Parking Facility P2 (East Concourse)",
    permissions: ["VIEW", "UPDATE_STATUS", "UPDATE_CAPACITY", "UPDATE_DEMAND", "ADD_NOTES"],
    status: "ACTIVE",
    assignedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  });

  // Food & Dining Operator -> Food Zone A and VIP Gourmet
  assignments.push({
    assignmentId: `asg-${primaryEvent.id}-food-zone-a`,
    operatorId: "usr_demo_operator_food",
    eventId: primaryEvent.id,
    resourceId: "food-zone-a",
    resourceType: "food",
    resourceName: "Food Zone A (North Concourse Plaza)",
    permissions: ["VIEW", "UPDATE_STATUS", "UPDATE_CAPACITY", "UPDATE_DEMAND", "ADD_NOTES"],
    status: "ACTIVE",
    assignedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  });
  assignments.push({
    assignmentId: `asg-${primaryEvent.id}-food-zone-vip`,
    operatorId: "usr_demo_operator_food",
    eventId: primaryEvent.id,
    resourceId: "food-zone-vip",
    resourceType: "food",
    resourceName: "Grand Pavilions Gourmet Lounge",
    permissions: ["VIEW", "UPDATE_STATUS", "UPDATE_CAPACITY", "UPDATE_DEMAND", "ADD_NOTES"],
    status: "ACTIVE",
    assignedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  });

  // Medical Operator -> Medical Desk 1
  assignments.push({
    assignmentId: `asg-${primaryEvent.id}-medical-desk-1`,
    operatorId: "usr_demo_operator_medical",
    eventId: primaryEvent.id,
    resourceId: "medical-desk-1",
    resourceType: "medical",
    resourceName: "Medical Desk 1 (West Stand First Aid & Trauma Post)",
    permissions: ["VIEW", "UPDATE_STATUS", "UPDATE_CAPACITY", "UPDATE_DEMAND", "ADD_NOTES"],
    status: "ACTIVE",
    assignedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  });

  // Venue Services Operator -> Rigging & Sanitation
  assignments.push({
    assignmentId: `asg-${primaryEvent.id}-venue-rigging`,
    operatorId: "usr_demo_operator_venue",
    eventId: primaryEvent.id,
    resourceId: "venue-rigging-ops",
    resourceType: "venue_services",
    resourceName: "Central Rigging, Power & AV Technical Operations",
    permissions: ["VIEW", "UPDATE_STATUS", "UPDATE_CAPACITY", "UPDATE_DEMAND", "ADD_NOTES"],
    status: "ACTIVE",
    assignedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  });
  assignments.push({
    assignmentId: `asg-${primaryEvent.id}-venue-sanitation`,
    operatorId: "usr_demo_operator_venue",
    eventId: primaryEvent.id,
    resourceId: "venue-sanitation-ops",
    resourceType: "venue_services",
    resourceName: "Concourse Sanitation & Waste Management Taskforce",
    permissions: ["VIEW", "UPDATE_STATUS", "UPDATE_CAPACITY", "UPDATE_DEMAND", "ADD_NOTES"],
    status: "ACTIVE",
    assignedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  });

  // Other Services Operator -> Concierge Lockers
  assignments.push({
    assignmentId: `asg-${primaryEvent.id}-other-lockers`,
    operatorId: "usr_demo_operator_other",
    eventId: primaryEvent.id,
    resourceId: "other-concierge-lockers",
    resourceType: "other",
    resourceName: "Concourse Luggage Lockers & Information Hub",
    permissions: ["VIEW", "UPDATE_STATUS", "UPDATE_CAPACITY", "UPDATE_DEMAND", "ADD_NOTES"],
    status: "ACTIVE",
    assignedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  });

  // 2. Second Event Assignments
  if (secondEvent.id !== primaryEvent.id) {
    assignments.push({
      assignmentId: `asg-${secondEvent.id}-trans-m1`,
      operatorId: "usr_demo_operator",
      eventId: secondEvent.id,
      resourceId: "trans-shuttle-m1",
      resourceType: "transport",
      resourceName: "Festival Shuttle Line M1",
      permissions: ["VIEW", "UPDATE_STATUS", "UPDATE_CAPACITY", "UPDATE_DEMAND", "ADD_NOTES"],
      status: "ACTIVE",
      assignedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    });
    assignments.push({
      assignmentId: `asg-${secondEvent.id}-trans-m1-role`,
      operatorId: "usr_demo_operator_transport",
      eventId: secondEvent.id,
      resourceId: "trans-shuttle-m1",
      resourceType: "transport",
      resourceName: "Festival Shuttle Line M1",
      permissions: ["VIEW", "UPDATE_STATUS", "UPDATE_CAPACITY", "UPDATE_DEMAND", "ADD_NOTES"],
      status: "ACTIVE",
      assignedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    });

    assignments.push({
      assignmentId: `asg-${secondEvent.id}-park-p1`,
      operatorId: "usr_demo_operator_parking",
      eventId: secondEvent.id,
      resourceId: "park-p1",
      resourceType: "parking",
      resourceName: "Main Entrance Parking P1",
      permissions: ["VIEW", "UPDATE_STATUS", "UPDATE_CAPACITY", "UPDATE_DEMAND", "ADD_NOTES"],
      status: "ACTIVE",
      assignedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    });

    assignments.push({
      assignmentId: `asg-${secondEvent.id}-food-zone-m`,
      operatorId: "usr_demo_operator_food",
      eventId: secondEvent.id,
      resourceId: "food-zone-a",
      resourceType: "food",
      resourceName: "Food Zone A (Festival Gourmet Village)",
      permissions: ["VIEW", "UPDATE_STATUS", "UPDATE_CAPACITY", "UPDATE_DEMAND", "ADD_NOTES"],
      status: "ACTIVE",
      assignedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    });
  }

  return assignments;
}

/**
 * Loads all stored operator assignments.
 */
export function getStoredAssignments(): OperatorAssignment[] {
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading operator assignments from localStorage:", err);
  }

  const seeded = getInitialSeedAssignments();
  saveStoredAssignments(seeded);
  return seeded;
}

/**
 * Saves assignments into localStorage.
 */
export function saveStoredAssignments(assignments: OperatorAssignment[]): void {
  try {
    localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments));
  } catch (err) {
    console.error("Error saving operator assignments:", err);
  }
}

/**
 * Retrieves the operatorType for a given operator ID from eventflow_users or session
 */
function getOperatorTypeForUser(operatorId: string): string {
  try {
    const rawSession = localStorage.getItem("eventflow_session");
    if (rawSession) {
      const sess = JSON.parse(rawSession);
      if (sess?.user?.id === operatorId && sess?.user?.operatorType) {
        return sess.user.operatorType;
      }
    }
    const rawUsers = localStorage.getItem("eventflow_users");
    if (rawUsers) {
      const users = JSON.parse(rawUsers);
      const u = users.find((x: any) => x.id === operatorId);
      if (u?.operatorType) {
        return u.operatorType;
      }
    }
  } catch {}
  return "Transport";
}

/**
 * Guarantees that any custom operator user (by ID & operatorType) has sensible assignments
 * strictly matching their domain.
 */
function ensureAssignmentsForOperator(operatorId: string): OperatorAssignment[] {
  let all = getStoredAssignments();
  let operatorAssignments = all.filter((a) => a.operatorId === operatorId);

  if (operatorAssignments.length > 0) {
    return operatorAssignments;
  }

  // Look up user details if available to assign appropriate demo resources
  const allEvents = getAllStoredEvents();
  if (allEvents.length === 0) return [];

  const rawType = getOperatorTypeForUser(operatorId);
  const lower = rawType.toLowerCase();
  const primaryEvent = allEvents[0];
  const newAssignments: OperatorAssignment[] = [];
  const now = new Date().toISOString();

  if (lower.includes("accommodat") || lower.includes("hotel")) {
    newAssignments.push({
      assignmentId: `asg-${primaryEvent.id}-${operatorId}-accom`,
      operatorId,
      eventId: primaryEvent.id,
      resourceId: "res-accom-hotel-grand",
      resourceType: "accommodation",
      resourceName: "Grand Concourse Regency & Suites",
      permissions: ["VIEW", "UPDATE_STATUS", "UPDATE_CAPACITY", "UPDATE_DEMAND", "ADD_NOTES"],
      status: "ACTIVE",
      assignedAt: now,
      notes: "Official primary hospitality hotel partner for attendees.",
    });
  } else if (lower.includes("park")) {
    newAssignments.push({
      assignmentId: `asg-${primaryEvent.id}-${operatorId}-park`,
      operatorId,
      eventId: primaryEvent.id,
      resourceId: "park-p2",
      resourceType: "parking",
      resourceName: "Parking Facility P2 (East Concourse)",
      permissions: ["VIEW", "UPDATE_STATUS", "UPDATE_CAPACITY", "UPDATE_DEMAND", "ADD_NOTES"],
      status: "ACTIVE",
      assignedAt: now,
      notes: "Active parking bay management assignment.",
    });
  } else if (lower.includes("food") || lower.includes("dining") || lower.includes("hospitality")) {
    newAssignments.push({
      assignmentId: `asg-${primaryEvent.id}-${operatorId}-food`,
      operatorId,
      eventId: primaryEvent.id,
      resourceId: "food-zone-a",
      resourceType: "food",
      resourceName: "Food Zone A (North Concourse Plaza)",
      permissions: ["VIEW", "UPDATE_STATUS", "UPDATE_CAPACITY", "UPDATE_DEMAND", "ADD_NOTES"],
      status: "ACTIVE",
      assignedAt: now,
      notes: "Food court & dining pavilion operations.",
    });
  } else if (lower.includes("medic") || lower.includes("first aid") || lower.includes("assist")) {
    newAssignments.push({
      assignmentId: `asg-${primaryEvent.id}-${operatorId}-med`,
      operatorId,
      eventId: primaryEvent.id,
      resourceId: "medical-desk-1",
      resourceType: "medical",
      resourceName: "Medical Desk 1 (West Stand First Aid & Trauma Post)",
      permissions: ["VIEW", "UPDATE_STATUS", "UPDATE_CAPACITY", "UPDATE_DEMAND", "ADD_NOTES"],
      status: "ACTIVE",
      assignedAt: now,
      notes: "First aid, triage and ambulance dispatch post.",
    });
  } else if (lower.includes("venue") || lower.includes("stage") || lower.includes("rigging")) {
    newAssignments.push({
      assignmentId: `asg-${primaryEvent.id}-${operatorId}-venue`,
      operatorId,
      eventId: primaryEvent.id,
      resourceId: "venue-rigging-ops",
      resourceType: "venue_services",
      resourceName: "Central Rigging, Power & AV Technical Operations",
      permissions: ["VIEW", "UPDATE_STATUS", "UPDATE_CAPACITY", "UPDATE_DEMAND", "ADD_NOTES"],
      status: "ACTIVE",
      assignedAt: now,
      notes: "Venue electrical, AV and structural rigging unit.",
    });
  } else if (lower.includes("other") || lower.includes("concierge") || lower.includes("locker")) {
    newAssignments.push({
      assignmentId: `asg-${primaryEvent.id}-${operatorId}-other`,
      operatorId,
      eventId: primaryEvent.id,
      resourceId: "other-concierge-lockers",
      resourceType: "other",
      resourceName: "Concourse Luggage Lockers & Information Hub",
      permissions: ["VIEW", "UPDATE_STATUS", "UPDATE_CAPACITY", "UPDATE_DEMAND", "ADD_NOTES"],
      status: "ACTIVE",
      assignedAt: now,
      notes: "Baggage depository and lost-and-found management.",
    });
  } else {
    // Default Transport
    newAssignments.push({
      assignmentId: `asg-${primaryEvent.id}-${operatorId}-trans`,
      operatorId,
      eventId: primaryEvent.id,
      resourceId: "trans-shuttle-s2",
      resourceType: "transport",
      resourceName: "Express Shuttle S2 (Churchgate / Marine Lines)",
      permissions: ["VIEW", "UPDATE_STATUS", "UPDATE_CAPACITY", "UPDATE_DEMAND", "ADD_NOTES"],
      status: "ACTIVE",
      assignedAt: now,
      notes: "Assigned operational sector for primary event.",
    });
  }

  const merged = [...all, ...newAssignments];
  saveStoredAssignments(merged);
  return newAssignments;
}

/**
 * Gets all assignments for a specific operator.
 */
export function getOperatorAssignments(operatorId: string): OperatorAssignment[] {
  if (!operatorId) return [];
  return ensureAssignmentsForOperator(operatorId);
}

/**
 * Gets all events assigned to a specific operator.
 */
export function getOperatorEvents(operatorId: string): AppEvent[] {
  const assignments = getOperatorAssignments(operatorId);
  const eventIds = Array.from(new Set(assignments.map((a) => a.eventId)));
  const allEvents = getAllStoredEvents();

  return allEvents.filter((e) => eventIds.includes(e.id));
}

/**
 * Helper to ensure resources exist in the event's shared live state matching the assignment.
 */
function ensureLiveResourceExists(
  liveState: EventOperationalLiveState,
  assignment: OperatorAssignment,
  event: AppEvent
): any {
  const { resourceId, resourceType, resourceName } = assignment;

  if (resourceType === "transport") {
    if (!liveState.transportState) liveState.transportState = {};
    if (!liveState.transportState[resourceId]) {
      // Find matching transport from event config or fallback
      const existing = Object.values(liveState.transportState).find((t) => t.id === resourceId);
      if (existing) return existing;

      liveState.transportState[resourceId] = {
        id: resourceId,
        name: resourceName || "Shuttle S2",
        type: "shuttle",
        capacity: 50,
        currentDemand: 38,
        status: "ACTIVE",
        pickupDropLocation: "South Concourse Bus Terminal",
        operatingWindow: "08:00 - 23:00 IST",
        assignedZone: "Perimeter Ingress",
        notes: "Assigned to Transport Operator.",
      };
      saveEventLiveState(liveState);
    }
    return liveState.transportState[resourceId];
  }

  if (resourceType === "parking") {
    if (!liveState.parkingState) liveState.parkingState = {};
    if (!liveState.parkingState[resourceId]) {
      const existing = Object.values(liveState.parkingState).find((p) => p.id === resourceId);
      if (existing) return existing;

      liveState.parkingState[resourceId] = {
        id: resourceId,
        zoneName: resourceName || "Parking Lot P2",
        totalSpaces: 2000,
        availableSpaces: 300,
        occupiedSpaces: 1700,
        status: "NEAR CAPACITY",
        distanceFromVenue: "400m (5 min walk)",
        entryRoute: "Gate 4 Perimeter Road",
        shuttleAvailable: true,
        fee: "₹250 / day",
      };
      saveEventLiveState(liveState);
    }
    return liveState.parkingState[resourceId];
  }

  // Hospitality: Accommodation, Food, Medical, Other
  if (!liveState.hospitalityState) liveState.hospitalityState = {};
  if (!liveState.hospitalityState[resourceId]) {
    const existing = Object.values(liveState.hospitalityState).find((h) => h.id === resourceId);
    if (existing) return existing;

    let category: any = "Food Zones";
    let defaultStatus: any = "Operational";
    let capacity: any = 500;
    let demand: any = "420";

    if (resourceType === "food") {
      category = "Food Zones";
      defaultStatus = "High Demand";
      capacity = 500;
      demand = "420";
    } else if (resourceType === "medical") {
      category = "Medical Assistance";
      defaultStatus = "Available";
      capacity = 40;
      demand = "Normal";
    } else if (resourceType === "accommodation") {
      category = "Accommodation";
      defaultStatus = "Limited";
      capacity = 120;
      demand = "High";
    } else {
      category = "Other Services";
      defaultStatus = "Operational";
      capacity = 200;
      demand = "Moderate";
    }

    liveState.hospitalityState[resourceId] = {
      id: resourceId,
      name: resourceName || "Operational Resource",
      category,
      capacity,
      currentDemand: demand,
      status: defaultStatus,
      location: "Main Concourse Area",
      operatingHours: "08:00 - 23:00 IST",
      notes: "Assigned to dedicated Operator.",
    };
    saveEventLiveState(liveState);
  }
  return liveState.hospitalityState[resourceId];
}

/**
 * Resolves live operator resources for a given operator (and optional eventId).
 */
export function getOperatorAssignedResources(
  operatorId: string,
  eventId?: string
): ResolvedOperatorResource[] {
  const assignments = getOperatorAssignments(operatorId);
  const filtered = eventId ? assignments.filter((a) => a.eventId === eventId) : assignments;
  const result: ResolvedOperatorResource[] = [];

  for (const asg of filtered) {
    const event = getStoredEventById(asg.eventId);
    if (!event) continue;

    const liveState = getEventLiveState(event.id, event);
    const rawResource = ensureLiveResourceExists(liveState, asg, event);

    if (!rawResource) continue;

    let displayStatus = rawResource.status || "ACTIVE";
    let displayCapacity = rawResource.capacity ?? rawResource.totalSpaces ?? 100;
    let displayDemand = rawResource.currentDemand ?? rawResource.occupiedSpaces ?? 0;
    let available = rawResource.availableSpaces;
    let occupied = rawResource.occupiedSpaces;
    let operatingHours = rawResource.operatingWindow || rawResource.operatingHours;
    let location = rawResource.pickupDropLocation || rawResource.location || rawResource.distanceFromVenue;
    let notes = rawResource.notes || "";
    let lastUpdated = rawResource.lastUpdated || liveState.lastUpdated;

    result.push({
      assignment: asg,
      event: {
        id: event.id,
        name: event.name,
        date: event.date,
        time: event.time,
        venue: event.venue,
        location: event.location,
        image: event.image,
        statusBadge: event.statusBadge,
      },
      resource: {
        id: asg.resourceId,
        name: asg.resourceName || rawResource.name || rawResource.zoneName,
        type: asg.resourceType,
        status: displayStatus,
        capacity: displayCapacity,
        currentDemand: displayDemand,
        available,
        occupied,
        operatingHours,
        location,
        notes,
        lastUpdated,
        raw: rawResource,
      },
    });
  }

  return result;
}

/**
 * Resolves a single assigned resource for an operator.
 */
export function getOperatorResource(
  operatorId: string,
  eventId: string,
  resourceId: string
): ResolvedOperatorResource | null {
  const resources = getOperatorAssignedResources(operatorId, eventId);
  return resources.find((r) => r.resource.id === resourceId) || null;
}

/**
 * Checks if the operator is assigned and authorized to manage the resource.
 */
export function isOperatorAuthorizedForResource(
  operatorId: string,
  eventId: string,
  resourceId: string
): boolean {
  const assignments = getOperatorAssignments(operatorId);
  return assignments.some((a) => a.eventId === eventId && a.resourceId === resourceId);
}

/**
 * Global Operator Action Log Retrieval.
 */
export function getOperatorActionLogs(
  operatorId?: string,
  eventId?: string
): OperatorActionLogRecord[] {
  try {
    const raw = localStorage.getItem(ACTION_LOG_STORAGE_KEY);
    let logs: OperatorActionLogRecord[] = raw ? JSON.parse(raw) : [];

    if (operatorId) {
      logs = logs.filter((l) => l.operatorId === operatorId);
    }
    if (eventId) {
      logs = logs.filter((l) => l.eventId === eventId);
    }
    return logs;
  } catch (err) {
    console.error("Error loading action logs:", err);
    return [];
  }
}

/**
 * Records an action in the global operator action log as well as the event's live state.
 */
export function recordOperatorActionLog(log: Omit<OperatorActionLogRecord, "id" | "timestamp">): OperatorActionLogRecord {
  const newRecord: OperatorActionLogRecord = {
    ...log,
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };

  try {
    const existing = getOperatorActionLogs();
    const updated = [newRecord, ...existing].slice(0, 100);
    localStorage.setItem(ACTION_LOG_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Error storing action log:", err);
  }

  // Also log into shared operationalStateService action log
  recordOperationalAction(log.eventId, {
    action: log.action,
    resource: log.resourceName,
    user: `${log.operatorName} (Operator)`,
    previousState: log.previousValue,
    newState: log.newValue,
    details: log.details,
  });

  return newRecord;
}

/**
 * Updates a resource state in the shared event state (eventflow_live_state) with operator authorization.
 */
export function updateOperatorResourceState(
  operatorId: string,
  operatorName: string,
  eventId: string,
  resourceId: string,
  resourceType: OperatorResourceType,
  updates: {
    status?: string;
    capacity?: number;
    currentDemand?: number | string;
    totalSpaces?: number;
    occupiedSpaces?: number;
    availableSpaces?: number;
    notes?: string;
    operatingHours?: string;
    location?: string;
  }
): { success: boolean; error?: string; updatedState?: EventOperationalLiveState } {
  if (!isOperatorAuthorizedForResource(operatorId, eventId, resourceId)) {
    return {
      success: false,
      error: "Access Denied: You are not assigned to manage this resource.",
    };
  }

  const event = getStoredEventById(eventId);
  if (!event) {
    return { success: false, error: "Event not found." };
  }

  const liveState = getEventLiveState(eventId, event);
  const resource = ensureLiveResourceExists(
    liveState,
    {
      assignmentId: "temp",
      operatorId,
      eventId,
      resourceId,
      resourceType,
      resourceName: resourceId,
      permissions: [],
      status: "ACTIVE",
      assignedAt: "",
    },
    event
  );

  const prevStatus = resource.status;
  const prevDemand = resource.currentDemand ?? resource.occupiedSpaces;

  if (resourceType === "transport") {
    updateTransportState(
      eventId,
      resourceId,
      {
        status: (updates.status as any) || resource.status,
        capacity: updates.capacity !== undefined ? updates.capacity : resource.capacity,
        currentDemand: updates.currentDemand !== undefined ? Number(updates.currentDemand) : resource.currentDemand,
        notes: updates.notes !== undefined ? updates.notes : resource.notes,
        operatingWindow: updates.operatingHours || resource.operatingWindow,
      },
      `${operatorName} (Operator)`
    );
  } else if (resourceType === "parking") {
    // Validation: occupied + available <= totalSpaces, non-negative
    const total = updates.totalSpaces !== undefined ? updates.totalSpaces : resource.totalSpaces;
    const occupied = updates.occupiedSpaces !== undefined ? updates.occupiedSpaces : resource.occupiedSpaces;
    const available = updates.availableSpaces !== undefined ? updates.availableSpaces : resource.availableSpaces;

    if (total < 0 || occupied < 0 || available < 0) {
      return { success: false, error: "Parking counts cannot be negative." };
    }
    if (occupied + available > total) {
      return {
        success: false,
        error: `Invalid count: Occupied (${occupied}) + Available (${available}) exceeds Total Capacity (${total}).`,
      };
    }

    const res = updateParkingState(
      eventId,
      resourceId,
      {
        status: (updates.status as any) || resource.status,
        totalSpaces: total,
        occupiedSpaces: occupied,
        availableSpaces: available,
      },
      `${operatorName} (Operator)`
    );

    if (res.error) {
      return { success: false, error: res.error };
    }
  } else {
    // Accommodation, Food, Medical, Other Hospitality
    updateHospitalityState(
      eventId,
      resourceId,
      {
        status: (updates.status as any) || resource.status,
        capacity: updates.capacity !== undefined ? updates.capacity : resource.capacity,
        currentDemand: updates.currentDemand !== undefined ? String(updates.currentDemand) : resource.currentDemand,
        notes: updates.notes !== undefined ? updates.notes : resource.notes,
        operatingHours: updates.operatingHours || resource.operatingHours,
        location: updates.location || resource.location,
      },
      `${operatorName} (Operator)`
    );
  }

  // Record Operator Action Log
  recordOperatorActionLog({
    operatorId,
    operatorName,
    eventId,
    eventName: event.name,
    resourceId,
    resourceType,
    resourceName: resource.name || resource.zoneName || resourceId,
    action: `Updated ${resourceType} resource (${resource.name || resource.zoneName || resourceId})`,
    previousValue: `${prevStatus} (Demand/Occ: ${prevDemand})`,
    newValue: `${updates.status || prevStatus} (Demand/Occ: ${updates.currentDemand ?? updates.occupiedSpaces ?? prevDemand})`,
    details: updates.notes || `Capacity: ${updates.capacity ?? updates.totalSpaces ?? resource.capacity}`,
  });

  // Notify listeners across the entire system
  try {
    window.dispatchEvent(new CustomEvent("eventflow_live_state_updated", { detail: { eventId } }));
  } catch {}

  const finalState = getEventLiveState(eventId);
  return { success: true, updatedState: finalState };
}

/**
 * Gets alerts relevant to the operator's assigned events and resources.
 */
export function getOperatorAlerts(operatorId: string): OperationalAlert[] {
  const assignments = getOperatorAssignments(operatorId);
  const assignedEventIds = Array.from(new Set(assignments.map((a) => a.eventId)));
  const assignedResourceNames = assignments.map((a) => a.resourceName.toLowerCase());

  const allAlerts: OperationalAlert[] = [];

  assignedEventIds.forEach((eventId) => {
    const live = getEventLiveState(eventId);
    if (live.activeAlerts && live.activeAlerts.length > 0) {
      live.activeAlerts.forEach((alert) => {
        // Operator can see alerts intended for Operators or All, or alerts matching assigned resources
        const isAudienceMatch = alert.audience === "Operators" || alert.audience === "All";
        const isResourceMatch =
          alert.affectedArea ||
          alert.affectedTransportResource ||
          alert.affectedHospitalityResource ||
          assignedResourceNames.some((n) => alert.title.toLowerCase().includes(n) || alert.message.toLowerCase().includes(n));

        if (isAudienceMatch || isResourceMatch) {
          allAlerts.push(alert);
        }
      });
    }
  });

  return allAlerts;
}

/**
 * Gets list of acknowledged alert IDs for an operator.
 */
export function getAcknowledgedAlertIds(operatorId: string): string[] {
  try {
    const raw = localStorage.getItem(`${ACKNOWLEDGED_ALERTS_KEY}_${operatorId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Marks an alert as acknowledged for this operator without deleting it for the Organizer.
 */
export function acknowledgeAlert(operatorId: string, alertId: string): void {
  try {
    const current = getAcknowledgedAlertIds(operatorId);
    if (!current.includes(alertId)) {
      const updated = [...current, alertId];
      localStorage.setItem(`${ACKNOWLEDGED_ALERTS_KEY}_${operatorId}`, JSON.stringify(updated));
    }
  } catch (err) {
    console.error("Error saving alert acknowledgment:", err);
  }
}

/**
 * Checks if an alert is acknowledged.
 */
export function isAlertAcknowledged(operatorId: string, alertId: string): boolean {
  const list = getAcknowledgedAlertIds(operatorId);
  return list.includes(alertId);
}
