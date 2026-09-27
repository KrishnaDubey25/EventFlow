/**
 * AttendeeIntelligenceService
 * Derives personalized, non-spamming, location-aware arrival guidance and operational
 * insights for attendees based on their specific ticket, origin, travel mode, and event state.
 */

import {
  AttendeeContext,
  PersonalizedAttendeeInsight,
  InsightPriority,
  OperationalActionRecord,
} from "../types/intelligence";
import { AppEvent } from "../types/event";
import { EventFlowTicket } from "../types/booking";
import { calculateRoute, RouteCalculationResult } from "./locationService";
import { getStoredEventById } from "./eventStorageService";
import { getEventLiveState } from "./operationalStateService";

const ATTENDEE_CONTEXT_STORAGE_KEY = "eventflow_attendee_contexts";
const ATTENDEE_INSIGHTS_STORAGE_KEY = "eventflow_attendee_insights";

/**
 * Loads stored attendee context or initializes a smart default from their booked ticket and event
 */
export function getAttendeeContext(attendeeId: string, eventId: string, ticket?: EventFlowTicket): AttendeeContext {
  try {
    const raw = localStorage.getItem(ATTENDEE_CONTEXT_STORAGE_KEY);
    const parsed: Record<string, AttendeeContext> = raw ? JSON.parse(raw) : {};
    const key = `${attendeeId}_${eventId}`;

    if (parsed[key]) {
      return parsed[key];
    }
  } catch {}

  const event = getStoredEventById(eventId);
  const venue = event?.venue || "Event Venue";
  const eventLoc = event?.location || "Event Location";

  // Derive initial origin suggestion based on the event's metropolitan area
  let defaultOrigin = "Central Railway Station";
  const locLower = (event?.location || "").toLowerCase();
  if (locLower.includes("bengaluru") || locLower.includes("bangalore")) {
    defaultOrigin = "Indiranagar, Bengaluru";
  } else if (locLower.includes("delhi") || locLower.includes("noida") || locLower.includes("gurgaon")) {
    defaultOrigin = "Connaught Place, New Delhi";
  } else if (locLower.includes("mumbai") || locLower.includes("bkc") || locLower.includes("wankhede")) {
    defaultOrigin = "Dadar West, Mumbai";
  } else if (locLower.includes("ahmedabad")) {
    defaultOrigin = "Vastrapur, Ahmedabad";
  }

  const newContext: AttendeeContext = {
    attendeeId,
    eventId,
    ticketId: ticket?.ticketId || `tkt_${attendeeId}_${eventId}`,
    attendeeName: ticket?.attendeeName || "Attendee",
    origin: defaultOrigin,
    destination: {
      venueName: venue,
      address: eventLoc,
      latitude: event?.latitude || 19.0607,
      longitude: event?.longitude || 72.8656,
      placeId: event?.placeId,
    },
    arrivalPreference: "standard",
    travelMode: "transit",
    ticketZone: ticket?.section || "General Stand",
    seat: ticket?.seat || "General Ingress",
    assignedGate: ticket?.assignedGate || "Gate 1",
    eventDate: event?.date || "Event Date",
    eventTime: event?.time || "19:00 IST",
    currentJourneyState: "NOT_STARTED",
  };

  saveAttendeeContext(newContext);
  return newContext;
}

/**
 * Saves updated attendee preferences (e.g. customized origin or preferred travel mode)
 */
export function saveAttendeeContext(context: AttendeeContext): void {
  try {
    const raw = localStorage.getItem(ATTENDEE_CONTEXT_STORAGE_KEY);
    const parsed: Record<string, AttendeeContext> = raw ? JSON.parse(raw) : {};
    const key = `${context.attendeeId}_${context.eventId}`;
    parsed[key] = context;
    localStorage.setItem(ATTENDEE_CONTEXT_STORAGE_KEY, JSON.stringify(parsed));
  } catch (err) {
    console.error("Failed to save attendee context:", err);
  }
}

/**
 * Evaluates conditions and generates high-value personalized insights for the attendee.
 * Strictly adheres to anti-spam rules: only emits when a meaningful threshold is crossed.
 */
