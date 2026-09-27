import React from "react";
import { EventFlowTicket } from "../../types/booking";
import { SAMPLE_EVENTS } from "../../data/eventsData";
import { SportsTicketCard } from "./SportsTicketCard";
import { ConcertTicketCard } from "./ConcertTicketCard";
import { ConferenceTicketCard } from "./ConferenceTicketCard";
import { FestivalTicketCard } from "./FestivalTicketCard";
import { EventFlowDigitalTicket } from "./EventFlowDigitalTicket";

interface CategoryTicketRendererProps {
  ticket: EventFlowTicket;
  eventCategory?: string;
  showActions?: boolean;
}

export const CategoryTicketRenderer: React.FC<CategoryTicketRendererProps> = ({
  ticket,
  eventCategory,
  showActions = true,
}) => {
  // Resolve category from prop or look up event in SAMPLE_EVENTS
  let category = (eventCategory || "").toLowerCase();
  if (!category && ticket.eventId) {
    const matchedEvent = SAMPLE_EVENTS.find((e) => e.id === ticket.eventId);
    if (matchedEvent) {
      category = (matchedEvent.category || "").toLowerCase();
    }
  }

  // Also check ticket name or ticketType if still undefined
  const eventName = (ticket.eventName || "").toLowerCase();
  const ticketType = (ticket.ticketType || "").toLowerCase();

  if (
    category.includes("sport") ||
    category.includes("cricket") ||
    category.includes("football") ||
    eventName.includes("cricket") ||
    eventName.includes("wankhede") ||
    eventName.includes("ipl")
  ) {
    return <SportsTicketCard ticket={ticket} showActions={showActions} />;
  }

  if (
    category.includes("concert") ||
    category.includes("music") ||
    eventName.includes("music") ||
    eventName.includes("concert") ||
    eventName.includes("coldplay") ||
    ticketType.includes("pitch") ||
    ticketType.includes("standing")
  ) {
    return <ConcertTicketCard ticket={ticket} showActions={showActions} />;
  }

  if (
    category.includes("conference") ||
    category.includes("tech") ||
    category.includes("ai") ||
    eventName.includes("expo") ||
    eventName.includes("summit") ||
    ticketType.includes("delegate")
  ) {
    return <ConferenceTicketCard ticket={ticket} showActions={showActions} />;
  }

  if (
    category.includes("festival") ||
    category.includes("gathering") ||
    category.includes("large") ||
    eventName.includes("festival")
  ) {
    return <FestivalTicketCard ticket={ticket} showActions={showActions} />;
  }

  // Default fallback
  return <EventFlowDigitalTicket ticket={ticket} showActions={showActions} />;
};
