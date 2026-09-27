import React, { useState } from "react";
import {
  TrendingUp,
  Flame,
  Users,
  Clock,
  Sparkles,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { OperatorLayout } from "../../components/operator/OperatorLayout";
import { useAuth } from "../../context/AuthContext";
import { OperatorUser, normalizeOperatorType } from "../../types/auth";
import { getOperatorEvents } from "../../services/operatorAssignmentService";

export const OperatorDemandPage: React.FC = () => {
  const { user } = useAuth();
  const operatorUser = user as OperatorUser | null;
  const operatorId = user?.id || "";
  const operatorType = normalizeOperatorType(operatorUser?.operatorType);

  const assignedEvents = getOperatorEvents(operatorId);
  const [activeEventIndex, setActiveEventIndex] = useState(0);

  const currentEvent = assignedEvents[activeEventIndex] || {
    eventId: "ev-summit-2026",
    eventName: "Global AI & Cloud Architecture Summit 2026",
    venue: "Bandra Kurla Convention Complex, Mumbai",
    date: "2026-10-24",
  };

  const getSurgeWindows = () => {
    switch (operatorType) {
      case "Accommodation":
        return [
          {
            timeWindow: "08:00 AM - 11:00 AM",
            label: "Early Arrival Wave",
            projectedSurge: "+65% Check-in Influx",
            severity: "High",
            action: "Open express keycard kiosk; prepare luggage hold zone.",
          },
          {
            timeWindow: "01:00 PM - 03:00 PM",
            label: "VIP Delegate Ingress",
            projectedSurge: "+40% Executive Stays",
            severity: "Medium",
            action: "Ensure club suite amenities and welcome baskets are placed.",
          },
          {
            timeWindow: "06:30 PM - 09:30 PM",
            label: "Evening Return Wave",
            projectedSurge: "+85% Room Re-entry & Room Service",
            severity: "High",
            action: "Staff concierge desk and prepare fast-dining evening room delivery.",
          },
        ];
      case "Transport":
        return [
          {
            timeWindow: "07:30 AM - 09:45 AM",
            label: "Morning Ingress Spike",
            projectedSurge: "+140% Passenger Boarding",
            severity: "Critical",
            action: "Deploy all standby feeder buses; reduce headway from 15m to 6m.",
          },
          {
            timeWindow: "12:30 PM - 02:00 PM",
            label: "Inter-Hall Shuttle Shifts",
            projectedSurge: "+50% Short Trips",
            severity: "Medium",
            action: "Maintain 10m regular circular routes between North and South concourses.",
          },
          {
            timeWindow: "05:15 PM - 07:45 PM",
            label: "Evening Egress Exodus",
            projectedSurge: "+180% Metro Station Transfers",
            severity: "Critical",
            action: "Queue empty coaches in holding bay 3 for rapid continuous dispatch.",
          },
        ];
      case "Food & Dining":
      default:
        return [
          {
            timeWindow: "10:30 AM - 11:30 AM",
            label: "Mid-Morning Coffee & Snack Surge",
            projectedSurge: "+90% Beverage Queues",
            severity: "High",
            action: "Pre-brew filter coffees; stock grab-and-go artisan pastries.",
          },
          {
            timeWindow: "12:30 PM - 02:30 PM",
            label: "Keynote Lunch Break Peak",
            projectedSurge: "+220% Main Meal Rush",
            severity: "Critical",
            action: "Open 4 additional quick-serve POS counters; pre-box combo meals.",
          },
          {
            timeWindow: "04:30 PM - 06:00 PM",
            label: "Post-Session Tea & Snack Flow",
            projectedSurge: "+70% Refreshments",
            severity: "Medium",
            action: "Replenish bottled beverages and quick finger food stalls.",
          },
        ];
    }
  };

  const surgeWindows = getSurgeWindows();

  return (
    <OperatorLayout
      title="Event Demand & Surge Prediction"
      subtitle="Anticipate attendee flow peaks, adjust resource capacity in advance, and prevent bottlenecks."
    >
      {/* Event Selector Header */}
      <div className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7]/80 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Active Demand Model</span>
            <h3 className="font-bold text-base text-[#0B1120] font-heading">
              {(currentEvent as any).eventName || currentEvent.name}
            </h3>
            <p className="text-xs text-[#6B6252]">
              {currentEvent.venue} • {currentEvent.date}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {assignedEvents.length > 1 && (
            <select
              value={activeEventIndex}
              onChange={(e) => setActiveEventIndex(Number(e.target.value))}
              className="px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs font-semibold text-[#241E17] focus:outline-none"
            >
              {assignedEvents.map((ev, idx) => (
                <option key={(ev as any).eventId || ev.id || idx} value={idx}>
                  {(ev as any).eventName || ev.name}
                </option>
              ))}
            </select>
          )}
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Forecast Synced
          </span>
        </div>
      </div>

      {/* Projection Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Total Projected Attendees</span>
            <div className="p-2 rounded-xl bg-[#F7FAFF] text-[#4F7CFF]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0B1120] mt-2 font-heading">12,450</p>
          <p className="text-xs text-[#6B6252] mt-0.5">+18% vs yesterday's pre-registration</p>
        </div>

        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Peak Demand Window</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-700 mt-2 font-heading">12:30 PM - 2:30 PM</p>
          <p className="text-xs text-[#6B6252] mt-0.5">Highest concentration index</p>
        </div>

        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Demand Stress Index</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-2 font-heading">High (Tier 2)</p>
          <p className="text-xs text-[#6B6252] mt-0.5">Reserve capacity allocation recommended</p>
        </div>
      </div>

      {/* Surge Wave Timetable */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-[#0B1120] font-heading">Projected Surge Windows & Operator Directives</h3>
          <span className="text-xs text-[#6B6252] font-medium">Timeline auto-calibrated by EventFlow schedule</span>
        </div>

        <div className="space-y-3">
          {surgeWindows.map((wave, idx) => (
            <div
              key={idx}
              className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7]/80 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-3 rounded-2xl shrink-0 ${
                    wave.severity === "Critical"
                      ? "bg-rose-50 text-rose-600 border border-rose-200"
                      : wave.severity === "High"
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "bg-[#F7FAFF] text-[#4F7CFF] border border-[#C9D9F7]"
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#0B1120] bg-[#F7FAFF] px-2 py-0.5 rounded-md">
                      {wave.timeWindow}
                    </span>
                    <h4 className="font-bold text-sm text-[#0B1120] font-heading">{wave.label}</h4>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        wave.severity === "Critical"
                          ? "bg-rose-100 text-rose-800"
                          : wave.severity === "High"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-[#EDE3CB] text-[#6b5024]"
                      }`}
                    >
                      {wave.projectedSurge}
                    </span>
                  </div>
                  <p className="text-xs text-[#4A4236] mt-1 font-medium">
                    <strong className="text-[#0B1120]">Recommended Action:</strong> {wave.action}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7] text-[#382F27] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Protocol Active</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </OperatorLayout>
  );
};
