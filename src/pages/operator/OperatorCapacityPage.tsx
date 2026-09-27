import React, { useState, useEffect } from "react";
import {
  Layers,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Sparkles,
  Users,
  BedDouble,
  Car,
  Truck,
  UtensilsCrossed,
  HeartPulse,
  Wrench,
  HelpCircle,
  Plus,
  Minus,
} from "lucide-react";
import { OperatorLayout } from "../../components/operator/OperatorLayout";
import { useAuth } from "../../context/AuthContext";
import { OperatorUser, normalizeOperatorType } from "../../types/auth";
import {
  getOperatorResources,
  updateOperatorResource,
} from "../../services/operatorResourceService";
import { OperatorResourceRecord } from "../../types/operator";
import { calculateResourceCapacity, getCapacityHistory, recordCapacitySnapshot } from "../../services/capacityCalculationService";
import { getEventPresence } from "../../services/eventCollaborationService";

export const OperatorCapacityPage: React.FC = () => {
  const { user } = useAuth();
  const operatorUser = user as OperatorUser | null;
  const operatorId = user?.id || "";
  const operatorType = normalizeOperatorType(operatorUser?.operatorType);

  const [resources, setResources] = useState<OperatorResourceRecord[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadResources = () => {
    const list = getOperatorResources(operatorId, operatorType);
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
  }, [operatorId, operatorType]);

  const handleAdjust = (res: OperatorResourceRecord, delta: number) => {
    const newOccupied = Math.max(0, Math.min(res.capacity, (res.occupiedCapacity || 0) + delta));
    const newAvailable = Math.max(0, res.capacity - newOccupied);

    updateOperatorResource(operatorId, res.id, {
      occupiedCapacity: newOccupied,
      availableCapacity: newAvailable,
      notes: `Capacity adjusted: ${newOccupied} utilized of ${res.capacity}`,
    });

    setFeedback(`Updated ${res.name}: ${newOccupied} utilized, ${newAvailable} remaining`);
    setTimeout(() => setFeedback(null), 2500);
    loadResources();
  };

  const handleSetMax = (res: OperatorResourceRecord, newTotal: number) => {
    if (newTotal <= 0) return;
    const newOccupied = Math.min(newTotal, res.occupiedCapacity || 0);
    const newAvailable = Math.max(0, newTotal - newOccupied);

    updateOperatorResource(operatorId, res.id, {
      capacity: newTotal,
      occupiedCapacity: newOccupied,
      availableCapacity: newAvailable,
    });

    setFeedback(`Updated ${res.name} total capacity to ${newTotal}`);
    setTimeout(() => setFeedback(null), 2500);
    loadResources();
  };

  // Type-specific labeling
  const getCapacityMeta = () => {
    switch (operatorType) {
      case "Accommodation":
        return {
          title: "Rooms & Lodging Capacity",
          subtitle: "Monitor room inventories, set maximum guest room counts, and adjust occupied rooms.",
          unit: "Rooms",
          icon: BedDouble,
          themeColor: "indigo",
        };
      case "Transport":
        return {
          title: "Fleet Passenger Capacity",
          subtitle: "Track available bus seats, monitor vehicle crowding, and expand route quotas.",
          unit: "Seats",
          icon: Truck,
          themeColor: "blue",
        };
      case "Parking":
        return {
          title: "Parking Bays & Zone Capacity",
          subtitle: "Manage slot quotas, adjust real-time lot occupancy, and prevent overflow.",
          unit: "Slots",
          icon: Car,
          themeColor: "cyan",
        };
      case "Food & Dining":
        return {
          title: "Dining Outlets & Service Throughput",
          subtitle: "Manage kitchen capacity, seating covers, and peak meal rush limits.",
          unit: "Covers / hr",
          icon: UtensilsCrossed,
          themeColor: "amber",
        };
      case "Medical & Assistance":
        return {
          title: "Medical Post Bed & Triage Capacity",
          subtitle: "Track clinic observation beds, monitor patient load, and manage triage units.",
          unit: "Beds",
          icon: HeartPulse,
          themeColor: "rose",
        };
      case "Venue Services":
        return {
          title: "Service Units & Crew Capacity",
          subtitle: "Manage on-duty service personnel, equipment deployment limits, and area coverage.",
          unit: "Crew Members",
          icon: Wrench,
          themeColor: "violet",
        };
      default:
        return {
          title: "Resource Capacity & Allocation",
          subtitle: "Manage operational units, inventory quantities, and resource quotas.",
          unit: "Units",
          icon: HelpCircle,
          themeColor: "slate",
        };
    }
  };

  const meta = getCapacityMeta();
  const Icon = meta.icon;

  const totalMax = resources.reduce((acc, r) => acc + (r.capacity || 0), 0);
  const totalOccupied = resources.reduce((acc, r) => acc + (r.occupiedCapacity || 0), 0);
  const totalAvailable = Math.max(0, totalMax - totalOccupied);
  const utilizationPct = totalMax > 0 ? Math.round((totalOccupied / totalMax) * 100) : 0;
  const eventIds = Array.from(new Set(resources.flatMap((r) => r.assignedEventIds || [])));
  const liveAttendeeCount = eventIds.reduce((sum, id) => sum + getEventPresence(id).length, 0);
  const systemCalculation = calculateResourceCapacity(resources, Math.ceil(liveAttendeeCount * 0.12));
  const trend = getCapacityHistory(operatorId).slice(-12);

  useEffect(() => {
    if (!resources.length || !operatorId) return;
    recordCapacitySnapshot(operatorId, calculateResourceCapacity(resources, Math.ceil(liveAttendeeCount * 0.12)));
  }, [operatorId, resources.length, totalOccupied, totalMax, liveAttendeeCount]);

  return (
    <OperatorLayout title={meta.title} subtitle={meta.subtitle}>
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Total Quota</span>
            <div className="p-2 rounded-xl bg-[#F7FAFF] text-[#4F7CFF]">
              <Icon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0B1120] mt-2 font-heading">{totalMax.toLocaleString()}</p>
          <p className="text-xs text-[#6B6252] mt-0.5">Maximum {meta.unit.toLowerCase()}</p>
        </div>

        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Utilized / Occupied</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-indigo-700 mt-2 font-heading">{totalOccupied.toLocaleString()}</p>
          <p className="text-xs text-[#6B6252] mt-0.5">{utilizationPct}% utilization rate</p>
        </div>

        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Available Reserve</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2 font-heading">{totalAvailable.toLocaleString()}</p>
          <p className="text-xs text-[#6B6252] mt-0.5">Ready for immediate allocation</p>
        </div>

        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Capacity Strain</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-2 font-heading">{utilizationPct}%</p>
          <p className="text-xs text-[#6B6252] mt-0.5">
            {utilizationPct >= 90 ? "High Load: Near Peak" : "Operational Buffer Intact"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#C9D9F7] bg-[#0B1120] p-4 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><span className="text-[10px] font-black uppercase tracking-[.14em] text-[#78B7FF]">System calculation</span><h3 className="mt-1 text-sm font-black">Capacity engine · {systemCalculation.status}</h3></div><div className="flex gap-2 text-center text-[10px]"><div className="rounded-xl bg-white/[.07] px-3 py-2"><b className="block text-base">{systemCalculation.projected}</b>Projected</div><div className="rounded-xl bg-white/[.07] px-3 py-2"><b className="block text-base">{systemCalculation.reserveAfterProjection}</b>Reserve</div><div className="rounded-xl bg-white/[.07] px-3 py-2"><b className="block text-base">{liveAttendeeCount}</b>Live demand</div></div></div>
        <div className="mt-3 flex h-12 items-end gap-1">{(trend.length?trend:[systemCalculation]).map((point,i)=><span key={i} className="flex-1 rounded-t bg-[#4F7CFF]/70" style={{height:`${Math.max(8,Math.min(100,point.utilization))}%`}} title={`${point.utilization}% utilization`}/>)}</div>
        <div className="mt-2 flex justify-between text-[10px] text-[#9FB3CC]"><span>Trend registry</span><span>Actual resource data → projected load</span></div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-600">✕</button>
        </div>
      )}

      {/* Resource Capacity Tuning Cards */}
      <div className="space-y-4">
        {resources.map((res) => {
          const occPct = res.capacity > 0 ? Math.round(((res.occupiedCapacity || 0) / res.capacity) * 100) : 0;
          const isHigh = occPct >= 90;

          return (
            <div
              key={res.id}
              className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7]/80 p-6 shadow-2xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-base text-[#0B1120] font-heading">{res.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-[#F7FAFF] text-[#382F27] font-medium">
                      {res.location || "Main Sector"}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6252] mt-0.5">
                    {res.notes || `Configured ${meta.unit.toLowerCase()} quota for this resource.`}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-[#8C8272] font-medium">Available</span>
                    <p className="text-lg font-bold text-emerald-600 font-heading">
                      {res.availableCapacity ?? Math.max(0, res.capacity - (res.occupiedCapacity || 0))} {meta.unit}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isHigh
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {occPct}% Load
                  </span>
                </div>
              </div>

              {/* Capacity Fill Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#6B6252]">Utilization Progress</span>
                  <span className="font-bold text-[#0B1120]">
                    {res.occupiedCapacity || 0} / {res.capacity} {meta.unit} ({occPct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#F7FAFF] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      isHigh ? "bg-rose-500" : occPct >= 75 ? "bg-blue-500" : "bg-[#4F7CFF]"
                    }`}
                    style={{ width: `${Math.min(100, occPct)}%` }}
                  />
                </div>
              </div>

              {/* Adjusters Row */}
              <div className="pt-3 border-t border-[#F7FAFF] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#4A4236]">Occupied Adjustment:</span>
                  <button
                    onClick={() => handleAdjust(res, 1)}
                    className="px-2 py-1 rounded-lg bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#241E17] text-xs font-bold transition-colors cursor-pointer"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => handleAdjust(res, 5)}
                    className="px-2 py-1 rounded-lg bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#241E17] text-xs font-bold transition-colors cursor-pointer"
                  >
                    +5
                  </button>
                  <button
                    onClick={() => handleAdjust(res, -1)}
                    className="px-2 py-1 rounded-lg bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#241E17] text-xs font-bold transition-colors cursor-pointer"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => handleAdjust(res, -5)}
                    className="px-2 py-1 rounded-lg bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#241E17] text-xs font-bold transition-colors cursor-pointer"
                  >
                    -5
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#4A4236]">Total Max Quota:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSetMax(res, Math.max(1, res.capacity - 10))}
                      className="p-1 rounded-lg bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#4A4236]"
                      title="Decrease Total"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 py-1 rounded-lg bg-[#F4F8FF] border border-[#C9D9F7] text-xs font-mono font-bold text-[#241E17]">
                      {res.capacity}
                    </span>
                    <button
                      onClick={() => handleSetMax(res, res.capacity + 10)}
                      className="p-1 rounded-lg bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#4A4236]"
                      title="Increase Total"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </OperatorLayout>
  );
};
