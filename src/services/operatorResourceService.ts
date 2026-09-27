import {
  OperatorResourceRecord,
  OperatorResourceType,
  AccommodationRoomType,
  ParkingZoneSlot,
  MedicalIncident,
  VenueMaintenanceIssue,
} from "../types/operator";
import { OperatorType, normalizeOperatorType } from "../types/auth";
import { getAllStoredEvents, getStoredEventById } from "./eventStorageService";
import {
  getEventLiveState,
  saveEventLiveState,
  updateTransportState,
  updateParkingState,
  updateHospitalityState,
  recordOperationalAction,
} from "./operationalStateService";
import {
  getStoredAssignments,
  saveStoredAssignments,
  recordOperatorActionLog,
} from "./operatorAssignmentService";

export const RESOURCES_STORAGE_KEY = "eventflow_operator_resources";

/**
 * Returns type-specific OperatorResourceType from OperatorType
 */
export function getResourceTypeFromOperatorType(opType: OperatorType): OperatorResourceType {
  switch (opType) {
    case "Accommodation":
      return "accommodation";
    case "Transport":
      return "transport";
    case "Parking":
      return "parking";
    case "Food & Dining":
      return "food";
    case "Medical & Assistance":
      return "medical";
    case "Venue Services":
      return "venue_services";
    case "Other Services":
    default:
      return "other";
  }
}

/**
 * Generates initial demo resources for all operator categories connected to canonical events
 */
