import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  User as UserIcon,
  Mail,
  Lock,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  Layers,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles,
  ArrowLeft,
  KeyRound,
  Shield,
  Radio,
  Users,
  Compass,
  Check,
  LockKeyhole,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { EventFlowLogo } from "../home/EventFlowLogo";
import {
  UserRole,
  OperatorType,
  AgeGroup,
  AttendeeSignupFormData,
  OrganizerSignupFormData,
  OperatorSignupFormData,
  CANONICAL_OPERATOR_TYPES,
} from "../../types/auth";

interface AuthSplitScreenProps {
  initialMode: "signin" | "signup";
}

const OPERATOR_TYPES: OperatorType[] = CANONICAL_OPERATOR_TYPES;

const AGE_GROUPS: AgeGroup[] = [
  "Under 18",
  "18 - 24",
  "25 - 34",
  "35 - 49",
  "50+",
];

export const AuthSplitScreen: React.FC<AuthSplitScreenProps> = ({ initialMode }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signin, signup, getRoleDefaultPath, resetPasswordSimulation } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>("attendee");

  // Keep state in sync if prop changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Sign In State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInError, setSignInError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Forgot Password Modal State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotFeedback, setForgotFeedback] = useState<{ success: boolean; message: string } | null>(
    null
  );
  const [isResetting, setIsResetting] = useState(false);

  // Shared Password Visibility for Signup
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirm, setShowSignUpConfirm] = useState(false);

  // Attendee Form State
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [attendeeMobile, setAttendeeMobile] = useState("");
  const [attendeeCity, setAttendeeCity] = useState("");
  const [attendeeAgeGroup, setAttendeeAgeGroup] = useState<AgeGroup | "">("");
  const [attendeePassword, setAttendeePassword] = useState("");
  const [attendeeConfirmPassword, setAttendeeConfirmPassword] = useState("");

  // Organizer Form State
  const [organizerName, setOrganizerName] = useState("");
  const [organizerOrg, setOrganizerOrg] = useState("");
  const [organizerEmail, setOrganizerEmail] = useState("");
  const [organizerMobile, setOrganizerMobile] = useState("");
  const [organizerPosition, setOrganizerPosition] = useState("");
  const [organizerCity, setOrganizerCity] = useState("");
  const [organizerPassword, setOrganizerPassword] = useState("");
  const [organizerConfirmPassword, setOrganizerConfirmPassword] = useState("");

  // Operator Form State
  const [operatorName, setOperatorName] = useState("");
  const [operatorOrg, setOperatorOrg] = useState("");
  const [operatorEmail, setOperatorEmail] = useState("");
  const [operatorMobile, setOperatorMobile] = useState("");
  const [operatorType, setOperatorType] = useState<OperatorType | "">("");
  const [operatorCity, setOperatorCity] = useState("");
  const [operatorPassword, setOperatorPassword] = useState("");
  const [operatorConfirmPassword, setOperatorConfirmPassword] = useState("");

  // Signup Validation & Feedback
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [signUpError, setSignUpError] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Password Checklist Helper
  const checkPasswordRequirements = (pwd: string) => {
    return {
      minLength: pwd.length >= 8,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumberOrSymbol: /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd),
    };
  };

  const getActivePasswordValue = () => {
    if (selectedRole === "attendee") return attendeePassword;
    if (selectedRole === "organizer") return organizerPassword;
    return operatorPassword;
  };

  const currentPassCheck = checkPasswordRequirements(getActivePasswordValue());

  // Mode Switch Handler with clean animation and URL sync
  const handleModeChange = (newMode: "signin" | "signup") => {
    setMode(newMode);
    setSignInError("");
    setSignUpError("");
    setFieldErrors({});
    if (newMode === "signin") {
      navigate("/signin", { replace: true });
    } else {
      navigate("/signup", { replace: true });
    }
  };

  // Sign In Submission
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError("");

    if (!signInEmail.trim()) {
      setSignInError("Please enter your email address.");
      return;
    }
    if (!signInPassword) {
      setSignInError("Please enter your password.");
      return;
    }

    setIsSigningIn(true);

    try {
      const result = await signin({
        email: signInEmail.trim(),
        password: signInPassword,
        rememberMe,
      });

      if (!result.success) {
        setSignInError(result.error || "Unable to sign in.");
        setIsSigningIn(false);
        return;
      }

      // Successful sign in -> Route according to verified role
      const redirectUrl = searchParams.get("redirect");
      if (redirectUrl && redirectUrl.startsWith("/")) {
        navigate(redirectUrl, { replace: true });
      } else if (result.user) {
        navigate(getRoleDefaultPath(result.user.role), { replace: true });
      }
    } catch {
      setSignInError("An unexpected error occurred. Please try again.");
      setIsSigningIn(false);
    }
  };

  // Helper validation for email format
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Sign Up Submission
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError("");
    const errors: Record<string, string> = {};

    const activePwd = getActivePasswordValue();
    const activeConfirm =
      selectedRole === "attendee"
        ? attendeeConfirmPassword
        : selectedRole === "organizer"
        ? organizerConfirmPassword
        : operatorConfirmPassword;

    // Role-specific fields validation
    if (selectedRole === "attendee") {
      if (!attendeeName.trim()) errors.name = "Full name is required.";
      if (!attendeeEmail.trim()) {
        errors.email = "Email is required.";
      } else if (!isValidEmail(attendeeEmail)) {
        errors.email = "Please enter a valid email address.";
      }
      if (!attendeeMobile.trim()) errors.mobile = "Mobile number is required.";
      if (!attendeeCity.trim()) errors.city = "City is required.";
      if (!attendeeAgeGroup) errors.ageGroup = "Please select an age group.";
    } else if (selectedRole === "organizer") {
      if (!organizerName.trim()) errors.name = "Full name is required.";
      if (!organizerOrg.trim()) errors.organization = "Organization / Company is required.";
      if (!organizerEmail.trim()) {
        errors.email = "Official email is required.";
      } else if (!isValidEmail(organizerEmail)) {
        errors.email = "Please enter a valid corporate email.";
      }
      if (!organizerMobile.trim()) errors.mobile = "Mobile number is required.";
      if (!organizerPosition.trim()) errors.position = "Role / Position is required.";
      if (!organizerCity.trim()) errors.city = "Operating city is required.";
    } else if (selectedRole === "operator") {
      if (!operatorName.trim()) errors.name = "Full name is required.";
      if (!operatorOrg.trim()) errors.organization = "Service provider name is required.";
      if (!operatorEmail.trim()) {
        errors.email = "Official email is required.";
      } else if (!isValidEmail(operatorEmail)) {
        errors.email = "Please enter a valid operator email.";
      }
      if (!operatorMobile.trim()) errors.mobile = "Mobile number is required.";
      if (!operatorType) errors.operatorType = "Please select your service domain.";
      if (!operatorCity.trim()) errors.operatingCity = "Operating city is required.";
    }

    // Password requirements check
    const reqs = checkPasswordRequirements(activePwd);
    if (!reqs.minLength || !reqs.hasUpper || !reqs.hasLower || !reqs.hasNumberOrSymbol) {
      errors.password = "Password does not meet the security requirements.";
    }

    if (activePwd !== activeConfirm) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSignUpError("Please resolve the highlighted fields to continue.");
      return;
    }

    setFieldErrors({});
    setIsSigningUp(true);

    try {
      let result;
      if (selectedRole === "attendee") {
        const payload: AttendeeSignupFormData = {
          role: "attendee",
          name: attendeeName.trim(),
          email: attendeeEmail.trim(),
          mobile: attendeeMobile.trim(),
          city: attendeeCity.trim(),
          ageGroup: attendeeAgeGroup as AgeGroup,
          password: attendeePassword,
          confirmPassword: attendeeConfirmPassword,
        };
        result = await signup(payload);
      } else if (selectedRole === "organizer") {
        const payload: OrganizerSignupFormData = {
          role: "organizer",
          name: organizerName.trim(),
          organization: organizerOrg.trim(),
          email: organizerEmail.trim(),
          mobile: organizerMobile.trim(),
          position: organizerPosition.trim(),
          city: organizerCity.trim(),
          password: organizerPassword,
          confirmPassword: organizerConfirmPassword,
        };
        result = await signup(payload);
      } else {
        const payload: OperatorSignupFormData = {
          role: "operator",
          name: operatorName.trim(),
          organization: operatorOrg.trim(),
          email: operatorEmail.trim(),
          mobile: operatorMobile.trim(),
          operatorType: operatorType as OperatorType,
          operatingCity: operatorCity.trim(),
          password: operatorPassword,
          confirmPassword: operatorConfirmPassword,
        };
        result = await signup(payload);
      }

      if (!result.success) {
        setSignUpError(result.error || "Registration failed.");
        setIsSigningUp(false);
        return;
      }

      // Successful registration -> Navigate to role landing route
      if (result.user) {
        navigate(getRoleDefaultPath(result.user.role), { replace: true });
      }
    } catch {
      setSignUpError("An error occurred during account creation. Please try again.");
      setIsSigningUp(false);
    }
  };

  // Forgot Password Simulation
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setIsResetting(true);
    setForgotFeedback(null);

    const res = await resetPasswordSimulation(forgotEmail.trim());
    setIsResetting(false);
    setForgotFeedback(res);
  };

  // Quick Demo Account Pre-fill for testing
  const fillDemoAccount = (demoRole: UserRole, opType?: OperatorType) => {
    if (demoRole === "attendee") {
      setSignInEmail("alex.turner@eventflow.live");
      setSignInPassword("EventPass@2026");
    } else if (demoRole === "organizer") {
      setSignInEmail("sarah.chen@apexevents.com");
      setSignInPassword("ApexDirector@2026");
    } else {
      switch (opType) {
        case "Accommodation":
          setSignInEmail("aarav.accommodation@eventflow.live");
          setSignInPassword("Password123!");
          break;
        case "Transport":
          setSignInEmail("marcus.operator@eventflow.live");
          setSignInPassword("Password123!");
          break;
        case "Parking":
          setSignInEmail("priya.operator@eventflow.live");
          setSignInPassword("Password123!");
          break;
        case "Food & Dining":
          setSignInEmail("david.operator@eventflow.live");
          setSignInPassword("Password123!");
          break;
        case "Medical & Assistance":
          setSignInEmail("aanya.operator@eventflow.live");
          setSignInPassword("Password123!");
          break;
        case "Venue Services":
          setSignInEmail("vikram.operator@eventflow.live");
          setSignInPassword("Password123!");
          break;
        case "Other Services":
          setSignInEmail("zoya.operator@eventflow.live");
          setSignInPassword("Password123!");
          break;
        default:
          setSignInEmail("marcus.operator@eventflow.live");
          setSignInPassword("Password123!");
      }
    }
    setSignInError("");
  };

  // Active theme color based on selected role
  const getRoleAccentColor = (role: UserRole) => {
    switch (role) {
      case "attendee":
        return {
          badgeBg: "bg-[#F7FAFF]",
          badgeBorder: "border-[#EDE3CB]",
          badgeText: "text-[#2D5FD2]",
          activeTab: "bg-[#4F7CFF] text-white shadow-md shadow-[#4F7CFF]/20",
          ring: "focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF]",
          btn: "bg-[#0B1120] hover:bg-[#241E17]",
        };
      case "organizer":
        return {
          badgeBg: "bg-indigo-50",
          badgeBorder: "border-indigo-100",
          badgeText: "text-indigo-700",
          activeTab: "bg-indigo-600 text-white shadow-md shadow-indigo-600/20",
          ring: "focus:ring-indigo-600/20 focus:border-indigo-600",
          btn: "bg-[#0B1120] hover:bg-[#241E17]",
        };
      case "operator":
        return {
          badgeBg: "bg-teal-50",
          badgeBorder: "border-teal-100",
          badgeText: "text-teal-700",
          activeTab: "bg-teal-600 text-white shadow-md shadow-teal-600/20",
          ring: "focus:ring-teal-600/20 focus:border-teal-600",
          btn: "bg-[#0B1120] hover:bg-[#241E17]",
        };
    }
  };

  const currentTheme = getRoleAccentColor(selectedRole);

  return (
    <div className="eventflow-auth min-h-screen bg-[#0B1120] text-[#F5EFE2] flex flex-col font-sans selection:bg-[#C9A15C] selection:text-[#0B1120] relative overflow-hidden">
      {/* Subtle Animated Ambient Background Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            x: [0, 25, 0],
            y: [0, -25, 0],
            scale: [1, 1.06, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-[#C9D9F7]/25 via-indigo-100/20 to-transparent blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-32 w-[560px] h-[560px] rounded-full bg-gradient-to-tl from-teal-200/20 via-[#EDE3CB]/15 to-transparent blur-3xl"
        />
        <motion.div
          animate={{
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-r from-indigo-100/15 via-purple-100/10 to-teal-100/15 blur-3xl"
        />
      </div>

      {/* Top Header Navigation */}
      <header className="eventflow-auth-header sticky top-0 z-30 w-full bg-[#0B1120]/90 backdrop-blur-md border-b border-[#C9A15C]/20">
        <div className="max-w-5xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 text-xs font-semibold text-[#4A4236] hover:text-[#0B1120] transition-colors py-1.5 px-3 rounded-lg hover:bg-[#F7FAFF]/80 group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#8C8272] group-hover:-translate-x-0.5 group-hover:text-[#382F27] transition-transform" />
            <span>Back to Home</span>
          </Link>

          <Link to="/" className="flex items-center gap-2.5 select-none group">
            <EventFlowLogo size={32} className="transition-transform group-hover:scale-105 duration-200" />
            <span className="text-xl font-bold tracking-tight text-[#0B1120] font-heading">
              EventFlow
            </span>
          </Link>

          <div className="flex justify-end">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F0E9D6] border border-[#C9D9F7] text-[#382F27] shadow-2xs">
              <LockKeyhole className="w-3.5 h-3.5 text-[#4F7CFF]" />
              <span className="hidden sm:inline">Secure Access</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Single-Panel Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-[540px]"
        >
          {/* Central Authentication Card */}
          <div className="eventflow-auth-card bg-[#F0E9D6] rounded-3xl border border-[#C9A15C]/45 shadow-[0_28px_70px_-24px_rgba(0,0,0,0.62)] p-6 sm:p-9 relative overflow-hidden">
            {/* Top Subtle Brand Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#16345D] via-[#C9A15C] to-[#2D5FD2]" />

            {/* Mode Switcher Tabs (Sign In ↔ Create Account) */}
            <div className="bg-[#F7FAFF] p-1.5 rounded-2xl flex items-center mb-7 relative shadow-inner">
              <button
                type="button"
                onClick={() => handleModeChange("signin")}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer relative z-10 flex items-center justify-center gap-2 ${
                  mode === "signin"
                    ? "text-[#0B1120]"
                    : "text-[#6B6252] hover:text-[#241E17]"
                }`}
              >
                {mode === "signin" && (
                  <motion.div
                    layoutId="activeAuthModeTab"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    className="absolute inset-0 bg-[#F0E9D6] rounded-xl shadow-xs border border-[#C9D9F7]/60 z-0"
                  />
                )}
                <span className="relative z-10">Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange("signup")}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer relative z-10 flex items-center justify-center gap-2 ${
                  mode === "signup"
                    ? "text-[#0B1120]"
                    : "text-[#6B6252] hover:text-[#241E17]"
                }`}
              >
                {mode === "signup" && (
                  <motion.div
                    layoutId="activeAuthModeTab"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    className="absolute inset-0 bg-[#F0E9D6] rounded-xl shadow-xs border border-[#C9D9F7]/60 z-0"
                  />
                )}
                <span className="relative z-10">Create Account</span>
              </button>
            </div>

            {/* Form Views Animated Transition */}
            <AnimatePresence mode="wait" initial={false}>
              {mode === "signin" ? (
                /* ========================================================= */
                /* SIGN IN FORM VIEW                                         */
                /* ========================================================= */
                <motion.div
                  key="signin-view"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <div className="text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F7FAFF] text-[#2D5FD2] border border-[#EDE3CB] mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#4F7CFF]" />
                      <span>Registered Portal Access</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1120] font-heading">
                      Sign in to EventFlow
                    </h1>
                    <p className="text-sm text-[#6B6252] mt-1.5 leading-relaxed">
                      Enter your verified credentials. If you do not have an account yet, please create one first.
                    </p>
                  </div>

                  {/* Sign In Error Alert */}
                  <AnimatePresence>
                    {signInError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -6 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -6 }}
                        className="overflow-hidden"
                      >
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs sm:text-sm">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="leading-relaxed font-medium">{signInError}</span>
                            {signInError.includes("Account not found") && (
                              <div className="mt-2">
                                <button
                                  type="button"
                                  onClick={() => handleModeChange("signup")}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-900 underline cursor-pointer"
                                >
                                  <span>Create a new account now</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSignInSubmit} className="space-y-4">
                    {/* Email Field */}
                    <div>
                      <label className="block text-xs font-semibold text-[#382F27] mb-1.5 uppercase tracking-wider">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8272]">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          value={signInEmail}
                          onChange={(e) => {
                            setSignInEmail(e.target.value);
                            if (signInError) setSignInError("");
                          }}
                          placeholder="e.g. name@eventflow.live"
                          autoComplete="email"
                          required
                          className="w-full pl-10 pr-4 py-2.5 bg-[#F4F8FF]/50 border border-[#C9BBA0] rounded-xl text-sm text-[#0B1120] placeholder-[#8C8272] focus:bg-[#F0E9D6] focus:outline-none focus:ring-4 focus:ring-[#4F7CFF]/10 focus:border-[#4F7CFF] transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-[#382F27] uppercase tracking-wider">
                          Password <span className="text-rose-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setForgotEmail(signInEmail);
                            setForgotFeedback(null);
                            setForgotModalOpen(true);
                          }}
                          className="text-xs font-medium text-[#4F7CFF] hover:text-[#2D5FD2] transition-colors cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8272]">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showSignInPassword ? "text" : "password"}
                          value={signInPassword}
                          onChange={(e) => {
                            setSignInPassword(e.target.value);
                            if (signInError) setSignInError("");
                          }}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          required
                          className="w-full pl-10 pr-11 py-2.5 bg-[#F4F8FF]/50 border border-[#C9BBA0] rounded-xl text-sm text-[#0B1120] placeholder-[#8C8272] focus:bg-[#F0E9D6] focus:outline-none focus:ring-4 focus:ring-[#4F7CFF]/10 focus:border-[#4F7CFF] transition-all shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignInPassword(!showSignInPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8C8272] hover:text-[#4A4236] transition-colors cursor-pointer"
                          aria-label={showSignInPassword ? "Hide password" : "Show password"}
                        >
                          {showSignInPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Remember session */}
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded text-[#4F7CFF] border-[#C9BBA0] focus:ring-[#4F7CFF]/20 cursor-pointer"
                        />
                        <span className="text-xs text-[#4A4236] font-medium">
                          Remember session on this device
                        </span>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSigningIn}
                        className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#0B1120] hover:bg-[#241E17] transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.99]"
                      >
                        {isSigningIn ? (
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Verifying Credentials...</span>
                          </div>
                        ) : (
                          <>
                            <span>Sign In to Portal</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-[#C9BBA0]" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Switch to Register */}
                  <div className="pt-2 border-t border-[#F7FAFF] text-center text-xs text-[#6B6252]">
                    Don't have an EventFlow account?{" "}
                    <button
                      type="button"
                      onClick={() => handleModeChange("signup")}
                      className="font-semibold text-[#4F7CFF] hover:text-[#2D5FD2] underline cursor-pointer"
                    >
                      Create Account
                    </button>
                  </div>

                  {/* Quick Demo Credentials Panel */}
                  <div className="pt-4 border-t border-[#F7FAFF]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-[#8C8272] uppercase tracking-wider">
                        Quick Demo Logins
                      </span>
                      <span className="text-[10px] text-[#8C8272]">1-click test credentials</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => fillDemoAccount("attendee")}
                        className="p-2 rounded-xl bg-[#F7FAFF]/60 hover:bg-[#EDE3CB]/70 border border-[#C9D9F7]/60 text-left transition-all cursor-pointer group"
                      >
                        <div className="text-[11px] font-bold text-[#2D5FD2] flex items-center justify-between">
                          <span>Attendee Demo</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4F7CFF]" />
                        </div>
                        <div className="text-[9px] text-[#6B6252] truncate mt-0.5">Alex Turner (/events)</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => fillDemoAccount("organizer")}
                        className="p-2 rounded-xl bg-indigo-50/60 hover:bg-indigo-100/70 border border-indigo-200/60 text-left transition-all cursor-pointer group"
                      >
                        <div className="text-[11px] font-bold text-indigo-700 flex items-center justify-between">
                          <span>Organizer Demo</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                        </div>
                        <div className="text-[9px] text-[#6B6252] truncate mt-0.5">Apex Events (/operations)</div>
                      </button>
                    </div>

                    {/* Operator Types Selector Chips */}
                    <div className="p-2 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7]/70">
                      <div className="text-[10px] font-semibold text-[#6B6252] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Operator Specializations:</span>
                        <span className="text-teal-700 font-bold">Role-Isolated</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {OPERATOR_TYPES.map((op) => (
                          <button
                            key={op}
                            type="button"
                            onClick={() => fillDemoAccount("operator", op)}
                            className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-[#F0E9D6] hover:bg-teal-50 hover:text-teal-800 hover:border-teal-300 border border-[#C9D9F7] text-[#382F27] transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                            <span>{op}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* ========================================================= */
                /* CREATE ACCOUNT / REGISTRATION VIEW                        */
                /* ========================================================= */
                <motion.div
                  key="signup-view"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <div className="text-center sm:text-left">
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${currentTheme.badgeBg} ${currentTheme.badgeText} border ${currentTheme.badgeBorder} mb-2`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Role-Specific Registration</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1120] font-heading">
                      Create Your Account
                    </h1>
                    <p className="text-sm text-[#6B6252] mt-1 leading-relaxed">
                      Select your operational role first. Each tier provides specialized permissions and dedicated portal routing.
                    </p>
                  </div>

                  {/* Role Selector Grid */}
                  <div>
                    <label className="block text-xs font-semibold text-[#382F27] mb-2 uppercase tracking-wider">
                      Select Role Tier <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {/* Attendee */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRole("attendee");
                          setSignUpError("");
                          setFieldErrors({});
                        }}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer relative ${
                          selectedRole === "attendee"
                            ? "bg-[#F7FAFF]/80 border-[#4F7CFF] shadow-sm"
                            : "bg-[#F4F8FF]/70 border-[#C9D9F7] hover:bg-[#F7FAFF] hover:border-[#C9BBA0]"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl mx-auto mb-1.5 flex items-center justify-center transition-colors ${
                            selectedRole === "attendee"
                              ? "bg-[#4F7CFF] text-white shadow-xs"
                              : "bg-[#C9D9F7]/80 text-[#4A4236]"
                          }`}
                        >
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-bold text-[#0B1120]">Attendee</div>
                        <div className="text-[10px] text-[#6B6252]">Tickets & Entry</div>
                      </button>

                      {/* Organizer */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRole("organizer");
                          setSignUpError("");
                          setFieldErrors({});
                        }}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer relative ${
                          selectedRole === "organizer"
                            ? "bg-indigo-50/80 border-indigo-500 shadow-sm"
                            : "bg-[#F4F8FF]/70 border-[#C9D9F7] hover:bg-[#F7FAFF] hover:border-[#C9BBA0]"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl mx-auto mb-1.5 flex items-center justify-center transition-colors ${
                            selectedRole === "organizer"
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-[#C9D9F7]/80 text-[#4A4236]"
                          }`}
                        >
                          <Shield className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-bold text-[#0B1120]">Organizer</div>
                        <div className="text-[10px] text-[#6B6252]">Operations Hub</div>
                      </button>

                      {/* Operator */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRole("operator");
                          setSignUpError("");
                          setFieldErrors({});
                        }}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer relative ${
                          selectedRole === "operator"
                            ? "bg-teal-50/80 border-teal-500 shadow-sm"
                            : "bg-[#F4F8FF]/70 border-[#C9D9F7] hover:bg-[#F7FAFF] hover:border-[#C9BBA0]"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl mx-auto mb-1.5 flex items-center justify-center transition-colors ${
                            selectedRole === "operator"
                              ? "bg-teal-600 text-white shadow-xs"
                              : "bg-[#C9D9F7]/80 text-[#4A4236]"
                          }`}
                        >
                          <Radio className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-bold text-[#0B1120]">Operator</div>
                        <div className="text-[10px] text-[#6B6252]">Field Terminal</div>
                      </button>
                    </div>
                  </div>

                  {/* Sign Up Error Alert */}
                  <AnimatePresence>
                    {signUpError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -6 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -6 }}
                        className="overflow-hidden"
                      >
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs sm:text-sm">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <span className="leading-relaxed font-medium">{signUpError}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Role-Specific Form Fields */}
                  <form onSubmit={handleSignUpSubmit} className="space-y-4">
                    {/* ATTENDEE FIELDS */}
                    {selectedRole === "attendee" && (
                      <div className="space-y-3.5 animate-fadeIn">
                        {/* Full Name */}
                        <div>
                          <label className="block text-xs font-semibold text-[#382F27] mb-1 uppercase tracking-wider">
                            Full Name <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8272]">
                              <UserIcon className="w-4 h-4" />
                            </div>
                            <input
                              type="text"
                              value={attendeeName}
                              onChange={(e) => {
                                setAttendeeName(e.target.value);
                                if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: "" });
                              }}
                              placeholder="e.g. Alex Turner"
                              required
                              className="w-full pl-10 pr-3 py-2 bg-[#F4F8FF]/50 border border-[#C9BBA0] rounded-xl text-sm text-[#0B1120] focus:bg-[#F0E9D6] focus:outline-none focus:ring-4 focus:ring-[#4F7CFF]/10 focus:border-[#4F7CFF] shadow-2xs"
                            />
                          </div>
                          {fieldErrors.name && (
                            <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.name}</p>
                          )}
                        </div>

                        {/* Email & Mobile */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-[#382F27] mb-1 uppercase tracking-wider">
                              Email <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8272]">
                                <Mail className="w-4 h-4" />
                              </div>
                              <input
                                type="email"
                                value={attendeeEmail}
                                onChange={(e) => {
                                  setAttendeeEmail(e.target.value);
                                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
                                }}
                                placeholder="name@domain.com"
                                required
                                className="w-full pl-10 pr-3 py-2 bg-[#F4F8FF]/50 border border-[#C9BBA0] rounded-xl text-sm text-[#0B1120] focus:bg-[#F0E9D6] focus:outline-none focus:ring-4 focus:ring-[#4F7CFF]/10 focus:border-[#4F7CFF] shadow-2xs"
                              />
                            </div>
                            {fieldErrors.email && (
                              <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.email}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#382F27] mb-1 uppercase tracking-wider">
                              Mobile Number <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8272]">
                                <Phone className="w-4 h-4" />
                              </div>
                              <input
                                type="tel"
                                value={attendeeMobile}
                                onChange={(e) => {
                                  setAttendeeMobile(e.target.value);
                                  if (fieldErrors.mobile) setFieldErrors({ ...fieldErrors, mobile: "" });
                                }}
                                placeholder="+1 555-0199"
                                required
                                className="w-full pl-10 pr-3 py-2 bg-[#F4F8FF]/50 border border-[#C9BBA0] rounded-xl text-sm text-[#0B1120] focus:bg-[#F0E9D6] focus:outline-none focus:ring-4 focus:ring-[#4F7CFF]/10 focus:border-[#4F7CFF] shadow-2xs"
                              />
                            </div>
                            {fieldErrors.mobile && (
                              <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.mobile}</p>
                            )}
                          </div>
                        </div>

                        {/* City & Age Group */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-[#382F27] mb-1 uppercase tracking-wider">
                              City <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8272]">
                                <MapPin className="w-4 h-4" />
                              </div>
                              <input
                                type="text"
                                value={attendeeCity}
                                onChange={(e) => {
                                  setAttendeeCity(e.target.value);
                                  if (fieldErrors.city) setFieldErrors({ ...fieldErrors, city: "" });
                                }}
                                placeholder="e.g. San Francisco"
                                required
                                className="w-full pl-10 pr-3 py-2 bg-[#F4F8FF]/50 border border-[#C9BBA0] rounded-xl text-sm text-[#0B1120] focus:bg-[#F0E9D6] focus:outline-none focus:ring-4 focus:ring-[#4F7CFF]/10 focus:border-[#4F7CFF] shadow-2xs"
                              />
                            </div>
                            {fieldErrors.city && (
                              <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.city}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#382F27] mb-1 uppercase tracking-wider">
                              Age Group <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8272]">
                                <Calendar className="w-4 h-4" />
                              </div>
                              <select
                                value={attendeeAgeGroup}
                                onChange={(e) => {
                                  setAttendeeAgeGroup(e.target.value as AgeGroup);
                                  if (fieldErrors.ageGroup) setFieldErrors({ ...fieldErrors, ageGroup: "" });
                                }}
                                required
                                className="w-full pl-10 pr-4 py-2 bg-[#F4F8FF]/50 border border-[#C9BBA0] rounded-xl text-sm text-[#0B1120] focus:bg-[#F0E9D6] focus:outline-none focus:ring-4 focus:ring-[#4F7CFF]/10 focus:border-[#4F7CFF] shadow-2xs appearance-none cursor-pointer"
                              >
                                <option value="">Select Range</option>
                                {AGE_GROUPS.map((g) => (
                                  <option key={g} value={g}>
                                    {g}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {fieldErrors.ageGroup && (
                              <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.ageGroup}</p>
                            )}
                          </div>
                        </div>

                        {/* Password & Confirm */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-[#382F27] mb-1 uppercase tracking-wider">
                              Password <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8272]">
                                <Lock className="w-4 h-4" />
                              </div>
                              <input
                                type={showSignUpPassword ? "text" : "password"}
                                value={attendeePassword}
                                onChange={(e) => {
                                  setAttendeePassword(e.target.value);
                                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: "" });
                                }}
                                placeholder="••••••••"
                                required
                                className="w-full pl-10 pr-10 py-2 bg-[#F4F8FF]/50 border border-[#C9BBA0] rounded-xl text-sm text-[#0B1120] focus:bg-[#F0E9D6] focus:outline-none focus:ring-4 focus:ring-[#4F7CFF]/10 focus:border-[#4F7CFF] shadow-2xs"
                              />
                              <button
                                type="button"
                                onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8C8272] hover:text-[#4A4236] cursor-pointer"
                              >
                                {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#382F27] mb-1 uppercase tracking-wider">
                              Confirm Password <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8272]">
                                <Lock className="w-4 h-4" />
                              </div>
                              <input
                                type={showSignUpConfirm ? "text" : "password"}
                                value={attendeeConfirmPassword}
                                onChange={(e) => {
                                  setAttendeeConfirmPassword(e.target.value);
                                  if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: "" });
                                }}
                                placeholder="••••••••"
                                required
                                className="w-full pl-10 pr-10 py-2 bg-[#F4F8FF]/50 border border-[#C9BBA0] rounded-xl text-sm text-[#0B1120] focus:bg-[#F0E9D6] focus:outline-none focus:ring-4 focus:ring-[#4F7CFF]/10 focus:border-[#4F7CFF] shadow-2xs"
                              />
                              <button
                                type="button"
                                onClick={() => setShowSignUpConfirm(!showSignUpConfirm)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8C8272] hover:text-[#4A4236] cursor-pointer"
                              >
                                {showSignUpConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ORGANIZER FIELDS */}
                    {selectedRole === "organizer" && (
                      <div className="space-y-3.5 animate-fadeIn">
                        {/* Full Name & Organization */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-[#382F27] mb-1 uppercase tracking-wider">
                              Full Name <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8272]">
                                <UserIcon className="w-4 h-4" />
                              </div>
                              <input
                                type="text"
                                value={organizerName}
                                onChange={(e) => {
                                  setOrganizerName(e.target.value);
                                  if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: "" });
                                }}
                                placeholder="e.g. Sarah Chen"
                                required
                                className="w-full pl-10 pr-3 py-2 bg-[#F4F8FF]/50 border border-[#C9BBA0] rounded-xl text-sm text-[#0B1120] focus:bg-[#F0E9D6] focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 shadow-2xs"
                              />
                            </div>
                            {fieldErrors.name && (
                              <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.name}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#382F27] mb-1 uppercase tracking-wider">
                              Organization / Company <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8272]">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <input
                                type="text"
                                value={organizerOrg}
                                onChange={(e) => {
                                  setOrganizerOrg(e.target.value);
                                  if (fieldErrors.organization)
                                    setFieldErrors({ ...fieldErrors, organization: "" });
                                }}
                                placeholder="e.g. Apex Global Live"
                                required
                                className="w-full pl-10 pr-3 py-2 bg-[#F4F8FF]/50 border border-[#C9BBA0] rounded-xl text-sm text-[#0B1120] focus:bg-[#F0E9D6] focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 shadow-2xs"
                              />
                            </div>
                            {fieldErrors.organization && (
                              <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.organization}</p>
                            )}
                          </div>
                        </div>

                        {/* Official Email & Mobile */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-[#382F27] mb-1 uppercase tracking-wider">
                              Official Email <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8272]">
                                <Mail className="w-4 h-4" />
                              </div>
                              <input
                                type="email"
                                value={organizerEmail}
                                onChange={(e) => {
                                  setOrganizerEmail(e.target.value);
                                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
                                }}
                                placeholder="director@apexevents.com"
                                required
                                className="w-full pl-10 pr-3 py-2 bg-[#F4F8FF]/50 border border-[#C9BBA0] rounded-xl text-sm text-[#0B1120] focus:bg-[#F0E9D6] focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 shadow-2xs"
                              />
                            </div>
                            {fieldErrors.email && (
                              <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.email}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#382F27] mb-1 uppercase tracking-wider">
                              Mobile Number <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8272]">
                                <Phone className="w-4 h-4" />
                              </div>
                              <input
                                type="tel"
                                value={organizerMobile}
                                onChange={(e) => {
                                  setOrganizerMobile(e.target.value);
                                  if (fieldErrors.mobile) setFieldErrors({ ...fieldErrors, mobile: "" });
                                }}
                                placeholder="+44 20 7946"
                                required
                                className="w-full pl-10 pr-3 py-2 bg-[#F4F8FF]/50 border border-[#C9BBA0] rounded-xl text-sm text-[#0B1120] focus:bg-[#F0E9D6] focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 shadow-2xs"
                              />
                            </div>
                            {fieldErrors.mobile && (
                              <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.mobile}</p>
                            )}
                          </div>
                        </div>

                        {/* Role / Position & City */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-[#382F27] mb-1 uppercase tracking-wider">
                              Role / Position <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8272]">
                                <Briefcase className="w-4 h-4" />
                              </div>
                              <input
                                type="text"
                                value={organizerPosition}
                                onChange={(e) => {
                                  setOrganizerPosition(e.target.value);
                                  if (fieldErrors.position)
                                    setFieldErrors({ ...fieldErrors, position: "" });
                                }}
                                placeholder="e.g. Operations Director"
                                required
                                className="w-full pl-10 pr-3 py-2 bg-[#F4F8FF]/50 border border-[#C9BBA0] rounded-xl text-sm text-[#0B1120] focus:bg-[#F0E9D6] focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 shadow-2xs"
                              />
                            </div>
                            {fieldErrors.position && (
                              <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.position}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#382F27] mb-1 uppercase tracking-wider">
                              City <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8272]">
                                <MapPin className="w-4 h-4" />
                              </div>
                              <input
                                type="text"
                                value={organizerCity}
                                onChange={(e) => {
                                  setOrganizerCity(e.target.value);
                                  if (fieldErrors.city) setFieldErrors({ ...fieldErrors, city: "" });
                                }}
                                placeholder="e.g. London"
                                required
                                className="w-full pl-10 pr-3 py-2 bg-[#F4F8FF]/50 border border-[#C9BBA0] rounded-xl text-sm text-[#0B1120] focus:bg-[#F0E9D6] focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 shadow-2xs"
                              />
                            </div>
                            {fieldErrors.city && (
                              <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.city}</p>
                            )}
                          </div>
                        </div>

                        {/* Password & Confirm */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-[#382F27] mb-1 uppercase tracking-wider">
                              Password <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8272]">
                                <Lock className="w-4 h-4" />
                              </div>
                              <input
                                type={showSignUpPassword ? "text" : "password"}
                                value={organizerPassword}
                                onChange={(e) => {
                                  setOrganizerPassword(e.target.value);
                                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: "" });
                                }}
                                placeholder="••••••••"
                                required
                                className="w-full pl-10 pr-10 py-2 bg-[#F4F8FF]/50 border border-[#C9BBA0] rounded-xl text-sm text-[#0B1120] focus:bg-[#F0E9D6] focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 shadow-2xs"
                              />
                              <button
                                type="button"
                                onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8C8272] hover:text-[#4A4236] cursor-pointer"
                              >
                                {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#382F27] mb-1 uppercase tracking-wider">
                              Confirm Password <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8272]">
                                <Lock className="w-4 h-4" />
                              </div>
                              <input
                                type={showSignUpConfirm ? "text" : "password"}
                                value={organizerConfirmPassword}
                                onChange={(e) => {
                                  setOrganizerConfirmPassword(e.target.value);
                                  if (fieldErrors.confirmPassword)
                                    setFieldErrors({ ...fieldErrors, confirmPassword: "" });
                                }}
                                placeholder="••••••••"
                                required
                                className="w-full pl-10 pr-10 py-2 bg-[#F4F8FF]/50 border border-[#C9BBA0] rounded-xl text-sm text-[#0B1120] focus:bg-[#F0E9D6] focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 shadow-2xs"
                              />
                              <button
                                type="button"
                                onClick={() => setShowSignUpConfirm(!showSignUpConfirm)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8C8272] hover:text-[#4A4236] cursor-pointer"
                              >
                                {showSignUpConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* OPERATOR FIELDS */}
                    {selectedRole === "operator" && (
                      <div className="space-y-3.5 animate-fadeIn">
                        {/* Full Name & Service Provider */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-[#382F27] mb-1 uppercase tracking-wider">
                              Full Name <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8272]">
                                <UserIcon className="w-4 h-4" />
                              </div>
                              <input
                                type="text"
                                value={operatorName}
                                onChange={(e) => {
                                  setOperatorName(e.target.value);
                                  if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: "" });
                                }}
                                placeholder="e.g. Marcus Vance"
                                required
                                className="w-full pl-10 pr-3 py-2 bg-[#F4F8FF]/50 border border-[#C9BBA0] rounded-xl text-sm text-[#0B1120] focus:bg-[#F0E9D6] focus:outline-none focus:ring-4 focus:ring-teal-600/10 focus:border-teal-600 shadow-2xs"
                              />
                            </div>
                            {fieldErrors.name && (
                              <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.name}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#382F27] mb-1 uppercase tracking-wider">
                              Service Provider <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8272]">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <input
                                type="text"
                                value={operatorOrg}
                                onChange={(e) => {
                                  setOperatorOrg(e.target.value);
                                  if (fieldErrors.organization)
                                    setFieldErrors({ ...fieldErrors, organization: "" });
                                }}
                                placeholder="e.g. Metropolitan Transit"
                                required
                                className="w-full pl-10 pr-3 py-2 bg-[#F4F8FF]/50 border border-[#C9BBA0] rounded-xl text-sm text-[#0B1120] focus:bg-[#F0E9D6] focus:outline-none focus:ring-4 focus:ring-teal-600/10 focus:border-teal-600 shadow-2xs"
                              />
                            </div>
                            {fieldErrors.organization && (
                              <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.organization}</p>
                            )}
                          </div>
                        </div>

                        {/* Official Email & Mobile */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-[#382F27] mb-1 uppercase tracking-wider">
                              Official Email <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8272]">
                                <Mail className="w-4 h-4" />
                              </div>
                              <input
                                type="email"
                                value={operatorEmail}
                                onChange={(e) => {
                                  setOperatorEmail(e.target.value);
                                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
                                }}
                                placeholder="ops@metrotransit.sg"
                                required
                                className="w-full pl-10 pr-3 py-2 bg-[#F4F8FF]/50 border border-[#C9BBA0] rounded-xl text-sm text-[#0B1120] focus:bg-[#F0E9D6] focus:outline-none focus:ring-4 focus:ring-teal-600/10 focus:border-teal-600 shadow-2xs"
                              />
                            </div>
                            {fieldErrors.email && (
                              <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.email}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#382F27] mb-1 uppercase tracking-wider">
                              Mobile Number <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8272]">
                                <Phone className="w-4 h-4" />
                              </div>
                              <input
                                type="tel"
                                value={operatorMobile}
                                onChange={(e) => {
                                  setOperatorMobile(e.target.value);
                                  if (fieldErrors.mobile) setFieldErrors({ ...fieldErrors, mobile: "" });
                                }}
                                placeholder="+65 6789 0123"
                                required
                                className="w-full pl-10 pr-3 py-2 bg-[#F4F8FF]/50 border border-[#C9BBA0] rounded-xl text-sm text-[#0B1120] focus:bg-[#F0E9D6] focus:outline-none focus:ring-4 focus:ring-teal-600/10 focus:border-teal-600 shadow-2xs"
                              />
                            </div>
                            {fieldErrors.mobile && (
                              <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.mobile}</p>
                            )}
                          </div>
                        </div>

                        {/* Operator Type & Operating City */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-[#382F27] mb-1 uppercase tracking-wider">
                              Operator Type <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8272]">
                                <Layers className="w-4 h-4" />
                              </div>
                              <select
                                value={operatorType}
                                onChange={(e) => {
                                  setOperatorType(e.target.value as OperatorType);
                                  if (fieldErrors.operatorType)
                                    setFieldErrors({ ...fieldErrors, operatorType: "" });
                                }}
                                required
                                className="w-full pl-10 pr-4 py-2 bg-[#F4F8FF]/50 border border-[#C9BBA0] rounded-xl text-sm text-[#0B1120] focus:bg-[#F0E9D6] focus:outline-none focus:ring-4 focus:ring-teal-600/10 focus:border-teal-600 shadow-2xs appearance-none cursor-pointer"
                              >
                                <option value="">Select Domain</option>
                                {OPERATOR_TYPES.map((t) => (
                                  <option key={t} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {fieldErrors.operatorType && (
                              <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.operatorType}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#382F27] mb-1 uppercase tracking-wider">
                              Operating City <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8272]">
                                <MapPin className="w-4 h-4" />
                              </div>
                              <input
                                type="text"
                                value={operatorCity}
                                onChange={(e) => {
                                  setOperatorCity(e.target.value);
                                  if (fieldErrors.operatingCity)
                                    setFieldErrors({ ...fieldErrors, operatingCity: "" });
                                }}
                                placeholder="e.g. Singapore"
                                required
                                className="w-full pl-10 pr-3 py-2 bg-[#F4F8FF]/50 border border-[#C9BBA0] rounded-xl text-sm text-[#0B1120] focus:bg-[#F0E9D6] focus:outline-none focus:ring-4 focus:ring-teal-600/10 focus:border-teal-600 shadow-2xs"
                              />
                            </div>
                            {fieldErrors.operatingCity && (
                              <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.operatingCity}</p>
                            )}
                          </div>
                        </div>

                        {/* Password & Confirm */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-[#382F27] mb-1 uppercase tracking-wider">
                              Password <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8272]">
                                <Lock className="w-4 h-4" />
                              </div>
                              <input
                                type={showSignUpPassword ? "text" : "password"}
                                value={operatorPassword}
                                onChange={(e) => {
                                  setOperatorPassword(e.target.value);
                                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: "" });
                                }}
                                placeholder="••••••••"
                                required
                                className="w-full pl-10 pr-10 py-2 bg-[#F4F8FF]/50 border border-[#C9BBA0] rounded-xl text-sm text-[#0B1120] focus:bg-[#F0E9D6] focus:outline-none focus:ring-4 focus:ring-teal-600/10 focus:border-teal-600 shadow-2xs"
                              />
                              <button
                                type="button"
                                onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8C8272] hover:text-[#4A4236] cursor-pointer"
                              >
                                {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#382F27] mb-1 uppercase tracking-wider">
                              Confirm Password <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8272]">
                                <Lock className="w-4 h-4" />
                              </div>
                              <input
                                type={showSignUpConfirm ? "text" : "password"}
                                value={operatorConfirmPassword}
                                onChange={(e) => {
                                  setOperatorConfirmPassword(e.target.value);
                                  if (fieldErrors.confirmPassword)
                                    setFieldErrors({ ...fieldErrors, confirmPassword: "" });
                                }}
                                placeholder="••••••••"
                                required
                                className="w-full pl-10 pr-10 py-2 bg-[#F4F8FF]/50 border border-[#C9BBA0] rounded-xl text-sm text-[#0B1120] focus:bg-[#F0E9D6] focus:outline-none focus:ring-4 focus:ring-teal-600/10 focus:border-teal-600 shadow-2xs"
                              />
                              <button
                                type="button"
                                onClick={() => setShowSignUpConfirm(!showSignUpConfirm)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8C8272] hover:text-[#4A4236] cursor-pointer"
                              >
                                {showSignUpConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Real-time Password Requirements Checklist */}
                    <div className="p-3.5 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/80 space-y-2 text-[11px]">
                      <div className="font-semibold text-[#382F27] flex items-center justify-between">
                        <span>Password Policy Checklist</span>
                        <span className="text-[10px] text-[#8C8272]">Enforced for all roles</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[#6B6252]">
                        <div
                          className={`flex items-center gap-1.5 transition-colors ${
                            currentPassCheck.minLength ? "text-emerald-700 font-semibold" : ""
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] transition-colors ${
                              currentPassCheck.minLength
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-[#C9D9F7] text-[#8C8272]"
                            }`}
                          >
                            <Check className="w-2.5 h-2.5" />
                          </span>
                          <span>Min. 8 characters</span>
                        </div>

                        <div
                          className={`flex items-center gap-1.5 transition-colors ${
                            currentPassCheck.hasUpper ? "text-emerald-700 font-semibold" : ""
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] transition-colors ${
                              currentPassCheck.hasUpper
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-[#C9D9F7] text-[#8C8272]"
                            }`}
                          >
                            <Check className="w-2.5 h-2.5" />
                          </span>
                          <span>Uppercase letter</span>
                        </div>

                        <div
                          className={`flex items-center gap-1.5 transition-colors ${
                            currentPassCheck.hasLower ? "text-emerald-700 font-semibold" : ""
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] transition-colors ${
                              currentPassCheck.hasLower
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-[#C9D9F7] text-[#8C8272]"
                            }`}
                          >
                            <Check className="w-2.5 h-2.5" />
                          </span>
                          <span>Lowercase letter</span>
                        </div>

                        <div
                          className={`flex items-center gap-1.5 transition-colors ${
                            currentPassCheck.hasNumberOrSymbol ? "text-emerald-700 font-semibold" : ""
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] transition-colors ${
                              currentPassCheck.hasNumberOrSymbol
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-[#C9D9F7] text-[#8C8272]"
                            }`}
                          >
                            <Check className="w-2.5 h-2.5" />
                          </span>
                          <span>Number or symbol</span>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSigningUp}
                        className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#0B1120] hover:bg-[#241E17] transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.99]"
                      >
                        {isSigningUp ? (
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Creating {selectedRole} Account...</span>
                          </div>
                        ) : (
                          <>
                            <span>Create Account & Continue</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-[#C9BBA0]" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Switch to Sign In */}
                  <div className="pt-2 border-t border-[#F7FAFF] text-center text-xs text-[#6B6252]">
                    Already have an EventFlow account?{" "}
                    <button
                      type="button"
                      onClick={() => handleModeChange("signin")}
                      className="font-semibold text-[#4F7CFF] hover:text-[#2D5FD2] underline cursor-pointer"
                    >
                      Sign In
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Security Banner */}
          <div className="mt-6 text-center text-xs text-[#8C8272] flex items-center justify-center gap-2">
            <LockKeyhole className="w-3.5 h-3.5 text-[#8C8272]" />
            <span>256-bit encrypted session • Local storage persistence</span>
          </div>
        </motion.div>
      </main>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {forgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1120]/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#F0E9D6] rounded-3xl border border-[#C9D9F7] shadow-2xl p-6 sm:p-7 max-w-md w-full relative"
            >
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-[#8C8272] hover:text-[#4A4236] hover:bg-[#F7FAFF] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#F7FAFF] text-[#4F7CFF] flex items-center justify-center border border-[#EDE3CB]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0B1120] font-heading">
                    Reset Your Password
                  </h3>
                  <p className="text-xs text-[#6B6252]">
                    Enter your account email to receive recovery instructions.
                  </p>
                </div>
              </div>

              {forgotFeedback ? (
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm flex items-start gap-3 border ${
                    forgotFeedback.success
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-rose-50 border-rose-200 text-rose-900"
                  }`}
                >
                  {forgotFeedback.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-3">
                    <p className="leading-relaxed">{forgotFeedback.message}</p>
                    <button
                      type="button"
                      onClick={() => setForgotModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-[#0B1120] hover:bg-[#241E17] text-white font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Return to Sign In
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#382F27] mb-1.5 uppercase tracking-wider">
                      Account Email
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full px-3.5 py-2.5 bg-[#F4F8FF]/50 border border-[#C9D9F7] rounded-xl text-sm text-[#0B1120] focus:bg-[#F0E9D6] focus:outline-none focus:ring-4 focus:ring-[#4F7CFF]/10 focus:border-[#4F7CFF]"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-[#4A4236] hover:bg-[#F7FAFF] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isResetting}
                      className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#0B1120] hover:bg-[#241E17] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isResetting ? "Processing..." : "Send Reset Link"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
