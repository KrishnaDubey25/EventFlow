export type EventCategory =
  | "All"
  | "Sports"
  | "Concerts"
  | "Conferences"
  | "Festivals"
  | "Large Gatherings";

export type EventVisibility = "DRAFT" | "PUBLISHED" | "UNPUBLISHED";

export interface EventGate {
  id: string;
  name: string;
  type?: string;
  assignedZones?: string[];
  status?: "optimal" | "congested" | "critical" | "closed";
  avgWaitMins?: number;
}

export interface EventZone {
  id: string;
  name: string;
  capacity?: string | number;
  description?: string;
  level?: string;
}

export interface EventTransport {
  id?: string;
  type: "metro" | "bus" | "train" | "rideshare" | "shuttle" | "ferry" | "taxi" | "other";
  title: string;
  detail: string;
  badge?: string;
  frequency?: string;
  capacity?: number | string;
  currentDemand?: string;
  status?: string;
  pickupDropLocation?: string;
  operatingWindow?: string;
}

export interface EventParking {
  id: string;
  name: string;
  capacity?: string | number;
  occupied?: string | number;
  available?: string | number;
  fee?: string;
  status?: "available" | "filling_fast" | "full" | "closed" | "AVAILABLE" | "FILLING" | "NEAR CAPACITY" | "FULL" | "CLOSED";
  shuttleAvailable?: boolean;
  distanceFromVenue?: string;
  entryRoute?: string;
}

export interface EventHospitality {
  id?: string;
  type: "f&b" | "merchandise" | "hydration" | "lounge" | "medical" | "accommodation" | "service" | "other";
  title: string;
  location: string;
  details?: string;
  mobileOrdering?: boolean;
  category?: string;
  capacity?: string | number;
  currentDemand?: string;
  status?: string;
  operatingHours?: string;
}

export interface EventAccommodation {
  id: string;
  name: string;
  type: "Hotel" | "Hostel" | "Short Stay" | "Resort" | "Other";
  distance: string;
  rating?: string | number;
  priceRange?: string;
  address?: string;
  shuttleConnected?: boolean;
  status?: "Available" | "Limited" | "Sold Out";
  bookingUrl?: string;
}

export interface EventFoodDining {
  id: string;
  name: string;
  type: "Restaurant" | "Food Zone" | "Food Court" | "Cafeteria" | "Refreshment Point";
  location: string;
  cuisine?: string;
  avgWaitMins?: number;
  mobileOrdering?: boolean;
  status?: "Normal" | "High Demand" | "Limited" | "Available";
  operatingHours?: string;
}

export interface EventMedicalAssistance {
  id: string;
  name: string;
  type: "Medical Desk" | "First Aid" | "Ambulance Point" | "Help Desk" | "Accessibility Assistance";
  location: string;
  staffCount?: number;
  contactNumber?: string;
  status?: "Operational" | "Standby" | "High Demand";
  accessibilityFeatures?: string[];
}

export interface EventOtherService {
  id: string;
  name: string;
  type:
    | "Rest Area"
    | "Information Desk"
    | "Lost & Found"
    | "Charging Station"
    | "Water Station"
    | "Accessibility Service"
    | "Other Event Service";
  location: string;
  capacity?: string | number;
  status?: "Available" | "Operational" | "High Demand" | "Under Maintenance";
  notes?: string;
}

export interface EventScheduleItem {
  time: string;
  activity: string;
  description?: string;
  location?: string;
}

export interface EventTicketTypeConfig {
  id: string;
  name: string;
  price: number;
  totalCapacity: number;
  soldCount?: number;
  description?: string;
  badge?: string;
  section?: string;
  allowedGates?: string[];
}

export interface AppEvent {
  id: string;
  organizerId?: string;
  name: string;
  category: "Sports" | "Concerts" | "Conferences" | "Festivals" | "Large Gatherings";
  date: string;
  time: string;
  startTime?: string;
  endTime?: string;
  location: string;
  venue: string;
  address?: string;
  placeId?: string;
  district: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  capacity: number | string;
  expectedAttendance: number | string;
  description: string;
  image: string;
  eventGuide?: { reception?: string; medicalHours?: string; helpPoint?: string };
  admissionBenefits?: Record<string,string>;
  gallery?: string[];
  agePolicy?: string;
  language?: string;
  duration?: string;
  highlights?: string[];
  status?: string;
  visibility?: EventVisibility;
  gates: EventGate[];
  zones: EventZone[];
  ticketTypes?: EventTicketTypeConfig[];
  transport: EventTransport[];
  parking: EventParking[];
  hospitality: EventHospitality[];
  accommodation?: EventAccommodation[];
  foodDining?: EventFoodDining[];
  medicalAssistance?: EventMedicalAssistance[];
  otherServices?: EventOtherService[];
  services?: any[];
  schedule: EventScheduleItem[];
  guidelines?: {
    permitted: string[];
    prohibited: string[];
    bagPolicy?: string;
    entryRules?: string;
  };
  faqs?: {
    question: string;
    answer: string;
  }[];
  organizerInfo?: {
    name: string;
    verified: boolean;
    supportContact?: string;
    licenseNo?: string;
  };
  // Visual & presentation highlights
  accentColor?: string;
  statusBadge?: string;
  highlightStat?: string;
  distanceKm?: number;
}
