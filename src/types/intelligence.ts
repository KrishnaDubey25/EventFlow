import { EcosystemResourceType } from "./ecosystem";

export type ResourceOperationalStatus =
  | "AVAILABLE"
  | "NORMAL"
  | "NEAR CAPACITY"
  | "CRITICAL"
  | "OVER CAPACITY";

export type TrendDirection = "INCREASING" | "STABLE" | "DECREASING";

export type PressureLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export type EarlyWarningSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface CapacityThresholds {
  availableMax: number; // e.g. 60
  normalMax: number; // e.g. 80
  nearCapacityMax: number; // e.g. 90
  criticalMax: number; // e.g. 100
}

export interface ResourceCapacityCalculation {
  resourceId: string;
  resourceName: string;
  category: EcosystemResourceType;
  totalCapacity: number;
  currentUsage: number;
  availableCapacity: number; // totalCapacity - currentUsage
  utilizationPercentage: number; // (currentUsage / totalCapacity) * 100
  status: ResourceOperationalStatus;
  trend: TrendDirection;
  trendDelta: number; // difference from previous sample
  recentSamples: number[]; // e.g. [70, 76, 81, 87]
  lastUpdated: string;
  source: "Operator Update" | "Simulated Demo Data" | "System Calculation";
}

export interface EventPressureBreakdown {
  crowdUtilization: number;
  parkingUtilization: number;
  transportUtilization: number;
  hospitalityUtilization: number;
  venueUtilization: number;
  activeIncidentsCount: number;
}

export interface ContributingFactor {
  domain: string;
  utilization: number;
  impact: string;
  status: string;
}

export interface EventPressureReport {
  eventId: string;
  overallScore: number; // 0 to 100
  pressureLevel: PressureLevel;
  breakdown: EventPressureBreakdown;
  topFactors: ContributingFactor[];
  lastCalculated: string;
  isSimulated: boolean;
}

export interface ActionPreviewItem {
  actionId: string;
  title: string;
  description: string;
  reason: string;
  affectedResources: string[];
  previewOnly: true;
}

export interface EarlyWarningAlert {
  id: string;
  eventId: string;
  resourceId: string;
  resourceName: string;
  category: EcosystemResourceType;
  severity: EarlyWarningSeverity;
  reason: string;
  potentialImpact: string;
  currentUtilization: number;
  availableCapacity: number;
  trend: TrendDirection;
  timestamp: string;
  source: "Rule Engine" | "Simulation Controller" | "Operator Alert";
  possibleActions: ActionPreviewItem[];
  isAcknowledged?: boolean;
}

export interface ConnectedImpact {
  id: string;
  sourceResourceId: string;
  sourceResourceName: string;
  sourceCategory: EcosystemResourceType;
  targetResourceId: string;
  targetResourceName: string;
  targetCategory: EcosystemResourceType;
  relation: string;
  predictedImpact: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
}

export interface OperatorResourceIntelligence {
  resourceId: string;
  resourceName: string;
  operatorType: string;
  utilization: number;
  totalCapacity: number;
  availableCapacity: number;
  currentUsage: number;
  trend: TrendDirection;
  status: ResourceOperationalStatus;
  warning?: string;
  recommendedCheck?: string;
  connectedContext?: string;
  lastUpdated: string;
  source: "Operator Field Update" | "Simulated Demo Data" | "Rule Engine";
}

export interface AttendeeGuidanceNotice {
  id: string;
  category: "parking" | "transport" | "gates" | "food" | "general";
  journeyStageApplicable: string[];
  message: string;
  type: "info" | "advisory" | "alert";
  timestamp: string;
}

export interface EventSimulationState {
  isSimulationActive: boolean;
  resourceOverrides: Record<
    string,
    {
      currentUsage: number;
      totalCapacity?: number;
      status?: string;
    }
  >;
  simulatedAt: string;
  activeScenario?: "peak_parking" | "gate_surge" | "transit_disruption" | "normal" | "custom";
}