function getInitialSeedResources(): OperatorResourceRecord[] {
  const allEvents = getAllStoredEvents();
  const event1 = allEvents[0]?.id || "evt_mumbai_cricket_01";
  const event2 = allEvents[1]?.id || event1;

  const now = new Date().toISOString();

  return [
    // 1. ACCOMMODATION
    {
      id: "res-accom-hotel-grand",
      operatorId: "usr_demo_operator_accommodation",
      operatorType: "Accommodation",
      resourceType: "accommodation",
      name: "Grand Concourse Regency & Suites",
      status: "ACTIVE",
      capacity: 320,
      availableCapacity: 45,
      occupiedCapacity: 275,
      location: "Marine Concourse Boulevard, Mumbai (800m from Stadium)",
      operatingHours: "24/7 Front Desk Operations",
      assignedEventIds: [event1],
      createdAt: now,
      updatedAt: now,
      notes: "Official primary hospitality partner for VIP attendees and tournament staff.",
      accommodation: {
        propertyName: "Grand Concourse Regency & Suites",
        propertyType: "Luxury 5-Star Hotel",
        totalRooms: 320,
        availableRooms: 45,
        occupiedRooms: 275,
        roomTypes: [
          { id: "rt-deluxe", name: "Deluxe Concourse King", totalRooms: 160, occupiedRooms: 142, availableRooms: 18, ratePerNight: "₹14,500" },
          { id: "rt-exec", name: "Executive Club Suite", totalRooms: 100, occupiedRooms: 92, availableRooms: 8, ratePerNight: "₹24,000" },
          { id: "rt-pres", name: "Presidential Skyline Suite", totalRooms: 60, occupiedRooms: 41, availableRooms: 19, ratePerNight: "₹48,000" },
        ],
        amenities: ["Airport Shuttle Transfer", "High-speed Wi-Fi", "Match Day Breakfast Buffet", "Valet Parking", "Fitness Hub & Spa"],
        checkInTime: "14:00 IST",
        checkOutTime: "11:00 IST",
        demandStatus: "High",
      },
    },
    {
      id: "res-accom-hotel-coastal",
      operatorId: "usr_demo_operator_accommodation",
      operatorType: "Accommodation",
      resourceType: "accommodation",
      name: "Marine Pearl Boutique Hotel",
      status: "ACTIVE",
      capacity: 120,
      availableCapacity: 24,
      occupiedCapacity: 96,
      location: "Churchgate Station North Arcade, Mumbai",
      operatingHours: "24/7 Check-in Service",
      assignedEventIds: [event1],
      createdAt: now,
      updatedAt: now,
      notes: "Direct walkway access to South Gate transit shuttles.",
      accommodation: {
        propertyName: "Marine Pearl Boutique Hotel",
        propertyType: "Boutique Business Hotel",
        totalRooms: 120,
        availableRooms: 24,
        occupiedRooms: 96,
        roomTypes: [
          { id: "rt-classic", name: "Classic Queen Room", totalRooms: 80, occupiedRooms: 68, availableRooms: 12, ratePerNight: "₹8,500" },
          { id: "rt-twin", name: "Twin Deluxe Room", totalRooms: 40, occupiedRooms: 28, availableRooms: 12, ratePerNight: "₹10,500" },
        ],
        amenities: ["Free Express Breakfast", "Luggage Storage Locker", "Match Ticket Concierge Desk"],
        checkInTime: "13:00 IST",
        checkOutTime: "11:00 IST",
        demandStatus: "Moderate",
      },
    },

    // 2. TRANSPORT
    {
      id: "trans-shuttle-s2",
      operatorId: "usr_demo_operator_transport",
      operatorType: "Transport",
      resourceType: "transport",
      name: "Express Shuttle S2 (Churchgate / Marine Lines)",
      status: "ACTIVE",
      capacity: 50,
      availableCapacity: 12,
      occupiedCapacity: 38,
      location: "South Concourse Bus Terminal Bay 4",
      operatingHours: "08:00 - 23:30 IST",
      assignedEventIds: [event1],
      createdAt: now,
      updatedAt: now,
      notes: "High-frequency electric shuttle servicing Southern ingress route.",
      transport: {
        fleetNumber: "FL-S2-EV40",
        vehicleType: "Electric Low-Floor City Bus",
        registrationNumber: "MH-01-EV-4821",
        totalSeats: 50,
        availableSeats: 12,
        routeId: "RT-S2-EXPRESS",
        routeName: "Churchgate Terminal ⇄ Stadium South Hub",
        tripStatus: "En Route",
        driverName: "Sunil Deshmukh",
        driverContact: "+91 98200 11223",
        frequencyMinutes: 8,
        nextDeparture: "In 4 mins",
      },
    },
    {
      id: "trans-shuttle-s1",
      operatorId: "usr_demo_operator_transport",
      operatorType: "Transport",
      resourceType: "transport",
      name: "Metro Line 3 Feeder Shuttle",
      status: "ACTIVE",
      capacity: 65,
      availableCapacity: 25,
      occupiedCapacity: 40,
      location: "East Station Ingress Point 2",
      operatingHours: "07:30 - 00:30 IST",
      assignedEventIds: [event1],
      createdAt: now,
      updatedAt: now,
      notes: "Dedicated underground Aqua Line connection shuttle.",
      transport: {
        fleetNumber: "FL-S1-AC65",
        vehicleType: "Double-Axle Articulated Shuttle",
        registrationNumber: "MH-01-TR-9082",
        totalSeats: 65,
        availableSeats: 25,
        routeId: "RT-M3-FEEDER",
        routeName: "Vidhan Bhavan Metro ⇄ East Stadium Plaza",
        tripStatus: "Boarding",
        driverName: "Rajendra Patil",
        driverContact: "+91 98200 44556",
        frequencyMinutes: 6,
        nextDeparture: "Boarding Now",
      },
    },
    {
      id: "trans-shuttle-m1",
      operatorId: "usr_demo_operator_transport",
      operatorType: "Transport",
      resourceType: "transport",
      name: "Festival Shuttle Line M1",
      status: "ACTIVE",
      capacity: 45,
      availableCapacity: 15,
      occupiedCapacity: 30,
      location: "Main Gate VIP Terminal",
      operatingHours: "12:00 - 02:00 IST",
      assignedEventIds: [event2],
      createdAt: now,
      updatedAt: now,
      notes: "Late night festival shuttle fleet.",
      transport: {
        fleetNumber: "FL-M1-FEST",
        vehicleType: "Air-Conditioned Transit Coach",
        registrationNumber: "MH-02-TR-7711",
        totalSeats: 45,
        availableSeats: 15,
        routeId: "RT-FEST-M1",
        routeName: "Bandra Kurla Complex Hub ⇄ Festival Arena",
        tripStatus: "Scheduled",
        driverName: "Vikram Shinde",
        driverContact: "+91 98200 77889",
        frequencyMinutes: 12,
        nextDeparture: "Scheduled at 15:30",
      },
    },

    // 3. PARKING
    {
      id: "park-p2",
      operatorId: "usr_demo_operator_parking",
      operatorType: "Parking",
      resourceType: "parking",
      name: "Parking Facility P2 (East Concourse Multi-Level)",
      status: "ACTIVE",
      capacity: 2000,
      availableCapacity: 320,
      occupiedCapacity: 1680,
      location: "East Concourse Approach Road, Gate 4",
      operatingHours: "06:00 - 01:00 IST",
      assignedEventIds: [event1],
      createdAt: now,
      updatedAt: now,
      notes: "Main stadium multi-tier parking with dedicated ANPR automated toll lanes.",
      parking: {
        facilityName: "Parking Facility P2 (East Concourse)",
        parkingType: "Covered Multi-Level Garage (4 Floors)",
        totalSlots: 2000,
        availableSlots: 320,
        occupiedSlots: 1680,
        isCovered: true,
        hourlyRate: "₹250 / Match Event",
        entryExitRatePerHour: 240,
        supportedVehicles: ["Sedans", "SUVs", "Hatchbacks", "Electric Vehicles (EV Charging)"],
        zones: [
          { id: "zone-p2-a", name: "Zone A (Ground - EV & Priority)", totalSlots: 400, occupiedSlots: 380, availableSlots: 20, floorLevel: "Ground Level" },
          { id: "zone-p2-b", name: "Zone B (Level 1 General)", totalSlots: 600, occupiedSlots: 540, availableSlots: 60, floorLevel: "Level 1" },
          { id: "zone-p2-c", name: "Zone C (Level 2 General)", totalSlots: 600, occupiedSlots: 490, availableSlots: 110, floorLevel: "Level 2" },
          { id: "zone-p2-d", name: "Zone D (Rooftop Open Concourse)", totalSlots: 400, occupiedSlots: 270, availableSlots: 130, floorLevel: "Level 3 Deck" },
        ],
      },
    },
    {
      id: "park-p1",
      operatorId: "usr_demo_operator_parking",
      operatorType: "Parking",
      resourceType: "parking",
      name: "Main Entrance Parking P1",
      status: "ACTIVE",
      capacity: 1500,
      availableCapacity: 450,
      occupiedCapacity: 1050,
      location: "North Perimeter Ring Road, Gate 1 & 2",
      operatingHours: "08:00 - 00:00 IST",
      assignedEventIds: [event2],
      createdAt: now,
      updatedAt: now,
      notes: "Surface parking lot with direct tarmac walkway to VIP ingress.",
      parking: {
        facilityName: "Main Entrance Parking P1",
        parkingType: "Paved Surface Lot",
        totalSlots: 1500,
        availableSlots: 450,
        occupiedSlots: 1050,
        isCovered: false,
        hourlyRate: "₹200 / Event Pass",
        entryExitRatePerHour: 180,
        supportedVehicles: ["Cars", "Two-Wheelers", "Charter Coaches"],
        zones: [
          { id: "zone-p1-vip", name: "VIP Sector North", totalSlots: 300, occupiedSlots: 280, availableSlots: 20, floorLevel: "Surface North" },
          { id: "zone-p1-gen", name: "General Public West", totalSlots: 1200, occupiedSlots: 770, availableSlots: 430, floorLevel: "Surface West" },
        ],
      },
    },

    // 4. FOOD & DINING
    {
      id: "food-zone-a",
      operatorId: "usr_demo_operator_food",
      operatorType: "Food & Dining",
      resourceType: "food",
      name: "Food Zone A (North Concourse Plaza)",
      status: "ACTIVE",
      capacity: 600,
      availableCapacity: 110,
      occupiedCapacity: 490,
      location: "North Stand Concourse Level 2",
      operatingHours: "10:00 - 23:00 IST",
      assignedEventIds: [event1, event2],
      createdAt: now,
      updatedAt: now,
      notes: "High throughput food court with 14 POS express counters.",
      food: {
        outletName: "Food Zone A (North Concourse Plaza)",
        outletType: "High-Capacity Food Pavilion",
        seatingCapacity: 600,
        serviceCapacityPerHour: 1200,
        serviceStatus: "High Demand",
        cuisine: "Multi-Cuisine Quick Service & Beverages",
        averageWaitMinutes: 7,
        popularItems: ["Signature Match Burgers", "Artisan Woodfired Pizza Slices", "Hydration Smoothies", "Masala Chai Flasks"],
      },
    },
    {
      id: "food-zone-vip",
      operatorId: "usr_demo_operator_food",
      operatorType: "Food & Dining",
      resourceType: "food",
      name: "Grand Pavilions Gourmet Lounge",
      status: "ACTIVE",
      capacity: 250,
      availableCapacity: 65,
      occupiedCapacity: 185,
      location: "President's Box Concourse, Tier 3",
      operatingHours: "12:00 - 23:30 IST",
      assignedEventIds: [event1],
      createdAt: now,
      updatedAt: now,
      notes: "Fine dining hospitality for suite holders.",
      food: {
        outletName: "Grand Pavilions Gourmet Lounge",
        outletType: "Fine Hospitality & Lounge Buffet",
        seatingCapacity: 250,
        serviceCapacityPerHour: 400,
        serviceStatus: "Open",
        cuisine: "Continental & Pan-Asian Buffet",
        averageWaitMinutes: 2,
        popularItems: ["Chef Carvery", "Truffle Pasta Bar", "Artisanal Mocktail Bar"],
      },
    },

    // 5. MEDICAL & ASSISTANCE
    {
      id: "medical-desk-1",
      operatorId: "usr_demo_operator_medical",
      operatorType: "Medical & Assistance",
      resourceType: "medical",
      name: "Medical Desk 1 (West Stand First Aid & Trauma Post)",
      status: "ACTIVE",
      capacity: 45,
      availableCapacity: 34,
      occupiedCapacity: 11,
      location: "West Stand Gate 6 Ingress Hub",
      operatingHours: "24/7 Event Readiness",
      assignedEventIds: [event1],
      createdAt: now,
      updatedAt: now,
      notes: "Primary stadium casualty clearing station with direct ambulance tunnel exit.",
      medical: {
        pointName: "Medical Desk 1 (West Stand)",
        serviceType: "Trauma, Resuscitation & First Aid Unit",
        doctorsOnDuty: 4,
        nursesOnDuty: 8,
        paramedicsOnDuty: 10,
        treatmentBeds: 45,
        availableBeds: 34,
        ambulancesStationed: 3,
        emergencyHotline: "+91 22 2289 9911",
        incidents: [
          {
            id: "inc-01",
            title: "Heat Exhaustion & Mild Dehydration",
            severity: "LOW",
            status: "RESOLVED",
            patientCount: 3,
            location: "North Tier Concourse",
            loggedAt: "14:15 IST",
            notes: "Electrolytes administered; attendees rested 20 mins and discharged safely.",
          },
          {
            id: "inc-02",
            title: "Staircase Slip & Ankle Sprain",
            severity: "MEDIUM",
            status: "TRIAGED",
            patientCount: 1,
            location: "Gate 4 Stairwell",
            loggedAt: "15:40 IST",
            notes: "Crepe bandage and ice applied, mobile crutch provided.",
          },
        ],
      },
    },

    // 6. VENUE SERVICES
    {
      id: "venue-rigging-ops",
      operatorId: "usr_demo_operator_venue",
      operatorType: "Venue Services",
      resourceType: "venue_services",
      name: "Central Rigging, Power & AV Technical Operations",
      status: "ACTIVE",
      capacity: 80,
      availableCapacity: 18,
      occupiedCapacity: 62,
      location: "South Tech Control Tower & Dimmer Room",
      operatingHours: "06:00 - 02:00 IST",
      assignedEventIds: [event1],
      createdAt: now,
      updatedAt: now,
      notes: "Manages stadium floodlighting, PA broadcast systems, backup generators, and screen rigs.",
      venueServices: {
        serviceName: "Central Rigging, Power & AV Technical Operations",
        serviceCategory: "High-Voltage Power, Lighting & Rigging",
        staffOnDuty: 28,
        equipmentReadinessPercent: 99,
        operationalStatus: "Ready",
        maintenanceIssues: [
          {
            id: "mnt-01",
            title: "Audio delay speaker line 4 impedance drop",
            priority: "LOW",
            status: "RESOLVED",
            sector: "East Upper Balcony",
            technicianAssigned: "Ramesh Sharma",
            loggedAt: "13:20 IST",
            description: "Loose terminal re-soldered and recalibrated with DSP processor.",
          },
        ],
      },
    },
    {
      id: "venue-sanitation-ops",
      operatorId: "usr_demo_operator_venue",
      operatorType: "Venue Services",
      resourceType: "venue_services",
      name: "Concourse Sanitation & Waste Management Taskforce",
      status: "ACTIVE",
      capacity: 120,
      availableCapacity: 25,
      occupiedCapacity: 95,
      location: "Service Bayside Compound",
      operatingHours: "Continuous 24-hr Shift",
      assignedEventIds: [event1],
      createdAt: now,
      updatedAt: now,
      notes: "Maintains hygiene, waste sorting, and restroom sanitization sweeps.",
      venueServices: {
        serviceName: "Concourse Sanitation & Waste Management Taskforce",
        serviceCategory: "Sanitation & Environmental Management",
        staffOnDuty: 65,
        equipmentReadinessPercent: 100,
        operationalStatus: "In Service",
        maintenanceIssues: [],
      },
    },

    // 7. OTHER SERVICES
    {
      id: "other-concierge-lockers",
      operatorId: "usr_demo_operator_other",
      operatorType: "Other Services",
      resourceType: "other",
      name: "Concourse Luggage Lockers & Information Hub",
      status: "ACTIVE",
      capacity: 500,
      availableCapacity: 140,
      occupiedCapacity: 360,
      location: "Main Ingress Plaza Central Kiosk",
      operatingHours: "08:00 - 23:30 IST",
      assignedEventIds: [event2],
      createdAt: now,
      updatedAt: now,
      notes: "Provides secure baggage deposit, lost-and-found registry, and sensory quiet packs.",
      otherServices: {
        serviceName: "Concourse Luggage Lockers & Information Hub",
        serviceCategory: "Attendee Care & Baggage Security",
        description: "Electronic biometric locker banks and lost-and-found dispatch service.",
        serviceStatus: "Operational",
      },
    },
  ];
}

