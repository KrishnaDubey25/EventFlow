export type ExperienceMode = "organizer" | "operator" | "attendee";

export type EventCategory = "sports" | "concert" | "conference" | "festival" | "motorsport";

export interface MegaEvent {
  id: string;
  name: string;
  type: EventCategory;
  venue: string;
  city: string;
  country: string;
  capacity: number;
  expectedAttendance: number;
  currentAttendance: number;
  date: string;
  time: string;
  status: "live" | "scheduled" | "post-event";
  currentPhase: "Pre-Event Build" | "Ingress Peak" | "Main Event Active" | "Interval / Halftime" | "Egress Spike" | "Egress Concluding";
  description: string;
  weather: {
    temp: string;
    condition: string;
    alert?: string;
  };
  gates: GateInfo[];
  parkingLots: ParkingZone[];
  transitLines: TransitRoute[];
  hospitalityStalls: HospitalityStall[];
  incidents: IncidentAlert[];
}

export interface GateInfo {
  id: string;
  name: string;
  assignedZones: string[];
  capacityPerMin: number;
  currentThroughput: number; // people / min
  queueLength: number; // estimated people in queue
  avgWaitMins: number;
  status: "optimal" | "congested" | "critical" | "overflow_open" | "closed";
  turnstilesActive: number;
  turnstilesTotal: number;
  bagCheckLanes: number;
  locationCoord: { x: number; y: number }; // percentage on map
}

export interface ParkingZone {
  id: string;
  name: string;
  totalBays: number;
  occupiedBays: number;
  evChargingBays: number;
  price: string;
  status: "available" | "filling_fast" | "full" | "diverting";
  shuttleRouteId: string;
  locationCoord: { x: number; y: number };
  targetZones: string[];
  dynamicDivertTo?: string;
}

export interface TransitRoute {
  id: string;
  name: string;
  type: "metro" | "express_shuttle" | "bus_rapid" | "rideshare_hub" | "water_taxi";
  headwayMinutes: number; // minutes between trains/shuttles
  capacityPerVehicle: number;
  vehiclesActive: number;
  crowdLoadPercent: number;
  status: "on_time" | "minor_delays" | "congested" | "surging";
  nextDepartureMins: number;
  terminalStation: string;
  locationCoord: { x: number; y: number };
}

export interface HospitalityStall {
  id: string;
  name: string;
  type: "f&b" | "merchandise" | "medical" | "water_station" | "restroom";
  concourseLevel: string;
  zone: string;
  queueTimeMins: number;
  stockLevelPercent: number;
  mobileOrderingEnabled: boolean;
  specialty: string;
  status: "smooth" | "busy" | "low_stock";
  locationCoord: { x: number; y: number };
}

export interface IncidentAlert {
  id: string;
  title: string;
  type: "crowd_density" | "transit_delay" | "gate_choke" | "weather" | "equipment" | "medical";
  severity: "info" | "warning" | "critical";
  timestamp: string;
  location: string;
  description: string;
  status: "active" | "mitigating" | "resolved";
  suggestedAction: string;
}

export interface AttendeeTicket {
  id: string;
  eventId: string;
  ticketCode: string;
  attendeeName: string;
  tier: "General Admission" | "VIP Gold Box" | "Club Platinum" | "Media Pass" | "Grandstand North";
  assignedGate: string;
  zone: string;
  section: string;
  row: string;
  seat: string;
  parkingZone: string;
  recommendedArrival: string;
  transitSuggestion: string;
  status: "verified" | "scanned_in" | "unverified";
}

export interface DecisionAction {
  id: string;
  priority: "IMMEDIATE" | "HIGH" | "MEDIUM";
  domain: "Crowd" | "Transport" | "Hospitality" | "Gates" | "Security";
  action: string;
  executed?: boolean;
}

export interface DecisionSupportResult {
  riskLevel: "OPTIMAL" | "MODERATE" | "ELEVATED" | "CRITICAL";
  executiveSummary: string;
  predictedImpact: string;
  recommendedActions: DecisionAction[];
  attendeeBroadcast: string;
  contingencyTrigger: string;
}