export type InsightPriority = "INFO" | "ADVISORY" | "WARNING" | "CRITICAL";

export interface AttendeeContext {
  attendeeId: string;
  eventId: string;
  ticketId: string;
  attendeeName?: string;
  origin?: string;
  originCoordinates?: { lat: number; lng: number };
  destination: {
    venueName: string;
    address: string;
    latitude: number;
    longitude: number;
    placeId?: string;
  };
  arrivalPreference?: "early" | "standard" | "just_in_time";
  travelMode: "driving" | "transit" | "rideshare" | "walking";
  ticketZone?: string;
  seat?: string;
  assignedGate?: string;
  eventDate: string;
  eventTime: string;
  currentJourneyState?: string;
  selectedParking?: string;
  selectedTransport?: string;
  selectedHospitality?: string;
  selectedAccommodation?: string;
}

export interface PersonalizedAttendeeInsight {
  id: string;
  attendeeId: string;
  eventId: string;
  priority: InsightPriority;
  title: string;
  message: string;
  actionableStep?: string;
  routeInfo?: {
    distanceKm: number;
    estimatedMinutes: number;
    trafficDelayMinutes: number;
    departureTime: string;
    targetArrivalTime: string;
    isLiveTraffic: boolean;
    status: "SMOOTH" | "MODERATE" | "CONGESTED";
  };
  recommendedDepartureTime: string;
  recommendedArrivalTime: string;
  generatedAt: string;
  source: string;
  dataClassification: "LIVE DATA" | "ESTIMATED DATA" | "SIMULATED DATA";
}

export type OperationalActionStatus =
  | "PROPOSED"
  | "APPROVED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "VERIFIED"
  | "FAILED";

export interface OperationalActionRecord {
  actionId: string;
  eventId: string;
  resourceId: string;
  resourceName: string;
  category: EcosystemResourceType;
  title: string;
  description: string;
  proposedBy: string;
  assignedToOperatorId?: string;
  assignedToOperatorName?: string;
  createdAt: string;
  updatedAt: string;
  status: OperationalActionStatus;
  preActionMetric?: {
    utilization: number;
    available: number;
  };
  postActionMetric?: {
    utilization: number;
    available: number;
    measuredAt: string;
    impactSummary: string;
  };
  attendeeConsequenceMessage?: string;
  isSimulated?: boolean;
}

export interface EventPredictionForecast {
  eventId: string;
  metric: string;
  predictedValue: number;
  predictionTime: string;
  confidence?: number;
  modelVersion: string;
  generatedAt: string;
  expectedPeakArrivalHour: string;
  predictedPressure: PressureLevel;
  recommendedActions: string[];
  isModelPrediction: boolean;
}

export interface AppNotification {
  notificationId: string;
  userId: string;
  role: "attendee" | "organizer" | "operator";
  eventId: string;
  type: InsightPriority;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  source: string;
  relatedResourceId?: string;
  actionLink?: string;
}

// ==========================================
// PHASE 15: PREDICTION & FORECASTING TYPES
// ==========================================

export type ForecastHorizon = 15 | 30 | 60 | 120; // Horizons in minutes

export type PredictionReliability = "LOW" | "MEDIUM" | "HIGH" | "INSUFFICIENT_DATA";

export type PredictionAlertType =
  | "PREDICTED_INFO"
  | "PREDICTED_ADVISORY"
  | "PREDICTED_WARNING"
  | "PREDICTED_CRITICAL";

export interface HistoricalTelemetryObservation {
  id: string;
  timestamp: string;
  timeMillis: number;
  eventId: string;
  currentAttendees: number;
  arrivalRate: number;
  exitRate: number;
  parkingUsage: Record<string, number>;
  parkingUtilization: Record<string, number>;
  transportUsage: Record<string, number>;
  transportUtilization: Record<string, number>;
  hospitalityUsage: Record<string, number>;
  accommodationUsage: Record<string, number>;
  zoneCounts: Record<string, number>;
  sourceType: string;
}

