import {
  ResourceCapacityCalculation,
  ResourceOperationalStatus,
  TrendDirection,
  EventPressureReport,
  PressureLevel,
  EarlyWarningAlert,
  EarlyWarningSeverity,
  ConnectedImpact,
  OperatorResourceIntelligence,
  AttendeeGuidanceNotice,
  EventSimulationState,
  CapacityThresholds,
  ActionPreviewItem,
  ContributingFactor,
} from "../types/intelligence";
import { EcosystemResourceItem, EcosystemResourceType } from "../types/ecosystem";
import { getEventEcosystem, getAllEventEcosystems } from "./eventEcosystemService";
import { getStoredOperatorResources } from "./operatorResourceService";

const TREND_STORAGE_KEY = "eventflow_resource_trend_history";
const SIMULATION_STORAGE_KEY = "eventflow_event_simulation";
const ACKNOWLEDGED_ALERTS_KEY = "eventflow_acknowledged_alerts";

export const DEFAULT_CAPACITY_THRESHOLDS: CapacityThresholds = {
  availableMax: 60,
  normalMax: 80,
  nearCapacityMax: 90,
  criticalMax: 100,
};

/**
 * Calculates deterministic status from utilization % using configurable thresholds
 */
export function determineResourceStatus(
  utilization: number,
  thresholds: CapacityThresholds = DEFAULT_CAPACITY_THRESHOLDS
): ResourceOperationalStatus {
  if (utilization <= thresholds.availableMax) return "AVAILABLE";
  if (utilization <= thresholds.normalMax) return "NORMAL";
  if (utilization <= thresholds.nearCapacityMax) return "NEAR CAPACITY";
  if (utilization <= thresholds.criticalMax) return "CRITICAL";
  return "OVER CAPACITY";
}

/**
 * Retrieves historical samples for trend analysis
 */
