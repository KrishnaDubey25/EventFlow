import { Booking, EventFlowTicket, TicketTypeInfo } from "../types/booking";
import { DEFAULT_TICKET_TYPES } from "../data/ticketInventoryData";
import { AppEvent } from "../types/event";

const BOOKINGS_STORAGE_KEY = "eventflow_bookings";
const TICKETS_STORAGE_KEY = "eventflow_tickets";

export const INITIAL_DEMO_BOOKINGS: Booking[] = [
  // 1. Mumbai Tech & AI Expo 2026 (Tomorrow - Event Day Mode)
  {
    bookingId: "BK-EXP-2026-AR01",
    userId: "usr_demo_attendee",
    eventId: "mumbai-tech-ai-expo-2026",
    eventName: "Mumbai Tech & AI Expo 2026",
    venue: "Jio World Convention Centre, Mumbai",
    eventDate: "Tomorrow",
    eventTime: "09:30 - 18:30 IST",
    attendeeName: "Alex Rivera",
    attendeeEmail: "alex.attendee@eventflow.live",
    attendeeMobile: "+1 (555) 234-8901",
    ticketType: "VIP Executive Delegate Pass",
    ticketTypeId: "vip",
    quantity: 1,
    price: 3200,
    platformFee: 120,
    totalPrice: 3320,
    section: "Convention Hall A — Keynote Pavilion",
    seats: ["Row 4 — Seat 18"],
    seatLabel: "Keynote Pavilion — Row 4, Seat 18",
    assignedGate: "Gate 1 (BKC Grand Ingress)",
    entryWindow: "08:30 - 09:30 IST",
    bookingDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    status: "CONFIRMED",
    ticketIds: ["EF-2026-EXP-AR01"],
    paymentMethod: "UPI",
    paymentStatus: "PAID",
    transactionId: "TXN-EXP-889104",
    paymentTimestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  // 2. Mumbai Music Festival 2026 (Few Days Later - Concert)
  {
    bookingId: "BK-MMF-2026-AR02",
    userId: "usr_demo_attendee",
    eventId: "mumbai-music-fest-2026",
    eventName: "Mumbai Music Festival 2026",
    venue: "NESCO Centre, Mumbai",
    eventDate: "In 4 Days",
    eventTime: "16:00 - 23:30 IST",
    attendeeName: "Alex Rivera",
    attendeeEmail: "alex.attendee@eventflow.live",
    attendeeMobile: "+1 (555) 234-8901",
    ticketType: "Golden Circle Pitch Standing Pass",
    ticketTypeId: "general",
    quantity: 1,
    price: 2499,
    platformFee: 99,
    totalPrice: 2598,
    section: "Main Soundstage Pitch",
    seats: ["Standing Zone GA-12"],
    seatLabel: "Golden Circle Pitch — Standing",
    assignedGate: "Gate 1 (Western Express Turnstiles)",
    entryWindow: "16:00 - 17:30 IST",
    bookingDate: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    status: "CONFIRMED",
    ticketIds: ["EF-2026-MMF-AR02"],
    paymentMethod: "Card",
    paymentStatus: "PAID",
    transactionId: "TXN-MMF-902143",
    paymentTimestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
  // 3. Mumbai Cricket Night — Wankhede (Sports Ticket)
  {
    bookingId: "BK-WANK-2026-AR03",
    userId: "usr_demo_attendee",
    eventId: "mumbai-cricket-wankhede-2026",
    eventName: "Mumbai Cricket Night — Wankhede",
    venue: "Wankhede Stadium, Mumbai",
    eventDate: "In 8 Days",
    eventTime: "17:00 - 23:30 IST",
    attendeeName: "Alex Rivera",
    attendeeEmail: "alex.attendee@eventflow.live",
    attendeeMobile: "+1 (555) 234-8901",
    ticketType: "Garware Pavilion Club Pass",
    ticketTypeId: "premium",
    quantity: 1,
    price: 3500,
    platformFee: 150,
    totalPrice: 3650,
    section: "Garware Pavilion Level 2",
    seats: ["G2-Row-8-Seat-22"],
    seatLabel: "Garware Pavilion Level 2 — Row 8, Seat 22",
    assignedGate: "Gate 4 (Turnstiles 20-28)",
    entryWindow: "16:30 - 18:30 IST",
    bookingDate: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    status: "CONFIRMED",
    ticketIds: ["EF-2026-WANK-AR03"],
    paymentMethod: "UPI",
    paymentStatus: "PAID",
    transactionId: "TXN-WANK-392019",
    paymentTimestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
  },
  // 4. India Innovation & Technology Summit 2026 (Large Gathering)
  {
    bookingId: "BK-BIEC-2026-AR04",
    userId: "usr_demo_attendee",
    eventId: "india-innovation-summit-2026",
    eventName: "India Innovation & Technology Summit 2026",
    venue: "Bengaluru International Exhibition Centre, Bengaluru",
    eventDate: "In 45 Days",
    eventTime: "09:00 - 18:30 IST",
    attendeeName: "Alex Rivera",
    attendeeEmail: "alex.attendee@eventflow.live",
    attendeeMobile: "+1 (555) 234-8901",
    ticketType: "All-Access Delegate Badge",
    ticketTypeId: "vip",
    quantity: 1,
    price: 4900,
    platformFee: 180,
    totalPrice: 5080,
    section: "Hall 1 — Sovereign AI & Quantum Pavilion",
    seats: ["Zone A — Fast Track"],
    seatLabel: "Hall 1 — Zone A Fast Track",
    assignedGate: "Gate 1 (Tumkur Highway Main Gate)",
    entryWindow: "08:30 - 10:00 IST",
    bookingDate: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    status: "CONFIRMED",
    ticketIds: ["EF-2026-BIEC-AR04"],
    paymentMethod: "NetBanking",
    paymentStatus: "PAID",
    transactionId: "TXN-BIEC-401928",
    paymentTimestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_DEMO_TICKETS: EventFlowTicket[] = [
  // 1. Mumbai Tech & AI Expo 2026 (Conference Pass)
  {
    ticketId: "EF-2026-EXP-AR01",
    bookingId: "BK-EXP-2026-AR01",
    userId: "usr_demo_attendee",
    eventId: "mumbai-tech-ai-expo-2026",
    eventName: "Mumbai Tech & AI Expo 2026",
    venue: "Jio World Convention Centre, Mumbai",
    eventDate: "Tomorrow",
    eventTime: "09:30 - 18:30 IST",
    attendeeName: "Alex Rivera",
    attendeeEmail: "alex.attendee@eventflow.live",
    attendeeMobile: "+1 (555) 234-8901",
    ticketType: "VIP Executive Delegate Pass",
    section: "Convention Hall A — Keynote Pavilion",
    seat: "Row 4, Seat 18",
    assignedGate: "Gate 1 (BKC Grand Ingress)",
    entryWindow: "08:30 - 09:30 IST",
    qrToken: "EVENTFLOW::TKT::EF-2026-EXP-AR01::mumbai-tech-ai-expo-2026::usr_demo_attendee::08:30-09:30-IST",
    status: "CONFIRMED",
    price: 3200,
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  // 2. Mumbai Music Festival 2026 (Concert Ticket)
  {
    ticketId: "EF-2026-MMF-AR02",
    bookingId: "BK-MMF-2026-AR02",
    userId: "usr_demo_attendee",
    eventId: "mumbai-music-fest-2026",
    eventName: "Mumbai Music Festival 2026",
    venue: "NESCO Centre, Mumbai",
    eventDate: "In 4 Days",
    eventTime: "16:00 - 23:30 IST",
    attendeeName: "Alex Rivera",
    attendeeEmail: "alex.attendee@eventflow.live",
    attendeeMobile: "+1 (555) 234-8901",
    ticketType: "Golden Circle Pitch Standing Pass",
    section: "Main Soundstage Pitch",
    seat: "Standing Zone GA-12",
    assignedGate: "Gate 1 (Western Express Turnstiles)",
    entryWindow: "16:00 - 17:30 IST",
    qrToken: "EVENTFLOW::TKT::EF-2026-MMF-AR02::mumbai-music-fest-2026::usr_demo_attendee::16:00-17:30-IST",
    status: "CONFIRMED",
    price: 2499,
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
  // 3. Mumbai Cricket Night — Wankhede (Sports Ticket)
  {
    ticketId: "EF-2026-WANK-AR03",
    bookingId: "BK-WANK-2026-AR03",
    userId: "usr_demo_attendee",
    eventId: "mumbai-cricket-wankhede-2026",
    eventName: "Mumbai Cricket Night — Wankhede",
    venue: "Wankhede Stadium, Mumbai",
    eventDate: "In 8 Days",
    eventTime: "17:00 - 23:30 IST",
    attendeeName: "Alex Rivera",
    attendeeEmail: "alex.attendee@eventflow.live",
    attendeeMobile: "+1 (555) 234-8901",
    ticketType: "Garware Pavilion Club Pass",
    section: "Garware Pavilion Level 2",
    seat: "Row 8, Seat 22",
    assignedGate: "Gate 4 (Turnstiles 20-28)",
    entryWindow: "16:30 - 18:30 IST",
    qrToken: "EVENTFLOW::TKT::EF-2026-WANK-AR03::mumbai-cricket-wankhede-2026::usr_demo_attendee::16:30-18:30-IST",
    status: "CONFIRMED",
    price: 3500,
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
  },
  // 4. India Innovation & Technology Summit 2026 (Festival / Large Gathering Pass)
  {
    ticketId: "EF-2026-BIEC-AR04",
    bookingId: "BK-BIEC-2026-AR04",
    userId: "usr_demo_attendee",
    eventId: "india-innovation-summit-2026",
    eventName: "India Innovation & Technology Summit 2026",
    venue: "Bengaluru International Exhibition Centre, Bengaluru",
    eventDate: "In 45 Days",
    eventTime: "09:00 - 18:30 IST",
    attendeeName: "Alex Rivera",
    attendeeEmail: "alex.attendee@eventflow.live",
    attendeeMobile: "+1 (555) 234-8901",
    ticketType: "All-Access Delegate Badge",
    section: "Hall 1 — Sovereign AI & Quantum Pavilion",
    seat: "Zone A Fast Track",
    assignedGate: "Gate 1 (Tumkur Highway Main Gate)",
    entryWindow: "08:30 - 10:00 IST",
    qrToken: "EVENTFLOW::TKT::EF-2026-BIEC-AR04::india-innovation-summit-2026::usr_demo_attendee::08:30-10:00-IST",
    status: "CONFIRMED",
    price: 4900,
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_DEMO_BOOKING: Booking = INITIAL_DEMO_BOOKINGS[0];
export const INITIAL_DEMO_TICKET: EventFlowTicket = INITIAL_DEMO_TICKETS[0];

export function getAllBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!raw) {
      const initial = INITIAL_DEMO_BOOKINGS;
      try {
        localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(initial));
      } catch {}
      return initial;
    }
    const parsed: Booking[] = JSON.parse(raw);
    // Safely ensure demo bookings for Alex Rivera are present without overwriting any custom bookings
    let updated = false;
    for (const demoBooking of INITIAL_DEMO_BOOKINGS) {
      if (!parsed.some((b) => b.bookingId === demoBooking.bookingId)) {
        parsed.push(demoBooking);
        updated = true;
      }
    }
    if (updated) {
      try {
        localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(parsed));
      } catch {}
    }
    return parsed;
  } catch (err) {
    console.error("Error reading bookings from localStorage:", err);
    return INITIAL_DEMO_BOOKINGS;
  }
}

export function getAllTickets(): EventFlowTicket[] {
  try {
    const raw = localStorage.getItem(TICKETS_STORAGE_KEY);
    if (!raw) {
      const initial = INITIAL_DEMO_TICKETS;
      try {
        localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(initial));
      } catch {}
      return initial;
    }
    const parsed: EventFlowTicket[] = JSON.parse(raw);
    // Safely ensure demo tickets for Alex Rivera are present without overwriting any custom tickets
    let updated = false;
    for (const demoTicket of INITIAL_DEMO_TICKETS) {
      if (!parsed.some((t) => t.ticketId === demoTicket.ticketId)) {
        parsed.push(demoTicket);
        updated = true;
      }
    }
    if (updated) {
      try {
        localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(parsed));
      } catch {}
    }
    return parsed;
  } catch (err) {
    console.error("Error reading tickets from localStorage:", err);
    return INITIAL_DEMO_TICKETS;
  }
}

export function getUserBookings(userId: string): Booking[] {
  if (!userId) return [];
  const all = getAllBookings();
  return all.filter((b) => b.userId === userId);
}

export function getUserTickets(userId: string): EventFlowTicket[] {
  if (!userId) return [];
  const all = getAllTickets();
  return all.filter((t) => t.userId === userId);
}

export function getBookedSeatsForEvent(eventId: string): string[] {
  if (!eventId) return [];
  const all = getAllBookings();
  const eventBookings = all.filter((b) => b.eventId === eventId);
  const bookedSeats: string[] = [];
  eventBookings.forEach((b) => {
    if (Array.isArray(b.seats)) {
      b.seats.forEach((seat) => {
        if (seat && !seat.startsWith("Unreserved") && !seat.startsWith("GA")) {
          bookedSeats.push(seat);
        }
      });
    }
  });
  return bookedSeats;
}

export function getTicketTypesForEvent(event: AppEvent): TicketTypeInfo[] {
  const allBookings = getAllBookings();
  const eventBookings = allBookings.filter((b) => b.eventId === event.id);

  // Compute sold quantity per ticket type
  const soldMap: Record<string, number> = {};
  eventBookings.forEach((b) => {
    const typeId = b.ticketTypeId || "ga";
    soldMap[typeId] = (soldMap[typeId] || 0) + (b.quantity || 1);
  });

  return DEFAULT_TICKET_TYPES.map((base) => {
    const sold = soldMap[base.id] || 0;
    const available = Math.max(0, base.totalQuantity - sold);

    // Dynamic gate customization based on event's real gates if available
    let allowedGates = base.allowedGates;
    if (event.gates && event.gates.length > 0) {
      if (base.id === "vip") {
        allowedGates = [event.gates[0]?.name || "Gate 1 (VIP)"];
      } else if (base.id === "premium") {
        allowedGates = event.gates.slice(0, 2).map((g) => g.name);
      } else {
        allowedGates = event.gates.slice(1).map((g) => g.name);
      }
    }

    return {
      ...base,
      availableQuantity: available,
      allowedGates,
    };
  });
}

function generateRandomAlphaNum(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // excludes ambiguous 0, O, 1, I
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate Ticket ID in requested format: e.g. EF-2026-XXXX
export function generateTicketId(): string {
  const code = generateRandomAlphaNum(5);
  return `EF-2026-${code}`;
}

export interface CreateBookingParams {
  userId: string;
  eventId: string;
  eventName: string;
  venue: string;
  eventDate: string;
  eventTime: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeeMobile?: string;
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  unitPrice: number;
  platformFee: number;
  section: string;
  seats: string[];
  assignedGate: string;
  entryWindow: string;
  paymentMethod?: string;
  paymentStatus?: "PAID" | "PENDING";
  transactionId?: string;
  paymentTimestamp?: string;
}

export function createBooking(params: CreateBookingParams): {
  booking: Booking;
  tickets: EventFlowTicket[];
} {
  const existingBookings = getAllBookings();
  const existingTickets = getAllTickets();

  const bookingId = `BK-${Date.now().toString(36).toUpperCase()}-${generateRandomAlphaNum(4)}`;
  const bookingDate = new Date().toISOString();
  const totalPrice = params.unitPrice * params.quantity + params.platformFee;

  const generatedTickets: EventFlowTicket[] = [];
  const ticketIds: string[] = [];

  for (let i = 0; i < params.quantity; i++) {
    const ticketId = generateTicketId();
    ticketIds.push(ticketId);

    const seat = params.seats[i] || (params.ticketTypeId === "ga" ? "GA Section - Standing" : `Seat ${i + 1}`);

    const qrToken = `EVENTFLOW::TKT::${ticketId}::${params.eventId}::${params.userId}::${params.entryWindow}`;

    const newTicket: EventFlowTicket = {
      ticketId,
      bookingId,
      userId: params.userId,
      eventId: params.eventId,
      eventName: params.eventName,
      venue: params.venue,
      eventDate: params.eventDate,
      eventTime: params.eventTime,
      attendeeName: params.attendeeName,
      attendeeEmail: params.attendeeEmail,
      attendeeMobile: params.attendeeMobile,
      ticketType: params.ticketTypeName,
      section: params.section,
      seat,
      assignedGate: params.assignedGate,
      entryWindow: params.entryWindow,
      qrToken,
      status: "CONFIRMED",
      price: params.unitPrice,
      createdAt: bookingDate,
    };

    generatedTickets.push(newTicket);
  }

  const seatLabel =
    params.seats.length > 0
      ? params.seats.join(", ")
      : params.ticketTypeId === "ga"
      ? "General Admission - Open Zone"
      : "Assigned Seating";

  const newBooking: Booking = {
    bookingId,
    userId: params.userId,
    eventId: params.eventId,
    eventName: params.eventName,
    venue: params.venue,
    eventDate: params.eventDate,
    eventTime: params.eventTime,
    attendeeName: params.attendeeName,
    attendeeEmail: params.attendeeEmail,
    attendeeMobile: params.attendeeMobile,
    ticketType: params.ticketTypeName,
    ticketTypeId: params.ticketTypeId,
    quantity: params.quantity,
    price: params.unitPrice,
    platformFee: params.platformFee,
    totalPrice,
    section: params.section,
    seats: params.seats.length > 0 ? params.seats : [seatLabel],
    seatLabel,
    assignedGate: params.assignedGate,
    entryWindow: params.entryWindow,
    bookingDate,
    status: "CONFIRMED",
    ticketIds,
    paymentMethod: params.paymentMethod || "UPI",
    paymentStatus: params.paymentStatus || "PAID",
    transactionId: params.transactionId || `TXN-${Date.now()}-${generateRandomAlphaNum(4)}`,
    paymentTimestamp: params.paymentTimestamp || bookingDate,
  };

  // Atomically update localStorage
  const updatedBookings = [newBooking, ...existingBookings];
  const updatedTickets = [...generatedTickets, ...existingTickets];

  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updatedBookings));
    localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(updatedTickets));
  } catch (err) {
    console.error("Failed to write booking to localStorage:", err);
  }

  return {
    booking: newBooking,
    tickets: generatedTickets,
  };
}

