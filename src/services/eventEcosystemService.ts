import {
  EventEcosystem,
  EcosystemResourceItem,
  EcosystemResourceType,
  EcosystemResourceStatus,
  EventTimelineConfig,
  AttendeeJourneyStage,
  AttendeeJourneyState,
} from "../types/ecosystem";
import { AppEvent } from "../types/event";
import { getStoredEventById, getAllStoredEvents } from "./eventStorageService";
import { getStoredOperatorResources } from "./operatorResourceService";
import { getEventLiveState } from "./operationalStateService";
import { identifyCityFromCoordinates } from "./locationService";

const ECOSYSTEM_STORAGE_KEY = "eventflow_event_ecosystems";
const JOURNEY_STATE_STORAGE_KEY = "eventflow_attendee_journey_states";
const TIMELINE_STORAGE_KEY = "eventflow_event_timelines";

function parseNumeric(val: string | number | undefined, defaultVal: number = 0): number {
  if (val === undefined || val === null) return defaultVal;
  if (typeof val === "number") return val;
  const cleaned = val.replace(/,/g, "").trim();
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? defaultVal : parsed;
}

/**
 * Creates default timeline configuration for any event category
 */
export function createDefaultTimeline(event: AppEvent): EventTimelineConfig {
  const dateStr = event.date || "2026-10-15";
  const startTime = event.startTime || "10:00";
  const endTime = event.endTime || "18:00";

  // Category specific schedule presets
  const isConcert = event.category === "Concerts";
  const isSports = event.category === "Sports";
  const isFestival = event.category === "Festivals";
  const isConference = event.category === "Conferences";

  const gatesOpenTime = isConcert ? "16:00" : isSports ? "13:30" : "08:30";
  const mainStart = isConcert ? "18:30" : isSports ? "15:30" : "09:30";
  const intervalTime = isSports ? "17:15" : isConference ? "13:00" : "20:00";
  const eventEnd = isConcert ? "22:30" : isSports ? "19:30" : "17:30";
  const egressStart = eventEnd;
  const egressEnd = isConcert ? "23:45" : isSports ? "20:45" : "18:45";

  const milestones = [
    {
      id: "m-01",
      time: gatesOpenTime,
      title: "Perimeter Turnstiles & Security Check Open",
      phase: "Ingress" as const,
      description: "Smart digital QR scanners active. Fast-track no-bag lanes operational.",
      location: "All Gates",
      isKeyMilestone: true,
    },
    {
      id: "m-02",
      time: mainStart,
      title: isSports ? "Match Kickoff / Opening Whistle" : isConcert ? "Opening Act & Headliner Intro" : "Keynote Address & Opening Session",
      phase: "Main Event" as const,
      description: "Main auditorium and stadium bowl floodlights and AV feed live.",
      location: "Main Arena",
      isKeyMilestone: true,
    },
    {
      id: "m-03",
      time: intervalTime,
      title: isSports ? "Innings Break / Halftime Interval" : isConference ? "Networking Lunch & Exhibition Hour" : "Concert Mid-Show Interval",
      phase: "Interval" as const,
      description: "Concourse F&B outlets and hydration points experience peak footfall.",
      location: "Concourse Food Pavilions",
      isKeyMilestone: false,
    },
    {
      id: "m-04",
      time: eventEnd,
      title: isSports ? "Final Whistle & Presentation Ceremony" : isConcert ? "Encore & Finale Broadcast" : "Closing Keynote & Day Concludes",
      phase: "Main Event" as const,
      description: "Main event concludes; egress safety lighting and announcement loop starts.",
      location: "Main Arena",
      isKeyMilestone: true,
    },
    {
      id: "m-05",
      time: egressStart,
      title: "Staged Egress & Transit Corridors Active",
      phase: "Egress" as const,
      description: "Dedicated dispersal corridors open; shuttle frequencies increased to 4 min headways.",
      location: "Dispersal Plazas & Transit Terminals",
      isKeyMilestone: true,
    },
    {
      id: "m-06",
      time: egressEnd,
      title: "Perimeter Sweep & Operational Handover",
      phase: "Post-Event" as const,
      description: "Concourse sanitation sweep and transport operations return to standard baseline.",
      location: "All Sectors",
      isKeyMilestone: false,
    },
  ];

  return {
    date: dateStr,
    gatesOpenTime,
    eventStartTime: mainStart,
    intervalTime,
    eventEndTime: eventEnd,
    egressStartTime: egressStart,
    egressEndTime: egressEnd,
    milestones,
  };
}

