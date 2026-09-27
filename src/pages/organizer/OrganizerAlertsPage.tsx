import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BellRing,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Plus,
  Send,
  Trash2,
  Clock,
  Users,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { OrganizerLayout } from "../../components/organizer/OrganizerLayout";
import {
  getStoredEventById,
  getOrganizerEvents,
} from "../../services/eventStorageService";
import {
  getEventLiveState,
  createOperationalAlert,
  resolveOperationalAlert,
} from "../../services/operationalStateService";
import { AppEvent } from "../../types/event";
import {
  EventOperationalLiveState,
  OperationalAlert,
  AlertSeverity,
  AlertAudience,
} from "../../types/operational";

export const OrganizerAlertsPage: React.FC = () => {
  const params = useParams<{ eventId?: string }>();
  const { user } = useAuth();

  const [events, setEvents] = useState<AppEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<AppEvent | null>(null);
  const [liveState, setLiveState] = useState<EventOperationalLiveState | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Form State
  const [alertType, setAlertType] = useState("Gate Advisory");
  const [severity, setSeverity] = useState<AlertSeverity>("WARNING");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [affectedResource, setAffectedResource] = useState("");
  const [audience, setAudience] = useState<AlertAudience>("All");

  useEffect(() => {
    if (user?.id) {
      const orgEvents = getOrganizerEvents(user.id);
      setEvents(orgEvents);

      if (orgEvents.length === 0) {
        setCurrentEvent(null);
        setLiveState(null);
        return;
      }

      const targetId = params.eventId || orgEvents[0]?.id;
      const evt = orgEvents.find((e) => e.id === targetId) || orgEvents[0];

      if (evt) {
        setCurrentEvent(evt);
        const state = getEventLiveState(evt.id, evt);
        setLiveState(state);
      }
    }
  }, [user?.id, params.eventId]);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handlePublishAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent || !user?.name || !title.trim() || !message.trim()) return;

    const newAlert = createOperationalAlert({
      eventId: currentEvent.id,
      alertType,
      severity,
      title: title.trim(),
      message: message.trim(),
      affectedArea: affectedResource.trim() || "Event Precinct",
      audience,
      startTime: new Date().toISOString(),
      createdBy: user.name,
    });

    // Refresh state
    const updatedState = getEventLiveState(currentEvent.id);
    setLiveState({ ...updatedState });

    // Reset form
    setTitle("");
    setMessage("");
    setAffectedResource("");
    showNotice(`Operational Alert "${newAlert.title}" broadcasted to ${audience}.`);
  };

  const handleResolveAlert = (alertId: string) => {
    if (!currentEvent || !user?.name) return;
    const updated = resolveOperationalAlert(currentEvent.id, alertId, user.name);
    setLiveState({ ...updated });
    showNotice(`Operational alert marked as resolved.`);
  };

  if (events.length === 0) {
    return (
      <OrganizerLayout pageTitle="Alert Center">
        <div className="p-12 text-center bg-[#F0E9D6] rounded-3xl border border-[#C9D9F7] shadow-2xs font-sans space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <BellRing className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#0B1120] font-heading">No Events Found</h3>
            <p className="text-xs text-[#6B6252] mt-1">
              Create an event in the Event Operations manager to issue live broadcasts and safety advisories.
            </p>
          </div>
          <Link
            to="/operations/events"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#4F7CFF] text-white hover:bg-[#2D5FD2] shadow-2xs"
          >
            <span>Go to Events Manager</span>
          </Link>
        </div>
      </OrganizerLayout>
    );
  }

  if (!currentEvent || !liveState) {
    return (
      <OrganizerLayout pageTitle="Alert Center">
        <div className="p-12 text-center bg-[#F0E9D6] rounded-3xl border border-[#C9D9F7] shadow-2xs font-sans">
          <p className="text-sm text-[#6B6252]">Loading alert center...</p>
        </div>
      </OrganizerLayout>
    );
  }

  const activeAlerts = liveState.activeAlerts || [];

  return (
    <OrganizerLayout
      activeEvent={currentEvent}
      pageTitle={`Alert Center: ${currentEvent.name}`}
      pageSubtitle="Broadcast official operational advisories, lane diversions, transit alerts, and safety notices."
      pageBadge="Alert Center"
    >
      <div className="space-y-8 font-sans">
        {/* Notice */}
        {actionNotice && (
          <div className="p-4 rounded-2xl bg-[#0B1120] text-white shadow-xl flex items-center justify-between gap-3 border border-[#241E17] animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-xs text-[#8C8272] hover:text-white">
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 1 Col: Publish Alert Form */}
          <div className="rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs p-6 sm:p-7 space-y-5">
            <div>
              <h3 className="text-base font-bold text-[#0B1120] font-heading flex items-center gap-2">
                <BellRing className="w-5 h-5 text-[#4F7CFF]" />
                <span>Publish Operational Alert</span>
              </h3>
              <p className="text-xs text-[#6B6252] mt-0.5">
                Targeted or global broadcast synchronized to shared event state.
              </p>
            </div>

            <form onSubmit={handlePublishAlert} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#382F27] mb-1">Alert Category</label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#C9D9F7] bg-[#F0E9D6] focus:ring-1 focus:ring-[#4F7CFF]"
                >
                  <option value="Gate Advisory">Gate Advisory & Fast-Track</option>
                  <option value="Transit Advisory">Transit Advisory & Route Diversion</option>
                  <option value="Parking Update">Parking Inventory Update</option>
                  <option value="Weather Advisory">Weather & Environmental Advisory</option>
                  <option value="Schedule Change">Agenda & Keynote Update</option>
                  <option value="Security Broadcast">Security & Safety Advisory</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#382F27] mb-1">Severity Level</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["INFO", "NOTICE", "WARNING", "CRITICAL"] as AlertSeverity[]).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverity(sev)}
                      className={`py-1.5 rounded-xl font-mono text-[10px] font-bold transition-all cursor-pointer ${
                        severity === sev
                          ? sev === "CRITICAL"
                            ? "bg-rose-600 text-white shadow-2xs"
                            : sev === "WARNING"
                            ? "bg-blue-600 text-white shadow-2xs"
                            : sev === "NOTICE"
                            ? "bg-[#4F7CFF] text-white shadow-2xs"
                            : "bg-[#2D5FD2] text-white shadow-2xs"
                          : "bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#382F27]"
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#382F27] mb-1">Headline / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Turnstiles at Gate 2 diverted to Gate 1 Fast-Track"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#C9D9F7] focus:ring-1 focus:ring-[#4F7CFF]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#382F27] mb-1">Detailed Message *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide explicit instructions for attendees or operational ground teams..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#C9D9F7] focus:ring-1 focus:ring-[#4F7CFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#382F27] mb-1">Affected Area</label>
                  <input
                    type="text"
                    placeholder="e.g. Gate 2, West Ingress"
                    value={affectedResource}
                    onChange={(e) => setAffectedResource(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#C9D9F7] focus:ring-1 focus:ring-[#4F7CFF]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#382F27] mb-1">Target Audience</label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as AlertAudience)}
                    className="w-full px-3 py-2 rounded-xl border border-[#C9D9F7] bg-[#F0E9D6] focus:ring-1 focus:ring-[#4F7CFF]"
                  >
                    <option value="All">All Audiences</option>
                    <option value="Attendees">Attendees Only</option>
                    <option value="Operators">Operators & Staff</option>
                    <option value="Organizer">Organizer Internal</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white font-bold flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Broadcast Operational Alert</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right 2 Cols: Active & Historical Alerts Stream */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0B1120] font-heading">
                  Active Operational Advisories ({activeAlerts.length})
                </h3>
                <p className="text-xs text-[#6B6252] mt-0.5">
                  Live notifications currently broadcasted across attendee and operations screens.
                </p>
              </div>
            </div>

            {activeAlerts.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-[#0B1120] font-heading">No Active Alerts</h4>
                <p className="text-xs text-[#6B6252] max-w-sm mx-auto">
                  All systems are running normally. Use the form on the left to broadcast an advisory if conditions change.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-5 rounded-3xl bg-[#F0E9D6] border shadow-2xs space-y-3 transition-all ${
                      alert.severity === "CRITICAL"
                        ? "border-rose-300 ring-1 ring-rose-500/20"
                        : alert.severity === "WARNING"
                        ? "border-blue-300"
                        : "border-[#C9D9F7]/90"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            alert.severity === "CRITICAL"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : alert.severity === "WARNING"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : alert.severity === "NOTICE"
                              ? "bg-[#F7FAFF] text-[#2D5FD2] border border-[#C9D9F7]"
                              : "bg-[#F7FAFF] text-[#2D5FD2] border border-[#C9D9F7]"
                          }`}
                        >
                          {alert.severity}
                        </span>

                        <span className="text-xs font-bold text-[#4A4236]">
                          {alert.alertType}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F7FAFF] text-[#4A4236] border border-[#C9D9F7]">
                          Audience: {alert.audience}
                        </span>
                        <span className="text-[10px] text-[#8C8272] font-mono">
                          {new Date(alert.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-[#0B1120] font-heading">{alert.title}</h4>
                      <p className="text-xs text-[#4A4236] leading-relaxed font-medium">{alert.message}</p>
                    </div>

                    <div className="pt-2 border-t border-[#F7FAFF] flex items-center justify-between text-[11px]">
                      <span className="text-[#6B6252]">
                        Target Area:{" "}
                        <span className="font-bold text-[#241E17]">
                          {alert.affectedGate || alert.affectedArea || "Entire Precinct"}
                        </span>
                      </span>

                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-emerald-200 shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolve Alert</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </OrganizerLayout>
  );
};
