export interface Ticket {
  ticketId: string;
  eventId: string;
  eventName: string;
  venue?: string;
  attendeeName: string;
  attendeeEmail?: string;
  attendeePhone?: string;
  ticketType: string;
  section: string;
  seat: string;
  assignedGate: string;
  allowedAlternateGates: string[];
  entryWindow: string;
  accessLevel: string;
  accessibilityRequirements?: string;
  qrCode: string;
  ticketCode: string;
  purchaseDate?: string;
  price?: string;
  tier?: string;
  isRegistered?: boolean;
}

export interface ExtractedTicketInfo {
  eventName?: string | null;
  eventDate?: string | null;
  eventTime?: string | null;
  venue?: string | null;
  ticketId?: string | null;
  attendeeName?: string | null;
  ticketType?: string | null;
  section?: string | null;
  seat?: string | null;
  gate?: string | null;
  entryWindow?: string | null;
  qrPayload?: string | null;
}

export interface TicketInspectionResponse {
  isEventTicket: boolean;
  confidence: number;
  isBlurryOrUnclear: boolean;
  rejectionReason?: string | null;
  extractedFields: ExtractedTicketInfo;
  qrDetected: boolean;
  qrLegible: boolean;
}

export type VerificationErrorCode =
  | "NOT_A_TICKET"
  | "UNREADABLE_TICKET"
  | "WRONG_EVENT"
  | "INVALID_TICKET"
  | "ACCOUNT_MISMATCH"
  | "ALREADY_REGISTERED"
  | "QR_UNREADABLE"
  | "MISSING_INFO";

export type VerificationStage =
  | "IDLE"
  | "UPLOAD_SCAN"
  | "READING_TICKET"
  | "EXTRACTING_DETAILS"
  | "VALIDATING_EVENT"
  | "VALIDATING_TICKET"
  | "MATCHING_ATTENDEE"
  | "VERIFIED"
  | "FAILED";


export interface VerificationResult {
  success: boolean;
  ticket?: Ticket;
  extractedInfo?: ExtractedTicketInfo;
  errorMessage?: string;
  errorCode?: VerificationErrorCode;
  failedStage?: VerificationStage;
}

