import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { AppEvent, EventVisibility } from "../types/event";
import { getAllStoredEvents, getAllPublishedEvents } from "../services/eventStorageService";

interface EventContextType {
  events: (AppEvent & { organizerId?: string; visibility?: EventVisibility })[];
  allEvents: (AppEvent & { organizerId?: string; visibility?: EventVisibility })[];
  publishedEvents: (AppEvent & { organizerId?: string; visibility?: EventVisibility })[];
  selectedEventId: string | null;
  selectedEvent: (AppEvent & { organizerId?: string; visibility?: EventVisibility }) | null;
  selectEvent: (eventIdOrEvent: string | AppEvent) => void;
  clearSelectedEvent: () => void;
  getEventById: (id: string) => (AppEvent & { organizerId?: string; visibility?: EventVisibility }) | undefined;
  isEventSelected: (id: string) => boolean;
  refreshEvents: () => void;
}

const STORAGE_KEY = "eventflow_selected_event_id";

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allEvents, setAllEvents] = useState<(AppEvent & { organizerId?: string; visibility?: EventVisibility })[]>(
    () => getAllStoredEvents()
  );
  const [selectedEventId, setSelectedEventId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const refreshEvents = useCallback(() => {
    const loaded = getAllStoredEvents();
    setAllEvents(loaded);
  }, []);

  useEffect(() => {
    // Listen for storage events across tabs or local updates
    const handleStorageChange = () => {
      refreshEvents();
    };

    const handleEventDeleted = (e: Event) => {
      const customEvt = e as CustomEvent<{ eventId: string }>;
      const deletedId = customEvt.detail?.eventId;
      refreshEvents();
      if (deletedId && selectedEventId === deletedId) {
        clearSelectedEvent();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("eventflow_event_deleted", handleEventDeleted);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("eventflow_event_deleted", handleEventDeleted);
    };
  }, [refreshEvents, selectedEventId]);

  const publishedEvents = useMemo(() => {
    return allEvents.filter((e) => !e.visibility || e.visibility === "PUBLISHED");
  }, [allEvents]);

  // Default 'events' provided to attendee discovery corresponds to published events
  const events = publishedEvents;

  const selectedEvent = allEvents.find((evt) => evt.id === selectedEventId) || null;

  const selectEvent = (eventIdOrEvent: string | AppEvent) => {
    const id = typeof eventIdOrEvent === "string" ? eventIdOrEvent : eventIdOrEvent.id;
    setSelectedEventId(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch (err) {
      console.error("Failed to save selected event:", err);
    }
  };

  const clearSelectedEvent = () => {
    setSelectedEventId(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Failed to clear selected event:", err);
    }
  };

  const getEventById = (id: string): (AppEvent & { organizerId?: string; visibility?: EventVisibility }) | undefined => {
    return allEvents.find((e) => e.id === id);
  };

  const isEventSelected = (id: string): boolean => {
    return selectedEventId === id;
  };

  return (
    <EventContext.Provider
      value={{
        events,
        allEvents,
        publishedEvents,
        selectedEventId,
        selectedEvent,
        selectEvent,
        clearSelectedEvent,
        getEventById,
        isEventSelected,
        refreshEvents,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEventSelection = (): EventContextType => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEventSelection must be used within an EventProvider");
  }
  return context;
};