export interface ResourceForecast {
  resourceId: string;
  resourceName: string;
  type: "parking" | "transport" | "hospitality" | "accommodation";
  currentUsage: number;
  capacity: number;
  currentUtilization: number;
  predictedUsage15m: number;
  predictedUsage30m: number;
  predictedUsage60m: number;
  predictedUsage120m: number;
  predictedUtilization15m: number;
  predictedUtilization30m: number;
  predictedUtilization60m: number;
  predictedUtilization120m: number;
  predictedStatus: "NORMAL" | "MODERATE" | "HIGH" | "CRITICAL";
  timeToThresholdMinutes?: number;
  targetThresholdName?: string;
  explanation: string;
  rateOfChange: number;
  acceleration: number;
  reliability: PredictionReliability;
}

export interface ZoneForecast {
  zoneId: string;
  zoneName: string;
  capacity: number;
  currentCount: number;
  currentUtilization: number;
  predictedCount15m: number;
  predictedCount30m: number;
  predictedCount60m: number;
  predictedCount120m: number;
  predictedUtilization15m: number;
  predictedUtilization30m: number;
  predictedUtilization60m: number;
  predictedUtilization120m: number;
  predictedStatus: "NORMAL" | "MODERATE" | "HIGH" | "CRITICAL";
  explanation: string;
  reliability: PredictionReliability;
}

export interface ArrivalWaveForecast {
  isWaveDetected: boolean;
  waveIntensity: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  estimatedTimeToPeakMinutes: number;
  projectedPeakArrivalRate: number;
  description: string;
  explanation: string;
}

export interface ExitWaveForecast {
  isDispersalWaveDetected: boolean;
  estimatedTimeToDispersalMinutes: number;
  projectedDispersalDemandPax: number;
  projectedTransportDemand: "NORMAL" | "HIGH" | "CRITICAL";
  projectedParkingEgressRate: number;
  description: string;
  explanation: string;
}

export interface PredictionAlert {
  predictionId: string;
  eventId: string;
  resourceId?: string;
  resourceName?: string;
  resourceType?: "crowd" | "parking" | "transport" | "hospitality" | "accommodation" | "zone";
  severity: PredictionAlertType;
  title: string;
  message: string;
  forecastHorizonMinutes: number;
  predictedUtilization: number;
  timeUntilPressureMinutes: number;
  potentialImpact: string;
  explanation: string;
  createdAt: string;
  status: "ACTIVE" | "RESOLVED";
  ruleKey: string;
}

export interface PredictedEventState {
  eventId: string;
  generatedAt: string;
  horizons: ForecastHorizon[];
  currentAttendees: number;
  predictedAttendees15m: number;
  predictedAttendees30m: number;
  predictedAttendees60m: number;
  predictedAttendees120m: number;
  predictedUtilization15m: number;
  predictedUtilization30m: number;
  predictedUtilization60m: number;
  predictedUtilization120m: number;
  predictedArrivalRate: number;
  predictedExitRate: number;
  zoneForecasts: Record<string, ZoneForecast>;
  parkingForecasts: Record<string, ResourceForecast>;
  transportForecasts: Record<string, ResourceForecast>;
  hospitalityForecasts: Record<string, ResourceForecast>;
  accommodationForecasts: Record<string, ResourceForecast>;
  overallCrowdPressure: "NORMAL" | "MODERATE" | "HIGH" | "CRITICAL";
  arrivalWave: ArrivalWaveForecast;
  exitWave: ExitWaveForecast;
  predictionAlerts: PredictionAlert[];
  dataSufficiency: "SUFFICIENT" | "INSUFFICIENT_DATA";
  forecastReliability: PredictionReliability;
  sampleObservationsCount: number;
  explanation: string;
}

