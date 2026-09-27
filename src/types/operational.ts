export type EventOperationalStatus = "UPCOMING" | "PREPARING" | "LIVE" | "COMPLETED";

export type TelemetrySourceType = "REAL" | "SIMULATION" | "MANUAL" | "EXTERNAL_API" | "SENSOR";

export type CentralUtilizationStatus = "NORMAL" | "MODERATE" | "HIGH" | "CRITICAL";

export interface UtilizationThresholds {
  normalMax: number; // default < 60%
  moderateMax: number; // default 60-75%
  highMax: number; // default 75-90%
}

export const DEFAULT_UTILIZATION_THRESHOLDS: UtilizationThresholds = {
  normalMax: 60,
  moderateMax: 75,
  highMax: 90,
};

export function calculateUtilizationStatus(
  utilizationPercent: number,
  thresholds: UtilizationThresholds = DEFAULT_UTILIZATION_THRESHOLDS
): CentralUtilizationStatus {
  if (utilizationPercent < thresholds.normalMax) return "NORMAL";
  if (utilizationPercent <= thresholds.moderateMax) return "MODERATE";
  if (utilizationPercent <= thresholds.highMax) return "HIGH";
  return "CRITICAL";
}

export interface EventCrowdZone {
  id: string;
  name: string;
  capacity: number;
  currentCount: number;
  utilization: number;
  status: CentralUtilizationStatus;
  arrivalRate: number; // pax / min
  exitRate: number; // pax / min
}

export interface MonitoredResource {
  resourceId: string;
  eventId: string;
  name: string;
  type: "parking" | "transport" | "hospitality" | "accommodation";
  capacity: number;
  currentUsage: number;
  utilization: number;
  status: CentralUtilizationStatus | string;
  lastUpdated: string;
  assignedZone?: string;
  details?: string;
}

export interface LiveTelemetryValues {
  currentAttendees: number;
  arrivalRate: number;
  exitRate: number;
  crowdUtilization: number;
  parkingUtilization: number;
  transportUtilization: number;
  hospitalityUtilization: number;
  accommodationUtilization: number;
  status: CentralUtilizationStatus;
  lastUpdated: string;
  sourceType: TelemetrySourceType;
}

export interface OperationalAuditEntry {
  id: string;
  timestamp: string;
  eventId: string;
  resource: string;
  oldValue: string | number;
  newValue: string | number;
  changedBy: string;
  reason: string;
  sourceType: TelemetrySourceType;
}

export interface LiveSimulationConfig {
  isRunning: boolean;
  arrivalRate: number; // pax / min
  exitRate: number; // pax / min
  parkingDemandRate: number; // vehicles / min
  transportDemandRate: number; // transit pax / min
  hospitalityDemandRate: number; // orders / min
  speedMultiplier: number;
  activeScenario?: string;
  scenarioLabel?: string;
  lastTickAt?: string;
}

export interface CrowdState {
  totalExpected: number;
  currentAttendance: number; // Reported / live attendance count
  entryRate: number; // pax / min
  exitRate: number; // pax / min
  venueCapacity: number;
  occupancyPercent: number;
}

export type GateOperationalStatus = "NORMAL" | "BUSY" | "HIGH PRESSURE" | "RESTRICTED" | "CLOSED";

export interface GateOperationalState {
  id: string;
  name: string;
  status: GateOperationalStatus;
  capacity: number; // Base throughput capacity (e.g. 120 pax/min)
  currentCount: number; // Processed entries
  entryRate: number; // pax/min
  assignedSections: string[];
  allowedTicketGroups: string[]; // e.g. ["ga", "vip", "premium"]
  alternateGateIds: string[]; // Specific eligible alternate gate IDs (respects ticket access)
  additionalLanes: number;
  scanningCapacityMultiplier: number; // 1.0, 1.25, 1.5, 2.0
  operationalNote?: string;
  lastUpdated?: string;
}

export type TransportOperationalStatus = "NORMAL" | "ELEVATED" | "DISRUPTED" | "ACTIVE" | "STANDBY" | "DELAYED";

export interface TransportOperationalState {
  id: string;
  name: string;
  type: "metro" | "bus" | "shuttle" | "taxi" | "private" | "train" | "other";
  capacity: number;
  currentDemand: number;
  status: TransportOperationalStatus;
  pickupDropLocation: string;
  operatingWindow: string;
  assignedZone?: string;
  notes?: string;
}

export type ParkingOperationalStatus = "AVAILABLE" | "FILLING" | "NEAR CAPACITY" | "FULL" | "CLOSED";

export interface ParkingOperationalState {
  id: string;
  zoneName: string;
  totalSpaces: number;
  availableSpaces: number;
  occupiedSpaces: number;
  status: ParkingOperationalStatus;
  distanceFromVenue: string;
  entryRoute: string;
  shuttleAvailable?: boolean;
  fee?: string;
}

export type HospitalityCategory =
  | "Accommodation"
  | "Restaurants"
  | "Food Zones"
  | "Rest Areas"
  | "Medical Assistance"
  | "Help Desk"
  | "Other Services";