export async function evaluateAttendeeInsights(
  context: AttendeeContext,
  event: AppEvent,
  operationalActions: OperationalActionRecord[] = []
): Promise<PersonalizedAttendeeInsight[]> {
  const insights: PersonalizedAttendeeInsight[] = [];
  const now = new Date();

  // 1. Calculate dynamic route and ETA from attendee's origin to event destination
  const route = await calculateRoute({
    origin: context.origin || "City Center",
    destination: context.destination,
    travelMode: context.travelMode,
    eventStartTimeStr: event.startTime || event.time,
  });

  // 2. Base Arrival & Departure Insight (INFO Priority)
  insights.push({
    id: `ins-dept-${context.attendeeId}-${context.eventId}`,
    attendeeId: context.attendeeId,
    eventId: context.eventId,
    priority: "INFO",
    title: `Recommended Departure: ${route.recommendedDepartureTime}`,
    message: `Plan to leave by ${route.recommendedDepartureTime} via ${context.travelMode} (${route.distanceKm} km, ~${route.durationMinutes} mins) to arrive comfortably at ${context.destination.venueName} by ${route.targetArrivalTime} for ${context.assignedGate || "Gate 1"} security check.`,
    actionableStep: `Target arrival window: ${route.targetArrivalTime}`,
    routeInfo: {
      distanceKm: route.distanceKm,
      estimatedMinutes: route.durationMinutes,
      trafficDelayMinutes: route.trafficDelayMinutes,
      departureTime: route.recommendedDepartureTime,
      targetArrivalTime: route.targetArrivalTime,
      isLiveTraffic: route.isLiveTraffic,
      status: route.routeStatus,
    },
    recommendedDepartureTime: route.recommendedDepartureTime,
    recommendedArrivalTime: route.targetArrivalTime,
    generatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    source: route.source,
    dataClassification: route.dataClassification,
  });

  // 3. Traffic Condition Insight (ADVISORY or WARNING when delay is material)
  if (route.trafficDelayMinutes >= 15) {
    insights.push({
      id: `ins-traffic-${context.attendeeId}-${context.eventId}`,
      attendeeId: context.attendeeId,
      eventId: context.eventId,
      priority: route.trafficDelayMinutes >= 25 ? "WARNING" : "ADVISORY",
      title: route.trafficDelayMinutes >= 25 ? "Significant Traffic Delay on Ingress Route" : "Heavier Traffic Observed",
      message: `Congestion along arterial corridors is adding an estimated ${route.trafficDelayMinutes} minutes of delay. Consider departing 15 minutes earlier or switching to rapid metro lines.`,
      actionableStep: "Depart earlier or take metro transit to bypass traffic.",
      recommendedDepartureTime: route.recommendedDepartureTime,
      recommendedArrivalTime: route.targetArrivalTime,
      generatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      source: "Municipal Transit & Traffic Engine",
      dataClassification: "ESTIMATED DATA",
    });
  }

  // 4. Live Event State & Parking Check (Only for driving/rideshare attendees)
  const liveState = getEventLiveState(event.id, event);
  if (context.travelMode === "driving") {
    // Check if parking is near capacity
    const parkingLots = Object.values(liveState.parkingState || {});
    const fullLots = parkingLots.filter((p) => p.status === "FULL" || p.status === "FILLING");

    if (fullLots.length > 0) {
      insights.push({
        id: `ins-park-${context.attendeeId}-${context.eventId}`,
        attendeeId: context.attendeeId,
        eventId: context.eventId,
        priority: "WARNING",
        title: "Primary Venue Parking Near Capacity",
        message: `${fullLots.map((p) => p.zoneName).join(", ")} is filling rapidly. Follow digital roadside matrix displays to overflow lots with connected feeder shuttles.`,
        actionableStep: "Divert to overflow parking ground with direct shuttle.",
        recommendedDepartureTime: route.recommendedDepartureTime,
        recommendedArrivalTime: route.targetArrivalTime,
        generatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        source: "Event Parking Operations",
        dataClassification: "LIVE DATA",
      });
    }
  }

  // 5. Selected Resource Availability & Recommendation Evaluation
  const hospResources = Object.values(liveState.hospitalityResources || {});
  const parkResources = Object.values(liveState.parkingResources || {});

  // Evaluate Selected Hospitality Option
  if (context.selectedHospitality) {
    const selectedHosp = hospResources.find(
      (h) => h.resourceId === context.selectedHospitality || h.name === context.selectedHospitality
    );

    if (selectedHosp && (selectedHosp.status.includes("FULL") || selectedHosp.status.includes("UNAVAILABLE"))) {
      // Find suitable available alternative
      const alternative = hospResources.find(
        (h) => h.resourceId !== selectedHosp.resourceId && !h.status.includes("FULL") && !h.status.includes("UNAVAILABLE")
      );

      const altName = alternative?.name || "Concourse Food Plaza B";

      insights.push({
        id: `ins-selected-hosp-${context.attendeeId}-${context.eventId}`,
        attendeeId: context.attendeeId,
        eventId: context.eventId,
        priority: "WARNING",
        title: `Selected Hospitality Unavailable: ${selectedHosp.name}`,
        message: `Your selected hospitality option (${selectedHosp.name}) is currently unavailable or at maximum capacity. Recommended alternative: ${altName}.`,
        actionableStep: `Proceed to ${altName} upon ingress.`,
        recommendedDepartureTime: route.recommendedDepartureTime,
        recommendedArrivalTime: route.targetArrivalTime,
        generatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        source: "Central Event Hospitality Engine",
        dataClassification: "LIVE DATA",
      });
    }
  }

  // Evaluate Selected Parking Lot
  if (context.selectedParking) {
    const selectedPark = parkResources.find(
      (p) => p.resourceId === context.selectedParking || p.name === context.selectedParking
    );

    if (selectedPark && (selectedPark.utilization >= 90 || selectedPark.status === "CRITICAL" || selectedPark.status === "FULL")) {
      const alternativePark = parkResources.find(
        (p) => p.resourceId !== selectedPark.resourceId && p.utilization < 85
      );

      const altName = alternativePark?.name || "Lot P2 (East Deck)";

      insights.push({
        id: `ins-selected-park-${context.attendeeId}-${context.eventId}`,
        attendeeId: context.attendeeId,
        eventId: context.eventId,
        priority: "WARNING",
        title: `Selected Parking Near Capacity: ${selectedPark.name}`,
        message: `Parking lot (${selectedPark.name}) is currently at ${selectedPark.utilization}% capacity. Recommended alternative: ${altName}.`,
        actionableStep: `Follow roadside matrix displays to ${altName}.`,
        recommendedDepartureTime: route.recommendedDepartureTime,
        recommendedArrivalTime: route.targetArrivalTime,
        generatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        source: "Central Parking Operations Engine",
        dataClassification: "LIVE DATA",
      });
    }
  }

  // 6. Operational Action Propagation (Consequences of Organizer / Operator Decisions)
  const relevantActions = operationalActions.filter(
    (act) => act.eventId === event.id && (act.status === "APPROVED" || act.status === "IN_PROGRESS" || act.status === "COMPLETED")
  );

  relevantActions.forEach((act) => {
    if (act.attendeeConsequenceMessage) {
      // Determine if action affects this attendee's travel mode
      const isTransitRelevant = act.category === "transport" && (context.travelMode === "transit" || context.travelMode === "driving");
      const isParkingRelevant = act.category === "parking" && context.travelMode === "driving";
      const isGateRelevant = act.category === "gate";

      if (isTransitRelevant || isParkingRelevant || isGateRelevant) {
        insights.push({
          id: `ins-action-${act.actionId}-${context.attendeeId}`,
          attendeeId: context.attendeeId,
          eventId: context.eventId,
          priority: "INFO",
          title: `Operational Update: ${act.title}`,
          message: act.attendeeConsequenceMessage,
          actionableStep: `Implemented by operations control.`,
          recommendedDepartureTime: route.recommendedDepartureTime,
          recommendedArrivalTime: route.targetArrivalTime,
          generatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          source: "Unified Event Operations Command",
          dataClassification: "LIVE DATA",
        });
      }
    }
  });

  return insights;
}

