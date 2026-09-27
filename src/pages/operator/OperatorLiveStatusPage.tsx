import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Radio,
  Layers,
  Truck,
  Car,
  UtensilsCrossed,
  HeartPulse,
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sliders,
  RefreshCw,
  Plus,
  Minus,
  Save,
  Clock,
  BellRing,
  ShieldAlert,
} from "lucide-react";
import { OperatorLayout } from "../../components/operator/OperatorLayout";
import { useAuth } from "../../context/AuthContext";
import {
  getOperatorAssignedResources,
  updateOperatorResourceState,
} from "../../services/operatorAssignmentService";
import { LiveEventService } from "../../services/liveEventService";
import { getStoredActions } from "../../services/operationalActionService";
import { PredictionService } from "../../services/prediction/predictionService";
import { ResolvedOperatorResource } from "../../types/operator";
import { calculateUtilizationStatus } from "../../types/operational";
import { Sparkles, TrendingUp } from "lucide-react";

export const OperatorLiveStatusPage: React.FC = () => {
  const { user } = useAuth();
  const operatorId = user?.id || "";
  const operatorName = user?.fullName || user?.name || "Operator";

  const [refreshKey, setRefreshKey] = useState(0);
  const [activeFeedback, setActiveFeedback] = useState<{ id: string; msg: string; isError?: boolean } | null>(null);

  useEffect(() => {
    const handleUpdate = () => setRefreshKey((k) => k + 1);
    window.addEventListener("eventflow_live_state_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("eventflow_live_state_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const assignedResources = getOperatorAssignedResources(operatorId);
  const primaryEventId = assignedResources[0]?.event?.id || "";
  const primaryLiveState = primaryEventId ? LiveEventService.getEventLiveState(primaryEventId) : null;

  // Compute live prediction forecast
  const forecast = primaryEventId ? PredictionService.generateForecast(primaryEventId) : null;

  // Clock
  const clockInfo = primaryLiveState && assignedResources[0]?.event
    ? LiveEventService.getEventClockDisplay(
        assignedResources[0].event.date,
        assignedResources[0].event.time,
        primaryLiveState.liveStartedAt,
        primaryLiveState.status
      )
    : null;

  // Relevant active alerts for assigned resources
  const relevantAlerts = (primaryLiveState?.alerts || []).filter(
    (a) =>
      a.status === "ACTIVE" &&
      (a.audience === "Operators" || a.audience === "All")
  );

  // Relevant assigned actions
  const allActions = getStoredActions(primaryEventId);
  const assignedActions = allActions.filter(
    (act) => act.assignedToOperatorId === operatorId || act.assignedToOperatorName === operatorName
  );

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "transport":
        return Truck;
      case "parking":
        return Car;
      case "food":
        return UtensilsCrossed;
      case "medical":
        return HeartPulse;
      default:
        return Building;
    }
  };

  const handleQuickStatus = (item: ResolvedOperatorResource, newStatus: string) => {
    const res = updateOperatorResourceState(
      operatorId,
      operatorName,
      item.event.id,
      item.resource.id,
      item.resource.type,
      { status: newStatus }
    );

    if (res.success) {
      setActiveFeedback({ id: item.resource.id, msg: `Status set to ${newStatus}` });
      setTimeout(() => setActiveFeedback(null), 3000);
    } else {
      setActiveFeedback({ id: item.resource.id, msg: res.error || "Update failed", isError: true });
      setTimeout(() => setActiveFeedback(null), 4000);
    }
  };

  const handleDemandDelta = (item: ResolvedOperatorResource, delta: number) => {
    if (item.resource.type === "parking") {
      const currentOcc = item.resource.occupied ?? 0;
      const total = typeof item.resource.capacity === "number" ? item.resource.capacity : 500;
      const newOcc = Math.max(0, Math.min(total, currentOcc + delta));
      const newAvail = total - newOcc;

      const res = updateOperatorResourceState(
        operatorId,
        operatorName,
        item.event.id,
        item.resource.id,
        item.resource.type,
        {
          occupiedSpaces: newOcc,
          availableSpaces: newAvail,
          totalSpaces: total,
        }
      );

      if (res.success) {
        setActiveFeedback({ id: item.resource.id, msg: `Occupied: ${newOcc} / Avail: ${newAvail}` });
        setTimeout(() => setActiveFeedback(null), 2500);
      }
    } else {
      const currentDemandNum = parseInt(String(item.resource.currentDemand), 10) || 0;
      const newDemand = Math.max(0, currentDemandNum + delta);

      const res = updateOperatorResourceState(
        operatorId,
        operatorName,
        item.event.id,
        item.resource.id,
        item.resource.type,
        { currentDemand: newDemand }
      );

      if (res.success) {
        setActiveFeedback({ id: item.resource.id, msg: `Demand updated to ${newDemand}` });
        setTimeout(() => setActiveFeedback(null), 2500);
      }
    }
  };

  return (
    <OperatorLayout
      title="Live Operations Grid"
      subtitle="High-frequency operational controls for assigned event services."
    >
      <div className="space-y-6">
        {/* Top Synchronized Operational Banner */}
        <div className="bg-[#F0E9D6] rounded-3xl border border-[#C9D9F7] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#F7FAFF] text-[#4F7CFF] border border-[#EDE3CB]">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-[#0B1120] font-heading">
                  Operational Field Console
                </h3>
                {primaryLiveState && (
                  <>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border ${
                        primaryLiveState.status === "LIVE"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : "bg-[#F7FAFF] text-[#2D5FD2] border-[#C9D9F7]"
                      }`}
                    >
                      {primaryLiveState.status === "LIVE" ? "● LIVE" : primaryLiveState.status}
                    </span>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                        primaryLiveState.sourceType === "SIMULATION"
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                          : "bg-[#F7FAFF] text-[#382F27] border-[#C9D9F7]"
                      }`}
                    >
                      SOURCE: {primaryLiveState.sourceType}
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-[#6B6252] mt-1">
                Reads strictly from Central Event State. Changes publish directly to Organizer & Attendee journeys.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {clockInfo && (
              <div className="px-3 py-1.5 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7] text-right">
                <span className="block text-[9px] uppercase font-mono text-[#8C8272] font-bold">
                  {clockInfo.label}
                </span>
                <span className="text-xs font-bold font-mono text-emerald-600">
                  {clockInfo.timeString}
                </span>
              </div>
            )}

            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Central Sync Online
            </span>
          </div>
        </div>

        {/* Phase 15: Operator Predictive Projections & Ahead-of-Time Alert Panel */}
        {forecast && (
          <div className="p-5 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0B1120] font-heading">
                    Operator Predictive Forecasting (+30 Min Projection)
                  </h4>
                  <p className="text-[11px] text-[#6B6252]">
                    Ahead-of-time telemetry projections specifically for your assigned station.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {forecast.forecastReliability} RELIABILITY
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {assignedResources.map((item) => {
                const pForecast =
                  forecast.parkingForecasts[item.resource.id] ||
                  forecast.transportForecasts[item.resource.id] ||
                  forecast.hospitalityForecasts[item.resource.id];

                if (!pForecast) return null;

                const isProjectedPressure = pForecast.predictedUtilization30m >= 75;

                return (
                  <div
                    key={item.resource.id}
                    className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                      isProjectedPressure
                        ? "bg-blue-50/70 border-blue-200 text-blue-950"
                        : "bg-[#F4F8FF] border-[#C9D9F7] text-[#0B1120]"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{item.resource.name}</span>
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                          isProjectedPressure
                            ? "bg-blue-100 text-blue-800 border-blue-300"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        PREDICTED (+30m): {pForecast.predictedUtilization30m}%
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-[11px] font-mono">
                      <span className="text-[#6B6252]">
                        Current: {pForecast.currentUsage} ({pForecast.currentUtilization}%)
                      </span>
                      <span className="font-bold text-indigo-700">
                        → Projected: {pForecast.predictedUsage30m} / {pForecast.capacity} ({pForecast.predictedStatus})
                      </span>
                    </div>

                    <p className="text-[11px] text-[#4A4236] font-sans leading-relaxed">
                      {pForecast.explanation}
                    </p>

                    {pForecast.timeToThresholdMinutes && pForecast.timeToThresholdMinutes > 0 && (
                      <div className="text-[10px] font-mono font-bold text-blue-800 pt-0.5">
                        ⚠️ Projected to reach high threshold in ~{pForecast.timeToThresholdMinutes} minutes.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Assigned Operational Directives Banner if actions pending */}
        {assignedActions.length > 0 && (
          <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-950 space-y-2">
            <div className="flex items-center justify-between font-bold text-indigo-900">
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span>Assigned Operational Directives ({assignedActions.length})</span>
              </span>
              <span className="text-[10px] font-mono uppercase bg-indigo-100 px-2 py-0.5 rounded text-indigo-700 font-bold">
                Assigned to your post
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {assignedActions.map((act) => (
                <div key={act.actionId} className="p-2.5 rounded-xl bg-[#F0E9D6] border border-indigo-100 space-y-1">
                  <div className="font-bold text-[#241E17] flex items-center justify-between">
                    <span>{act.title}</span>
                    <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase">
                      {act.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4A4236]">{act.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Alerts for this resource */}
        {relevantAlerts.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase font-bold text-[#6B6252] flex items-center gap-1.5">
              <BellRing className="w-3.5 h-3.5 text-blue-500" />
              <span>Active Threshold Advisories ({relevantAlerts.length})</span>
            </span>
            <div className="space-y-2">
              {relevantAlerts.map((alt) => (
                <div
                  key={alt.id}
                  className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                    alt.severity === "CRITICAL"
                      ? "bg-rose-50 border-rose-200 text-rose-900"
                      : "bg-blue-50 border-blue-200 text-blue-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <div>
                      <span className="font-bold">{alt.title}</span>
                      <p className="text-[11px] opacity-90">{alt.message}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-[#F0E9D6]/70 border shrink-0">
                    {alt.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grid of Assigned Resource Control Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignedResources.map((item) => {
            const Icon = getResourceIcon(item.resource.type);
            const statusStr = String(item.resource.status).toUpperCase();
            const capNum = typeof item.resource.capacity === "number" ? item.resource.capacity : parseInt(String(item.resource.capacity), 10) || 100;
            const occNum = item.resource.occupied !== undefined ? item.resource.occupied : parseInt(String(item.resource.currentDemand), 10) || 0;
            const percent = capNum > 0 ? Math.min(100, Math.round((occNum / capNum) * 100)) : 0;
            const centralStatus = calculateUtilizationStatus(percent);

            const isFeedback = activeFeedback?.id === item.resource.id;

            return (
              <div
                key={`${item.event.id}-${item.resource.id}`}
                className="bg-[#F0E9D6] rounded-3xl border border-[#C9D9F7] p-5 sm:p-6 shadow-xs hover:border-[#C9BBA0] transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-2xl bg-[#F7FAFF] text-[#4F7CFF]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-[#0B1120] font-heading">{item.resource.name}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F7FAFF] text-[#382F27] uppercase">
                          {item.resource.type}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B6252] mt-0.5">{item.event.name}</p>
                    </div>
                  </div>

                  <Link
                    to={`/operators/events/${item.event.id}/resources/${item.resource.id}`}
                    className="p-2 rounded-xl text-[#8C8272] hover:text-[#382F27] hover:bg-[#F7FAFF]"
                    title="Full details"
                  >
                    <Sliders className="w-4 h-4" />
                  </Link>
                </div>

                {/* Feedback toast */}
                {isFeedback && (
                  <div
                    className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                      activeFeedback.isError
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {activeFeedback.isError ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>{activeFeedback.msg}</span>
                  </div>
                )}

                {/* Capacity Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6B6252] font-medium">
                      {item.resource.type === "parking" ? "Occupancy Load" : "Current Demand vs Capacity"}
                    </span>
                    <span className="font-bold font-mono text-[#0B1120]">
                      {occNum.toLocaleString()} / {capNum.toLocaleString()} ({percent}%) •{" "}
                      <span className="uppercase text-[#4F7CFF]">{centralStatus}</span>
                    </span>
                  </div>

                  <div className="h-2 w-full bg-[#F7FAFF] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        percent >= 90
                          ? "bg-rose-500"
                          : percent >= 75
                          ? "bg-blue-500"
                          : "bg-[#4F7CFF]"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Quick Demand Increment / Decrement Stepper */}
                <div className="p-3.5 rounded-2xl bg-[#F4F8FF] border border-[#F7FAFF] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#6B6252] uppercase font-mono block">
                      {item.resource.type === "parking" ? "Occupied Spaces" : "Current Demand"}
                    </span>
                    <span className="text-base font-extrabold font-mono text-[#0B1120]">{occNum.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDemandDelta(item, -10)}
                      className="px-2 py-1.5 rounded-xl bg-[#F0E9D6] border border-[#C9D9F7] text-[#382F27] hover:bg-[#F7FAFF] active:scale-95 transition-all text-xs font-bold font-mono cursor-pointer"
                      title="-10"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => handleDemandDelta(item, -1)}
                      className="p-1.5 rounded-xl bg-[#F0E9D6] border border-[#C9D9F7] text-[#382F27] hover:bg-[#F7FAFF] active:scale-95 transition-all cursor-pointer"
                      title="-1"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDemandDelta(item, 1)}
                      className="p-1.5 rounded-xl bg-[#F0E9D6] border border-[#C9D9F7] text-[#382F27] hover:bg-[#F7FAFF] active:scale-95 transition-all cursor-pointer"
                      title="+1"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDemandDelta(item, 10)}
                      className="px-2 py-1.5 rounded-xl bg-[#F0E9D6] border border-[#C9D9F7] text-[#382F27] hover:bg-[#F7FAFF] active:scale-95 transition-all text-xs font-bold font-mono cursor-pointer"
                      title="+10"
                    >
                      +10
                    </button>
                  </div>
                </div>

                {/* Quick Status Buttons */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-[#6B6252] uppercase font-mono">Set Operational Status</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {item.resource.type === "transport" &&
                      ["ACTIVE", "DELAYED", "DISRUPTED", "STANDBY"].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleQuickStatus(item, s)}
                          className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all truncate cursor-pointer ${
                            statusStr === s
                              ? "bg-[#4F7CFF] text-white border-[#4F7CFF] shadow-xs"
                              : "bg-[#F4F8FF] text-[#382F27] border-[#C9D9F7] hover:bg-[#F7FAFF]"
                          }`}
                        >
                          {s}
                        </button>
                      ))}

                    {item.resource.type === "parking" &&
                      ["AVAILABLE", "FILLING", "NEAR CAPACITY", "FULL"].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleQuickStatus(item, s)}
                          className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all truncate cursor-pointer ${
                            statusStr === s
                              ? "bg-[#4F7CFF] text-white border-[#4F7CFF] shadow-xs"
                              : "bg-[#F4F8FF] text-[#382F27] border-[#C9D9F7] hover:bg-[#F7FAFF]"
                          }`}
                        >
                          {s}
                        </button>
                      ))}

                    {item.resource.type !== "transport" &&
                      item.resource.type !== "parking" &&
                      ["Operational", "High Demand", "Limited", "Standby"].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleQuickStatus(item, s)}
                          className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all truncate cursor-pointer ${
                            String(item.resource.status).toLowerCase() === s.toLowerCase()
                              ? "bg-[#4F7CFF] text-white border-[#4F7CFF] shadow-xs"
                              : "bg-[#F4F8FF] text-[#382F27] border-[#C9D9F7] hover:bg-[#F7FAFF]"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </OperatorLayout>
  );
};