export type HospitalityOperationalStatus = "Normal" | "High Demand" | "Limited" | "Available" | "Operational" | "Standby";

export interface HospitalityOperationalState {
  id: string;
  name: string;
  category: HospitalityCategory;
  capacity: number | string;
  currentDemand: string;
  status: HospitalityOperationalStatus;
  location: string;
  operatingHours: string;
  notes?: string;
}

export type AlertSeverity = "INFO" | "NOTICE" | "WARNING" | "CRITICAL";
export type AlertAudience = "Organizer" | "Operators" | "Attendees" | "All";
export type AlertStatus = "ACTIVE" | "RESOLVED" | "EXPIRED";

export interface OperationalAlert {
  id: string;
  eventId: string;
  alertType: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  affectedArea?: string;
  affectedGate?: string;
  affectedTransportResource?: string;
  affectedHospitalityResource?: string;
  audience: AlertAudience;
  startTime: string;
  expiryTime?: string;
  createdAt: string;
  createdBy: string;
  status: AlertStatus;
  resolvedAt?: string;
  resolutionNote?: string;
  ruleKey?: string;
}

export interface OperationalActionLog {
  id: string;
  eventId: string;
  timestamp: string;
  action: string;
  resource: string;
  user: string;
  previousState?: string;
  newState?: string;
  details?: string;
}

export interface AttendeeGuidanceDecision {
  id: string;
  eventId: string;
  affectedResourceType: "hospitality" | "parking" | "transport" | "gate" | "zone";
  affectedResourceId: string;
  affectedResourceName: string;
  alternativeResourceId?: string;
  alternativeResourceName?: string;
  title: string;
  reason: string;
  message: string;
  recommendedActionText?: string;
  targetAudience?: {
    selectedParking?: string;
    selectedTransport?: string;
    selectedHospitality?: string;
    selectedAccommodation?: string;
    ticketZone?: string;
    preferredTravelMode?: string;
  };
  status: "ACTIVE" | "SUPERSEDED" | "RESOLVED";
  createdAt: string;
  approvedBy: string;
}

export interface GuidanceRule {
  id: string;
  eventId: string;
  conditionResourceType: "hospitality" | "parking" | "transport" | "gate";
  conditionResourceId: string;
  conditionTriggerStatus: string[]; // e.g. ["UNAVAILABLE", "FULL", "HIGH PRESSURE"]
  recommendedAlternativeId: string;
  recommendedAlternativeName: string;
  guidanceTitle: string;
  guidanceReason: string;
  guidanceMessage: string;
  autoApprove?: boolean;
}

export interface ActionVerificationRecord {
  id: string;
  actionId: string;
  eventId: string;
  resourceId: string;
  resourceName: string;
  actionTitle: string;
  beforeUtilization: number;
  afterUtilization?: number;
  measuredDelta?: number;
  verifiedAt?: string;
  status: "PENDING" | "VERIFIED" | "FAILED";
  impactSummary: string;
}

export interface EventReadinessChecklist {
  venue: { isReady: boolean; notes: string };
  gates: { isReady: boolean; notes: string; count: number };
  ticketInventory: { isReady: boolean; notes: string; soldCount: number; totalCapacity: number };
  transport: { isReady: boolean; notes: string; activeCount: number };
  parking: { isReady: boolean; notes: string; availableSpaces: number };
  hospitality: { isReady: boolean; notes: string; operationalCount: number };
  schedule: { isReady: boolean; notes: string; itemsCount: number };
  alerts: { isReady: boolean; notes: string; activeCount: number };
  overallPercent: number;
}

export interface EventOperationalLiveState {
  eventId: string;
  status: EventOperationalStatus;
  eventStatus: EventOperationalStatus; // Alias for backward compatibility
  currentAttendees: number;
  expectedAttendees: number;
  venueCapacity: number;
  crowdZones: Record<string, EventCrowdZone>;
  parkingResources: Record<string, MonitoredResource>;
  transportResources: Record<string, MonitoredResource>;
  hospitalityResources: Record<string, MonitoredResource>;
  accommodationResources: Record<string, MonitoredResource>;
  alerts: OperationalAlert[];
  actions: OperationalActionLog[];
  guidanceDecisions?: AttendeeGuidanceDecision[];
  verifications?: ActionVerificationRecord[];
  lastUpdated: string;
  sourceType: TelemetrySourceType;
  liveStartedAt?: string;
  telemetry: LiveTelemetryValues;
  auditLogs: OperationalAuditEntry[];
  simulationConfig?: LiveSimulationConfig;

  // Compatibility fields
  crowdState: CrowdState;
  gateStates: Record<string, GateOperationalState>;
  transportState: Record<string, TransportOperationalState>;
  parkingState: Record<string, ParkingOperationalState>;
  hospitalityState: Record<string, HospitalityOperationalState>;
  activeAlerts: OperationalAlert[];
  operationalActions: OperationalActionLog[];
  updatedBy: string;
}