/**
 * Validates a ticket code or QR token string.
 */
export function validateTicket(ticketCodeOrToken: string): {
  valid: boolean;
  ticket?: EventFlowTicket;
  message: string;
} {
  if (!ticketCodeOrToken || !ticketCodeOrToken.trim()) {
    return { valid: false, message: "Please enter or scan a valid ticket ID or QR code token." };
  }

  const raw = ticketCodeOrToken.trim();
  const allTickets = getAllTickets();

  // Search by ticketId, qrToken, or substring
  const matched = allTickets.find(
    (t) =>
      t.ticketId.toUpperCase() === raw.toUpperCase() ||
      t.qrToken === raw ||
      (raw.includes("::") && t.qrToken.includes(raw.split("::")[2] || "")) ||
      (t.ticketId.toLowerCase().includes(raw.toLowerCase()) && raw.length >= 6)
  );

  if (!matched) {
    return {
      valid: false,
      message: "Ticket not found. This code does not match any registered pass in EventFlow.",
    };
  }

  if ((matched as any).status === "CANCELLED") {
    return {
      valid: false,
      ticket: matched,
      message: "Invalid Pass: This booking has been cancelled.",
    };
  }

  if ((matched as any).checkedIn) {
    return {
      valid: false,
      ticket: matched,
      message: `Already Used: This pass was scanned and checked in at ${(matched as any).checkedInAt || "earlier"}.`,
    };
  }

  return {
    valid: true,
    ticket: matched,
    message: "Valid Pass — Admission Approved.",
  };
}

