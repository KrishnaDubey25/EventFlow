import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  CheckCircle2,
  Shield,
  Bell,
  Heart,
  Accessibility,
  LogOut,
  Sparkles,
} from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const AttendeeProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName || user?.name || "");
  const [phone, setPhone] = useState(user?.mobile || "+91 98200 12345");
  const [preferredCity, setPreferredCity] = useState("Mumbai");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Preference toggles (saved to user profile)
  const [categories, setCategories] = useState<string[]>([
    "Sports",
    "Concerts",
    "Conferences",
  ]);
  const [gateAlerts, setGateAlerts] = useState(true);
  const [transitAlerts, setTransitAlerts] = useState(true);
  const [accessibilityAssistance, setAccessibilityAssistance] = useState(false);

  const toggleCategory = (cat: string) => {
    if (categories.includes(cat)) {
      setCategories(categories.filter((c) => c !== cat));
    } else {
      setCategories([...categories, cat]);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg("Full name cannot be empty.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");
    setSaveSuccess(false);

    try {
      const res = await updateProfile({
        fullName: fullName.trim(),
        name: fullName.trim(),
        mobile: phone.trim(),
      });

      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setErrorMsg(res.error || "Failed to update profile.");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate("/signin", { replace: true });
  };

  return (
    <AppLayout pageTitle="Attendee Profile" pageBadge="Account & Preferences">
      <div className="max-w-4xl mx-auto space-y-8 pb-20 font-sans">
        {/* Header Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0B1120] font-heading">
              Attendee Profile & Journey Preferences
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6252] mt-1">
              Manage your personal credentials, communication alerts, and on-site accessibility needs.
            </p>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Success / Error Messages */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile successfully updated and saved to your account.</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Account Identity Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl text-white font-bold text-xl flex items-center justify-center shadow-md shrink-0"
              style={{ backgroundColor: user?.avatarColor || "#4F7CFF" }}
            >
              {user?.initials || "EF"}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0B1120] font-heading">
                {user?.fullName || user?.name || "Attendee User"}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B6252] mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#8C8272]" />
                  <span>{user?.email}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F7FAFF] text-[#2D5FD2] font-mono text-[10px] font-bold uppercase border border-[#EDE3CB]">
                  Role: {user?.role || "attendee"}
                </span>
              </div>
            </div>
          </div>

          {/* Personal Info Edit Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4 pt-4 border-t border-[#F7FAFF]">
            <h3 className="text-sm font-bold text-[#0B1120] font-heading">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#382F27]">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8C8272] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7] text-xs text-[#241E17] focus:outline-none focus:border-[#4F7CFF] focus:bg-[#F0E9D6]"
                    placeholder="Your Full Legal Name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#382F27]">Email Address (Read-only)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8C8272] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F7FAFF] border border-[#C9D9F7] text-xs text-[#6B6252] cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#382F27]">Phone Number (For Gate Alerts)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8C8272] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7] text-xs text-[#241E17] focus:outline-none focus:border-[#4F7CFF] focus:bg-[#F0E9D6]"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#382F27]">Primary Event City</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#8C8272] absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={preferredCity}
                    onChange={(e) => setPreferredCity(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7] text-xs text-[#241E17] focus:outline-none focus:border-[#4F7CFF] focus:bg-[#F0E9D6] cursor-pointer"
                  >
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Chennai">Chennai</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white font-bold text-xs transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Event Interests & Notification Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Favorite Categories */}
          <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="w-4.5 h-4.5 text-rose-500" />
              <h3 className="text-sm font-bold text-[#0B1120] font-heading">
                Preferred Event Categories
              </h3>
            </div>
            <p className="text-xs text-[#6B6252]">
              Select categories to personalize discover recommendations on your dashboard.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {["Sports", "Concerts", "Conferences", "Festivals"].map((cat) => {
                const isSelected = categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#4F7CFF] text-white shadow-2xs font-bold"
                        : "bg-[#F7FAFF] text-[#4A4236] hover:bg-[#C9D9F7]"
                    }`}
                  >
                    {isSelected ? `✓ ${cat}` : `+ ${cat}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-time Journey Notifications */}
          <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4.5 h-4.5 text-[#4F7CFF]" />
              <h3 className="text-sm font-bold text-[#0B1120] font-heading">
                Journey Notifications
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-[#F4F8FF] border border-[#F7FAFF] cursor-pointer">
                <div>
                  <span className="font-bold text-[#0B1120] block">Gate & Arrival Alerts</span>
                  <span className="text-[#6B6252]">Notify 2 hours prior with queue estimates</span>
                </div>
                <input
                  type="checkbox"
                  checked={gateAlerts}
                  onChange={(e) => setGateAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-[#4F7CFF] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-[#F4F8FF] border border-[#F7FAFF] cursor-pointer">
                <div>
                  <span className="font-bold text-[#0B1120] block">Public Transit Updates</span>
                  <span className="text-[#6B6252]">Nearest metro and shuttle status</span>
                </div>
                <input
                  type="checkbox"
                  checked={transitAlerts}
                  onChange={(e) => setTransitAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-[#4F7CFF] cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Accessibility & Special Assistance */}
        <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <Accessibility className="w-4.5 h-4.5 text-indigo-600" />
            <h3 className="text-sm font-bold text-[#0B1120] font-heading">
              Accessibility Services
            </h3>
          </div>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 cursor-pointer text-xs">
            <div>
              <span className="font-bold text-indigo-950 block">Assisted Ingress & Wheelchair Transfer</span>
              <span className="text-indigo-800">Assign step-free turnstiles and notify station stewards upon arrival</span>
            </div>
            <input
              type="checkbox"
              checked={accessibilityAssistance}
              onChange={(e) => setAccessibilityAssistance(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </AppLayout>
  );
};
