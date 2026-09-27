/**
 * OperationalActionService
 * Coordinates the EventFlow Operational Action Loop:
 * Prediction / Pressure -> Impact Analysis -> Action Decision -> Event State Update ->
 * Operator Assignment -> Attendee Consequence -> Post-Action Verification & Measurement.
 */

import {
  OperationalActionRecord,
  OperationalActionStatus,
} from "../types/intelligence";
import { EcosystemResourceType } from "../types/ecosystem";
import { getStoredEventById } from "./eventStorageService";
import { addNotification } from "./notificationService";

const ACTIONS_STORAGE_KEY = "eventflow_operational_actions";

export function getStoredActions(eventId?: string): OperationalActionRecord[] {
  try {
    const raw = localStorage.getItem(ACTIONS_STORAGE_KEY);
    const actions: OperationalActionRecord[] = raw ? JSON.parse(raw) : [];
    if (eventId) {
      return actions.filter((a) => a.eventId === eventId);
    }
    return actions;
  } catch {
    return [];
  }
}

export function saveStoredActions(actions: OperationalActionRecord[]): void {
  try {
    localStorage.setItem(ACTIONS_STORAGE_KEY, JSON.stringify(actions));
    // Broadcast for live reactivity across dashboards
    window.dispatchEvent(new CustomEvent("eventflow_action_updated"));
  } catch (err) {
    console.error("Failed to save operational actions:", err);
  }
}

/**
 * Initializes default operational action presets for any event if not present
 */
export function initializeDefaultActionsForEvent(eventId: string): OperationalActionRecord[] {
  const existing = getStoredActions(eventId);
  if (existing.length > 0) return existing;

  const event = getStoredEventById(eventId);
  const now = new Date();

  const presets: OperationalActionRecord[] = [
    {
      actionId: `act-${eventId}-01`,
      eventId,
      resourceId: `res-trans-0`,
      resourceName: "Shuttle Transit Loop",
      category: "transport",
      title: "Increase Shuttle Bus Frequency to 4-Minute Headways",
      description: "Deploy 6 standby electric feeder buses from depot to clear surge queues at transit stations.",
      proposedBy: "Lead Operations Director",
      assignedToOperatorId: "op-transport-1",
      assignedToOperatorName: "Rapid Transit Operations",
      createdAt: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
      status: "COMPLETED",
      preActionMetric: {
        utilization: 88,
        available: 140,
      },
      postActionMetric: {
        utilization: 64,
        available: 430,
        measuredAt: new Date().toISOString(),
        impactSummary: "Action impact observed: Shuttle queue wait dropped from 14 mins to 4 mins.",
      },
      attendeeConsequenceMessage: "Additional electric shuttle capacity has been deployed along your arrival corridor.",
      isSimulated: false,
    },
    {
      actionId: `act-${eventId}-02`,
      eventId,
      resourceId: `res-park-0`,
      resourceName: "Primary Multilevel Parking",
      category: "parking",
      title: "Activate Overflow Surface Parking Lot P2",
      description: "Direct arriving private vehicles via electronic matrix signs to overflow lot to maintain 15% safety buffer.",
      proposedBy: "Perimeter Traffic Controller",
      assignedToOperatorId: "op-parking-1",
      assignedToOperatorName: "Perimeter Parking Services",
      createdAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
      status: "IN_PROGRESS",
      preActionMetric: {
        utilization: 91,
        available: 120,
      },
      attendeeConsequenceMessage: "Overflow parking lot P2 is now open with direct electric feeder shuttle to Gate 1.",
      isSimulated: false,
    },
    {
      actionId: `act-${eventId}-03`,
      eventId,
      resourceId: `res-gate-1`,
      resourceName: "Gate 1 Turnstiles",
      category: "gate",
      title: "Open Express Zero-Bag Ingress Lanes",
      description: "Convert 4 standard turnstiles into dedicated fast-track lanes for attendees without bags.",
      proposedBy: "Security & Gate Lead",
      assignedToOperatorId: "op-gate-1",
      assignedToOperatorName: "Venue Turnstile Control",
      createdAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      status: "APPROVED",
      preActionMetric: {
        utilization: 85,
        available: 200,
      },
      attendeeConsequenceMessage: "Zero-bag fast-track lanes are now open at Gate 1 for accelerated under-2-min entry.",
      isSimulated: false,
    },
  ];

  const all = getStoredActions();
  const merged = [...presets, ...all.filter((a) => a.eventId !== eventId)];
  saveStoredActions(merged);
  return presets;
}

