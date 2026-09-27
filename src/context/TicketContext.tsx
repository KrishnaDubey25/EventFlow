import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { useEventSelection } from "./EventContext";
import { EventFlowTicket, Booking } from "../types/booking";
import { getUserTickets, getUserBookings } from "../services/bookingService";

interface TicketContextType {
  userTickets: EventFlowTicket[];
  userBookings: Booking[];
  activeTicket: EventFlowTicket | null;
  hasTickets: boolean;
  refreshTickets: () => void;
  // Compatibility with existing code
  verifiedTicket: EventFlowTicket | null;
  isTicketVerified: boolean;
  saveVerifiedTicket: (ticket: EventFlowTicket) => void;
  clearVerifiedTicket: () => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { selectedEventId } = useEventSelection();

  const [userTickets, setUserTickets] = useState<EventFlowTicket[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);

  const refreshTickets = useCallback(() => {
    if (!user) {
      setUserTickets([]);
      setUserBookings([]);
      return;
    }
    const tickets = getUserTickets(user.id);
    const bookings = getUserBookings(user.id);
    setUserTickets(tickets);
    setUserBookings(bookings);
  }, [user]);

  // Keep tickets and bookings synced with current logged-in user
  useEffect(() => {
    refreshTickets();
  }, [user, refreshTickets]);

  // Active ticket for currently selected event or latest booked ticket
  const activeTicket = React.useMemo(() => {
    if (userTickets.length === 0) return null;
    if (selectedEventId) {
      const match = userTickets.find((t) => t.eventId === selectedEventId);
      if (match) return match;
    }
    return userTickets[0] || null;
  }, [userTickets, selectedEventId]);

  const saveVerifiedTicket = (_ticket: EventFlowTicket) => {
    refreshTickets();
  };

  const clearVerifiedTicket = () => {
    // No-op for verified ticket since tickets are now real bookings
    refreshTickets();
  };

  return (
    <TicketContext.Provider
      value={{
        userTickets,
        userBookings,
        activeTicket,
        hasTickets: userTickets.length > 0,
        refreshTickets,
        verifiedTicket: activeTicket,
        isTicketVerified: Boolean(activeTicket),
        saveVerifiedTicket,
        clearVerifiedTicket,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTicket = (): TicketContextType => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error("useTicket must be used within a TicketProvider");
  }
  return context;
};