/**
 * Scaffolds an event ecosystem tailored to venue, capacity, and category
 */
export function scaffoldEventEcosystem(event: AppEvent): EventEcosystem {
  const eventCapacity = parseNumeric(event.capacity, 10000);
  const liveState = getEventLiveState(event.id, event);
  const operatorResources = getStoredOperatorResources().filter((r) =>
    r.assignedEventIds?.includes(event.id)
  );

  const venueOccupancy = liveState.crowdState.currentAttendance || Math.round(eventCapacity * 0.7);
  const cityCluster = identifyCityFromCoordinates(event.latitude || 19.0607, event.longitude || 72.8656);

  // Build Resource List
  const resources: EcosystemResourceItem[] = [];

  // 1. Gates
  if (event.gates && event.gates.length > 0) {
    event.gates.forEach((g, idx) => {
      const gateState = liveState.gateStates[g.id];
      const cap = gateState?.capacity ? gateState.capacity * 60 : 7200;
      const usage = gateState?.currentCount || Math.round(venueOccupancy / event.gates.length);

      resources.push({
        id: `res-gate-${g.id}`,
        eventId: event.id,
        category: "gate",
        name: g.name,
        location: `Perimeter Outer Ring (${g.assignedZones?.join(", ") || "General Access"})`,
        totalCapacity: cap,
        currentUsage: usage,
        availableCapacity: Math.max(0, cap - usage),
        status: gateState?.status === "HIGH PRESSURE" ? "NEAR CAPACITY" : gateState?.status === "CLOSED" ? "UNAVAILABLE" : "AVAILABLE",
        condition: `Turnstiles scanning at ${gateState?.entryRate || 22} pax/min`,
        operatingHours: "Gates open 2 hours before main event",
        notes: "Equipped with high-speed digital barcode turnstiles and fast-track bag checks.",
        dependencies: [
          {
            targetResourceId: "venue-main",
            targetResourceType: "venue",
            dependencyType: "VENUE_INGRESS",
            description: "Direct ingress pipeline into Main Seating Arena",
            impactLevel: "HIGH",
          },
        ],
      });
    });
  } else {
    resources.push({
      id: "res-gate-main-01",
      eventId: event.id,
      category: "gate",
      name: "Gate 1 (Main Concourse Ingress)",
      location: "North Plaza",
      totalCapacity: Math.round(eventCapacity * 0.6),
      currentUsage: Math.round(venueOccupancy * 0.6),
      availableCapacity: Math.max(0, Math.round(eventCapacity * 0.6) - Math.round(venueOccupancy * 0.6)),
      status: "AVAILABLE",
      condition: "Smooth flow, low queue delay",
      operatingHours: "08:00 - 23:00",
    });
  }

  // 2. Transport
  const opTransport = operatorResources.find((r) => r.resourceType === "transport");
  if (event.transport && event.transport.length > 0) {
    event.transport.forEach((t, idx) => {
      const isShuttle = t.type === "shuttle";
      const cap = isShuttle ? 1200 : 8000;
      const usage = isShuttle ? 840 : 5600;

      resources.push({
        id: `res-trans-${idx}`,
        eventId: event.id,
        category: "transport",
        name: t.title,
        location: t.detail || "Arterial Transit Bay",
        totalCapacity: cap,
        currentUsage: usage,
        availableCapacity: Math.max(0, cap - usage),
        status: t.badge?.toLowerCase().includes("high") ? "LIMITED" : "AVAILABLE",
        assignedOperatorId: opTransport?.operatorId,
        assignedOperatorName: opTransport ? "Rapid Transit Operations" : undefined,
        assignedOperatorType: "Transport",
        condition: `Operating frequency: ${t.frequency || "Every 6-8 mins"}`,
        operatingHours: "06:00 - 00:00 IST",
        notes: `Direct transit corridor connecting city arterials to ${event.venue}.`,
        dependencies: [
          {
            targetResourceId: "res-park-01",
            targetResourceType: "parking",
            dependencyType: "PARKING_OVERFLOW",
            description: "Carries attendees from remote parking bays and transit hubs",
            impactLevel: "HIGH",
          },
        ],
      });
    });
  } else {
    const transitName =
      cityCluster === "bengaluru"
        ? "Namma Metro Green Line (Madavara Station Direct Skywalk)"
        : cityCluster === "delhi"
        ? "Delhi Metro Blue Line (Supreme Court Station Direct Underpass)"
        : cityCluster === "mumbai"
        ? "Mumbai Metro Aqua Line 3 (BKC Station Covered Skywalk)"
        : `Rapid Transit Express Corridor (${event.venue} North Link)`;

    resources.push({
      id: "res-trans-metro-express",
      eventId: event.id,
      category: "transport",
      name: transitName,
      location: `Direct pedestrian portal to ${event.venue}`,
      totalCapacity: 9500,
      currentUsage: 6400,
      availableCapacity: 3100,
      status: "AVAILABLE",
      condition: "Trains every 3.5 minutes",
      operatingHours: "06:00 - 00:30 IST",
    });
  }

  // 3. Parking
  const opParking = operatorResources.find((r) => r.resourceType === "parking");
  if (event.parking && event.parking.length > 0) {
    event.parking.forEach((p, idx) => {
      const total = parseNumeric(p.capacity, 1500);
      const occupied = Math.round(total * 0.72);

      resources.push({
        id: `res-park-${idx}`,
        eventId: event.id,
        category: "parking",
        name: p.name,
        location: p.entryRoute || `Outer Ring approach towards ${p.name}`,
        totalCapacity: total,
        currentUsage: occupied,
        availableCapacity: Math.max(0, total - occupied),
        status: p.status === "full" ? "FULL" : p.status === "filling_fast" ? "NEAR CAPACITY" : "AVAILABLE",
        assignedOperatorId: opParking?.operatorId,
        assignedOperatorName: opParking ? "Perimeter Parking Services" : undefined,
        assignedOperatorType: "Parking",
        condition: p.shuttleAvailable ? "Shuttle feeder connected" : "Direct walking path",
        operatingHours: "07:00 - 01:00 IST",
        notes: `Parking facility with automated ANPR sensor tolling. Fee: ${p.fee || "₹200/day"}`,
        dependencies: p.shuttleAvailable
          ? [
              {
                targetResourceId: "res-trans-0",
                targetResourceType: "transport",
                dependencyType: "SHUTTLE_FEEDER",
                description: "Requires dedicated shuttle connection due to distance from venue turnstiles",
                impactLevel: "MEDIUM",
              },
            ]
          : [],
      });
    });
  } else {
    const parkName =
      cityCluster === "bengaluru"
        ? "BIEC Dedicated Surface Multilevel Lot (P1-P3)"
        : cityCluster === "delhi"
        ? "Bharat Mandapam Underground Smart Deck P1-P2"
        : cityCluster === "mumbai"
        ? "Jio World Multilevel Underground Deck P1-P3"
        : `${event.venue} Official Multilevel Parking Facility P1`;

    resources.push({
      id: "res-park-p1-main",
      eventId: event.id,
      category: "parking",
      name: parkName,
      location: `Access Road, ${event.venue}`,
      totalCapacity: 3500,
      currentUsage: 2150,
      availableCapacity: 1350,
      status: "AVAILABLE",
      condition: "Level 1-3 open, FASTag ANPR & EV charging active",
      operatingHours: "24/7",
    });
  }

  // 4. Accommodation
  const opAccom = operatorResources.find((r) => r.resourceType === "accommodation");
  if (event.accommodation && event.accommodation.length > 0) {
    event.accommodation.forEach((a, idx) => {
      const totalRooms = 250 + idx * 100;
      const occupied = Math.round(totalRooms * 0.85);

      resources.push({
        id: `res-accom-${idx}`,
        eventId: event.id,
        category: "accommodation",
        name: a.name,
        location: a.address || `${a.distance} from venue`,
        totalCapacity: totalRooms,
        currentUsage: occupied,
        availableCapacity: Math.max(0, totalRooms - occupied),
        status: a.status === "Sold Out" ? "FULL" : a.status === "Limited" ? "LIMITED" : "AVAILABLE",
        assignedOperatorId: opAccom?.operatorId,
        assignedOperatorName: opAccom ? "Hospitality Partner Group" : undefined,
        assignedOperatorType: "Accommodation",
        condition: a.shuttleConnected ? "Direct shuttle pickup to venue" : "Short cab transit",
        operatingHours: "24/7 Front Desk",
        notes: `Official delegate and VIP lodging partner. Rating: ${a.rating || "4.8/5"}.`,
        dependencies: [
          {
            targetResourceId: "res-trans-0",
            targetResourceType: "transport",
            dependencyType: "ACCOMMODATION_TRANSIT",
            description: "Generates transport demand before and after event peak times",
            impactLevel: "MEDIUM",
          },
        ],
      });
    });
  } else {
    const hotel1 =
      cityCluster === "bengaluru"
        ? { name: "Taj Yeshwantpur Bengaluru", loc: "2275 Tumkur Road, Yeshwanthpur (6.8 km)" }
        : cityCluster === "delhi"
        ? { name: "The Lalit New Delhi", loc: "Barakhamba Avenue, Connaught Place (2.8 km)" }
        : cityCluster === "mumbai"
        ? { name: "Trident Hotel Bandra Kurla", loc: "C 56 G Block BKC (0.5 km)" }
        : { name: `Grand Business Hotel & Suites`, loc: `Adjacent to ${event.venue} (1.2 km)` };

    resources.push({
      id: "res-accom-hotel-primary",
      eventId: event.id,
      category: "accommodation",
      name: hotel1.name,
      location: hotel1.loc,
      totalCapacity: 350,
      currentUsage: 295,
      availableCapacity: 55,
      status: "LIMITED",
      condition: "Official partner hotel, direct venue express feeder",
      operatingHours: "24/7 Front Desk",
    });
  }

  // 5. Food & Dining
  const opFood = operatorResources.find((r) => r.resourceType === "food");
  if (event.foodDining && event.foodDining.length > 0) {
    event.foodDining.forEach((f, idx) => {
      const cap = 500 + idx * 200;
      const occ = Math.round(cap * 0.6);

      resources.push({
        id: `res-food-${idx}`,
        eventId: event.id,
        category: "food",
        name: f.name,
        location: f.location,
        totalCapacity: cap,
        currentUsage: occ,
        availableCapacity: Math.max(0, cap - occ),
        status: f.status === "High Demand" ? "NEAR CAPACITY" : "AVAILABLE",
        assignedOperatorId: opFood?.operatorId,
        assignedOperatorName: opFood ? "Concessions & Catering Services" : undefined,
        assignedOperatorType: "Food & Dining",
        condition: `Avg wait time: ${f.avgWaitMins || 6} mins`,
        operatingHours: f.operatingHours || "10:00 - 23:00 IST",
        notes: `Multi-vendor food court. Mobile app ordering: ${f.mobileOrdering ? "Enabled" : "In-person POS"}`,
        dependencies: [
          {
            targetResourceId: "venue-main",
            targetResourceType: "venue",
            dependencyType: "MEALTIME_SPIKE",
            description: "Experiences surging attendee demand during intervals and halftime breaks",
            impactLevel: "HIGH",
          },
        ],
      });
    });
  } else {
    const foodName =
      cityCluster === "bengaluru"
        ? "BIEC Grand Concourse Food Court"
        : cityCluster === "delhi"
        ? "Mandapam Executive Dining & Plenary Bistro"
        : cityCluster === "mumbai"
        ? "Jio World Culinary Boulevard & Cafes"
        : `${event.venue} Concourse Dining Promenade`;

    resources.push({
      id: "res-food-court-primary",
      eventId: event.id,
      category: "food",
      name: foodName,
      location: "Level 1 & 2 Atrium",
      totalCapacity: 950,
      currentUsage: 540,
      availableCapacity: 410,
      status: "AVAILABLE",
      condition: "Express lane active, mobile pickup enabled",
      operatingHours: "10:00 - 23:00 IST",
    });
  }

  // 6. Medical Assistance
  const opMed = operatorResources.find((r) => r.resourceType === "medical");
  if (event.medicalAssistance && event.medicalAssistance.length > 0) {
    event.medicalAssistance.forEach((m, idx) => {
      resources.push({
        id: `res-med-${idx}`,
        eventId: event.id,
        category: "medical",
        name: m.name,
        location: m.location,
        totalCapacity: 30 + idx * 10,
        currentUsage: 6,
        availableCapacity: 24 + idx * 10,
        status: "AVAILABLE",
        assignedOperatorId: opMed?.operatorId,
        assignedOperatorName: opMed ? "Emergency Medical Response" : undefined,
        assignedOperatorType: "Medical & Assistance",
        condition: `Staff on duty: ${m.staffCount || 8} personnel`,
        operatingHours: "24/7 Event Readiness",
        notes: `Equipped with resuscitation units, triage beds, and dedicated ambulance bays. Contact: ${m.contactNumber || "Ext 108"}.`,
        dependencies: [
          {
            targetResourceId: "venue-main",
            targetResourceType: "venue",
            dependencyType: "FIRST_AID_SUPPORT",
            description: "Direct medical support and casualty clearing for all attendee sectors",
            impactLevel: "MEDIUM",
          },
        ],
      });
    });
  } else {
    const medName =
      cityCluster === "bengaluru"
        ? "Fortis Healthcare Emergency Clinic at BIEC"
        : cityCluster === "delhi"
        ? "Apollo Mandapam Onsite Emergency Triage Center"
        : cityCluster === "mumbai"
        ? "Asian Heart Institute BKC Emergency Post"
        : `Emergency Medical & Trauma Desk at ${event.venue}`;

    resources.push({
      id: "res-med-main-station",
      eventId: event.id,
      category: "medical",
      name: medName,
      location: "Gate 1 Concierge Complex",
      totalCapacity: 40,
      currentUsage: 7,
      availableCapacity: 33,
      status: "AVAILABLE",
      condition: "Doctors, paramedics, and ambulances on standby",
      operatingHours: "24/7 Event Readiness",
    });
  }


  // 7. Venue Services
  const opVenue = operatorResources.find((r) => r.resourceType === "venue_services");
  resources.push({
    id: "res-vs-power-rigging",
    eventId: event.id,
    category: "venue_services",
    name: "Central AV, Floodlighting & Generator Operations",
    location: "Technical Control Tower",
    totalCapacity: 100,
    currentUsage: 85,
    availableCapacity: 15,
    status: "ACTIVE",
    assignedOperatorId: opVenue?.operatorId,
    assignedOperatorName: opVenue ? "Venue Technical Facilities" : undefined,
    assignedOperatorType: "Venue Services",
    condition: "Primary grid & backup generators 100% synchronized",
    operatingHours: "Continuous shift",
    notes: "Maintains sound systems, arena displays, electrical distribution, and floodlights.",
  });

  resources.push({
    id: "res-vs-sanitation",
    eventId: event.id,
    category: "venue_services",
    name: "Concourse Hygiene & Waste Management Team",
    location: "All Sectors & Restrooms",
    totalCapacity: 150,
    currentUsage: 110,
    availableCapacity: 40,
    status: "ACTIVE",
    condition: "Scheduled 15-minute sanitization cycles",
    operatingHours: "Continuous 24-hr Shift",
    notes: "Ensures clean restrooms, hydration points, and rapid waste sorting.",
  });

  // 8. Other Services (Info desk, Cloakroom)
  resources.push({
    id: "res-other-info-cloakroom",
    eventId: event.id,
    category: "other",
    name: "Main Plaza Information & Cloakroom Hub",
    location: "North Concourse Ingress Plaza",
    totalCapacity: 600,
    currentUsage: 420,
    availableCapacity: 180,
    status: "AVAILABLE",
    condition: "Cloakroom lockers available, lost-and-found staffed",
    operatingHours: "08:00 - 23:30 IST",
    notes: "Provides luggage storage lockers, accessibility wheelchairs, and sensory quiet packs.",
  });

  // Timeline
  const timeline = createDefaultTimeline(event);

  return {
    eventId: event.id,
    eventName: event.name,
    eventCategory: event.category,
    venueName: event.venue,
    venueCapacity: eventCapacity,
    venueCurrentUsage: venueOccupancy,
    timeline,
    resources,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Loads all event ecosystems from localStorage
 */
export function getAllEventEcosystems(): Record<string, EventEcosystem> {
  try {
    const raw = localStorage.getItem(ECOSYSTEM_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading event ecosystems:", err);
    return {};
  }
}

/**
 * Saves all event ecosystems to localStorage
 */
export function saveAllEventEcosystems(ecosystems: Record<string, EventEcosystem>): void {
  try {
    localStorage.setItem(ECOSYSTEM_STORAGE_KEY, JSON.stringify(ecosystems));
  } catch (err) {
    console.error("Error saving event ecosystems:", err);
  }
}

/**
 * Retrieves the event ecosystem for an event, automatically scaffolding if not present.
 */
export function getEventEcosystem(eventId: string): EventEcosystem {
  const all = getAllEventEcosystems();
  if (all[eventId]) {
    // Recalculate available capacity dynamically
    const eco = all[eventId];
    eco.resources = (eco.resources || []).map((r) => ({
      ...r,
      availableCapacity: Math.max(0, (r.totalCapacity || 0) - (r.currentUsage || 0)),
    }));
    return eco;
  }

  const event = getStoredEventById(eventId) || getAllStoredEvents()[0];
  if (!event) {
    // Fallback minimal ecosystem
    return {
      eventId,
      eventName: "Demo Event",
      eventCategory: "Large Gatherings",
      venueName: "Event Arena",
      venueCapacity: 5000,
      venueCurrentUsage: 2500,
      timeline: {
        date: "2026-10-15",
        gatesOpenTime: "09:00",
        eventStartTime: "10:00",
        eventEndTime: "18:00",
        egressStartTime: "18:00",
        egressEndTime: "19:30",
        milestones: [],
      },
      resources: [],
      lastUpdated: new Date().toISOString(),
    };
  }

  const scaffolded = scaffoldEventEcosystem(event);
  all[eventId] = scaffolded;
  saveAllEventEcosystems(all);
  return scaffolded;
}

/**
 * Updates an ecosystem resource and synchronizes storage.
 */
export function updateEcosystemResource(
  eventId: string,
  resourceId: string,
  updates: Partial<EcosystemResourceItem>,
  user: string = "Organizer"
): EventEcosystem {
  const ecosystem = getEventEcosystem(eventId);
  const resourceIdx = ecosystem.resources.findIndex((r) => r.id === resourceId);

  if (resourceIdx >= 0) {
    const existing = ecosystem.resources[resourceIdx];
    const totalCapacity = updates.totalCapacity !== undefined ? Math.max(0, updates.totalCapacity) : existing.totalCapacity;
    const currentUsage = updates.currentUsage !== undefined ? Math.max(0, updates.currentUsage) : existing.currentUsage;
    const availableCapacity = Math.max(0, totalCapacity - currentUsage);

    ecosystem.resources[resourceIdx] = {
      ...existing,
      ...updates,
      totalCapacity,
      currentUsage,
      availableCapacity,
    };

    ecosystem.lastUpdated = new Date().toISOString();
    const all = getAllEventEcosystems();
    all[eventId] = ecosystem;
    saveAllEventEcosystems(all);

    // Broadcast update
    try {
      window.dispatchEvent(new CustomEvent("eventflow_ecosystem_updated", { detail: { eventId, resourceId } }));
    } catch {}
  }

  return ecosystem;
}

/**
 * Loads all attendee journey states: [userId]: { [eventId]: AttendeeJourneyState }
 */
export function getAllAttendeeJourneyStates(): Record<string, Record<string, AttendeeJourneyState>> {
  try {
    const raw = localStorage.getItem(JOURNEY_STATE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error("Error reading journey states:", err);
    return {};
  }
}

/**
 * Saves all attendee journey states
 */
export function saveAllAttendeeJourneyStates(states: Record<string, Record<string, AttendeeJourneyState>>): void {
  try {
    localStorage.setItem(JOURNEY_STATE_STORAGE_KEY, JSON.stringify(states));
  } catch (err) {
    console.error("Error saving journey states:", err);
  }
}

/**
 * Retrieves the attendee journey state for a specific user and booked event.
 * Defaults to "NOT_STARTED" if unset.
 */
export function getAttendeeJourneyState(userId: string, eventId: string): AttendeeJourneyState {
  const allStates = getAllAttendeeJourneyStates();
  const userStates = allStates[userId] || {};

  if (userStates[eventId]) {
    return userStates[eventId];
  }

  const defaultState: AttendeeJourneyState = {
    userId,
    eventId,
    currentStage: "NOT_STARTED",
    selectedTravelMode: "metro",
    updatedAt: new Date().toISOString(),
  };

  userStates[eventId] = defaultState;
  allStates[userId] = userStates;
  saveAllAttendeeJourneyStates(allStates);
  return defaultState;
}

/**
 * Updates the attendee journey stage and metadata.
 */
export function updateAttendeeJourneyState(
  userId: string,
  eventId: string,
  stage: AttendeeJourneyStage,
  metadata?: Partial<AttendeeJourneyState>
): AttendeeJourneyState {
  const allStates = getAllAttendeeJourneyStates();
  const userStates = allStates[userId] || {};
  const current = userStates[eventId] || {
    userId,
    eventId,
    currentStage: "NOT_STARTED",
    updatedAt: new Date().toISOString(),
  };

  const updated: AttendeeJourneyState = {
    ...current,
    ...metadata,
    userId,
    eventId,
    currentStage: stage,
    updatedAt: new Date().toISOString(),
  };

  userStates[eventId] = updated;
  allStates[userId] = userStates;
  saveAllAttendeeJourneyStates(allStates);

  try {
    window.dispatchEvent(new CustomEvent("eventflow_journey_updated", { detail: { userId, eventId, stage } }));
  } catch {}

  return updated;
}
