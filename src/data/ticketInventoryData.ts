import { TicketTypeInfo } from "../types/booking";

export const DEFAULT_TICKET_TYPES: Omit<TicketTypeInfo, "availableQuantity">[] = [
  {
    id: "ga",
    name: "General Admission",
    price: 999,
    totalQuantity: 2450,
    description: "Standard grandstand / unreserved floor entry with open movement across fan promenades.",
    section: "North & South General Stands",
    allowedGates: ["Gate 4", "Gate 5", "Gate 6"],
    entryWindow: "15:00 - 18:30",
  },
  {
    id: "premium",
    name: "Premium",
    price: 1999,
    totalQuantity: 720,
    description: "Reserved elevated tier seating with fast-track security lanes and dedicated concourse bars.",
    section: "Lower Tier West Club",
    allowedGates: ["Gate 2", "Gate 3"],
    entryWindow: "14:30 - 19:00",
  },
  {
    id: "vip",
    name: "VIP",
    price: 4999,
    totalQuantity: 120,
    description: "Prime central stage/pitch view, hospitality suite access, complimentary dining & direct express gate.",
    section: "Level 2 Platinum Lounge",
    allowedGates: ["Gate 1 (VIP FastTrack)"],
    entryWindow: "14:00 - 19:30 (Anytime Express)",
  },
];
