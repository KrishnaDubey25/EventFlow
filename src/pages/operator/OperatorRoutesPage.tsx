import React, { useState, useEffect } from "react";
import {
  Route,
  Truck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  Search,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  MapPin,
  ChevronRight,
  TrendingUp,
  Activity,
  ArrowRight,
} from "lucide-react";
import { OperatorLayout } from "../../components/operator/OperatorLayout";
import { useAuth } from "../../context/AuthContext";
import { OperatorUser } from "../../types/auth";
import {
  getOperatorResources,
  updateOperatorResource,
} from "../../services/operatorResourceService";
import { OperatorResourceRecord } from "../../types/operator";

export const OperatorRoutesPage: React.FC = () => {
  const { user } = useAuth();
  const operatorUser = user as OperatorUser | null;
  const operatorId = user?.id || "";

  const [resources, setResources] = useState<OperatorResourceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadResources = () => {
    const list = getOperatorResources(operatorId, "Transport");
    setResources(list);
  };

  useEffect(() => {
    loadResources();
    const handleUpdate = () => loadResources();
    window.addEventListener("eventflow_live_state_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("eventflow_live_state_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [operatorId]);

  const handleStatusChange = (
    res: OperatorResourceRecord,
    newTripStatus: "On Route" | "Delayed" | "Standby" | "Out of Service",
    notes?: string
  ) => {
    const currentTransport = res.transport || {
      routeName: res.name,
      vehicleType: "Shuttle Bus",
      plateNumber: "MH-01-EF-101",
      registrationNumber: "MH-01-EF-101",
      driverName: "Active Driver",
      tripStatus: "En Route" as const,
      currentTrip: "Trip 4",
      nextDeparture: "15 mins",
      routeStops: ["Terminal 1", "Concourse A"],
    };

    updateOperatorResource(operatorId, res.id, {
      status: newTripStatus === "Out of Service" ? "INACTIVE" : "ACTIVE",
      transport: {
        ...currentTransport,
        tripStatus: newTripStatus as any,
      },
      notes: notes || `Trip status updated to ${newTripStatus}`,
    });

    setFeedback(`Updated ${res.name} to "${newTripStatus}"`);
    setTimeout(() => setFeedback(null), 3000);
    loadResources();
  };

  const handleCapacityIncrement = (res: OperatorResourceRecord, delta: number) => {
    const newOccupied = Math.max(0, Math.min(res.capacity, (res.occupiedCapacity || 0) + delta));
    const newAvailable = Math.max(0, res.capacity - newOccupied);

    updateOperatorResource(operatorId, res.id, {
      occupiedCapacity: newOccupied,
      availableCapacity: newAvailable,
      notes: `Passenger load updated to ${newOccupied}/${res.capacity}`,
    });

    setFeedback(`Updated ${res.name} passenger count to ${newOccupied}`);
    setTimeout(() => setFeedback(null), 2500);
    loadResources();
  };

  const filtered = resources.filter((r) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = r.name.toLowerCase().includes(q);
    const routeMatch = r.transport?.routeName.toLowerCase().includes(q) || false;
    const plateMatch = (r.transport?.plateNumber || r.transport?.registrationNumber || "").toLowerCase().includes(q);
    return nameMatch || routeMatch || plateMatch;
  });

  const totalVehicles = resources.length;
  const onRouteCount = resources.filter((r) => r.transport?.tripStatus === "On Route").length;
  const delayedCount = resources.filter((r) => r.transport?.tripStatus === "Delayed").length;
  const totalSeats = resources.reduce((acc, r) => acc + (r.capacity || 0), 0);
  const activePassengers = resources.reduce((acc, r) => acc + (r.occupiedCapacity || 0), 0);

  return (
    <OperatorLayout
      title="Transport Routes & Active Trips"
      subtitle="Monitor live fleet trips, adjust route headways, record passenger loads, and report disruptions."
    >
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Active Vehicles</span>
            <div className="p-2 rounded-xl bg-[#F7FAFF] text-[#4F7CFF]">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0B1120] mt-2 font-heading">{totalVehicles}</p>
          <p className="text-xs text-[#6B6252] mt-0.5">{onRouteCount} currently in transit</p>
        </div>

        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Total Seat Capacity</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-indigo-700 mt-2 font-heading">{totalSeats}</p>
          <p className="text-xs text-[#6B6252] mt-0.5">Across all feeder shuttles</p>
        </div>

        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Current Passengers</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-teal-700 mt-2 font-heading">{activePassengers}</p>
          <p className="text-xs text-[#6B6252] mt-0.5">
            {totalSeats > 0 ? Math.round((activePassengers / totalSeats) * 100) : 0}% fleet load
          </p>
        </div>

        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Disruptions</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-700 mt-2 font-heading">{delayedCount}</p>
          <p className="text-xs text-[#6B6252] mt-0.5">
            {delayedCount === 0 ? "All trips running on schedule" : "Active delays reported"}
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-600">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7]/80 p-4 shadow-2xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8C8272] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search route name, plate number, or shuttle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF]"
          />
        </div>

        <span className="text-xs text-[#6B6252] font-medium hidden sm:inline">
          Live sync enabled with Organizer Live State
        </span>
      </div>

      {/* Active Routes & Vehicles Card List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((r) => {
          const t = r.transport;
          const tripStatus = t?.tripStatus || "On Route";
          const occupancyPct = r.capacity > 0 ? Math.round(((r.occupiedCapacity || 0) / r.capacity) * 100) : 0;

          return (
            <div
              key={r.id}
              className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7]/80 p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#F7FAFF] text-[#4F7CFF]">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0B1120] font-heading">{r.name}</h3>
                    <p className="text-xs text-[#6B6252]">
                      {t?.vehicleType || "Bus"} • Plate:{" "}
                      <span className="font-mono font-bold text-[#382F27]">{t?.plateNumber || "MH-01"}</span>
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    tripStatus === "On Route"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : tripStatus === "Delayed"
                      ? "bg-rose-50 text-rose-700 border border-rose-200 animate-pulse"
                      : tripStatus === "Standby"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-[#F7FAFF] text-[#382F27] border border-[#C9D9F7]"
                  }`}
                >
                  {tripStatus}
                </span>
              </div>

              {/* Route Details */}
              <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7]/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#4A4236]">Assigned Route:</span>
                  <span className="font-bold text-[#0B1120]">{t?.routeName || "Terminal Shuttle Line"}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#4A4236]">Current Trip & Headway:</span>
                  <span className="text-[#241E17]">
                    {t?.currentTrip || "Trip 1"} • Next departure in{" "}
                    <span className="font-bold text-[#2D5FD2]">{t?.nextDeparture || "10 mins"}</span>
                  </span>
                </div>
                {(() => {
                  const stops = (t?.routeStops as string[] | undefined) || [];
                  if (stops.length === 0) return null;
                  return (
                    <div className="pt-2 border-t border-[#C9D9F7]/60 flex items-center gap-1.5 overflow-x-auto text-[11px] text-[#6B6252]">
                      <MapPin className="w-3.5 h-3.5 text-[#8C8272] shrink-0" />
                      {stops.map((stop: string, idx: number) => (
                        <React.Fragment key={stop + idx}>
                          <span className="font-medium text-[#382F27] whitespace-nowrap">{stop}</span>
                          {idx < stops.length - 1 && <ChevronRight className="w-3 h-3 text-[#C9BBA0] shrink-0" />}
                        </React.Fragment>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Passenger Load Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#6B6252]">Passenger Load</span>
                  <span className="font-bold text-[#0B1120]">
                    {r.occupiedCapacity || 0} / {r.capacity} seats ({occupancyPct}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F7FAFF] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      occupancyPct >= 90 ? "bg-rose-500" : occupancyPct >= 70 ? "bg-blue-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, occupancyPct)}%` }}
                  />
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="pt-2 border-t border-[#F7FAFF] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCapacityIncrement(r, 5)}
                    className="px-2 py-1 rounded-lg bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#382F27] text-xs font-bold transition-colors cursor-pointer"
                    title="Add 5 passengers"
                  >
                    +5 Pax
                  </button>
                  <button
                    onClick={() => handleCapacityIncrement(r, -5)}
                    className="px-2 py-1 rounded-lg bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#382F27] text-xs font-bold transition-colors cursor-pointer"
                    title="Remove 5 passengers"
                  >
                    -5 Pax
                  </button>
                  <button
                    onClick={() =>
                      updateOperatorResource(operatorId, r.id, {
                        occupiedCapacity: r.capacity,
                        availableCapacity: 0,
                        notes: "Bus marked full",
                      })
                    }
                    className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Set Full
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStatusChange(r, "On Route")}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>On Route</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange(r, "Delayed", "Heavy perimeter traffic on Marine Drive.")}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span>Delayed</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange(r, "Standby")}
                    className="p-1 rounded-lg text-[#8C8272] hover:text-[#382F27] hover:bg-[#F7FAFF] transition-colors cursor-pointer"
                    title="Move to Standby"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </OperatorLayout>
  );
};