// Compatibility adapter for the existing AttendeeLiveStatusGuide component.
// Keeps its original UI intact and derives answers from its selected resources.
export function updateAttendeePreferences(attendeeId: string, eventId: string, preferences: Partial<AttendeeContext>): AttendeeContext {
  const next = { ...getAttendeeContext(attendeeId, eventId), ...preferences, attendeeId, eventId };
  if (!['driving', 'transit', 'rideshare', 'walking'].includes(next.travelMode)) next.travelMode = 'transit';
  saveAttendeeContext(next);
  window.dispatchEvent(new Event('eventflow_attendee_context_updated'));
  return next;
}

export async function getAttendeePersonalizedTravelReport(context: AttendeeContext, event: AppEvent) {
  const state = getEventLiveState(event.id, event);
  const parking = Object.values(state.parkingResources || {}).find(p => p.resourceId === context.selectedParking || p.name === context.selectedParking);
  const hospitality = Object.values(state.hospitalityResources || {}).find(h => h.resourceId === context.selectedHospitality || h.name === context.selectedHospitality);
  const transport = Object.values(state.transportResources || {}).find(t => t.resourceId === context.selectedTransport || t.name === context.selectedTransport);
  const blocked = hospitality && /FULL|UNAVAILABLE|CLOSED/.test(hospitality.status);
  const alternative = blocked ? Object.values(state.hospitalityResources || {}).find(h => h.resourceId !== hospitality.resourceId && /^(AVAILABLE|OPEN|NORMAL|OPERATIONAL)$/.test(h.status)) : undefined;
  const source = state.sourceType === 'SIMULATION' ? 'Simulation' : 'Recorded event state';
  const changes: { title: string; description: string; timestamp: string; source: string }[] = [];
  if (parking && /FULL|CLOSED/.test(parking.status)) changes.push({ title: parking.name, description: `Selected parking is ${parking.status}. Ask staff for an available alternative.`, timestamp: new Date().toLocaleTimeString(), source });
  if (blocked) changes.push({ title: hospitality.name, description: `Selected hospitality is ${hospitality.status}.`, timestamp: new Date().toLocaleTimeString(), source });
  return {
    isDepartureTimeRecalculated: false, recalculationReason: '',
    answers: {
      whereDoIGo: { assignedGate: context.assignedGate || 'Check your ticket', venueName: event.venue, address: event.location, directions: 'Follow your assigned gate and venue signage.' },
      whenShouldILeave: { arrivalTime: 'Confirm with organizer', departureTime: 'Check directions', travelTimeMinutes: '—', bufferMinutes: '—', summary: 'A verified travel-time feed is not connected. Open directions from your current location and allow time for admission.' },
      howShouldITravel: { mode: context.travelMode, status: 'SELECTED', details: 'Your saved preference. Check service availability before travelling.', alternativeSuggestion: '' },
      whereShouldIPark: { selectedName: parking?.name || 'No matched parking selected', occupancyPercent: parking && parking.capacity > 0 ? Math.round(parking.currentUsage / parking.capacity * 100) : '—', availableSpaces: parking ? Math.max(0, parking.capacity - parking.currentUsage) : 'Unknown', warning: parking ? `${source}: ${parking.status}` : 'No recorded availability for your selection.' },
      whichTransportShouldITake: { selectedName: transport?.name || 'No matched transport selected', status: transport?.status || 'UNKNOWN', details: transport ? `${source}. Confirm departures with the operator.` : 'Choose a service in the Transport tab.', alternativeSuggestion: '' },
      whichHospitalityShouldIUse: { selectedName: hospitality?.name || 'No matched hospitality selected', status: blocked ? 'UNAVAILABLE' : hospitality?.status || 'UNKNOWN', details: hospitality ? `${source}: ${hospitality.status}` : 'Select an available service.', warning: blocked ? 'Your selected service is unavailable.' : '', recommendedAlternative: alternative ? { name: alternative.name, details: `${source}: ${alternative.status}` } : undefined },
      whatHasChanged: changes,
      whyHasItChanged: changes.map(c => ({ change: c.title, reason: c.description })),
    },
  };
}
export type AttendeePersonalizedTravelReport = Awaited<ReturnType<typeof getAttendeePersonalizedTravelReport>>;
