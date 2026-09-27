import { AppEvent, EventVisibility } from "../types/event";
import { SAMPLE_EVENTS } from "../data/eventsData";
import { resolveEventBanner } from "../utils/eventImageResolver";
import { deleteEventLiveState } from "./operationalStateService";
import { deleteEventBookingsAndTickets } from "./bookingService";

const EVENTS_STORAGE_KEY = "eventflow_events";
const DELETED_EVENTS_STORAGE_KEY = "eventflow_deleted_event_ids";
const DEMO_ORGANIZER_ID = "usr_demo_organizer";

/**
 * Retrieves the list of event IDs that have been explicitly removed/deleted by organizers.
 */
export function getDeletedEventIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_EVENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Records an event ID into the deleted blacklist so it is never re-seeded or resurrected.
 */
function recordDeletedEventId(eventId: string): void {
  try {
    const deletedIds = getDeletedEventIds();
    if (!deletedIds.includes(eventId)) {
      deletedIds.push(eventId);
      localStorage.setItem(DELETED_EVENTS_STORAGE_KEY, JSON.stringify(deletedIds));
    }
  } catch (err) {
    console.error("Failed to persist deleted event ID:", err);
  }
}

/**
 * Initializes and fetches all stored events from canonical eventflow_events collection.
 * Merges default SAMPLE_EVENTS seamlessly so attendee discovery, organizer views,
 * and operator modules share the exact same event registry.
 * Strictly respects the deleted events blacklist.
 */
export function getAllStoredEvents(): (AppEvent & { organizerId?: string; visibility?: EventVisibility })[] {
  const deletedIds = getDeletedEventIds();

  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) {
      // Seed initial sample events (excluding any that were previously deleted)
      const initial: (AppEvent & { organizerId: string; visibility: EventVisibility })[] = SAMPLE_EVENTS.filter(
        (evt) => !deletedIds.includes(evt.id)
      ).map((evt) => ({
        ...evt,
        organizerId: DEMO_ORGANIZER_ID,
        visibility: "PUBLISHED" as EventVisibility,
        image: resolveEventBanner(evt.category, evt.name, evt.venue, evt.image),
      }));

      try {
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(initial));
      } catch (err) {
        console.error("Failed to seed initial events:", err);
      }
      return initial;
    }

    const parsed: (AppEvent & { organizerId?: string; visibility?: EventVisibility })[] = JSON.parse(raw);
    let hasUpdates = false;

    // Filter out any events that exist in the deleted blacklist
    const activeEvents = parsed.filter((e) => !deletedIds.includes(e.id));
    if (activeEvents.length !== parsed.length) {
      hasUpdates = true;
    }

    // Ensure non-deleted demo events exist in the storage
    SAMPLE_EVENTS.forEach((demoEvt) => {
      if (deletedIds.includes(demoEvt.id)) return;

      const existing = activeEvents.find((e) => e.id === demoEvt.id);
      if (!existing) {
        activeEvents.push({
          ...demoEvt,
          organizerId: DEMO_ORGANIZER_ID,
          visibility: "PUBLISHED",
          image: resolveEventBanner(demoEvt.category, demoEvt.name, demoEvt.venue, demoEvt.image),
        });
        hasUpdates = true;
      } else {
        // Ensure demo events have a valid visibility
        if (!existing.visibility) {
          existing.visibility = "PUBLISHED";
          hasUpdates = true;
        }
      }
    });

    if (hasUpdates) {
      try {
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(activeEvents));
      } catch {}
    }

    return activeEvents;
  } catch (err) {
    console.error("Error loading events from storage:", err);
    return SAMPLE_EVENTS.filter((evt) => !deletedIds.includes(evt.id)).map((evt) => ({
      ...evt,
      organizerId: DEMO_ORGANIZER_ID,
      visibility: "PUBLISHED" as EventVisibility,
      image: resolveEventBanner(evt.category, evt.name, evt.venue, evt.image),
    }));
  }
}

/**
 * Returns only PUBLISHED events for Attendee Event Discovery.
 * DRAFT or UNPUBLISHED events are hidden from attendees.
 */
export function getAllPublishedEvents(): (AppEvent & { organizerId?: string; visibility?: EventVisibility })[] {
  const allEvents = getAllStoredEvents();
  return allEvents.filter((e) => !e.visibility || e.visibility === "PUBLISHED");
}

/**
 * Returns events owned by the specified organizerId.
 * Demo organizer (usr_demo_organizer) has access to demo events + created events.
 * Custom organizers have access to their created events.
 * Organizers see all their events (DRAFT, PUBLISHED, and UNPUBLISHED).
 */