/**
 * Loads all stored operator resources from localStorage
 */
export function getStoredOperatorResources(): OperatorResourceRecord[] {
  try {
    const raw = localStorage.getItem(RESOURCES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading operator resources from localStorage:", err);
  }

  const seeded = getInitialSeedResources();
  saveStoredOperatorResources(seeded);
  return seeded;
}

/**
 * Saves operator resources to localStorage
 */
export function saveStoredOperatorResources(resources: OperatorResourceRecord[]): void {
  try {
    localStorage.setItem(RESOURCES_STORAGE_KEY, JSON.stringify(resources));
  } catch (err) {
    console.error("Error saving operator resources:", err);
  }
}

/**
 * Ensures an operator user has their resources properly populated.
 * If none exist, seeds appropriate defaults based on operatorType.
 */
export function ensureResourcesForOperator(
  operatorId: string,
  rawOperatorType?: string
): OperatorResourceRecord[] {
  const normType = normalizeOperatorType(rawOperatorType);
  const allResources = getStoredOperatorResources();
  let userResources = allResources.filter((r) => r.operatorId === operatorId);

  if (userResources.length > 0) {
    return userResources;
  }

  // Look for demo templates matching the operator type
  const matchingTypeTemplates = allResources.filter((r) => r.operatorType === normType);
  const allEvents = getAllStoredEvents();
  const primaryEvent = allEvents[0]?.id || "evt_mumbai_cricket_01";
  const now = new Date().toISOString();

  let created: OperatorResourceRecord[] = [];

  if (matchingTypeTemplates.length > 0) {
    // Clone templates under this operator's ID
    created = matchingTypeTemplates.map((t, idx) => ({
      ...t,
      id: `res-${operatorId}-${idx + 1}-${t.resourceType}`,
      operatorId,
      assignedEventIds: t.assignedEventIds.length > 0 ? t.assignedEventIds : [primaryEvent],
      createdAt: now,
      updatedAt: now,
    }));
  } else {
    // Fallback resource generation
    const resType = getResourceTypeFromOperatorType(normType);
    const newRes: OperatorResourceRecord = {
      id: `res-${operatorId}-01-${resType}`,
      operatorId,
      operatorType: normType,
      resourceType: resType,
      name: `${normType} Operational Unit #1`,
      status: "ACTIVE",
      capacity: 100,
      availableCapacity: 60,
      occupiedCapacity: 40,
      location: "Main Event Perimeter Concourse",
      operatingHours: "08:00 - 23:00 IST",
      assignedEventIds: [primaryEvent],
      createdAt: now,
      updatedAt: now,
      notes: "Dedicated service resource assigned to operator.",
    };
    created = [newRes];
  }

  const updatedAll = [...allResources, ...created];
  saveStoredOperatorResources(updatedAll);

  // Also make sure assignments exist in eventflow_operator_assignments
  const existingAssignments = getStoredAssignments();
  const newAssignments = created.map((r) => ({
    assignmentId: `asg-${r.assignedEventIds[0] || primaryEvent}-${r.id}`,
    operatorId,
    eventId: r.assignedEventIds[0] || primaryEvent,
    resourceId: r.id,
    resourceType: r.resourceType,
    resourceName: r.name,
    permissions: ["VIEW", "UPDATE_STATUS", "UPDATE_CAPACITY", "UPDATE_DEMAND", "ADD_NOTES"] as any[],
    status: "ACTIVE" as const,
    assignedAt: now,
    notes: r.notes,
  }));

  saveStoredAssignments([...existingAssignments, ...newAssignments]);

  return created;
}

/**
 * Retrieves all resources for a specific operator.
 * Filters strictly to this operator's ID.
 */
export function getOperatorResources(
  operatorId: string,
  rawOperatorType?: string
): OperatorResourceRecord[] {
  if (!operatorId) return [];
  return ensureResourcesForOperator(operatorId, rawOperatorType);
}

/**
 * Retrieves a single resource by ID for an operator.
 * Enforces ownership check.
 */
export function getOperatorResourceById(
  operatorId: string,
  resourceId: string
): OperatorResourceRecord | null {
  const resources = getOperatorResources(operatorId);
  return resources.find((r) => r.id === resourceId) || null;
}

/**
 * Creates a new resource owned by this operator.
 */
export function createOperatorResource(
  operatorId: string,
  operatorType: OperatorType,
  data: Omit<OperatorResourceRecord, "id" | "operatorId" | "operatorType" | "createdAt" | "updatedAt">
): OperatorResourceRecord {
  const allResources = getStoredOperatorResources();
  const now = new Date().toISOString();
  const newId = `res-${operatorId}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

  const newResource: OperatorResourceRecord = {
    ...data,
    id: newId,
    operatorId,
    operatorType,
    createdAt: now,
    updatedAt: now,
  };

  const updated = [newResource, ...allResources];
  saveStoredOperatorResources(updated);

  // Create assignments for all assigned events
  const existingAssignments = getStoredAssignments();
  const createdAssignments = (newResource.assignedEventIds || []).map((eventId) => ({
    assignmentId: `asg-${eventId}-${newId}`,
    operatorId,
    eventId,
    resourceId: newId,
    resourceType: newResource.resourceType,
    resourceName: newResource.name,
    permissions: ["VIEW", "UPDATE_STATUS", "UPDATE_CAPACITY", "UPDATE_DEMAND", "ADD_NOTES"] as any[],
    status: "ACTIVE" as const,
    assignedAt: now,
    notes: newResource.notes,
  }));

  saveStoredAssignments([...existingAssignments, ...createdAssignments]);

  // Synchronize to event live state
  newResource.assignedEventIds.forEach((eventId) => {
    syncResourceToEventLiveState(newResource, eventId);
  });

  return newResource;
}

/**
 * Convenience helper to add a new operator resource.
 */
export function addOperatorResource(
  operatorId: string,
  data: Partial<OperatorResourceRecord> & { name: string; operatorType?: OperatorType }
): OperatorResourceRecord {
  const opType: OperatorType = (data.operatorType as OperatorType) || "Other Services";
  const mapTypeToResource = (t: string): any => {
    switch (t) {
      case "Accommodation":
        return "accommodation";
      case "Transport":
        return "transport";
      case "Parking":
        return "parking";
      case "Food & Dining":
        return "food";
      case "Medical & Assistance":
        return "medical";
      case "Venue Services":
        return "venue_services";
      default:
        return "other";
    }
  };

  const payload: Omit<OperatorResourceRecord, "id" | "operatorId" | "operatorType" | "createdAt" | "updatedAt"> = {
    resourceType: data.resourceType || mapTypeToResource(opType),
    name: data.name,
    status: data.status || "ACTIVE",
    capacity: data.capacity || 10,
    availableCapacity: data.availableCapacity !== undefined ? data.availableCapacity : (data.capacity || 10),
    occupiedCapacity: data.occupiedCapacity || 0,
    location: data.location || "Venue Concourse",
    operatingHours: data.operatingHours || "08:00 - 22:00 IST",
    assignedEventIds: data.assignedEventIds || ["ev-summit-2026"],
    notes: data.notes || "",
    accommodation: data.accommodation,
    transport: data.transport,
    parking: data.parking,
    food: data.food,
    medical: data.medical,
    venueServices: data.venueServices || data.venueService,
    otherServices: data.otherServices || data.otherService,
  };

  return createOperatorResource(operatorId, opType, payload);
}

/**
 * Updates a resource owned by this operator and synchronizes to eventflow_live_state.
 */
export function updateOperatorResource(
  operatorId: string,
  operatorNameOrResourceId: string,
  resourceIdOrUpdates: string | Partial<OperatorResourceRecord>,
  possibleUpdates?: Partial<OperatorResourceRecord>
): { success: boolean; error?: string; resource?: OperatorResourceRecord } {
  let operatorName = "Operator";
  let resourceId = "";
  let updates: Partial<OperatorResourceRecord> = {};

  if (typeof resourceIdOrUpdates === "string") {
    // Called with (operatorId, operatorName, resourceId, updates)
    operatorName = operatorNameOrResourceId;
    resourceId = resourceIdOrUpdates;
    updates = possibleUpdates || {};
  } else {
    // Called with (operatorId, resourceId, updates)
    resourceId = operatorNameOrResourceId;
    updates = resourceIdOrUpdates || {};
  }

  const allResources = getStoredOperatorResources();
  const idx = allResources.findIndex((r) => r.id === resourceId && r.operatorId === operatorId);

  if (idx === -1) {
    return { success: false, error: "Resource not found or unauthorized access." };
  }

  const existing = allResources[idx];
  const now = new Date().toISOString();

  // Validate non-negative numbers
  if (updates.capacity !== undefined && updates.capacity < 0) {
    return { success: false, error: "Capacity cannot be negative." };
  }
  if (updates.occupiedCapacity !== undefined && updates.occupiedCapacity < 0) {
    return { success: false, error: "Occupied count cannot be negative." };
  }
  if (updates.availableCapacity !== undefined && updates.availableCapacity < 0) {
    return { success: false, error: "Available count cannot be negative." };
  }

  // Calculate capacities
  const finalCapacity = updates.capacity !== undefined ? updates.capacity : existing.capacity;
  let finalOccupied = updates.occupiedCapacity !== undefined ? updates.occupiedCapacity : existing.occupiedCapacity;
  let finalAvailable = updates.availableCapacity !== undefined ? updates.availableCapacity : existing.availableCapacity;

  // Auto-balance if only one was changed
  if (updates.occupiedCapacity !== undefined && updates.availableCapacity === undefined) {
    finalAvailable = Math.max(0, finalCapacity - finalOccupied);
  } else if (updates.availableCapacity !== undefined && updates.occupiedCapacity === undefined) {
    finalOccupied = Math.max(0, finalCapacity - finalAvailable);
  }

  const merged: OperatorResourceRecord = {
    ...existing,
    ...updates,
    capacity: finalCapacity,
    occupiedCapacity: finalOccupied,
    availableCapacity: finalAvailable,
    updatedAt: now,
    accommodation: updates.accommodation ? { ...existing.accommodation, ...updates.accommodation } : existing.accommodation,
    transport: updates.transport ? { ...existing.transport, ...updates.transport } : existing.transport,
    parking: updates.parking ? { ...existing.parking, ...updates.parking } : existing.parking,
    food: updates.food ? { ...existing.food, ...updates.food } : existing.food,
    medical: updates.medical ? { ...existing.medical, ...updates.medical } : existing.medical,
    venueServices: updates.venueServices ? { ...existing.venueServices, ...updates.venueServices } : existing.venueServices,
    otherServices: updates.otherServices ? { ...existing.otherServices, ...updates.otherServices } : existing.otherServices,
  };

  allResources[idx] = merged;
  saveStoredOperatorResources(allResources);

  // Synchronize with shared event state (eventflow_live_state) for each assigned event
  (merged.assignedEventIds || []).forEach((eventId) => {
    syncResourceToEventLiveState(merged, eventId, operatorName);

    // Record audit log
    recordOperatorActionLog({
      operatorId,
      operatorName,
      eventId,
      eventName: getStoredEventById(eventId)?.name || "Assigned Event",
      resourceId: merged.id,
      resourceType: merged.resourceType,
      resourceName: merged.name,
      action: `Updated resource (${merged.name})`,
      previousValue: `Status: ${existing.status}, Cap: ${existing.capacity}, Occ: ${existing.occupiedCapacity}`,
      newValue: `Status: ${merged.status}, Cap: ${merged.capacity}, Occ: ${merged.occupiedCapacity}`,
      details: updates.notes || `Available: ${merged.availableCapacity}`,
    });
  });

  return { success: true, resource: merged };
}

/**
 * Deletes a resource owned by this operator.
 */
export function deleteOperatorResource(
  operatorId: string,
  resourceId: string
): { success: boolean; error?: string } {
  const allResources = getStoredOperatorResources();
  const existing = allResources.find((r) => r.id === resourceId && r.operatorId === operatorId);

  if (!existing) {
    return { success: false, error: "Resource not found or unauthorized access." };
  }

  const filtered = allResources.filter((r) => r.id !== resourceId);
  saveStoredOperatorResources(filtered);

  // Also remove assignments
  const allAssignments = getStoredAssignments();
  const updatedAssignments = allAssignments.filter((a) => a.resourceId !== resourceId);
  saveStoredAssignments(updatedAssignments);

  return { success: true };
}

/**
 * Synchronizes this resource's live data into the event's canonical eventflow_live_state[eventId].
 */
export function syncResourceToEventLiveState(
  resource: OperatorResourceRecord,
  eventId: string,
  operatorName = "Operator"
): void {
  const event = getStoredEventById(eventId);
  if (!event) return;

  const liveState = getEventLiveState(eventId, event);

  if (resource.resourceType === "transport") {
    const tripStatus = resource.transport?.tripStatus;
    const opStatus = resource.status === "ACTIVE" ? (tripStatus === "Delayed" ? "DELAYED" : "ACTIVE") : "STANDBY";

    updateTransportState(
      eventId,
      resource.id,
      {
        status: opStatus as any,
        capacity: resource.capacity,
        currentDemand: resource.occupiedCapacity,
        operatingWindow: resource.operatingHours,
        notes: resource.notes || resource.transport?.routeName,
      },
      `${operatorName} (Transport Operator)`
    );
  } else if (resource.resourceType === "parking") {
    let pStatus = "AVAILABLE";
    const occupancyPercent = resource.capacity > 0 ? (resource.occupiedCapacity / resource.capacity) * 100 : 0;
    if (occupancyPercent >= 98) {
      pStatus = "FULL";
    } else if (occupancyPercent >= 80) {
      pStatus = "NEAR CAPACITY";
    }

    updateParkingState(
      eventId,
      resource.id,
      {
        status: pStatus as any,
        totalSpaces: resource.capacity,
        occupiedSpaces: resource.occupiedCapacity,
        availableSpaces: resource.availableCapacity,
      },
      `${operatorName} (Parking Operator)`
    );
  } else {
    // Accommodation, Food, Medical, Venue Services, Other Services -> hospitalityState
    let category: any = "Other Services";
    let statusText: any = "Operational";

    if (resource.resourceType === "accommodation") {
      category = "Accommodation";
      statusText = resource.occupiedCapacity >= resource.capacity ? "Sold Out" : resource.occupiedCapacity > resource.capacity * 0.8 ? "Limited" : "Available";
    } else if (resource.resourceType === "food") {
      category = "Food Zones";
      statusText = resource.food?.serviceStatus || "Open";
    } else if (resource.resourceType === "medical") {
      category = "Medical Assistance";
      statusText = resource.medical?.availableBeds === 0 ? "High Demand" : "Available";
    } else if (resource.resourceType === "venue_services") {
      category = "Other Services";
      statusText = resource.venueServices?.operationalStatus || "Operational";
    }

    updateHospitalityState(
      eventId,
      resource.id,
      {
        status: statusText,
        capacity: resource.capacity,
        currentDemand: String(resource.occupiedCapacity),
        notes: resource.notes || resource.location,
        operatingHours: resource.operatingHours,
        location: resource.location,
      },
      `${operatorName} (${resource.operatorType})`
    );
  }

  // Dispatch live update event
  try {
    window.dispatchEvent(new CustomEvent("eventflow_live_state_updated", { detail: { eventId } }));
  } catch {}
}
