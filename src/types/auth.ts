export type UserRole = "attendee" | "organizer" | "operator";

export type OperatorType =
  | "Accommodation"
  | "Transport"
  | "Parking"
  | "Food & Dining"
  | "Medical & Assistance"
  | "Venue Services"
  | "Other Services";

export const CANONICAL_OPERATOR_TYPES: OperatorType[] = [
  "Accommodation",
  "Transport",
  "Parking",
  "Food & Dining",
  "Medical & Assistance",
  "Venue Services",
  "Other Services",
];

export function normalizeOperatorType(rawType?: string | null): OperatorType {
  if (!rawType) return "Transport";
  const lower = rawType.toLowerCase().trim();
  if (lower.includes("accommodat") || lower.includes("hotel") || lower.includes("room")) {
    return "Accommodation";
  }
  if (lower.includes("transit") || lower.includes("transport") || lower.includes("shuttle") || lower.includes("fleet")) {
    return "Transport";
  }
  if (lower.includes("park")) {
    return "Parking";
  }
  if (lower.includes("food") || lower.includes("dining") || lower.includes("hospitality") || lower.includes("cater")) {
    return "Food & Dining";
  }
  if (lower.includes("medic") || lower.includes("health") || lower.includes("first aid") || lower.includes("paramedic") || lower.includes("assist")) {
    return "Medical & Assistance";
  }
  if (lower.includes("venue") || lower.includes("stage") || lower.includes("rigging") || lower.includes("sanitat")) {
    return "Venue Services";
  }
  return "Other Services";
}

export type AgeGroup =
  | "Under 18"
  | "18 - 24"
  | "25 - 34"
  | "35 - 49"
  | "50+";

export interface BaseUser {
  id: string;
  fullName: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  createdAt: string;
  initials: string;
  avatarColor: string;
}

export interface AttendeeUser extends BaseUser {
  role: "attendee";
  city: string;
  ageGroup: AgeGroup;
}

export interface OrganizerUser extends BaseUser {
  role: "organizer";
  organization: string;
  position: string;
  city: string;
}

export interface OperatorBusinessProfile {
  // Common Fields
  companyName?: string;
  contactPerson?: string;
  officialEmail?: string;
  mobileNumber?: string;
  operatingCity?: string;
  address?: string;
  serviceType?: OperatorType;
  status?: "ACTIVE" | "ON_CALL" | "STANDBY" | "OFF_DUTY";
  createdDate?: string;

  // Accommodation Fields
  propertyName?: string;
  propertyType?: string;
  totalRooms?: number;
  roomTypes?: string[];
  totalCapacity?: number;
  availableCapacity?: number;
  amenities?: string[];
  operatingHours?: string;

  // Transport Fields
  fleetSize?: number;
  vehicleTypes?: string[];
  totalSeats?: number;
  operatingArea?: string;
  availableVehicles?: number;

  // Parking Fields
  facilityName?: string;
  parkingType?: string;
  totalSlots?: number;
  availableSlots?: number;
  covered?: boolean;
  supportedVehicleTypes?: string[];

  // Food & Dining Fields
  outletName?: string;
  outletType?: string;
  seatingCapacity?: number;
  serviceCapacity?: number;
  foodServiceType?: string;

  // Medical Fields
  medicalPointName?: string;
  medicalServiceType?: string;
  staffCount?: number;
  treatmentCapacity?: number;
  emergencySupport?: boolean;

  // Venue Services Fields
  serviceCategory?: string;
  staffCapacity?: number;
  equipmentCapacity?: number;

  // Other Services Fields
  serviceName?: string;
  description?: string;
}

export interface OperatorUser extends BaseUser {
  role: "operator";
  organization: string;
  operatorType: OperatorType;
  operatingCity: string;
  address?: string;
  status?: "ACTIVE" | "ON_CALL" | "STANDBY" | "OFF_DUTY";
  businessProfile?: OperatorBusinessProfile;
}

export type User = AttendeeUser | OrganizerUser | OperatorUser;

export type StoredAccount = User & {
  passwordHash: string; // Stored securely in localStorage for client-side prototype
};

export interface Session {
  user: User;
  token: string;
  rememberMe: boolean;
  expiresAt: number;
}

// Role-specific signup form types
export interface AttendeeSignupFormData {
  role: "attendee";
  name: string;
  email: string;
  mobile: string;
  city: string;
  ageGroup: AgeGroup | "";
  password: string;
  confirmPassword: string;
}

export interface OrganizerSignupFormData {
  role: "organizer";
  name: string;
  organization: string;
  email: string;
  mobile: string;
  position: string;
  city: string;
  password: string;
  confirmPassword: string;
}

export interface OperatorSignupFormData {
  role: "operator";
  name: string;
  organization: string;
  email: string;
  mobile: string;
  operatorType: OperatorType | "";
  operatingCity: string;
  password: string;
  confirmPassword: string;
}

export type SignupFormData =
  | AttendeeSignupFormData
  | OrganizerSignupFormData
  | OperatorSignupFormData;

export interface SigninFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: User;
}
