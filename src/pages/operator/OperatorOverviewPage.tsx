import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Calendar,
  Layers,
  AlertTriangle,
  Bell,
  ArrowRight,
  CheckCircle2,
  Clock,
  Radio,
  Sparkles,
  TrendingUp,
  MapPin,
  Car,
  Truck,
  UtensilsCrossed,
  HeartPulse,
  Wrench,
  Building,
  RefreshCw,
  BedDouble,
  ShieldCheck,
  Zap,
  Users,
  Flame,
  ArrowUpRight,
  X,
  HelpCircle,
} from "lucide-react";
import { OperatorLayout } from "../../components/operator/OperatorLayout";
import { useAuth } from "../../context/AuthContext";
import { OperatorUser, normalizeOperatorType } from "../../types/auth";
import {
  getOperatorEvents,
  getOperatorAlerts,
  getAcknowledgedAlertIds,
  getOperatorActionLogs,
} from "../../services/operatorAssignmentService";
import {
  getOperatorResources,
  updateOperatorResource,
} from "../../services/operatorResourceService";
import { getOperatorIntelligence } from "../../services/eventIntelligenceService";
import { OperatorResourceIntelligence } from "../../types/intelligence";
import { OperatorResourceRecord } from "../../types/operator";

export const OperatorOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const operatorUser = user as OperatorUser | null;
  const operatorId = user?.id || "";
  const operatorType = normalizeOperatorType(operatorUser?.operatorType);

  const [searchParams, setSearchParams] = useSearchParams();
  const [accessDeniedNotice, setAccessDeniedNotice] = useState<{
    required: string;
    current: string;
  } | null>(null);

  const [resources, setResources] = useState<OperatorResourceRecord[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (searchParams.get("access_denied")) {
      setAccessDeniedNotice({
        required: searchParams.get("required") || "Authorized",
        current: searchParams.get("current") || operatorType,
      });
      // Clear URL params cleanly without reloading
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("access_denied");
      newParams.delete("required");
      newParams.delete("current");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams, operatorType]);

  const loadResources = () => {
    const list = getOperatorResources(operatorId, operatorType);
    setResources(list);
  };

  useEffect(() => {
    loadResources();
    const handleUpdate = () => {
      setRefreshKey((k) => k + 1);
      loadResources();
    };
    window.addEventListener("eventflow_live_state_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("eventflow_live_state_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [operatorId, operatorType]);

  const assignedEvents = getOperatorEvents(operatorId);
  const alerts = getOperatorAlerts(operatorId);
  const ackedAlertIds = getAcknowledgedAlertIds(operatorId);
  const recentLogs = getOperatorActionLogs(operatorId).slice(0, 5);

  const activeAlerts = alerts.filter((a) => a.status === "ACTIVE" && !ackedAlertIds.includes(a.id));

  // Type-specific KPI calculations
  const totalResources = resources.length;
  const totalCapacity = resources.reduce((acc, r) => acc + (r.capacity || 0), 0);
  const totalOccupied = resources.reduce((acc, r) => acc + (r.occupiedCapacity || 0), 0);
  const totalAvailable = Math.max(0, totalCapacity - totalOccupied);
  const overallOccupancyPct = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  const activeResourcesCount = resources.filter((r) => r.status === "ACTIVE").length;
  const delayedRoutesCount = resources.filter((r) => r.transport?.tripStatus === "Delayed").length;

  const primaryEventId = assignedEvents[0]?.id || "mumbai-tech-ai-expo-2026";
  const operatorIntelligence = getOperatorIntelligence(operatorId, primaryEventId);

  const renderTypeKpis = () => {
    switch (operatorType) {
      case "Accommodation":
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Total Properties</span>
              <p className="text-2xl font-bold text-[#0B1120] mt-2 font-heading">{totalResources}</p>
              <p className="text-xs text-[#6B6252] mt-0.5">Active hotels & suites</p>
            </div>
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Total Rooms</span>
              <p className="text-2xl font-bold text-indigo-700 mt-2 font-heading">{totalCapacity}</p>
              <p className="text-xs text-[#6B6252] mt-0.5">{totalOccupied} booked / occupied</p>
            </div>
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Available Rooms</span>
              <p className="text-2xl font-bold text-emerald-700 mt-2 font-heading">{totalAvailable}</p>
              <p className="text-xs text-[#6B6252] mt-0.5">Ready for booking</p>
            </div>
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Occupancy Rate</span>
              <p className="text-2xl font-bold text-[#2D5FD2] mt-2 font-heading">{overallOccupancyPct}%</p>
              <p className="text-xs text-[#6B6252] mt-0.5">Lodging fill level</p>
            </div>
          </div>
        );

      case "Transport":
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Active Vehicles</span>
              <p className="text-2xl font-bold text-[#0B1120] mt-2 font-heading">{totalResources}</p>
              <p className="text-xs text-[#6B6252] mt-0.5">Buses & shuttles in service</p>
            </div>
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Fleet Passenger Cap</span>
              <p className="text-2xl font-bold text-[#2D5FD2] mt-2 font-heading">{totalCapacity}</p>
              <p className="text-xs text-[#6B6252] mt-0.5">Total seat allocation</p>
            </div>
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Delayed Routes</span>
              <p className="text-2xl font-bold text-rose-700 mt-2 font-heading">{delayedRoutesCount}</p>
              <p className="text-xs text-[#6B6252] mt-0.5">
                {delayedRoutesCount === 0 ? "All trips on time" : "Perimeter congestion"}
              </p>
            </div>
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Available Seats</span>
              <p className="text-2xl font-bold text-emerald-700 mt-2 font-heading">{totalAvailable}</p>
              <p className="text-xs text-[#6B6252] mt-0.5">Vacant seat inventory</p>
            </div>
          </div>
        );

      case "Parking":
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Total Facilities</span>
              <p className="text-2xl font-bold text-[#0B1120] mt-2 font-heading">{totalResources}</p>
              <p className="text-xs text-[#6B6252] mt-0.5">Designated parking zones</p>
            </div>
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Total Parking Slots</span>
              <p className="text-2xl font-bold text-indigo-700 mt-2 font-heading">{totalCapacity.toLocaleString()}</p>
              <p className="text-xs text-[#6B6252] mt-0.5">{totalOccupied} bays occupied</p>
            </div>
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Available Slots</span>
              <p className="text-2xl font-bold text-emerald-700 mt-2 font-heading">{totalAvailable.toLocaleString()}</p>
              <p className="text-xs text-[#6B6252] mt-0.5">Ready for arrival ingress</p>
            </div>
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Peak Fill Level</span>
              <p className="text-2xl font-bold text-blue-700 mt-2 font-heading">{overallOccupancyPct}%</p>
              <p className="text-xs text-[#6B6252] mt-0.5">
                {overallOccupancyPct >= 85 ? "Heavy vehicular load" : "Optimal capacity"}
              </p>
            </div>
          </div>
        );

      case "Food & Dining":
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Total Outlets</span>
              <p className="text-2xl font-bold text-[#0B1120] mt-2 font-heading">{totalResources}</p>
              <p className="text-xs text-[#6B6252] mt-0.5">Food courts & stalls</p>
            </div>
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Active Counters</span>
              <p className="text-2xl font-bold text-emerald-700 mt-2 font-heading">{activeResourcesCount}</p>
              <p className="text-xs text-[#6B6252] mt-0.5">Serving attendees</p>
            </div>
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Rush Status</span>
              <p className="text-2xl font-bold text-blue-700 mt-2 font-heading">Moderate Rush</p>
              <p className="text-xs text-[#6B6252] mt-0.5">Pre-lunch preparation</p>
            </div>
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Avg Wait Time</span>
              <p className="text-2xl font-bold text-[#2D5FD2] mt-2 font-heading">6.5 mins</p>
              <p className="text-xs text-[#6B6252] mt-0.5">Across all food points</p>
            </div>
          </div>
        );

      case "Medical & Assistance":
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Medical Points</span>
              <p className="text-2xl font-bold text-[#0B1120] mt-2 font-heading">{totalResources}</p>
              <p className="text-xs text-[#6B6252] mt-0.5">Triage & first-aid stations</p>
            </div>
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">On-Duty Clinical Staff</span>
              <p className="text-2xl font-bold text-[#2D5FD2] mt-2 font-heading">14 Personnel</p>
              <p className="text-xs text-[#6B6252] mt-0.5">Doctors & certified EMTs</p>
            </div>
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Available Clinic Beds</span>
              <p className="text-2xl font-bold text-emerald-700 mt-2 font-heading">{totalAvailable}</p>
              <p className="text-xs text-[#6B6252] mt-0.5">Observation bays free</p>
            </div>
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Ambulance Standby</span>
              <p className="text-2xl font-bold text-rose-700 mt-2 font-heading">Ready (2 Units)</p>
              <p className="text-xs text-[#6B6252] mt-0.5">Gate 3 & Gate 6 staging</p>
            </div>
          </div>
        );

      case "Venue Services":
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Assigned Services</span>
              <p className="text-2xl font-bold text-[#0B1120] mt-2 font-heading">{totalResources}</p>
              <p className="text-xs text-[#6B6252] mt-0.5">Power, rigging, sanitation</p>
            </div>
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Active Work Orders</span>
              <p className="text-2xl font-bold text-indigo-700 mt-2 font-heading">2 In Progress</p>
              <p className="text-xs text-[#6B6252] mt-0.5">Rigging & electrical inspection</p>
            </div>
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Crew On Shift</span>
              <p className="text-2xl font-bold text-[#2D5FD2] mt-2 font-heading">{totalCapacity} Techs</p>
              <p className="text-xs text-[#6B6252] mt-0.5">Engineers & field operators</p>
            </div>
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Equipment Health</span>
              <p className="text-2xl font-bold text-emerald-700 mt-2 font-heading">100% Normal</p>
              <p className="text-xs text-[#6B6252] mt-0.5">All main systems green</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Managed Resources</span>
              <p className="text-2xl font-bold text-[#0B1120] mt-2 font-heading">{totalResources}</p>
              <p className="text-xs text-[#6B6252] mt-0.5">Units in inventory</p>
            </div>
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Total Units</span>
              <p className="text-2xl font-bold text-indigo-700 mt-2 font-heading">{totalCapacity}</p>
              <p className="text-xs text-[#6B6252] mt-0.5">Allocated capacity</p>
            </div>
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Available Units</span>
              <p className="text-2xl font-bold text-emerald-700 mt-2 font-heading">{totalAvailable}</p>
              <p className="text-xs text-[#6B6252] mt-0.5">Ready for deployment</p>
            </div>
            <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8272]">Operational Health</span>
              <p className="text-2xl font-bold text-[#2D5FD2] mt-2 font-heading">Active</p>
              <p className="text-xs text-[#6B6252] mt-0.5">Field operations running</p>
            </div>
          </div>
        );
    }
  };

  return (
    <OperatorLayout
      title={`${operatorType} Control Operations`}
      subtitle={`Dedicated command and field management portal for ${operatorType} service providers.`}
    >
      {/* Route Isolation Access Denied Banner */}
      {accessDeniedNotice && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-rose-900 font-heading">Access Denied & Route Protected</h4>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                The requested page is restricted exclusively to{" "}
                <strong className="font-semibold text-rose-950">{accessDeniedNotice.required}</strong> operators.
                You are currently signed in with a{" "}
                <strong className="font-semibold text-rose-950">{accessDeniedNotice.current}</strong> account.
              </p>
            </div>
          </div>
          <button
            onClick={() => setAccessDeniedNotice(null)}
            className="p-1 rounded-lg text-rose-500 hover:text-rose-800 hover:bg-rose-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Operator Shift Banner */}
      <div className="bg-gradient-to-r from-[#0B1120] via-[#111C44] to-[#1E293B] rounded-2xl p-6 text-white shadow-sm border border-[#241E17]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-lg shrink-0"
              style={{ backgroundColor: operatorUser?.avatarColor || "#4F7CFF" }}
            >
              {operatorUser?.initials || "OP"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white font-heading">
                  Welcome back, {operatorUser?.fullName || operatorUser?.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#4F7CFF]/20 text-[#6EA8FF] text-xs font-bold border border-[#4F7CFF]/30">
                  {operatorType}
                </span>
              </div>
              <p className="text-xs text-[#C9BBA0] mt-1">
                {operatorUser?.organization || "EventFlow Partner Operations"} • City:{" "}
                <strong className="text-white">{operatorUser?.operatingCity || "Mumbai"}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/operators/live"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4F7CFF] hover:bg-[#4F7CFF] text-white font-semibold text-xs transition-colors shadow-xs shadow-[#4F7CFF]/20"
            >
              <Radio className="w-4 h-4 text-white animate-pulse" />
              <span>Live Status Grid</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Dynamic Type-Tailored KPIs */}
      {renderTypeKpis()}

      {/* OPERATOR INTELLIGENCE FOUNDATION: Isolated to assigned resources only */}
      {operatorIntelligence.length > 0 && (
        <div className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7]/80 p-5 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F7FAFF]">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#4F7CFF]" />
                <h3 className="text-sm font-bold text-[#0B1120] font-heading">
                  Field Resource Operational Intelligence
                </h3>
              </div>
              <p className="text-xs text-[#6B6252] mt-0.5">
                Deterministic capacity tracking and early warning checks scoped strictly to your managed assets.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#F7FAFF] text-[#4A4236] font-bold border border-[#C9D9F7]">
              ROLE ISOLATED • NO GLOBAL TELEMETRY
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {operatorIntelligence.map((intel) => (
              <div
                key={intel.resourceId}
                className={`p-4 rounded-xl border space-y-3 ${
                  intel.utilization >= 90
                    ? "bg-rose-50/50 border-rose-200"
                    : intel.utilization >= 80
                    ? "bg-blue-50/50 border-blue-200"
                    : "bg-[#F4F8FF] border-[#C9D9F7]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-[#8C8272] block">
                      {intel.operatorType} ASSET
                    </span>
                    <h4 className="text-sm font-bold text-[#0B1120]">{intel.resourceName}</h4>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        intel.utilization >= 90
                          ? "bg-rose-100 text-rose-800 border-rose-300"
                          : intel.utilization >= 80
                          ? "bg-blue-100 text-blue-800 border-blue-300"
                          : "bg-emerald-100 text-emerald-800 border-emerald-300"
                      }`}
                    >
                      {intel.utilization}% Load
                    </span>
                    <span className="text-xs font-mono font-bold text-[#4A4236] bg-[#F0E9D6] px-2 py-0.5 rounded border border-[#C9D9F7]">
                      {intel.trend === "INCREASING" ? "↑ Increasing" : intel.trend === "DECREASING" ? "↓ Decreasing" : "→ Stable"}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-[#4A4236] flex items-center justify-between font-mono bg-[#F0E9D6]/80 p-2 rounded-lg border border-[#F7FAFF]">
                  <span>Available Capacity: <strong className="text-[#0B1120]">{intel.availableCapacity}</strong></span>
                  <span>Occupied / In-Use: <strong className="text-[#0B1120]">{intel.currentUsage}</strong></span>
                </div>

                {intel.warning && (
                  <div className="text-xs text-rose-900 bg-rose-100/70 p-2 rounded-lg border border-rose-200 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>Warning:</strong> {intel.warning}</span>
                  </div>
                )}

                {intel.recommendedCheck && (
                  <div className="text-xs text-[#382F27] bg-[#F0E9D6] p-2 rounded-lg border border-[#C9D9F7] flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4F7CFF] shrink-0 mt-0.5" />
                    <span><strong>Recommended Operational Check:</strong> {intel.recommendedCheck}</span>
                  </div>
                )}

                {intel.connectedContext && (
                  <div className="text-[11px] text-[#6B6252] italic">
                    ℹ️ {intel.connectedContext}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Tailored Resource Feed & Shift Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Assigned Resources Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7]/80 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F7FAFF]">
              <div>
                <h3 className="text-base font-bold text-[#0B1120] font-heading">
                  Managed {operatorType} Resources
                </h3>
                <p className="text-xs text-[#6B6252]">
                  Real-time telemetry directly synced with attendee booking and organizer command
                </p>
              </div>
              <Link
                to="/operators/resources"
                className="text-xs font-bold text-[#4F7CFF] hover:text-[#2D5FD2] flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#F7FAFF]">
              {resources.length === 0 ? (
                <div className="py-8 text-center text-[#8C8272] text-xs">
                  No resources registered yet. Use the resource manager to add your first entity.
                </div>
              ) : (
                resources.slice(0, 4).map((r) => {
                  const occPct = r.capacity > 0 ? Math.round(((r.occupiedCapacity || 0) / r.capacity) * 100) : 0;
                  return (
                    <div
                      key={r.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F4F8FF]/50 p-2 rounded-xl transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-[#0B1120] font-heading">{r.name}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : r.status === "MAINTENANCE"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-[#F7FAFF] text-[#4A4236] border border-[#C9D9F7]"
                            }`}
                          >
                            {r.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B6252] mt-0.5 flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-[#8C8272]" />
                          <span>{r.location || "Main Sector"}</span>
                          {r.notes && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[200px]">{r.notes}</span>
                            </>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-[#8C8272]">Load</span>
                          <p className="text-xs font-bold text-[#0B1120] font-mono">
                            {r.occupiedCapacity} / {r.capacity} ({occPct}%)
                          </p>
                        </div>
                        <Link
                          to="/operators/resources"
                          className="px-2.5 py-1 rounded-lg bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#382F27] text-xs font-semibold transition-colors"
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Quick Specialized Shortcuts & Today's Shift */}
        <div className="space-y-4">
          {/* Quick Shortcuts */}
          <div className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7]/80 p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-[#0B1120] font-heading">Operator Quick Workflows</h3>
            <div className="space-y-2">
              {operatorType === "Accommodation" && (
                <>
                  <Link
                    to="/operators/bookings"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F4F8FF] hover:bg-[#F7FAFF]/60 border border-[#C9D9F7]/70 text-xs font-semibold text-[#241E17] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <BedDouble className="w-4 h-4 text-[#4F7CFF]" />
                      <span>Guest Bookings & Check-ins</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8C8272]" />
                  </Link>
                  <Link
                    to="/operators/demand"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F4F8FF] hover:bg-[#F7FAFF]/60 border border-[#C9D9F7]/70 text-xs font-semibold text-[#241E17] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Flame className="w-4 h-4 text-blue-600" />
                      <span>Event Check-in Influx Surge</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8C8272]" />
                  </Link>
                </>
              )}

              {operatorType === "Transport" && (
                <>
                  <Link
                    to="/operators/routes"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F4F8FF] hover:bg-[#F7FAFF]/60 border border-[#C9D9F7]/70 text-xs font-semibold text-[#241E17] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Truck className="w-4 h-4 text-[#4F7CFF]" />
                      <span>Routes, Trips & Delays</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8C8272]" />
                  </Link>
                  <Link
                    to="/operators/demand"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F4F8FF] hover:bg-[#F7FAFF]/60 border border-[#C9D9F7]/70 text-xs font-semibold text-[#241E17] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <TrendingUp className="w-4 h-4 text-teal-600" />
                      <span>Transit Ingress/Egress Surge</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8C8272]" />
                  </Link>
                </>
              )}

              {operatorType === "Parking" && (
                <>
                  <Link
                    to="/operators/occupancy"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F4F8FF] hover:bg-[#F7FAFF]/60 border border-[#C9D9F7]/70 text-xs font-semibold text-[#241E17] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Car className="w-4 h-4 text-cyan-600" />
                      <span>Real-Time Bay Occupancy</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8C8272]" />
                  </Link>
                  <Link
                    to="/operators/entry-exit"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F4F8FF] hover:bg-[#F7FAFF]/60 border border-[#C9D9F7]/70 text-xs font-semibold text-[#241E17] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Zap className="w-4 h-4 text-indigo-600" />
                      <span>Barrier & Gate Controls</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8C8272]" />
                  </Link>
                </>
              )}

              {operatorType === "Food & Dining" && (
                <>
                  <Link
                    to="/operators/demand"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F4F8FF] hover:bg-[#F7FAFF]/60 border border-[#C9D9F7]/70 text-xs font-semibold text-[#241E17] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Flame className="w-4 h-4 text-blue-600" />
                      <span>Meal Rush & Peak Windows</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8C8272]" />
                  </Link>
                  <Link
                    to="/operators/capacity"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F4F8FF] hover:bg-[#F7FAFF]/60 border border-[#C9D9F7]/70 text-xs font-semibold text-[#241E17] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <UtensilsCrossed className="w-4 h-4 text-indigo-600" />
                      <span>Dining Covers & Service Limits</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8C8272]" />
                  </Link>
                </>
              )}

              {operatorType === "Medical & Assistance" && (
                <>
                  <Link
                    to="/operators/incidents"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F4F8FF] hover:bg-[#F7FAFF]/60 border border-[#C9D9F7]/70 text-xs font-semibold text-[#241E17] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <HeartPulse className="w-4 h-4 text-rose-600" />
                      <span>Incident Triage & Casualties</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8C8272]" />
                  </Link>
                  <Link
                    to="/operators/capacity"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F4F8FF] hover:bg-[#F7FAFF]/60 border border-[#C9D9F7]/70 text-xs font-semibold text-[#241E17] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-[#4F7CFF]" />
                      <span>Clinic Bed & Staff Allocation</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8C8272]" />
                  </Link>
                </>
              )}

              {operatorType === "Venue Services" && (
                <>
                  <Link
                    to="/operators/issues"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F4F8FF] hover:bg-[#F7FAFF]/60 border border-[#C9D9F7]/70 text-xs font-semibold text-[#241E17] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Wrench className="w-4 h-4 text-indigo-600" />
                      <span>Maintenance Work Orders</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8C8272]" />
                  </Link>
                  <Link
                    to="/operators/capacity"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F4F8FF] hover:bg-[#F7FAFF]/60 border border-[#C9D9F7]/70 text-xs font-semibold text-[#241E17] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Crew & Rigging Quotas</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8C8272]" />
                  </Link>
                </>
              )}

              {operatorType === "Other Services" && (
                <>
                  <Link
                    to="/operators/resources"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F4F8FF] hover:bg-[#F7FAFF]/60 border border-[#C9D9F7]/70 text-xs font-semibold text-[#241E17] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-[#4A4236]" />
                      <span>Manage Custom Units</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8C8272]" />
                  </Link>
                  <Link
                    to="/operators/availability"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F4F8FF] hover:bg-[#F7FAFF]/60 border border-[#C9D9F7]/70 text-xs font-semibold text-[#241E17] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Availability Matrix</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8C8272]" />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Today's Active Shift Details */}
          <div className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7]/80 p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-[#0B1120] font-heading">Current Event Assignment</h3>
            {assignedEvents.length === 0 ? (
              <p className="text-xs text-[#8C8272]">No events currently scheduled.</p>
            ) : (
              <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7]/60 space-y-1.5 text-xs">
                <p className="font-bold text-[#0B1120]">
                  {(assignedEvents[0] as any).eventName || (assignedEvents[0] as any).event?.name || "Assigned Event"}
                </p>
                <p className="text-[#6B6252]">
                  {(assignedEvents[0] as any).venue || (assignedEvents[0] as any).event?.venue || "Main Complex"}
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-[#C9D9F7]/60 text-[11px]">
                  <span className="text-[#8C8272]">Shift Window:</span>
                  <span className="font-bold text-[#2D5FD2]">08:00 - 18:00 (Active)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </OperatorLayout>
  );
};