/**
 * Creates and proposes a new operational action
 */
export function proposeOperationalAction(params: {
  eventId: string;
  resourceId: string;
  resourceName: string;
  category: EcosystemResourceType;
  title: string;
  description: string;
  proposedBy: string;
  assignedToOperatorName?: string;
  attendeeConsequenceMessage?: string;
  currentUtilization?: number;
}): OperationalActionRecord {
  const all = getStoredActions();
  const actionId = `act-${Date.now()}`;

  const record: OperationalActionRecord = {
    actionId,
    eventId: params.eventId,
    resourceId: params.resourceId,
    resourceName: params.resourceName,
    category: params.category,
    title: params.title,
    description: params.description,
    proposedBy: params.proposedBy,
    assignedToOperatorName: params.assignedToOperatorName || "Operations Unit",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "PROPOSED",
    preActionMetric: params.currentUtilization
      ? {
          utilization: params.currentUtilization,
          available: 100 - params.currentUtilization,
        }
      : undefined,
    attendeeConsequenceMessage: params.attendeeConsequenceMessage,
    isSimulated: false,
  };

  all.unshift(record);
  saveStoredActions(all);

  // Notify Organizer
  addNotification({
    notificationId: `notif-${actionId}`,
    userId: "organizer",
    role: "organizer",
    eventId: params.eventId,
    type: "ADVISORY",
    title: `New Action Proposed: ${params.title}`,
    message: params.description,
    createdAt: new Date().toISOString(),
    read: false,
    source: "Operational Command",
    relatedResourceId: params.resourceId,
  });

  return record;
}

/**
 * Updates an operational action's lifecycle status (e.g. APPROVED, IN_PROGRESS, COMPLETED, VERIFIED)
 * and propagates updates to operator and attendees.
 */
export function updateActionStatus(
  actionId: string,
  newStatus: OperationalActionStatus,
  verificationDetails?: {
    measuredUtilization?: number;
    impactSummary?: string;
  }
): OperationalActionRecord | null {
  const all = getStoredActions();
  const target = all.find((a) => a.actionId === actionId);
  if (!target) return null;

  target.status = newStatus;
  target.updatedAt = new Date().toISOString();

  if (newStatus === "VERIFIED" || newStatus === "COMPLETED") {
    const postUtil = verificationDetails?.measuredUtilization ?? Math.max(45, (target.preActionMetric?.utilization || 85) - 18);
    target.postActionMetric = {
      utilization: postUtil,
      available: 100 - postUtil,
      measuredAt: new Date().toISOString(),
      impactSummary:
        verificationDetails?.impactSummary ||
        `Action impact observed: Pressure reduced from ${target.preActionMetric?.utilization || 88}% to ${postUtil}%. Target stabilization achieved.`,
    };
  }

  saveStoredActions(all);

  // Broadcast notification for Organizer & Operator
  addNotification({
    notificationId: `notif-status-${actionId}-${Date.now()}`,
    userId: "organizer",
    role: "organizer",
    eventId: target.eventId,
    type: newStatus === "COMPLETED" || newStatus === "VERIFIED" ? "INFO" : "ADVISORY",
    title: `Operational Action: ${target.title} is now ${newStatus}`,
    message: target.postActionMetric
      ? target.postActionMetric.impactSummary
      : `Action status updated to ${newStatus} by operations lead.`,
    createdAt: new Date().toISOString(),
    read: false,
    source: "Operations Command",
    relatedResourceId: target.resourceId,
  });

  return target;
}
