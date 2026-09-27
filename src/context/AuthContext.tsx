import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  StoredAccount,
  UserRole,
  SignupFormData,
  SigninFormData,
  AuthResponse,
  AttendeeUser,
  OrganizerUser,
  OperatorUser,
} from "../types/auth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signup: (data: SignupFormData) => Promise<AuthResponse>;
  signin: (data: SigninFormData) => Promise<AuthResponse>;
  logout: () => void;
  resetPasswordSimulation: (email: string) => Promise<{ success: boolean; message: string }>;
  getRoleDefaultPath: (role: UserRole) => string;
  updateProfile: (updatedData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

// LocalStorage Keys as mandated by Phase 3 specification
const USERS_STORAGE_KEY = "eventflow_users";
const SESSION_STORAGE_KEY = "eventflow_session";

// Pre-seeded demo accounts with full role-specific and user-isolated data
const INITIAL_DEMO_ACCOUNTS: (StoredAccount & { password?: string })[] = [
  {
    id: "usr_demo_attendee",
    fullName: "Alex Rivera",
    name: "Alex Rivera",
    email: "alex.attendee@eventflow.live",
    mobile: "+1 (555) 234-8901",
    password: "Password123!",
    passwordHash: "Password123!",
    role: "attendee",
    city: "London",
    ageGroup: "25 - 34",
    createdAt: new Date().toISOString(),
    initials: "AR",
    avatarColor: "#4F7CFF",
  } as AttendeeUser & { passwordHash: string; password?: string },
  {
    id: "usr_demo_organizer",
    fullName: "Sarah Chen",
    name: "Sarah Chen",
    email: "sarah.organizer@eventflow.live",
    mobile: "+44 20 7946 0912",
    password: "Password123!",
    passwordHash: "Password123!",
    role: "organizer",
    organization: "Apex Global Events & Stadium Group",
    position: "Executive Director of Stadium Ingress",
    city: "London",
    createdAt: new Date().toISOString(),
    initials: "SC",
    avatarColor: "#4F46E5",
  } as OrganizerUser & { passwordHash: string; password?: string },
  {
    id: "usr_demo_operator",
    fullName: "Marcus Vance",
    name: "Marcus Vance",
    email: "marcus.operator@eventflow.live",
    mobile: "+65 6789 0123",
    password: "Password123!",
    passwordHash: "Password123!",
    role: "operator",
    organization: "Metropolitan Rail & Transit Logistics",
    operatorType: "Transport",
    operatingCity: "Mumbai",
    createdAt: new Date().toISOString(),
    initials: "MV",
    avatarColor: "#4F7CFF",
  } as OperatorUser & { passwordHash: string; password?: string },
  {
    id: "usr_demo_operator_accommodation",
    fullName: "Aarav Mehta",
    name: "Aarav Mehta",
    email: "aarav.accommodation@eventflow.live",
    mobile: "+91 98200 88990",
    password: "Password123!",
    passwordHash: "Password123!",
    role: "operator",
    organization: "Grand Concourse & Royal Suites Hospitality",
    operatorType: "Accommodation",
    operatingCity: "Mumbai",
    createdAt: new Date().toISOString(),
    initials: "AM",
    avatarColor: "#0284C7",
  } as OperatorUser & { passwordHash: string; password?: string },
  {
    id: "usr_demo_operator_transport",
    fullName: "Marcus Vance",
    name: "Marcus Vance",
    email: "marcus.vance@metrotransit.sg",
    mobile: "+65 6789 0123",
    password: "Password123!",
    passwordHash: "Password123!",
    role: "operator",
    organization: "Metropolitan Rail & Transit Logistics",
    operatorType: "Transport",
    operatingCity: "Mumbai",
    createdAt: new Date().toISOString(),
    initials: "MV",
    avatarColor: "#4F7CFF",
  } as OperatorUser & { passwordHash: string; password?: string },
  {
    id: "usr_demo_operator_parking",
    fullName: "Priya Sharma",
    name: "Priya Sharma",
    email: "priya.operator@eventflow.live",
    mobile: "+91 98201 45678",
    password: "Password123!",
    passwordHash: "Password123!",
    role: "operator",
    organization: "City Smart Parking & Ingress Infrastructure",
    operatorType: "Parking",
    operatingCity: "Mumbai",
    createdAt: new Date().toISOString(),
    initials: "PS",
    avatarColor: "#0D9488",
  } as OperatorUser & { passwordHash: string; password?: string },
  {
    id: "usr_demo_operator_food",
    fullName: "David Miller",
    name: "David Miller",
    email: "david.operator@eventflow.live",
    mobile: "+91 98112 34567",
    password: "Password123!",
    passwordHash: "Password123!",
    role: "operator",
    organization: "Concourse Catering & Food Village Services",
    operatorType: "Food & Dining",
    operatingCity: "Mumbai",
    createdAt: new Date().toISOString(),
    initials: "DM",
    avatarColor: "#D97706",
  } as OperatorUser & { passwordHash: string; password?: string },
  {
    id: "usr_demo_operator_medical",
    fullName: "Dr. Aanya Sen",
    name: "Dr. Aanya Sen",
    email: "aanya.operator@eventflow.live",
    mobile: "+91 98334 56789",
    password: "Password123!",
    passwordHash: "Password123!",
    role: "operator",
    organization: "Apex Emergency Medical & First Response",
    operatorType: "Medical & Assistance",
    operatingCity: "Mumbai",
    createdAt: new Date().toISOString(),
    initials: "AS",
    avatarColor: "#E11D48",
  } as OperatorUser & { passwordHash: string; password?: string },
  {
    id: "usr_demo_operator_venue",
    fullName: "Vikram Rathore",
    name: "Vikram Rathore",
    email: "vikram.operator@eventflow.live",
    mobile: "+91 98450 12345",
    password: "Password123!",
    passwordHash: "Password123!",
    role: "operator",
    organization: "ProStage Venue & Technical Operations",
    operatorType: "Venue Services",
    operatingCity: "Mumbai",
    createdAt: new Date().toISOString(),
    initials: "VR",
    avatarColor: "#7C3AED",
  } as OperatorUser & { passwordHash: string; password?: string },
  {
    id: "usr_demo_operator_other",
    fullName: "Zoya Khan",
    name: "Zoya Khan",
    email: "zoya.operator@eventflow.live",
    mobile: "+91 98765 43210",
    password: "Password123!",
    passwordHash: "Password123!",
    role: "operator",
    organization: "Prime Event Concierge & Cloakroom Facilities",
    operatorType: "Other Services",
    operatingCity: "Mumbai",
    createdAt: new Date().toISOString(),
    initials: "ZK",
    avatarColor: "#4B5563",
  } as OperatorUser & { passwordHash: string; password?: string },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS: Record<UserRole, string[]> = {
  attendee: ["#4F7CFF", "#2D5FD2", "#4F7CFF"],
  organizer: ["#4F46E5", "#6366F1", "#7C3AED"],
  operator: ["#0D9488", "#059669", "#0284C7"],
};

function getRoleAvatarColor(role: UserRole): string {
  const colors = AVATAR_COLORS[role] || AVATAR_COLORS.attendee;
  return colors[Math.floor(Math.random() * colors.length)];
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to load accounts from eventflow_users
  const getStoredUsers = (): (StoredAccount & { password?: string })[] => {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      // Migrate legacy accounts if available
      const legacy = localStorage.getItem("eventflow_accounts_v2");
      if (legacy) {
        const parsed = JSON.parse(legacy);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsed));
        return parsed;
      }
    } catch (err) {
      console.error("Error loading users from localStorage:", err);
    }
    return INITIAL_DEMO_ACCOUNTS;
  };

  const saveStoredUsers = (users: (StoredAccount & { password?: string })[]) => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (err) {
      console.error("Error saving users to localStorage:", err);
    }
  };

  // Initialize accounts and active session on mount
  useEffect(() => {
    try {
      // 1. Seed or retrieve users collection
      const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      let usersList: (StoredAccount & { password?: string })[] = [];
      if (!storedUsersRaw) {
        usersList = INITIAL_DEMO_ACCOUNTS;
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ACCOUNTS));
      } else {
        usersList = JSON.parse(storedUsersRaw);
        // Ensure new demo operator accounts exist
        let changed = false;
        INITIAL_DEMO_ACCOUNTS.forEach((demo) => {
          const exists = usersList.find((u) => u.email === demo.email || u.id === demo.id);
          if (!exists) {
            usersList.push(demo);
            changed = true;
          } else if (demo.role === "operator" && (exists as any).operatorType !== (demo as any).operatorType) {
            (exists as any).operatorType = (demo as any).operatorType;
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersList));
        }
      }

      // 2. Read active session from eventflow_session
      const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (rawSession) {
        let activeUserId: string | null = null;
        try {
          const parsedSession = JSON.parse(rawSession);
          if (typeof parsedSession === "string") {
            activeUserId = parsedSession;
          } else if (parsedSession && typeof parsedSession === "object") {
            activeUserId = parsedSession.userId || parsedSession.user?.id || null;
          }
        } catch {
          activeUserId = rawSession;
        }

        if (activeUserId) {
          // Resolve exact user from users collection using unique userId
          const matchedUser = usersList.find((u) => u.id === activeUserId);
          if (matchedUser) {
            const { passwordHash: _, password: __, ...safeUser } = matchedUser;
            setUser(safeUser as User);
          } else {
            // Invalid session reference -> Clear session
            localStorage.removeItem(SESSION_STORAGE_KEY);
            setUser(null);
          }
        }
      }
    } catch (err) {
      console.error("Error restoring session:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRoleDefaultPath = (role: UserRole): string => {
    switch (role) {
      case "attendee":
        return "/events";
      case "organizer":
        return "/operations";
      case "operator":
        return "/operators";
      default:
        return "/events";
    }
  };

  const validateStrongPassword = (pass: string): string | null => {
    if (!pass || pass.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[A-Z]/.test(pass)) {
      return "Password must contain at least one uppercase letter (A-Z).";
    }
    if (!/[a-z]/.test(pass)) {
      return "Password must contain at least one lowercase letter (a-z).";
    }
    if (!/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass)) {
      return "Password must contain at least one number or special symbol.";
    }
    return null;
  };

  const signup = async (formData: SignupFormData): Promise<AuthResponse> => {
    const trimmedName = formData.name.trim();
    // Normalize email using lowercase and trimmed whitespace as mandated
    const normalizedEmail = formData.email.trim().toLowerCase();
    const trimmedMobile = formData.mobile.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;
    const role = formData.role;

    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: "Please enter your full name (at least 2 characters)." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      return { success: false, error: "Please enter a valid official email address." };
    }

    if (!trimmedMobile || trimmedMobile.replace(/\D/g, "").length < 7) {
      return { success: false, error: "Please enter a valid mobile number (minimum 7 digits)." };
    }

    const passwordError = validateStrongPassword(password);
    if (passwordError) {
      return { success: false, error: passwordError };
    }

    if (password !== confirmPassword) {
      return { success: false, error: "Passwords do not match. Please re-enter." };
    }

    // Check duplicate email in eventflow_users
    const allUsers = getStoredUsers();
    const existing = allUsers.find((a) => a.email.trim().toLowerCase() === normalizedEmail);
    if (existing) {
      return {
        success: false,
        error: "An account with this email already exists. Please sign in.",
      };
    }

    // Generate unique user record
    const newUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const initials = getInitials(trimmedName);
    const avatarColor = getRoleAvatarColor(role);
    const createdAt = new Date().toISOString();

    let newAccount: StoredAccount & { password?: string };

    if (role === "attendee") {
      const city = formData.city.trim();
      const ageGroup = formData.ageGroup;

      if (!city) {
        return { success: false, error: "Please enter your city." };
      }
      if (!ageGroup) {
        return { success: false, error: "Please select your age group." };
      }

      newAccount = {
        id: newUserId,
        fullName: trimmedName,
        name: trimmedName,
        email: normalizedEmail,
        mobile: trimmedMobile,
        role: "attendee",
        city,
        ageGroup,
        password: password,
        passwordHash: password,
        createdAt,
        initials,
        avatarColor,
      };
    } else if (role === "organizer") {
      const organization = formData.organization.trim();
      const position = formData.position.trim();
      const city = formData.city.trim();

      if (!organization) {
        return { success: false, error: "Please enter your organization or event company name." };
      }
      if (!position) {
        return { success: false, error: "Please enter your role / position in the organization." };
      }
      if (!city) {
        return { success: false, error: "Please enter your headquarters or operating city." };
      }

      newAccount = {
        id: newUserId,
        fullName: trimmedName,
        name: trimmedName,
        email: normalizedEmail,
        mobile: trimmedMobile,
        role: "organizer",
        organization,
        position,
        city,
        password: password,
        passwordHash: password,
        createdAt,
        initials,
        avatarColor,
      };
    } else if (role === "operator") {
      const organization = formData.organization.trim();
      const operatorType = formData.operatorType;
      const operatingCity = formData.operatingCity.trim();

      if (!organization) {
        return { success: false, error: "Please enter your service provider / company name." };
      }
      if (!operatorType) {
        return { success: false, error: "Please select your operator service type." };
      }
      if (!operatingCity) {
        return { success: false, error: "Please enter your operating city." };
      }

      newAccount = {
        id: newUserId,
        fullName: trimmedName,
        name: trimmedName,
        email: normalizedEmail,
        mobile: trimmedMobile,
        role: "operator",
        organization,
        operatorType,
        operatingCity,
        password: password,
        passwordHash: password,
        createdAt,
        initials,
        avatarColor,
      };
    } else {
      return { success: false, error: "Invalid role selected." };
    }

    // Save completely independent new account to eventflow_users (never overwrite existing)
    const updatedUsers = [...allUsers, newAccount];
    saveStoredUsers(updatedUsers);

    // Save user ID to eventflow_session
    const sessionPayload = {
      userId: newUserId,
      createdAt,
    };
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionPayload));
    } catch (err) {
      console.error("Error setting session:", err);
    }

    const { passwordHash: _, password: __, ...safeUser } = newAccount;
    setUser(safeUser as User);
    return { success: true, user: safeUser as User };
  };

  const signin = async (formData: SigninFormData): Promise<AuthResponse> => {
    // Normalize email using lowercase and trimmed whitespace
    const normalizedEmail = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!normalizedEmail) {
      return { success: false, error: "Please enter your email address." };
    }

    if (!password) {
      return { success: false, error: "Please enter your password." };
    }

    const allUsers = getStoredUsers();
    // 1. Find matching user by normalized email
    const account = allUsers.find((a) => a.email.trim().toLowerCase() === normalizedEmail);

    if (!account) {
      return {
        success: false,
        error: "Account not found. Please create an account first.",
      };
    }

    // 2. Validate password
    const storedPass = account.password || account.passwordHash;
    const isDemoPassword =
      password === "Password123!" ||
      password === "TransitOps@2026" ||
      password === "ApexDirector@2026" ||
      password === "EventPass@2026";
    const passwordMatch = storedPass === password || (account.id.startsWith("usr_demo_") && isDemoPassword);

    if (!passwordMatch) {
      return {
        success: false,
        error: "Incorrect password. Please verify and try again.",
      };
    }

    // 3. Save that user's unique ID in eventflow_session
    const sessionPayload = {
      userId: account.id,
      loginAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionPayload));
    } catch (err) {
      console.error("Error storing session:", err);
    }

    // 4. Load complete profile and render
    const { passwordHash: _, password: __, ...safeUser } = account;
    setUser(safeUser as User);
    return { success: true, user: safeUser as User };
  };

  const logout = () => {
    try {
      // Remove ONLY eventflow_session. DO NOT delete registered accounts or bookings!
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (err) {
      console.error("Error removing session from localStorage:", err);
    }
    setUser(null);
  };

  const resetPasswordSimulation = async (
    email: string
  ): Promise<{ success: boolean; message: string }> => {
    const normalizedEmail = email.trim().toLowerCase();
    const allUsers = getStoredUsers();
    const account = allUsers.find((a) => a.email.trim().toLowerCase() === normalizedEmail);

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!account) {
      return {
        success: false,
        message: "No registered account was found with this email address.",
      };
    }

    return {
      success: true,
      message: `Password reset instructions sent to ${account.email}. (Demo environment)`,
    };
  };

  const updateProfile = async (
    updatedData: Partial<User>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "No authenticated user found." };
    }

    try {
      const allUsers = getStoredUsers();
      const userIndex = allUsers.findIndex((u) => u.id === user.id);

      if (userIndex === -1) {
        return { success: false, error: "User record not found in system storage." };
      }

      const existingAccount = allUsers[userIndex];
      const newFullName = updatedData.fullName || updatedData.name || existingAccount.fullName || existingAccount.name;
      const initials = getInitials(newFullName);

      const mergedAccount = {
        ...existingAccount,
        ...updatedData,
        fullName: newFullName,
        name: newFullName,
        initials,
      } as StoredAccount;

      allUsers[userIndex] = mergedAccount;
      saveStoredUsers(allUsers);

      const { passwordHash: _, ...safeUser } = mergedAccount;
      setUser(safeUser as User);

      return { success: true };
    } catch (err) {
      console.error("Error updating user profile:", err);
      return { success: false, error: "Failed to persist profile changes." };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        signup,
        signin,
        logout,
        resetPasswordSimulation,
        getRoleDefaultPath,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
