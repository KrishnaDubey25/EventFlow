export interface TicketTypeInfo {
  id: string; // 'ga' | 'premium' | 'vip'
  name: string; // 'General Admission' | 'Premium' | 'VIP'
  price: number;
  totalQuantity: number;
  availableQuantity: number;
  description: string;
  section: string;
  allowedGates: string[];
  entryWindow: string;
}

export interface Booking {
  bookingId: string;
  userId: string;
  eventId: string;
  eventName: string;
  venue: string;
  eventDate: string;
  eventTime: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeeMobile?: string;
  ticketType: string;
  ticketTypeId: string;
  quantity: number;
  price: number;
  platformFee: number;
  totalPrice: number;
  section: string;
  seats: string[];
  seatLabel: string;
  assignedGate: string;
  entryWindow: string;
  bookingDate: string;
  status: "CONFIRMED";
  ticketIds: string[];
  paymentMethod?: string;
  paymentStatus?: "PAID" | "PENDING";
  transactionId?: string;
  paymentTimestamp?: string;
}

export interface EventFlowTicket {
  ticketId: string; // e.g. EF-BG26-X7K92P
  bookingId: string;
  userId: string;
  eventId: string;
  eventName: string;
  venue: string;
  eventDate: string;
  eventTime: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeeMobile?: string;
  ticketType: string;
  section: string;
  seat: string;
  assignedGate: string;
  entryWindow: string;
  qrToken: string;
  status: "CONFIRMED";
  price: number;
  createdAt: string;
}

export interface AttendeeJourneyContext {
  attendeeId: string;
  userId: string;
  eventId: string;
  ticketId?: string;
  ticketZone?: string;
  origin?: string;
  preferredTravelMode?: "metro" | "cab" | "shuttle" | "drive_park" | "walk";
  selectedParking?: string; // Resource ID e.g. "park-p1"
  selectedParkingName?: string;
  selectedTransport?: string; // Resource ID e.g. "trans-s1"
  selectedTransportName?: string;
  selectedHospitality?: string; // Resource ID e.g. "hosp-rest-1"
  selectedHospitalityName?: string;
  selectedAccommodation?: string; // Resource ID e.g. "accom-1"
  selectedAccommodationName?: string;
  arrivalPreference?: "early" | "standard" | "just_in_time";
  customDepartureTime?: string;
  updatedAt?: string;
}