export function getOrganizerEvents(
  organizerId: string
): (AppEvent & { organizerId?: string; visibility?: EventVisibility })[] {
  if (!organizerId) return [];
  const allEvents = getAllStoredEvents();

  // If demo organizer, return all demo events assigned to demo organizer or unassigned
  if (organizerId === DEMO_ORGANIZER_ID) {
    return allEvents.filter(
      (e) => !e.organizerId || e.organizerId === DEMO_ORGANIZER_ID
    );
  }

  // For a newly registered organizer, filter by their specific organizerId
  const ownedEvents = allEvents.filter((e) => e.organizerId === organizerId);
  return ownedEvents;
}

/**
 * Retrieves a single canonical event by its unique ID.
 */
export function getStoredEventById(
  eventId: string
): (AppEvent & { organizerId?: string; visibility?: EventVisibility }) | undefined {
  if (!eventId) return undefined;
  const deletedIds = getDeletedEventIds();
  if (deletedIds.includes(eventId)) return undefined;

  const allEvents = getAllStoredEvents();
  return allEvents.find((e) => e.id === eventId);
}

/**
 * Saves or updates an event in eventflow_events.
 * Automatically resolves a visually relevant banner if missing or generic.
 * Defaults visibility to PUBLISHED unless explicitly marked DRAFT or UNPUBLISHED.
 */
export function saveStoredEvent(
  eventData: AppEvent & { organizerId?: string; visibility?: EventVisibility },
  organizerId: string
): AppEvent & { organizerId: string; visibility: EventVisibility } {
  const allEvents = getAllStoredEvents();
  const normalizedOrganizerId = organizerId || DEMO_ORGANIZER_ID;

  // Resolve contextual image
  const resolvedImage = resolveEventBanner(
    eventData.category,
    eventData.name,
    eventData.venue,
    eventData.image
  );

  const eventWithOrganizer: AppEvent & { organizerId: string; visibility: EventVisibility } = {
    ...eventData,
    image: resolvedImage,
    organizerId: eventData.organizerId || normalizedOrganizerId,
    visibility: eventData.visibility || "PUBLISHED",
  };

  const existingIndex = allEvents.findIndex((e) => e.id === eventWithOrganizer.id);

  if (existingIndex >= 0) {
    allEvents[existingIndex] = eventWithOrganizer;
  } else {
    allEvents.unshift(eventWithOrganizer);
  }

  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(allEvents));
  } catch (err) {
    console.error("Failed to write event to storage:", err);
  }

  return eventWithOrganizer;
}

/**
 * Updates an event's visibility status directly.
 */
export function setEventVisibility(eventId: string, visibility: EventVisibility): boolean {
  const allEvents = getAllStoredEvents();
  const target = allEvents.find((e) => e.id === eventId);
  if (!target) return false;

  target.visibility = visibility;
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(allEvents));
    return true;
  } catch (err) {
    console.error("Failed to update event visibility:", err);
    return false;
  }
}

/**
 * Publishes an event making it live for attendees.
 */
export function publishEvent(eventId: string): boolean {
  return setEventVisibility(eventId, "PUBLISHED");
}

/**
 * Unpublishes an event without deleting it.
 */
export function unpublishEvent(eventId: string): boolean {
  return setEventVisibility(eventId, "UNPUBLISHED");
}

/**
 * Deletes an event completely and cascades removal across:
 * 1. Attendee Event Discovery (`eventflow_events`)
 * 2. Operational Live State, Gates, Alerts, and Hospitality Hubs (`operationalStateService`)
 * 3. Attendee Bookings & Digital Tickets (`bookingService`)
 * 4. Deleted blacklist registry (`eventflow_deleted_event_ids`)
 */
export function deleteStoredEvent(eventId: string): boolean {
  if (!eventId) return false;

  // 1. Record in deleted events blacklist
  recordDeletedEventId(eventId);

  // 2. Remove from active events list
  const allEvents = getAllStoredEvents();
  const filtered = allEvents.filter((e) => e.id !== eventId);

  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error("Failed to update events in storage during deletion:", err);
  }

  // 3. Cascade delete operational state, hospitality, parking, gates, and alerts
  deleteEventLiveState(eventId);

  // 4. Cascade delete associated attendee bookings and tickets
  deleteEventBookingsAndTickets(eventId);

  // 5. Broadcast deletion event so any active component listeners update in real time
  try {
    window.dispatchEvent(new CustomEvent("eventflow_event_deleted", { detail: { eventId } }));
    window.dispatchEvent(new Event("storage"));
  } catch (err) {
    console.error("Error dispatching delete event:", err);
  }

  return true;
}

/**
 * Alias for deleteStoredEvent
 */
export const deleteStoredEventCascading = deleteStoredEvent;

