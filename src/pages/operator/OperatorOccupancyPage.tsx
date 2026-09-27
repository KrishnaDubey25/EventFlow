import React, { useState, useEffect } from "react";
import {
  Car,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Search,
  Plus,
  Minus,
  Sparkles,
  Zap,
  ShieldCheck,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { OperatorLayout } from "../../components/operator/OperatorLayout";
import { useAuth } from "../../context/AuthContext";
import { OperatorUser } from "../../types/auth";
import {
  getOperatorResources,
  updateOperatorResource,
} from "../../services/operatorResourceService";
import { OperatorResourceRecord } from "../../types/operator";

export const OperatorOccupancyPage: React.FC = () => {
  const { user } = useAuth();
  const operatorUser = user as OperatorUser | null;
  const operatorId = user?.id || "";

  const [resources, setResources] = useState<OperatorResourceRecord[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadResources = () => {
    const list = getOperatorResources(operatorId, "Parking");
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

  const handleAdjustOccupancy = (res: OperatorResourceRecord, delta: number) => {
    const newOccupied = Math.max(0, Math.min(res.capacity, (res.occupiedCapacity || 0) + delta));
    const newAvailable = Math.max(0, res.capacity - newOccupied);

    let status = "AVAILABLE";
    if (newOccupied >= res.capacity) status = "FULL";
    else if (newOccupied >= res.capacity * 0.85) status = "NEAR CAPACITY";

    updateOperatorResource(operatorId, res.id, {
      occupiedCapacity: newOccupied,
      availableCapacity: newAvailable,
      parking: {
        ...(res.parking || {
          facilityType: "Concourse Parking",
          entryGate: "Gate 4",
          supportedVehicles: ["Four Wheelers", "Two Wheelers"],
          hourlyFee: "₹100/hr",
        }),
        totalSlots: res.capacity,
        occupiedSlots: newOccupied,
        availableSlots: newAvailable,
      },
      notes: `Occupancy adjusted to ${newOccupied}/${res.capacity} slots (${status})`,
    });

    setFeedback(`Updated ${res.name}: ${newOccupied} occupied, ${newAvailable} slots left`);
    setTimeout(() => setFeedback(null), 2500);
    loadResources();
  };

  const totalSlots = resources.reduce((acc, r) => acc + (r.capacity || 0), 0);
  const totalOccupied = resources.reduce((acc, r) => acc + (r.occupiedCapacity || 0), 0);
  const totalAvailable = Math.max(0, totalSlots - totalOccupied);
  const overallPercentage = totalSlots > 0 ? Math.round((totalOccupied / totalSlots) * 100) : 0;

  return (
    <OperatorLayout
      title="Parking Occupancy & Real-Time Bay Tracking"
      subtitle="Monitor live slot utilization, manage parking capacity, and prevent perimeter gridlock."
    >
      {/* Top Occupancy KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Total Parking Bays</span>
            <div className="p-2 rounded-xl bg-[#F7FAFF] text-[#4F7CFF]">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0B1120] mt-2 font-heading">{totalSlots.toLocaleString()}</p>
          <p className="text-xs text-[#6B6252] mt-0.5">Across {resources.length} parking facilities</p>
        </div>

        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Occupied Slots</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-indigo-700 mt-2 font-heading">{totalOccupied.toLocaleString()}</p>
          <p className="text-xs text-[#6B6252] mt-0.5">{overallPercentage}% capacity occupied</p>
        </div>

        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Available Slots</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2 font-heading">{totalAvailable.toLocaleString()}</p>
          <p className="text-xs text-[#6B6252] mt-0.5">Vacant bays ready for parking</p>
        </div>

        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Occupancy Level</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-2 font-heading">{overallPercentage}%</p>
          <p className="text-xs text-[#6B6252] mt-0.5">
            {overallPercentage >= 90 ? "Critical: Near Maximum" : "Steady Flow"}
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-600">✕</button>
        </div>
      )}

      {/* Facilities Detailed Occupancy Cards */}
      <div className="space-y-4">
        {resources.map((res) => {
          const p = res.parking;
          const occPct = res.capacity > 0 ? Math.round(((res.occupiedCapacity || 0) / res.capacity) * 100) : 0;
          const isFull = occPct >= 98;
          const isNearCap = occPct >= 80 && !isFull;

          return (
            <div
              key={res.id}
              className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7]/80 p-6 shadow-2xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[#F7FAFF] text-[#4F7CFF]">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#0B1120] font-heading">{res.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-[#6B6252]">
                      <span>{res.location || "East Perimeter Road"}</span>
                      <span>•</span>
                      <span>Entry: <strong className="text-[#382F27]">{p?.entryGate || "Gate 4"}</strong></span>
                      <span>•</span>
                      <span>Rate: <strong className="text-[#382F27]">{p?.hourlyFee || "₹250 / Day"}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isFull
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : isNearCap
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {isFull ? "LOT FULL" : isNearCap ? "NEAR CAPACITY" : "AVAILABLE"}
                  </span>
                </div>
              </div>

              {/* Progress Bar & Numerical Stats */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[#6B6252] font-medium">Slot Occupancy Gauge</span>
                  <span className="font-bold text-[#0B1120]">
                    {res.occupiedCapacity} / {res.capacity} slots filled ({occPct}%)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#F7FAFF] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      isFull ? "bg-rose-500" : isNearCap ? "bg-blue-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, occPct)}%` }}
                  />
                </div>
              </div>

              {/* Sub-Zones Breakdown if available */}
              {p?.zones && p.zones.length > 0 && (
                <div className="p-3.5 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7]/60">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B6252] mb-2">
                    Designated Bay Breakdown:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {p.zones.map((zone, idx) => (
                      <div key={(zone.name || zone.zoneName || "zone") + idx} className="p-2 rounded-lg bg-[#F0E9D6] border border-[#C9D9F7]/70 text-xs">
                        <div className="font-bold text-[#241E17]">{zone.name || zone.zoneName || `Bay ${idx + 1}`}</div>
                        <div className="text-[11px] text-[#6B6252] mt-0.5">
                          {zone.occupiedSlots ?? zone.occupied ?? 0} / {zone.totalSlots} slots
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Adjustment Controls */}
              <div className="pt-3 border-t border-[#F7FAFF] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#4A4236]">Quick Adjust:</span>
                  <button
                    onClick={() => handleAdjustOccupancy(res, 10)}
                    className="px-2.5 py-1 rounded-lg bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#241E17] text-xs font-bold transition-colors cursor-pointer"
                  >
                    +10 Cars
                  </button>
                  <button
                    onClick={() => handleAdjustOccupancy(res, 50)}
                    className="px-2.5 py-1 rounded-lg bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#241E17] text-xs font-bold transition-colors cursor-pointer"
                  >
                    +50 Cars
                  </button>
                  <button
                    onClick={() => handleAdjustOccupancy(res, -10)}
                    className="px-2.5 py-1 rounded-lg bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#241E17] text-xs font-bold transition-colors cursor-pointer"
                  >
                    -10 Cars
                  </button>
                  <button
                    onClick={() => handleAdjustOccupancy(res, -50)}
                    className="px-2.5 py-1 rounded-lg bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#241E17] text-xs font-bold transition-colors cursor-pointer"
                  >
                    -50 Cars
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateOperatorResource(operatorId, res.id, {
                        occupiedCapacity: res.capacity,
                        availableCapacity: 0,
                        notes: "Lot marked full by operator",
                      })
                    }
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
                  >
                    Mark Lot Full
                  </button>
                  <button
                    onClick={() =>
                      updateOperatorResource(operatorId, res.id, {
                        occupiedCapacity: 0,
                        availableCapacity: res.capacity,
                        notes: "Lot reset to completely available",
                      })
                    }
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
                  >
                    Reset to Empty
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
