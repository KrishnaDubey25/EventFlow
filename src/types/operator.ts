import { OperatorType } from "./auth";

export type OperatorResourceType =
  | "transport"
  | "parking"
  | "accommodation"
  | "food"
  | "medical"
  | "venue_services"
  | "other";

export type OperatorPermission =
  | "VIEW"
  | "UPDATE_STATUS"
  | "UPDATE_CAPACITY"
  | "UPDATE_DEMAND"
  | "ADD_NOTES";

export interface OperatorAssignment {
  assignmentId: string;
  operatorId: string;
  eventId: string;
  resourceId: string;
  resourceType: OperatorResourceType;
  resourceName: string;
  permissions: OperatorPermission[];
  status: "ACTIVE" | "INACTIVE" | "STANDBY";
  assignedAt: string;
  notes?: string;
}

export interface OperatorActionLogRecord {
  id: string;
  timestamp: string;
  operatorId: string;
  operatorName: string;
  eventId: string;
  eventName: string;
  resourceId: string;
  resourceType: OperatorResourceType;
  resourceName: string;
  action: string;
  previousValue?: string;
  newValue?: string;
  details?: string;
}

// Room entry for Accommodation
export interface AccommodationRoomType {
  id: string;
  name: string;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  ratePerNight?: string;
}

// Zone entry for Parking
export interface ParkingZoneSlot {
  id: string;
  name: string;
  zoneName?: string;
  totalSlots: number;
  occupiedSlots: number;
  occupied?: number;
  availableSlots: number;
  floorLevel?: string;
}

// Incident entry for Medical
export interface MedicalIncident {
  id: string;
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "TRIAGED" | "RESOLVED";
  patientCount: number;
  location: string;
  loggedAt: string;
  notes?: string;
}

// Maintenance ticket for Venue Services
export interface VenueMaintenanceIssue {
  id: string;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "LOGGED" | "IN_PROGRESS" | "RESOLVED" | string;
  sector: string;
  technicianAssigned?: string;
  assignedTech?: string;
  loggedAt: string;
  description?: string;
}

// Full Persistent Operator Resource Record in eventflow_operator_resources
export interface OperatorResourceRecord {
  id: string;
  operatorId: string;
  operatorType: OperatorType;
  resourceType: OperatorResourceType;
  name: string;
  status: "ACTIVE" | "INACTIVE" | "STANDBY" | "MAINTENANCE";
  capacity: number;
  availableCapacity: number;
  occupiedCapacity: number;
  location: string;
  operatingHours: string;
  assignedEventIds: string[];
  createdAt: string;
  updatedAt: string;
  notes?: string;

  // Type-specific payloads:
  accommodation?: {
    propertyName: string;
    propertyType?: string;
    totalRooms: number;
    availableRooms: number;
    occupiedRooms?: number;
    roomTypes?: (AccommodationRoomType | string)[];
    amenities?: string[];
    checkInTime?: string;
    checkOutTime?: string;
    demandStatus?: "Low" | "Moderate" | "High" | "Full";
    pricePerNight?: string;
    distanceToVenue?: string;
  };

  transport?: {
    fleetNumber?: string;
    vehicleType: string;
    registrationNumber?: string;
    plateNumber?: string;
    totalSeats?: number;
    seatCapacity?: number;
    availableSeats?: number;
    currentLoad?: number;
    routeId?: string;
    routeName: string;
    tripStatus: "Scheduled" | "Boarding" | "En Route" | "Delayed" | "Completed" | "On Route" | "Standby" | "Out of Service";
    driverName?: string;
    driverContact?: string;
    driverPhone?: string;
    frequencyMinutes?: number;
    nextDeparture?: string;
    routeStops?: any[];
    currentTrip?: any;
  };

  parking?: {
    facilityName?: string;
    facilityType?: string;
    parkingType?: string;
    totalSlots: number;
    availableSlots: number;
    occupiedSlots: number;
    zones?: ParkingZoneSlot[];
    supportedVehicles?: string[];
    hourlyRate?: string;
    hourlyFee?: string;
    entryGate?: string;
    entryExitRatePerHour?: number;
    isCovered?: boolean;
  };

  food?: {
    outletName?: string;
    stallName?: string;
    outletType?: string;
    seatingCapacity?: number;
    serviceCapacityPerHour?: number;
    serviceStatus?: "Open" | "High Demand" | "Peak Rush" | "Restocking" | "Closed" | string;
    foodType?: string;
    cuisine?: string;
    operatingHours?: string;
    locationInVenue?: string;
    averageWaitMinutes?: number;
    waitTimeMinutes?: number;
    rushStatus?: string;
    menuStatus?: string;
    popularItems?: string[];
  };

  medical?: {
    pointName?: string;
    stationName?: string;
    serviceType?: string;
    doctorsOnDuty?: number;
    nursesOnDuty?: number;
    paramedicsOnDuty?: number;
    staffOnDuty?: string;
    treatmentBeds?: number;
    availableBeds: number;
    ambulancesStationed?: number;
    ambulanceStandby?: boolean;
    emergencyHotline?: string;
    emergencyContact?: string;
    location?: string;
    incidents?: MedicalIncident[];
  };

  venueServices?: {
    serviceName?: string;
    serviceCategory?: string;
    staffOnDuty?: number;
    teamSize?: number;
    assignedArea?: string;
    equipmentReadinessPercent?: number;
    equipmentStatus?: string;
    operationalStatus?: "Ready" | "In Service" | "Attention Required" | "Standby" | string;
    currentTask?: string;
    maintenanceIssues?: VenueMaintenanceIssue[];
  };
  venueService?: any;

  otherServices?: {
    serviceName?: string;
    serviceCategory?: string;
    type?: string;
    description?: string;
    unitsAvailable?: number;
    contactPerson?: string;
    serviceStatus?: string;
  };
  otherService?: any;
}

export interface ResolvedOperatorResource {
  assignment: OperatorAssignment;
  event: {
    id: string;
    name: string;
    date: string;
    time: string;
    venue: string;
    location: string;
    image: string;
    statusBadge?: string;
  };
  resource: {
    id: string;
    name: string;
    type: OperatorResourceType;
    status: string;
    capacity: number | string;
    currentDemand: number | string;
    available?: number;
    occupied?: number;
    operatingHours?: string;
    location?: string;
    notes?: string;
    lastUpdated?: string;
    raw: any;
  };
}
