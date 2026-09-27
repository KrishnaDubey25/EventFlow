import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Car,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Sliders,
  MapPin,
  TrendingUp,
  DollarSign,
  Bus,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { OrganizerLayout } from "../../components/organizer/OrganizerLayout";
import {
  getStoredEventById,
  getOrganizerEvents,
} from "../../services/eventStorageService";
import {
  getEventLiveState,
  updateParkingState,
  saveEventLiveState,
  recordOperationalAction,
} from "../../services/operationalStateService";
import { AppEvent } from "../../types/event";
import {
  EventOperationalLiveState,
  ParkingOperationalState,
  ParkingOperationalStatus,
} from "../../types/operational";

export const OrganizerParkingPage: React.FC = () => {
  const params = useParams<{ eventId?: string }>();
  const { user } = useAuth();

  const [events, setEvents] = useState<AppEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<AppEvent | null>(null);
  const [liveState, setLiveState] = useState<EventOperationalLiveState | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [newTotalSpaces, setNewTotalSpaces] = useState(400);
  const [newFee, setNewFee] = useState("₹200 / day");
  const [newDistance, setNewDistance] = useState("400m (5 min walk)");
  const [newRoute, setNewRoute] = useState("Direct approach via West Gate Boulevard");

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

  const handleUpdateParking = (
    parkingId: string,
    updates: Partial<ParkingOperationalState>
  ) => {
    if (!currentEvent || !user?.name) return;
    setValidationError(null);

    const result = updateParkingState(currentEvent.id, parkingId, updates, user.name);
    if (result.error) {
      setValidationError(result.error);
      return;
    }

    setLiveState({ ...result.state });
    showNotice(
      `Operational action recorded: Parking ${result.state.parkingState[parkingId]?.zoneName} updated.`
    );
  };

  const handleAddParking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent || !liveState || !user?.name || !newZoneName.trim()) return;

    const id = `park-${Date.now()}`;
    const newLot: ParkingOperationalState = {
      id,
      zoneName: newZoneName.trim(),
      totalSpaces: newTotalSpaces,
      occupiedSpaces: 0,
      availableSpaces: newTotalSpaces,
      status: "AVAILABLE",
      distanceFromVenue: newDistance.trim(),
      entryRoute: newRoute.trim(),
      shuttleAvailable: true,
      fee: newFee.trim(),
    };

    liveState.parkingState[id] = newLot;
    saveEventLiveState(liveState);

    recordOperationalAction(currentEvent.id, {
      action: `Created new parking lot: ${newZoneName}`,
      resource: newZoneName,
      user: user.name,
      newState: "AVAILABLE",
    });

    setLiveState({ ...liveState });
    setIsAddModalOpen(false);
    setNewZoneName("");
    showNotice(`Operational action recorded: Registered parking zone "${newLot.zoneName}"`);
  };

  if (events.length === 0) {
    return (
      <OrganizerLayout pageTitle="Parking Operations">
        <div className="p-12 text-center bg-[#F0E9D6] rounded-3xl border border-[#C9D9F7] shadow-2xs font-sans space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F7FAFF] text-[#4F7CFF] flex items-center justify-center mx-auto">
            <Car className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#0B1120] font-heading">No Events Found</h3>
            <p className="text-xs text-[#6B6252] mt-1">
              Create an event to configure parking bays, track occupancy levels, and manage shuttle links.
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
      <OrganizerLayout pageTitle="Parking Operations">
        <div className="p-12 text-center bg-[#F0E9D6] rounded-3xl border border-[#C9D9F7] shadow-2xs font-sans">
          <p className="text-sm text-[#6B6252]">Loading parking telemetry...</p>
        </div>
      </OrganizerLayout>
    );
  }

  const parkingLots = Object.values(liveState.parkingState || {});
  const totalCapacity = parkingLots.reduce((s, p) => s + p.totalSpaces, 0);
  const totalOccupied = parkingLots.reduce((s, p) => s + p.occupiedSpaces, 0);
  const totalAvailable = parkingLots.reduce((s, p) => s + p.availableSpaces, 0);
  const macroOccupancy = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  return (
    <OrganizerLayout
      activeEvent={currentEvent}
      pageTitle={`Parking Management: ${currentEvent.name}`}
      pageSubtitle="Supervise precinct parking lots, track live vehicle inventory, and manage capacity statuses."
      pageBadge="Parking & Access"
      actions={
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white shadow-2xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Parking Zone</span>
        </button>
      }
    >
      <div className="space-y-8 font-sans">
        {/* Notice Banners */}
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

        {validationError && (
          <div className="p-4 rounded-2xl bg-rose-50 text-rose-900 border border-rose-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
            <button onClick={() => setValidationError(null)} className="text-xs font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Top Parking Macro Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs">
            <span className="text-[10px] uppercase font-mono font-bold text-[#8C8272] block">
              Total Parking Bays
            </span>
            <div className="mt-1 text-2xl font-bold font-mono text-[#0B1120]">
              {totalCapacity.toLocaleString()}
            </div>
            <span className="text-[11px] text-[#6B6252] mt-0.5 block">{parkingLots.length} active lots</span>
          </div>

          <div className="p-5 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs">
            <span className="text-[10px] uppercase font-mono font-bold text-[#8C8272] block">
              Occupied Bays
            </span>
            <div className="mt-1 text-2xl font-bold font-mono text-[#4F7CFF]">
              {totalOccupied.toLocaleString()}
            </div>
            <span className="text-[11px] text-[#2D5FD2] font-bold mt-0.5 block">{macroOccupancy}% filled</span>
          </div>

          <div className="p-5 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs">
            <span className="text-[10px] uppercase font-mono font-bold text-[#8C8272] block">
              Available Bays
            </span>
            <div className="mt-1 text-2xl font-bold font-mono text-emerald-600">
              {totalAvailable.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">Ready for incoming vehicles</span>
          </div>

          <div className="p-5 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs">
            <span className="text-[10px] uppercase font-mono font-bold text-[#8C8272] block">
              Parking Load
            </span>
            <div className="mt-1 text-2xl font-bold font-mono text-[#241E17]">
              {macroOccupancy}%
            </div>
            <div className="w-full bg-[#F7FAFF] h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-[#4F7CFF] rounded-full" style={{ width: `${macroOccupancy}%` }} />
            </div>
          </div>
        </div>

        {/* Parking Lots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {parkingLots.map((lot) => {
            const occupancy =
              lot.totalSpaces > 0 ? Math.round((lot.occupiedSpaces / lot.totalSpaces) * 100) : 0;

            return (
              <div
                key={lot.id}
                className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-[#F7FAFF] text-[#4F7CFF]">
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-[#0B1120] font-heading">{lot.zoneName}</h4>
                        <span className="text-[11px] text-[#6B6252] flex items-center gap-1 mt-0.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#4F7CFF]" />
                          <span>{lot.distanceFromVenue}</span>
                        </span>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <select
                      value={lot.status}
                      onChange={(e) =>
                        handleUpdateParking(lot.id, { status: e.target.value as ParkingOperationalStatus })
                      }
                      className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer appearance-none shadow-2xs ${
                        lot.status === "AVAILABLE"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : lot.status === "FILLING"
                          ? "bg-[#F7FAFF] text-[#2D5FD2] border-[#C9D9F7]"
                          : lot.status === "NEAR CAPACITY"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : lot.status === "FULL"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-[#F7FAFF] text-[#382F27] border-[#C9BBA0]"
                      }`}
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="FILLING">FILLING</option>
                      <option value="NEAR CAPACITY">NEAR CAPACITY</option>
                      <option value="FULL">FULL</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>

                  {/* Route & Fee Info */}
                  <div className="p-3.5 rounded-2xl bg-[#F4F8FF] border border-[#F7FAFF] text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#6B6252]">
                      <span>Approach: {lot.entryRoute}</span>
                      <span className="font-mono font-bold text-[#382F27]">{lot.fee || "₹200"}</span>
                    </div>
                  </div>

                  {/* Spaces Inventory Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#6B6252] font-sans font-medium">Occupancy:</span>
                      <span className="font-bold text-[#241E17]">
                        {lot.occupiedSpaces} / {lot.totalSpaces} ({occupancy}%)
                      </span>
                    </div>

                    <div className="w-full bg-[#F7FAFF] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          occupancy > 90
                            ? "bg-rose-500"
                            : occupancy > 75
                            ? "bg-blue-500"
                            : "bg-[#4F7CFF]"
                        }`}
                        style={{ width: `${occupancy}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Spaces Increment / Decrement Controllers */}
                <div className="pt-3 border-t border-[#F7FAFF] flex items-center justify-between text-xs">
                  <span className="text-[#6B6252] font-bold">Adjust Occupancy:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleUpdateParking(lot.id, {
                          occupiedSpaces: Math.max(0, lot.occupiedSpaces - 25),
                          availableSpaces: Math.min(lot.totalSpaces, lot.availableSpaces + 25),
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#382F27] font-mono font-bold"
                    >
                      -25 cars
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateParking(lot.id, {
                          occupiedSpaces: Math.min(lot.totalSpaces, lot.occupiedSpaces + 25),
                          availableSpaces: Math.max(0, lot.availableSpaces - 25),
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#382F27] font-mono font-bold"
                    >
                      +25 cars
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Parking Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="w-full max-w-lg bg-[#F0E9D6] rounded-3xl shadow-2xl border border-[#C9D9F7] p-6 sm:p-8 space-y-5">
            <div>
              <h3 className="text-base font-bold text-[#0B1120] font-heading">
                Add Parking Facility
              </h3>
              <p className="text-xs text-[#6B6252] mt-0.5">
                Register a new perimeter parking zone or multi-level parking deck.
              </p>
            </div>

            <form onSubmit={handleAddParking} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#382F27] mb-1">Zone Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Multi-Level Deck Zone C"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#C9D9F7] focus:ring-1 focus:ring-[#4F7CFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#382F27] mb-1">Total Capacity (Bays)</label>
                  <input
                    type="number"
                    value={newTotalSpaces}
                    onChange={(e) => setNewTotalSpaces(parseInt(e.target.value, 10) || 100)}
                    className="w-full px-3 py-2 rounded-xl border border-[#C9D9F7] font-mono focus:ring-1 focus:ring-[#4F7CFF]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#382F27] mb-1">Parking Fee</label>
                  <input
                    type="text"
                    value={newFee}
                    onChange={(e) => setNewFee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#C9D9F7] focus:ring-1 focus:ring-[#4F7CFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#382F27] mb-1">Distance & Walk Time</label>
                <input
                  type="text"
                  placeholder="e.g. 300m (4 min walk)"
                  value={newDistance}
                  onChange={(e) => setNewDistance(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#C9D9F7] focus:ring-1 focus:ring-[#4F7CFF]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#382F27] mb-1">Approach Ingress Route</label>
                <input
                  type="text"
                  placeholder="e.g. Direct entry from BKC North Flyover"
                  value={newRoute}
                  onChange={(e) => setNewRoute(e.target.value)}
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
                  Register Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </OrganizerLayout>
  );
};
