import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Building2,
  Briefcase,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { OrganizerUser } from "../types/auth";
import { AppLayout } from "../components/layout/AppLayout";

export const OperationsPlaceholderPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/signin", { replace: true });
  };

  const organizer = user?.role === "organizer" ? (user as OrganizerUser) : null;

  return (
    <AppLayout pageTitle="Operations Overview" pageBadge="Organizer Command">
      <div className="max-w-4xl mx-auto py-4 sm:py-8 flex flex-col items-center justify-center text-center">
        <div className="w-full bg-[#F0E9D6] rounded-3xl border border-[#0B1120]/8 shadow-[0_12px_40px_-10px_rgba(10,17,40,0.06)] p-8 sm:p-12 relative overflow-hidden">
          {/* Top ambient highlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-2 bg-gradient-to-r from-indigo-500 via-[#4F7CFF] to-indigo-600 rounded-full" />

          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mx-auto mb-6 shadow-xs">
            <Shield className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-4 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Authentication & Role Routing Verified</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1120] font-heading mb-3">
            Operations & Incident Command Center
          </h1>
          <p className="text-sm sm:text-base text-[#4A4236] max-w-xl mx-auto leading-relaxed mb-6">
            Welcome, <span className="font-semibold text-[#0B1120]">{user?.name}</span>. You are securely authenticated as an <span className="font-semibold text-indigo-700">Organizer</span>.
          </p>

          {/* Registered Organizer Profile Attributes */}
          <div className="bg-[#F4F8FF]/80 border border-[#C9D9F7] rounded-2xl p-5 mb-8 text-left max-w-xl mx-auto">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272] mb-3 font-mono">
              Verified Organizer Credentials
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#4A4236]">
                <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Org: <strong className="text-[#241E17]">{organizer?.organization || "Apex Global Events"}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-[#4A4236]">
                <Briefcase className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Role: <strong className="text-[#241E17]">{organizer?.position || "Operations Lead"}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-[#4A4236]">
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>City: <strong className="text-[#241E17]">{organizer?.city || "London"}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-[#4A4236]">
                <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Email: <strong className="text-[#241E17] truncate">{organizer?.email}</strong></span>
              </div>
              {organizer?.mobile && (
                <div className="flex items-center gap-2 text-[#4A4236] sm:col-span-2">
                  <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Mobile: <strong className="text-[#241E17]">{organizer.mobile}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Phase Notice */}
          <div className="bg-[#F4F8FF] border border-[#C9D9F7] rounded-2xl p-5 text-left mb-8 max-w-xl mx-auto">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#241E17] uppercase tracking-wider mb-2 font-mono">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Organizer Roadmap</span>
            </div>
            <p className="text-xs text-[#4A4236] leading-relaxed">
              Attendee Event Discovery, Live Command Center, Crowd density heatmaps, and Dispatch modules are active.
            </p>
          </div>

          {/* Action links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-[#382F27] bg-[#F7FAFF] hover:bg-[#C9D9F7] transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Homepage</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#0B1120] hover:bg-[#241E17] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
