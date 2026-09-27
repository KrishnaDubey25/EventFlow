import React, { useState } from "react";
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Layers,
  Calendar,
  Sparkles,
} from "lucide-react";
import { OperatorLayout } from "../../components/operator/OperatorLayout";
import { useAuth } from "../../context/AuthContext";
import { OperatorUser, OperatorType } from "../../types/auth";
import {
  getOperatorEvents,
  getOperatorAssignedResources,
  getOperatorActionLogs,
} from "../../services/operatorAssignmentService";

const OPERATOR_TYPES: OperatorType[] = [
  "Accommodation",
  "Transport",
  "Parking",
  "Food & Dining",
  "Medical & Assistance",
  "Venue Services",
  "Other Services",
];

export const OperatorProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const operatorUser = user as OperatorUser | null;
  const operatorId = user?.id || "";

  const [fullName, setFullName] = useState(operatorUser?.fullName || operatorUser?.name || "");
  const [organization, setOrganization] = useState(operatorUser?.organization || "");
  const [mobile, setMobile] = useState(operatorUser?.mobile || "");
  const [operatingCity, setOperatingCity] = useState(operatorUser?.operatingCity || "");
  const [operatorType, setOperatorType] = useState<OperatorType>(
    operatorUser?.operatorType || "Transport"
  );

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ msg: string; isError?: boolean } | null>(null);

  const assignedEvents = getOperatorEvents(operatorId);
  const assignedResources = getOperatorAssignedResources(operatorId);
  const actionLogs = getOperatorActionLogs(operatorId);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !organization.trim()) {
      setFeedback({ msg: "Full Name and Organization are required.", isError: true });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    const res = await updateProfile({
      fullName: fullName.trim(),
      organization: organization.trim(),
      mobile: mobile.trim(),
      operatingCity: operatingCity.trim(),
      operatorType,
    });

    setIsSaving(false);

    if (res.success) {
      setFeedback({ msg: "Operator profile updated successfully." });
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ msg: res.error || "Failed to update profile.", isError: true });
    }
  };

  return (
    <OperatorLayout
      title="Operator Profile"
      subtitle="View your operational credentials, specialty sector, and organization details."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7] p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#F7FAFF]">
              <div>
                <h3 className="text-base font-bold text-[#0B1120] font-heading">Personal & Service Information</h3>
                <p className="text-xs text-[#6B6252]">
                  Update your contact details and operating parameters.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-[#F7FAFF] text-[#2D5FD2] border border-[#C9D9F7] text-xs font-bold">
                OPERATOR ACCESS
              </span>
            </div>

            {feedback && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  feedback.isError
                    ? "bg-rose-50 text-rose-800 border border-rose-200"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                }`}
              >
                {feedback.isError ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span>{feedback.msg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#382F27] block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8C8272] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-lg text-sm text-[#0B1120] focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF] font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Organization */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#382F27] block mb-1">
                  Service Provider / Organization
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#8C8272] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-lg text-sm text-[#0B1120] focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF] font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Email (Read Only) */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#382F27] block mb-1">
                  Official Email (Account ID)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8C8272] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={operatorUser?.email || ""}
                    disabled
                    className="w-full pl-9 pr-3 py-2 bg-[#F7FAFF] border border-[#C9D9F7] rounded-lg text-sm text-[#6B6252] cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#382F27] block mb-1">
                  Contact Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8C8272] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-lg text-sm text-[#0B1120] focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF]"
                  />
                </div>
              </div>

              {/* Operator Type Specialty */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#382F27] block mb-1">
                  Specialty Sector / Operator Type
                </label>
                <select
                  value={operatorType}
                  onChange={(e) => setOperatorType(e.target.value as OperatorType)}
                  className="w-full px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-lg text-sm text-[#0B1120] focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF] font-semibold"
                >
                  {OPERATOR_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Operating City */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#382F27] block mb-1">
                  Base Operating City
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#8C8272] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={operatingCity}
                    onChange={(e) => setOperatingCity(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-lg text-sm text-[#0B1120] focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF] font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F7FAFF] flex items-center justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F7CFF] hover:bg-[#4F7CFF] text-white text-xs font-bold transition-all shadow-xs shadow-[#4F7CFF]/20 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving..." : "Save Profile Changes"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Credentials & Shift Stats */}
        <div className="space-y-6">
          {/* Identity Badge */}
          <div className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7] p-6 shadow-xs text-center">
            <div
              className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-2xl shadow-xs"
              style={{ backgroundColor: operatorUser?.avatarColor || "#4F7CFF" }}
            >
              {operatorUser?.initials || "OP"}
            </div>
            <h3 className="text-base font-bold text-[#0B1120] mt-3 font-heading">
              {operatorUser?.fullName || operatorUser?.name}
            </h3>
            <p className="text-xs text-[#6B6252] font-medium">{operatorUser?.organization}</p>

            <div className="mt-4 pt-4 border-t border-[#F7FAFF] space-y-2 text-left text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#6B6252]">System Role</span>
                <span className="font-bold text-[#2D5FD2] uppercase">Operator</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B6252]">Security Clearance</span>
                <span className="font-semibold text-[#241E17]">Resource Level</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B6252]">Account ID</span>
                <span className="font-mono text-[#4A4236] text-[11px] truncate max-w-[140px]">
                  {operatorId}
                </span>
              </div>
            </div>
          </div>

          {/* Operational Scope Stats */}
          <div className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7] p-6 shadow-xs">
            <h4 className="text-sm font-bold text-[#0B1120] pb-3 border-b border-[#F7FAFF] font-heading">
              Shift Activity Overview
            </h4>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF] text-center">
                <span className="text-2xl font-bold text-[#0B1120] block">{assignedEvents.length}</span>
                <span className="text-[11px] font-semibold text-[#6B6252]">Assigned Events</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF] text-center">
                <span className="text-2xl font-bold text-[#4F7CFF] block">{assignedResources.length}</span>
                <span className="text-[11px] font-semibold text-[#6B6252]">Live Resources</span>
              </div>
              <div className="col-span-2 p-3 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF] text-center">
                <span className="text-2xl font-bold text-indigo-600 block">{actionLogs.length}</span>
                <span className="text-[11px] font-semibold text-[#6B6252]">Actions Broadcasted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OperatorLayout>
  );
};
