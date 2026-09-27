import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Bus,
  Train,
  Car,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Sliders,
  Sparkles,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { OrganizerLayout } from "../../components/organizer/OrganizerLayout";
import {
  getStoredEventById,
  getOrganizerEvents,
} from "../../services/eventStorageService";
import {
  getEventLiveState,
  updateTransportState,
  saveEventLiveState,
  recordOperationalAction,
} from "../../services/operationalStateService";
import { AppEvent } from "../../types/event";
import {
  EventOperationalLiveState,
  TransportOperationalState,
  TransportOperationalStatus,
} from "../../types/operational";

export const OrganizerTransportPage: React.FC = () => {
  const params = useParams<{ eventId?: string }>();
  const { user } = useAuth();

  const [events, setEvents] = useState<AppEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<AppEvent | null>(null);
  const [liveState, setLiveState] = useState<EventOperationalLiveState | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"metro" | "shuttle" | "bus" | "taxi">("shuttle");
  const [newCapacity, setNewCapacity] = useState(120);
  const [newDetail, setNewDetail] = useState("");
  const [newFrequency, setNewFrequency] = useState("Every 8 mins");

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

  const handleStatusUpdate = (transportId: string, status: TransportOperationalStatus) => {
    if (!currentEvent || !user?.name) return;
    const updated = updateTransportState(currentEvent.id, transportId, { status }, user.name);
    setLiveState({ ...updated });
    showNotice(`Operational action recorded: ${updated.transportState[transportId]?.name} set to ${status}`);
  };

  const handleDemandUpdate = (transportId: string, currentDemand: number) => {
    if (!currentEvent || !user?.name) return;
    const updated = updateTransportState(currentEvent.id, transportId, { currentDemand }, user.name);
    setLiveState({ ...updated });
  };

  const handleAddTransport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent || !liveState || !user?.name || !newTitle.trim()) return;

    const id = `trans-${Date.now()}-${newType}`;
    const newTrans: TransportOperationalState = {
      id,
      name: newTitle.trim(),
      type: newType,
      capacity: newCapacity,
      currentDemand: Math.round(newCapacity * 0.4),
      status: "NORMAL",
      pickupDropLocation: newDetail.trim() || "Perimeter transit terminal",
      operatingWindow: "06:00 - 23:30 IST",
      notes: newFrequency,
    };

    liveState.transportState[id] = newTrans;
    saveEventLiveState(liveState);

    recordOperationalAction(currentEvent.id, {
      action: `Added new transit route: ${newTitle}`,
      resource: newTitle,
      user: user.name,
      newState: "NORMAL",
    });

    setLiveState({ ...liveState });
    setIsAddModalOpen(false);
    setNewTitle("");
    setNewDetail("");
    showNotice(`Operational action recorded: Added transit service "${newTrans.name}"`);
  };

  if (events.length === 0) {
    return (
      <OrganizerLayout pageTitle="Transport & Transit Operations">
        <div className="p-12 text-center bg-[#F0E9D6] rounded-3xl border border-[#C9D9F7] shadow-2xs font-sans space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F7FAFF] text-[#4F7CFF] flex items-center justify-center mx-auto">
            <Bus className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#0B1120] font-heading">No Events Found</h3>
            <p className="text-xs text-[#6B6252] mt-1">
              Create an event to configure transit routes, monitor shuttle fleets, and optimize arrival flows.
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
      <OrganizerLayout pageTitle="Transport & Transit Operations">
        <div className="p-12 text-center bg-[#F0E9D6] rounded-3xl border border-[#C9D9F7] shadow-2xs font-sans">
          <p className="text-sm text-[#6B6252]">Loading transit telemetry...</p>
        </div>
      </OrganizerLayout>
    );
  }

  const transportList = Object.values(liveState.transportState || {});

  return (
    <OrganizerLayout
      activeEvent={currentEvent}
      pageTitle={`Transport Management: ${currentEvent.name}`}
      pageSubtitle="Supervise metro connectivity, shuttle fleets, taxi hubs, and arrival corridors."
      pageBadge="Transit Operations"
      actions={
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white shadow-2xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transit Service</span>
        </button>
      }
    >
      <div className="space-y-8 font-sans">
        {/* Action Notice */}
        {actionNotice && (
          <div className="p-4 rounded-2xl bg-[#0B1120] text-white shadow-xl flex items-center justify-between gap-3 border border-[#241E17] animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-xs text-[#8C8272] hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Transport List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {transportList.map((t) => {
            const loadPercent =
              t.capacity > 0 ? Math.min(100, Math.round((t.currentDemand / t.capacity) * 100)) : 0;

            return (
              <div
                key={t.id}
                className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-[#F7FAFF] text-[#4F7CFF]">
                        {t.type === "metro" ? (
                          <Train className="w-5 h-5" />
                        ) : t.type === "taxi" ? (
                          <Car className="w-5 h-5" />
                        ) : (
                          <Bus className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-[#0B1120] font-heading">{t.name}</h4>
                        <span className="text-[10px] uppercase font-mono font-bold text-[#8C8272]">
                          {t.type} service • {t.notes || "Continuous"}
                        </span>
                      </div>
                    </div>

                    {/* Status selector */}
                    <select
                      value={t.status}
                      onChange={(e) => handleStatusUpdate(t.id, e.target.value as any)}
                      className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer appearance-none shadow-2xs ${
                        t.status === "NORMAL" || t.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : t.status === "ELEVATED"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : t.status === "DISRUPTED" || t.status === "DELAYED"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-[#F7FAFF] text-[#382F27] border-[#C9BBA0]"
                      }`}
                    >
                      <option value="NORMAL">NORMAL</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="ELEVATED">ELEVATED</option>
                      <option value="DISRUPTED">DISRUPTED</option>
                      <option value="DELAYED">DELAYED</option>
                      <option value="STANDBY">STANDBY</option>
                    </select>
                  </div>

                  {/* Route & Location details */}
                  <div className="p-3.5 rounded-2xl bg-[#F4F8FF] border border-[#F7FAFF] text-xs space-y-1">
                    <div className="text-[10px] font-mono uppercase font-bold text-[#8C8272]">
                      Route / Stop Location
                    </div>
                    <p className="text-[#382F27] font-semibold">{t.pickupDropLocation}</p>
                  </div>

                  {/* Demand vs Capacity Meter */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#6B6252] font-medium">Transit Load:</span>
                      <span className="font-mono font-bold text-[#241E17]">
                        {t.currentDemand} / {t.capacity} pax ({loadPercent}%)
                      </span>
                    </div>

                    <div className="w-full bg-[#F7FAFF] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          loadPercent > 85
                            ? "bg-rose-500"
                            : loadPercent > 65
                            ? "bg-blue-500"
                            : "bg-[#4F7CFF]"
                        }`}
                        style={{ width: `${loadPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Demand Quick Adjuster */}
                <div className="pt-3 border-t border-[#F7FAFF] flex items-center justify-between text-xs">
                  <span className="text-[#6B6252] font-bold">Update Live Demand:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDemandUpdate(t.id, Math.max(0, t.currentDemand - 20))}
                      className="px-2.5 py-1 rounded-lg bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#382F27] font-mono font-bold"
                    >
                      -20
                    </button>
                    <button
                      onClick={() => handleDemandUpdate(t.id, Math.min(t.capacity, t.currentDemand + 20))}
                      className="px-2.5 py-1 rounded-lg bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#382F27] font-mono font-bold"
                    >
                      +20
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Transit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="w-full max-w-lg bg-[#F0E9D6] rounded-3xl shadow-2xl border border-[#C9D9F7] p-6 sm:p-8 space-y-5">
            <div>
              <h3 className="text-base font-bold text-[#0B1120] font-heading">
                Add Transit / Shuttle Service
              </h3>
              <p className="text-xs text-[#6B6252] mt-0.5">
                Register a new transit route or specialized shuttle corridor.
              </p>
            </div>

            <form onSubmit={handleAddTransport} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#382F27] mb-1">Transit Service Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Express Shuttle (Gate 2 to North Deck)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#C9D9F7] focus:ring-1 focus:ring-[#4F7CFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#382F27] mb-1">Transit Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#C9D9F7] bg-[#F0E9D6]"
                  >
                    <option value="shuttle">Shuttle Fleet</option>
                    <option value="metro">Metro Line</option>
                    <option value="bus">City Bus</option>
                    <option value="taxi">Taxi / Rideshare</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#382F27] mb-1">Capacity (pax/trip)</label>
                  <input
                    type="number"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(parseInt(e.target.value, 10) || 50)}
                    className="w-full px-3 py-2 rounded-xl border border-[#C9D9F7] font-mono focus:ring-1 focus:ring-[#4F7CFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#382F27] mb-1">Pickup / Drop Terminal *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. East Transport Bay Terminal 3"
                  value={newDetail}
                  onChange={(e) => setNewDetail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#C9D9F7] focus:ring-1 focus:ring-[#4F7CFF]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#382F27] mb-1">Frequency / Schedule</label>
                <input
                  type="text"
                  placeholder="e.g. Departs every 6 mins"
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#C9D9F7] focus:ring-1 focus:ring-[#4F7CFF]"
                />
              </div>

              <div className="pt-3 border-t border-[#F7FAFF] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#4A4236] hover:bg-[#F7FAFF] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white font-bold shadow-2xs"
                >
                  Save Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </OrganizerLayout>
  );
};
