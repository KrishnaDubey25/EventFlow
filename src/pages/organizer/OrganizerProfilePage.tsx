import React, { useState, useEffect } from "react";
import {
  UserCheck,
  Building,
  Mail,
  Phone,
  MapPin,
  Shield,
  Save,
  Check,
  Award,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { OrganizerLayout } from "../../components/organizer/OrganizerLayout";
import { getOrganizerEvents } from "../../services/eventStorageService";
import { AppEvent } from "../../types/event";

export const OrganizerProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [city, setCity] = useState("");
  const [avatarColor, setAvatarColor] = useState("#4F7CFF");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [events, setEvents] = useState<AppEvent[]>([]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setOrganization((user as any).organization || "Event Operations Command");
      setEmail(user.email || "");
      setMobile(user.mobile || "");
      setRoleTitle((user as any).position || "Head of Event Operations");
      setCity((user as any).city || "Mumbai, India");
      setAvatarColor(user.avatarColor || "#4F7CFF");

      const orgEvents = getOrganizerEvents(user.id);
      setEvents(orgEvents);
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    await updateProfile({
      name,
      mobile,
      avatarColor,
      organization,
      position: roleTitle,
      city,
    } as any);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const AVATAR_COLORS = ["#4F7CFF", "#0284C7", "#059669", "#D97706", "#DC2626", "#7C3AED", "#0B1120"];

  return (
    <OrganizerLayout
      pageTitle="Organizer Profile & Credentials"
      pageSubtitle="Manage your official organization profile, security credentials, and contact data."
      pageBadge="Official Identity"
    >
      <div className="max-w-4xl space-y-8 font-sans">
        {/* Profile Card Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center font-heading font-bold text-2xl text-white shadow-md shadow-[#4F7CFF]/10 shrink-0"
              style={{ backgroundColor: avatarColor }}
            >
              {user?.initials || name.substring(0, 2).toUpperCase() || "EF"}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-[#0B1120] font-heading">{name}</h2>
                <span className="p-1 rounded-full bg-[#F7FAFF] text-[#4F7CFF]" title="Verified Organizer">
                  <Shield className="w-4 h-4 fill-current" />
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-[#4A4236] flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#8C8272]" />
                <span>{organization}</span>
              </p>
              <span className="inline-block text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#F7FAFF] text-[#2D5FD2] border border-[#C9D9F7]/80">
                ROLE: {user?.role.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-[#F7FAFF] w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-mono font-bold text-[#8C8272] block">
                Managed Events
              </span>
              <span className="text-xl font-bold font-mono text-[#0B1120]">{events.length}</span>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-mono font-bold text-[#8C8272] block">
                Auth ID
              </span>
              <span className="text-xs font-mono font-bold text-[#4A4236]">{user?.id}</span>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#F7FAFF]">
            <div>
              <h3 className="text-base font-bold text-[#0B1120] font-heading">
                Operational Contact Details
              </h3>
              <p className="text-xs text-[#6B6252] mt-0.5">
                These contact details are published to emergency services and event staff.
              </p>
            </div>

            {saveSuccess && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shadow-2xs">
                <Check className="w-4 h-4" />
                <span>Profile Updated!</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block font-bold text-[#382F27] mb-1.5">Official Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9D9F7] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#382F27] mb-1.5">Organization / Entity *</label>
                <input
                  type="text"
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9D9F7] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#382F27] mb-1.5">Official Email</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9D9F7] bg-[#F4F8FF] text-[#6B6252] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-[#382F27] mb-1.5">Direct Mobile Line</label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9D9F7] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF] font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-[#382F27] mb-1.5">Operational Position / Title</label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9D9F7] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#382F27] mb-1.5">Headquarters City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9D9F7] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-[#382F27] mb-2">Avatar Brand Accent</label>
                <div className="flex items-center gap-3">
                  {AVATAR_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setAvatarColor(col)}
                      className={`w-8 h-8 rounded-full transition-transform cursor-pointer ${
                        avatarColor === col ? "ring-2 ring-[#4F7CFF] ring-offset-2 scale-110" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F7FAFF] flex items-center justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white font-bold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </OrganizerLayout>
  );
};