export function getResourceTrendHistory(): Record<string, number[]> {
  try {
    const raw = localStorage.getItem(TREND_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Appends a utilization sample and persists recent history (max 8 samples)
 */
export function recordResourceSample(resourceId: string, utilization: number): number[] {
  const history = getResourceTrendHistory();
  const samples = history[resourceId] || [];

  // Avoid recording identical sample if last sample is identical and recent
  if (samples.length > 0 && samples[samples.length - 1] === utilization) {
    return samples;
  }

  const updated = [...samples, utilization].slice(-8);
  history[resourceId] = updated;

  try {
    localStorage.setItem(TREND_STORAGE_KEY, JSON.stringify(history));
  } catch {}

  return updated;
}

/**
 * Calculates direction of trend from recent samples
 */
export function calculateTrendDirection(samples: number[]): {
  direction: TrendDirection;
  delta: number;
} {
  if (!samples || samples.length < 2) {
    return { direction: "STABLE", delta: 0 };
  }

  const latest = samples[samples.length - 1];
  const previous = samples[samples.length - 2];
  const delta = latest - previous;

  if (delta > 2) return { direction: "INCREASING", delta };
  if (delta < -2) return { direction: "DECREASING", delta };
  return { direction: "STABLE", delta };
}

/**
 * Retrieves simulation state for an event
 */
export function getSimulationState(eventId: string): EventSimulationState {
  try {
    const raw = localStorage.getItem(SIMULATION_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return (
      parsed[eventId] || {
        isSimulationActive: false,
        resourceOverrides: {},
        simulatedAt: new Date().toISOString(),
      }
    );
  } catch {
    return {
      isSimulationActive: false,
      resourceOverrides: {},
      simulatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Saves simulation state
 */
export function setSimulationState(eventId: string, state: EventSimulationState): void {
  try {
    const raw = localStorage.getItem(SIMULATION_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[eventId] = state;
    localStorage.setItem(SIMULATION_STORAGE_KEY, JSON.stringify(parsed));
    window.dispatchEvent(new CustomEvent("eventflow_intelligence_updated", { detail: { eventId } }));
  } catch {}
}

/**
 * Toggles simulation mode
 */
export function toggleSimulationMode(eventId: string, active: boolean): EventSimulationState {
  const current = getSimulationState(eventId);
  const updated: EventSimulationState = {
    ...current,
    isSimulationActive: active,
    simulatedAt: new Date().toISOString(),
  };
  setSimulationState(eventId, updated);
  return updated;
}

/**
 * Sets an override for a resource in simulation mode
 */
export function setResourceSimulationOverride(
  eventId: string,
  resourceId: string,
  currentUsage: number,
  totalCapacity?: number
): EventSimulationState {
  const current = getSimulationState(eventId);
  const updated: EventSimulationState = {
    ...current,
    isSimulationActive: true,
    resourceOverrides: {
      ...current.resourceOverrides,
      [resourceId]: {
        currentUsage,
        totalCapacity,
      },
    },
    simulatedAt: new Date().toISOString(),
  };
  setSimulationState(eventId, updated);

  // Record trend sample for the new simulated value
  const eco = getEventEcosystem(eventId);
  const res = eco.resources.find((r) => r.id === resourceId);
  const tot = totalCapacity || res?.totalCapacity || 100;
  const util = Math.round((currentUsage / tot) * 100);
  recordResourceSample(resourceId, util);

  return updated;
}

/**
 * Resets simulation state for an event
 */
export function resetSimulation(eventId: string): void {
  setSimulationState(eventId, {
    isSimulationActive: false,
    resourceOverrides: {},
    simulatedAt: new Date().toISOString(),
  });
}

/**
 * Applies a pre-configured realistic operational test scenario
 */
export function applySimulationScenario(
  eventId: string,
  scenario: "peak_parking" | "gate_surge" | "transit_disruption" | "normal"
): EventSimulationState {
  const eco = getEventEcosystem(eventId);
  const overrides: Record<string, { currentUsage: number; totalCapacity?: number }> = {};

  if (scenario === "peak_parking") {
    // Escalate parking to 91%
    eco.resources
      .filter((r) => r.category === "parking")
      .forEach((p) => {
        const usage = Math.round(p.totalCapacity * 0.91);
        overrides[p.id] = { currentUsage: usage };
        recordResourceSample(p.id, 91);
      });
  } else if (scenario === "gate_surge") {
    // Escalate gate ingress to 94%
    eco.resources
      .filter((r) => r.category === "gate")
      .forEach((g) => {
        const usage = Math.round(g.totalCapacity * 0.94);
        overrides[g.id] = { currentUsage: usage };
        recordResourceSample(g.id, 94);
      });
  } else if (scenario === "transit_disruption") {
    // Elevate transport to 88%
    eco.resources
      .filter((r) => r.category === "transport")
      .forEach((t) => {
        const usage = Math.round(t.totalCapacity * 0.88);
        overrides[t.id] = { currentUsage: usage };
        recordResourceSample(t.id, 88);
      });
  } else {
    // Normal: Return to 65% baseline
    eco.resources.forEach((r) => {
      const usage = Math.round(r.totalCapacity * 0.65);
      overrides[r.id] = { currentUsage: usage };
      recordResourceSample(r.id, 65);
    });
  }

  const newState: EventSimulationState = {
    isSimulationActive: true,
    resourceOverrides: overrides,
    activeScenario: scenario,
    simulatedAt: new Date().toISOString(),
  };

  setSimulationState(eventId, newState);
  return newState;
}

/**
 * Calculates resource capacity engine metrics for a resource
 */
export function calculateResourceMetrics(
  resource: EcosystemResourceItem,
  simulationState: EventSimulationState,
  historyMap: Record<string, number[]> = getResourceTrendHistory(),
  thresholds: CapacityThresholds = DEFAULT_CAPACITY_THRESHOLDS
): ResourceCapacityCalculation {
  const override = simulationState.isSimulationActive
    ? simulationState.resourceOverrides[resource.id]
    : undefined;

  const totalCapacity = override?.totalCapacity !== undefined ? override.totalCapacity : resource.totalCapacity || 100;
  const currentUsage = override?.currentUsage !== undefined ? override.currentUsage : resource.currentUsage || 0;
  const availableCapacity = Math.max(0, totalCapacity - currentUsage);
  const utilizationPercentage = totalCapacity > 0 ? Math.round((currentUsage / totalCapacity) * 100) : 0;

  const status = determineResourceStatus(utilizationPercentage, thresholds);

  // Trend analysis
  let samples = historyMap[resource.id] || [];
  if (samples.length === 0) {
    // Initialize default history baseline e.g. [current - 12, current - 6, current]
    samples = [
      Math.max(0, utilizationPercentage - 14),
      Math.max(0, utilizationPercentage - 7),
      utilizationPercentage,
    ];
    historyMap[resource.id] = samples;
    try {
      localStorage.setItem(TREND_STORAGE_KEY, JSON.stringify(historyMap));
    } catch {}
  } else if (samples[samples.length - 1] !== utilizationPercentage) {
    samples = [...samples, utilizationPercentage].slice(-8);
    historyMap[resource.id] = samples;
  }

  const { direction, delta } = calculateTrendDirection(samples);

  return {
    resourceId: resource.id,
    resourceName: resource.name,
    category: resource.category,
    totalCapacity,
    currentUsage,
    availableCapacity,
    utilizationPercentage,
    status,
    trend: direction,
    trendDelta: delta,
    recentSamples: samples,
    lastUpdated: new Date().toISOString(),
    source: simulationState.isSimulationActive && override
      ? "Simulated Demo Data"
      : resource.assignedOperatorId
      ? "Operator Update"
      : "System Calculation",
  };
}

/**
 * Calculates the Event Pressure Score combining all operational domains
 */
export function calculateEventPressure(
  eventId: string,
  resourcesCalculations: ResourceCapacityCalculation[],
  simulationActive: boolean
): EventPressureReport {
  // Categorize calculations
  const gates = resourcesCalculations.filter((r) => r.category === "gate");
  const transport = resourcesCalculations.filter((r) => r.category === "transport");
  const parking = resourcesCalculations.filter((r) => r.category === "parking");
  const hospitality = resourcesCalculations.filter((r) =>
    ["food", "accommodation", "medical", "venue_services"].includes(r.category)
  );

  const avg = (list: ResourceCapacityCalculation[], defaultVal = 65) =>
    list.length > 0 ? Math.round(list.reduce((s, r) => s + r.utilizationPercentage, 0) / list.length) : defaultVal;

  const gateUtil = avg(gates, 70);
  const transUtil = avg(transport, 68);
  const parkUtil = avg(parking, 72);
  const hospUtil = avg(hospitality, 65);
  const venueUtil = Math.round(gateUtil * 0.5 + parkUtil * 0.3 + transUtil * 0.2);

  // Contributing factors
  const topFactors: ContributingFactor[] = [
    {
      domain: "Venue Ingress & Concourses",
      utilization: venueUtil,
      impact: venueUtil >= 85 ? "Turnstile pressure elevated" : "Smooth spectator flow",
      status: determineResourceStatus(venueUtil),
    },
    {
      domain: "Parking Facilities",
      utilization: parkUtil,
      impact: parkUtil >= 85 ? "Bays nearing saturation; overflow needed" : "Adequate bays available",
      status: determineResourceStatus(parkUtil),
    },
    {
      domain: "Arterial Transport & Shuttles",
      utilization: transUtil,
      impact: transUtil >= 85 ? "High transit demand; boarding queues" : "On-schedule headways",
      status: determineResourceStatus(transUtil),
    },
    {
      domain: "Hospitality & Dining",
      utilization: hospUtil,
      impact: hospUtil >= 80 ? "Peak concessions rush" : "Moderate queue times",
      status: determineResourceStatus(hospUtil),
    },
  ];

  // Weighted overall pressure score:
  // 30% Parking, 25% Venue/Gates, 25% Transport, 20% Hospitality
  const overallScore = Math.round(parkUtil * 0.3 + venueUtil * 0.25 + transUtil * 0.25 + hospUtil * 0.2);

  let pressureLevel: PressureLevel = "LOW";
  if (overallScore >= 90) pressureLevel = "CRITICAL";
  else if (overallScore >= 75) pressureLevel = "HIGH";
  else if (overallScore >= 55) pressureLevel = "MODERATE";

  return {
    eventId,
    overallScore,
    pressureLevel,
    breakdown: {
      crowdUtilization: venueUtil,
      parkingUtilization: parkUtil,
      transportUtilization: transUtil,
      hospitalityUtilization: hospUtil,
      venueUtilization: venueUtil,
      activeIncidentsCount: overallScore >= 80 ? 2 : 0,
    },
    topFactors: topFactors.sort((a, b) => b.utilization - a.utilization),
    lastCalculated: new Date().toISOString(),
    isSimulated: simulationActive,
  };
}

/**
 * Deterministic Early Warning Engine
 */
export function generateEarlyWarnings(
  eventId: string,
  metrics: ResourceCapacityCalculation[]
): EarlyWarningAlert[] {
  const alerts: EarlyWarningAlert[] = [];
  const now = new Date().toISOString();

  metrics.forEach((m) => {
    // Rule 1: Utilization is NEAR CAPACITY or CRITICAL and trend is INCREASING or STABLE
    if (m.utilizationPercentage >= 80) {
      const isCritical = m.utilizationPercentage >= 90;
      const isOver = m.utilizationPercentage > 100;
      const severity: EarlyWarningSeverity = isOver || isCritical ? "CRITICAL" : "WARNING";

      let reason = `${m.resourceName} is currently at ${m.utilizationPercentage}% capacity`;
      if (m.trend === "INCREASING") {
        reason += ` and utilization is trending upward (+${m.trendDelta}% delta).`;
      } else {
        reason += `.`;
      }

      let potentialImpact = "";
      const possibleActions: ActionPreviewItem[] = [];

      if (m.category === "parking") {
        potentialImpact = "Additional arriving vehicles will require overflow parking routing and shuttle dispatch.";
        possibleActions.push(
          {
            actionId: "act-overflow-parking",
            title: "Prepare Overflow Parking Sector",
            description: "Divert approaching private vehicles towards Remote Sector P3 and surface parking.",
            reason: `Parking bay remaining capacity is down to ${m.availableCapacity} spots.`,
            affectedResources: [m.resourceName, "Overflow Sector P3", "Shuttle Line S2"],
            previewOnly: true,
          },
          {
            actionId: "act-increase-shuttle",
            title: "Increase Feeder Shuttle Frequency",
            description: "Deploy 4 auxiliary electric shuttles to clear parking transit plazas.",
            reason: "High vehicle arrival rate creating pedestrian waiting queues.",
            affectedResources: ["Express Shuttle S2", "South Bus Terminal"],
            previewOnly: true,
          },
          {
            actionId: "act-parking-advisory",
            title: "Broadcast Parking Advisory to Arriving Attendees",
            description: "Send push guidance alerting attendees to use Metro Line 3 or pre-cleared lots.",
            reason: "Prevents perimeter gridlock before ingress closes.",
            affectedResources: ["Attendee Mobile Guidance"],
            previewOnly: true,
          }
        );
      } else if (m.category === "transport") {
        potentialImpact = "Platform and bus stop crowding may cause transit delays and delayed venue ingress.";
        possibleActions.push(
          {
            actionId: "act-transit-headway",
            title: "Compress Shuttle Headways (4-min loops)",
            description: "Dispatch reserve buses on rapid turnaround to absorb arrival surge.",
            reason: `Transit corridor is at ${m.utilizationPercentage}% capacity load.`,
            affectedResources: [m.resourceName, "Perimeter Transit Bay"],
            previewOnly: true,
          },
          {
            actionId: "act-station-marshals",
            title: "Deploy Crowd Marshals at Skywalk",
            description: "Position marshals to regulate escalator and turnstile queue spacing.",
            reason: "Prevents compression at metro station exit portals.",
            affectedResources: ["Metro Skywalk Concourse"],
            previewOnly: true,
          }
        );
      } else if (m.category === "gate") {
        potentialImpact = "Spectators will experience turnstile wait times exceeding 15 minutes.";
        possibleActions.push(
          {
            actionId: "act-gate-divert",
            title: "Open Alternate Auxiliary Scanning Lanes",
            description: "Activate 2 standby bag-check lanes and turnstile scanners.",
            reason: `Gate scanning pressure is at ${m.utilizationPercentage}%.`,
            affectedResources: [m.resourceName, "Adjacent Gate 2"],
            previewOnly: true,
          }
        );
      } else if (m.category === "food") {
        potentialImpact = "Concourse footfall queues will block pedestrian movement during halftime interval.";
        possibleActions.push(
          {
            actionId: "act-express-pos",
            title: "Activate Mobile Pickup & Express POS",
            description: "Direct mobile app orders to dedicated pickup counter to clear main counter lines.",
            reason: "Food zone experiencing peak rush demand.",
            affectedResources: [m.resourceName],
            previewOnly: true,
          }
        );
      } else {
        potentialImpact = "Service capacity nearing threshold; operational monitoring advised.";
        possibleActions.push({
          actionId: "act-service-alert",
          title: "Alert Sector Team Supervisor",
          description: "Request on-duty operator check-in to confirm staffing reserves.",
          reason: `Resource reached ${m.utilizationPercentage}% load.`,
          affectedResources: [m.resourceName],
          previewOnly: true,
        });
      }

      alerts.push({
        id: `alert-ew-${m.resourceId}`,
        eventId,
        resourceId: m.resourceId,
        resourceName: m.resourceName,
        category: m.category,
        severity,
        reason,
        potentialImpact,
        currentUtilization: m.utilizationPercentage,
        availableCapacity: m.availableCapacity,
        trend: m.trend,
        timestamp: now,
        source: m.source === "Simulated Demo Data" ? "Simulation Controller" : "Rule Engine",
        possibleActions,
      });
    }
  });

  // Sort alerts by severity (CRITICAL first, then WARNING, then by utilization)
  return alerts.sort((a, b) => {
    if (a.severity === "CRITICAL" && b.severity !== "CRITICAL") return -1;
    if (a.severity !== "CRITICAL" && b.severity === "CRITICAL") return 1;
    return b.currentUtilization - a.currentUtilization;
  });
}

/**
 * Calculates Connected Resource Impacts using deterministic dependency rules
 */
export function calculateConnectedImpacts(
  metrics: ResourceCapacityCalculation[],
  resources: EcosystemResourceItem[]
): ConnectedImpact[] {
  const impacts: ConnectedImpact[] = [];

  metrics.forEach((source) => {
    if (source.utilizationPercentage >= 80) {
      const sourceRes = resources.find((r) => r.id === source.resourceId);

      if (source.category === "parking") {
        // Connected to Transport & Venue Arrival
        const targetTrans = resources.find((r) => r.category === "transport");
        if (targetTrans) {
          impacts.push({
            id: `imp-${source.resourceId}-${targetTrans.id}`,
            sourceResourceId: source.resourceId,
            sourceResourceName: source.resourceName,
            sourceCategory: "parking",
            targetResourceId: targetTrans.id,
            targetResourceName: targetTrans.name,
            targetCategory: "transport",
            relation: "Parking Saturation → Shuttle Transit Demand",
            predictedImpact: "As parking lots fill, private vehicle drivers divert to transit shuttles. Expect ~18% feeder demand increase.",
            severity: source.utilizationPercentage >= 90 ? "HIGH" : "MEDIUM",
          });
        }
      } else if (source.category === "accommodation") {
        // Connected to Transport
        const targetTrans = resources.find((r) => r.category === "transport");
        if (targetTrans) {
          impacts.push({
            id: `imp-${source.resourceId}-${targetTrans.id}`,
            sourceResourceId: source.resourceId,
            sourceResourceName: source.resourceName,
            sourceCategory: "accommodation",
            targetResourceId: targetTrans.id,
            targetResourceName: targetTrans.name,
            targetCategory: "transport",
            relation: "Lodging Saturation → Synchronized Transit Surge",
            predictedImpact: "High hotel occupancy creates synchronized arrival waves 60-90 minutes prior to main event start.",
            severity: "MEDIUM",
          });
        }
      } else if (source.category === "food") {
        // Connected to Concourse Flow & Gates
        impacts.push({
          id: `imp-${source.resourceId}-crowd`,
          sourceResourceId: source.resourceId,
          sourceResourceName: source.resourceName,
          sourceCategory: "food",
          targetResourceId: "venue-concourse",
          targetResourceName: "Concourse Circulation Zone",
          targetCategory: "venue",
          relation: "Dining Rush → Local Concourse Density",
          predictedImpact: "Long food queues spill into main egress passageways, reducing spectator movement speeds by 35%.",
          severity: source.utilizationPercentage >= 90 ? "HIGH" : "MEDIUM",
        });
      } else if (source.category === "gate") {
        // Connected to Venue Seats
        impacts.push({
          id: `imp-${source.resourceId}-seats`,
          sourceResourceId: source.resourceId,
          sourceResourceName: source.resourceName,
          sourceCategory: "gate",
          targetResourceId: "venue-arena",
          targetResourceName: "Main Arena Stand Seating",
          targetCategory: "venue",
          relation: "Turnstile Ingress Rate → Stand Ingress Delay",
          predictedImpact: "Turnstile queues delay stadium bowl seating. Staggered lane opening recommended.",
          severity: "HIGH",
        });
      }
    }
  });

  return impacts;
}

/**
 * Returns role-isolated intelligence for an Operator
 */
export function getOperatorIntelligence(
  operatorId: string,
  eventId: string
): OperatorResourceIntelligence[] {
  const operatorResources = getStoredOperatorResources().filter(
    (r) => r.operatorId === operatorId && r.assignedEventIds?.includes(eventId)
  );

  const simulationState = getSimulationState(eventId);
  const historyMap = getResourceTrendHistory();

  return operatorResources.map((res) => {
    // Adapt to EcosystemResourceItem shape for metric calculation
    const adapted: EcosystemResourceItem = {
      id: res.id,
      eventId,
      category: res.resourceType as EcosystemResourceType,
      name: res.name,
      location: res.location,
      totalCapacity: res.capacity,
      currentUsage: res.occupiedCapacity,
      availableCapacity: res.availableCapacity,
      status: res.status as any,
    };

    const metrics = calculateResourceMetrics(adapted, simulationState, historyMap);

    let warning: string | undefined;
    let recommendedCheck: string | undefined;
    let connectedContext: string | undefined;

    if (metrics.utilizationPercentage >= 90) {
      warning = "Capacity is approaching critical operational threshold (>90%).";
      recommendedCheck = "Prepare secondary overflow sector and inspect turnaround speeds.";
      connectedContext = "Central Command has been notified of your sector's pressure.";
    } else if (metrics.utilizationPercentage >= 80) {
      warning = "Elevated sector demand detected (>80%).";
      recommendedCheck = "Verify lane staffing and review throughput queues.";
    }

    return {
      resourceId: res.id,
      resourceName: res.name,
      operatorType: res.operatorType,
      utilization: metrics.utilizationPercentage,
      totalCapacity: metrics.totalCapacity,
      availableCapacity: metrics.availableCapacity,
      currentUsage: metrics.currentUsage,
      trend: metrics.trend,
      status: metrics.status,
      warning,
      recommendedCheck,
      connectedContext,
      lastUpdated: new Date().toISOString(),
      source: simulationState.isSimulationActive ? "Simulated Demo Data" : "Operator Field Update",
    };
  });
}

/**
 * Converts internal operational state into helpful attendee guidance notices
 * Strictly hides raw internal telemetry numbers.
 */
export function getAttendeeGuidance(
  eventId: string,
  metrics: ResourceCapacityCalculation[]
): AttendeeGuidanceNotice[] {
  const notices: AttendeeGuidanceNotice[] = [];
  const now = new Date().toISOString();

  const parking = metrics.filter((m) => m.category === "parking");
  const transport = metrics.filter((m) => m.category === "transport");
  const gates = metrics.filter((m) => m.category === "gate");
  const food = metrics.filter((m) => m.category === "food");

  // Parking Notice
  const busyParking = parking.find((p) => p.utilizationPercentage >= 80);
  if (busyParking) {
    notices.push({
      id: "att-notice-parking",
      category: "parking",
      journeyStageApplicable: ["TRAVELLING", "ARRIVED_AT_DESTINATION", "AT_PARKING"],
      message: "Parking facilities near your selected arrival area are currently busy. Consider following directional signage to alternate bays or using rapid metro transit.",
      type: busyParking.utilizationPercentage >= 90 ? "alert" : "advisory",
      timestamp: now,
    });
  }

  // Transport Notice
  const busyTransport = transport.find((t) => t.utilizationPercentage >= 80);
  if (busyTransport) {
    notices.push({
      id: "att-notice-transport",
      category: "transport",
      journeyStageApplicable: ["TRAVELLING", "IN_TRANSIT", "EXITING", "RETURNING"],
      message: "Transit corridors and shuttle lines are experiencing high ridership. Please allow 15 to 20 minutes additional travel buffer.",
      type: "advisory",
      timestamp: now,
    });
  }

  // Gates Notice
  const busyGate = gates.find((g) => g.utilizationPercentage >= 85);
  if (busyGate) {
    notices.push({
      id: "att-notice-gate",
      category: "gates",
      journeyStageApplicable: ["AT_VENUE", "ARRIVED_AT_DESTINATION"],
      message: "Perimeter turnstiles are seeing active spectator ingress. Zero-bag attendees may proceed directly through express green inspection lanes.",
      type: "info",
      timestamp: now,
    });
  }

  // Food Notice
  const busyFood = food.find((f) => f.utilizationPercentage >= 80);
  if (busyFood) {
    notices.push({
      id: "att-notice-food",
      category: "food",
      journeyStageApplicable: ["INSIDE_EVENT"],
      message: "Concourse dining zones are in high demand during session intervals. Complimentary filtered hydration points remain available at all aisle entrances.",
      type: "info",
      timestamp: now,
    });
  }

  // Default baseline notice if everything is smooth
  if (notices.length === 0) {
    notices.push({
      id: "att-notice-smooth",
      category: "general",
      journeyStageApplicable: ["NOT_STARTED", "TRAVELLING", "AT_VENUE", "INSIDE_EVENT"],
      message: "All venue ingress corridors, transit shuttles, and concourse services are operating smoothly with normal arrival flow.",
      type: "info",
      timestamp: now,
    });
  }

  return notices;
}

/**
 * Master Intelligence Snapshot for an Event
 */
export interface EventIntelligenceSnapshot {
  eventId: string;
  eventName: string;
  pressureReport: EventPressureReport;
  resourceMetrics: ResourceCapacityCalculation[];
  earlyWarnings: EarlyWarningAlert[];
  connectedImpacts: ConnectedImpact[];
  simulationState: EventSimulationState;
  lastUpdated: string;
}

/**
 * Evaluates the full intelligence layer for an event
 */
export function evaluateEventIntelligence(eventId: string): EventIntelligenceSnapshot {
  const ecosystem = getEventEcosystem(eventId);
  const simulationState = getSimulationState(eventId);
  const historyMap = getResourceTrendHistory();

  // 1. Calculate metrics for all resources
  const resourceMetrics = ecosystem.resources.map((res) =>
    calculateResourceMetrics(res, simulationState, historyMap)
  );

  // 2. Compute Event Pressure Score
  const pressureReport = calculateEventPressure(
    eventId,
    resourceMetrics,
    simulationState.isSimulationActive
  );

  // 3. Early Warnings
  const earlyWarnings = generateEarlyWarnings(eventId, resourceMetrics);

  // 4. Connected Impacts
  const connectedImpacts = calculateConnectedImpacts(resourceMetrics, ecosystem.resources);

  return {
    eventId,
    eventName: ecosystem.eventName,
    pressureReport,
    resourceMetrics,
    earlyWarnings,
    connectedImpacts,
    simulationState,
    lastUpdated: new Date().toISOString(),
  };
}