/**
 * Performs ticket check-in and records check-in status and gate.
 */
export function checkInTicket(
  ticketId: string,
  gateName: string = "Gate 1",
  operatorName: string = "Field Staff"
): {
  success: boolean;
  ticket?: EventFlowTicket;
  message: string;
} {
  const allTickets = getAllTickets();
  const index = allTickets.findIndex((t) => t.ticketId.toUpperCase() === ticketId.toUpperCase());

  if (index === -1) {
    return { success: false, message: "Ticket ID not found." };
  }

  const target = allTickets[index];
  if ((target as any).checkedIn) {
    return {
      success: false,
      ticket: target,
      message: `Ticket already checked in at ${(target as any).checkedInAt}.`,
    };
  }

  const checkInTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const updatedTicket: EventFlowTicket = {
    ...target,
    status: "CONFIRMED",
    ...({
      checkedIn: true,
      checkedInAt: checkInTimestamp,
      checkedInGate: gateName,
      checkedInBy: operatorName,
    } as any),
  };

  allTickets[index] = updatedTicket;

  try {
    localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(allTickets));
  } catch (err) {
    console.error("Failed to save check-in state:", err);
  }

  return {
    success: true,
    ticket: updatedTicket,
    message: `Pass checked in successfully at ${gateName} (${checkInTimestamp}). Welcome!`,
  };
}

/**
 * Permanently removes all bookings and tickets associated with a deleted event.
 */
export function deleteEventBookingsAndTickets(eventId: string): {
  deletedBookingsCount: number;
  deletedTicketsCount: number;
} {
  if (!eventId) return { deletedBookingsCount: 0, deletedTicketsCount: 0 };

  const allBookings = getAllBookings();
  const allTickets = getAllTickets();

  const remainingBookings = allBookings.filter((b) => b.eventId !== eventId);
  const remainingTickets = allTickets.filter((t) => t.eventId !== eventId);

  const deletedBookingsCount = allBookings.length - remainingBookings.length;
  const deletedTicketsCount = allTickets.length - remainingTickets.length;

  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(remainingBookings));
    localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(remainingTickets));
  } catch (err) {
    console.error("Failed to update bookings storage during event deletion:", err);
  }

  return {
    deletedBookingsCount,
    deletedTicketsCount,
  };
}


