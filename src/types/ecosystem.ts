export type AttendeeJourneyStage =
  | "NOT_STARTED"
  | "TRAVELLING"
  | "ARRIVED_AT_DESTINATION"
  | "AT_PARKING"
  | "IN_TRANSIT"
  | "AT_VENUE"
  | "INSIDE_EVENT"
  | "EXITING"
  | "RETURNING"
  | "COMPLETED";

export interface AttendeeJourneyState {
  userId: string;
  eventId: string;
  currentStage: AttendeeJourneyStage;
  selectedTravelMode?: "metro" | "shuttle" | "car" | "rideshare" | "walk" | "bus";
  selectedParkingId?: string;
  selectedTransportId?: string;
  selectedAccommodationId?: string;
  assignedGate?: string;
  seatInfo?: string;
  notes?: string;
  updatedAt: string;
}

export interface EventTimelineMilestone {
  id: string;
  time: string;
  title: string;
  phase: "Pre-Event" | "Ingress" | "Main Event" | "Interval" | "Egress" | "Post-Event";
  description: string;
  location?: string;
  isKeyMilestone?: boolean;
}

export interface EventTimelineConfig {
  date: string;
  gatesOpenTime: string;
  eventStartTime: string;
  intervalTime?: string;
  eventEndTime: string;
  egressStartTime: string;
  egressEndTime: string;
  milestones: EventTimelineMilestone[];
}

export type EcosystemResourceType =
  | "venue"
  | "gate"
  | "transport"
  | "parking"
  | "accommodation"
  | "food"
  | "medical"
  | "venue_services"
  | "other";

export type EcosystemResourceStatus =
  | "AVAILABLE"
  | "LIMITED"
  | "NEAR CAPACITY"
  | "FULL"
  | "UNAVAILABLE"
  | "ACTIVE"
  | "INACTIVE"
  | "STANDBY"
  | "MAINTENANCE";

export interface ResourceDependency {
  targetResourceId: string;
  targetResourceType: EcosystemResourceType | string;
  dependencyType:
    | "SHUTTLE_FEEDER"
    | "PARKING_OVERFLOW"
    | "TRANSIT_DEMAND"
    | "ACCOMMODATION_TRANSIT"
    | "VENUE_INGRESS"
    | "MEALTIME_SPIKE"
    | "FIRST_AID_SUPPORT";
  description: string;
  impactLevel: "LOW" | "MEDIUM" | "HIGH";
}

export interface EcosystemResourceItem {
  id: string;
  eventId: string;
  category: EcosystemResourceType;
  name: string;
  location: string;
  totalCapacity: number;
  currentUsage: number;
  availableCapacity: number; // totalCapacity - currentUsage
  status: EcosystemResourceStatus;
  assignedOperatorId?: string;
  assignedOperatorName?: string;
  assignedOperatorType?: string;
  condition?: string;
  operatingHours?: string;
  notes?: string;
  dependencies?: ResourceDependency[];
}

export interface EventEcosystem {
  eventId: string;
  eventName: string;
  eventCategory: string;
  venueName: string;
  venueCapacity: number;
  venueCurrentUsage: number;
  timeline: EventTimelineConfig;
  resources: EcosystemResourceItem[];
  lastUpdated: string;
}
