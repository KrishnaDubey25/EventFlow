import React, { useState } from "react";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Layers,
  Car,
  Bus,
  Users2,
  UtensilsCrossed,
  AlertTriangle,
  Info,
  ShieldCheck,
  ChevronRight,
  Activity,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import {
  PredictedEventState,
  ForecastHorizon,
  PredictionReliability,
} from "../../types/intelligence";

interface PredictionTimelineCardProps {
  predictedState: PredictedEventState;
  selectedHorizon: ForecastHorizon;
  onSelectHorizon: (horizon: ForecastHorizon) => void;
}

export const PredictionTimelineCard: React.FC<PredictionTimelineCardProps> = ({
  predictedState,
  selectedHorizon,
  onSelectHorizon,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<"crowd" | "parking" | "transport" | "zones">("crowd");
  const [showExplanation, setShowExplanation] = useState<boolean>(true);

  const horizons: ForecastHorizon[] = [15, 30, 60, 120];

  const getReliabilityBadge = (rel: PredictionReliability) => {
    switch (rel) {
      case "HIGH":
        return "bg-emerald-50 text-emerald-700 border-emerald-300";
      case "MEDIUM":
        return "bg-[#F7FAFF] text-[#2D5FD2] border-[#C9D9F7]";
      case "LOW":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "INSUFFICIENT_DATA":
      default:
        return "bg-[#F7FAFF] text-[#4A4236] border-[#C9BBA0]";
    }
  };

  const getStatusColor = (util: number) => {
    if (util >= 90) return "bg-rose-50 text-rose-700 border-rose-200";
    if (util >= 75) return "bg-blue-50 text-blue-700 border-blue-200";
    if (util >= 60) return "bg-[#F7FAFF] text-[#2D5FD2] border-[#C9D9F7]";
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };

  const getPredictedPaxForHorizon = (h: ForecastHorizon) => {
    switch (h) {
      case 15:
        return predictedState.predictedAttendees15m;
      case 30:
        return predictedState.predictedAttendees30m;
      case 60:
        return predictedState.predictedAttendees60m;
      case 120:
        return predictedState.predictedAttendees120m;
    }
  };

  const getPredictedUtilForHorizon = (h: ForecastHorizon) => {
    switch (h) {
      case 15:
        return predictedState.predictedUtilization15m;
      case 30:
        return predictedState.predictedUtilization30m;
      case 60:
        return predictedState.predictedUtilization60m;
      case 120:
        return predictedState.predictedUtilization120m;
    }
  };

  return (
    <div className="rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs p-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#F7FAFF]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#0B1120] font-heading">
                Predictive Forecasting Engine
              </h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                Forecast Engine
              </span>
            </div>
            <p className="text-xs text-[#6B6252] mt-0.5">
              Multi-horizon mathematical projection consuming central live event telemetry.
            </p>
          </div>
        </div>

        {/* Reliability Indicator & Data Sufficiency */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-[#8C8272] block">Forecast Reliability</span>
            <span
              className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full uppercase border ${getReliabilityBadge(
                predictedState.forecastReliability
              )}`}
            >
              {predictedState.dataSufficiency === "INSUFFICIENT_DATA"
                ? "INSUFFICIENT DATA"
                : `${predictedState.forecastReliability} RELIABILITY`}
            </span>
          </div>

          <span className="text-[10px] text-[#8C8272] font-mono hidden md:inline">
            ({predictedState.sampleObservationsCount} samples)
          </span>
        </div>
      </div>

      {/* Visual Prediction Horizon Stepper / Timeline: NOW -> 15m -> 30m -> 60m -> 120m */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#6B6252] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Forecasting Timeline Horizons:</span>
          </span>
          <span className="text-[11px] text-[#8C8272] font-mono">
            Selected Horizon: +{selectedHorizon} Minutes
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          {/* NOW (Current Real Telemetry) */}
          <div className="p-3.5 rounded-2xl bg-[#0B1120] text-white border border-[#241E17] shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
                CURRENT
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="my-2">
              <div className="text-lg font-black font-mono">
                {predictedState.currentAttendees.toLocaleString()}
              </div>
              <div className="text-[10px] text-[#8C8272] font-mono">Total Attendance</div>
            </div>
            <span className="text-[9px] font-mono text-[#8C8272]">Baseline Ground Truth</span>
          </div>

          {/* +15 MIN (PREDICTED) */}
          {horizons.map((h) => {
            const isSelected = selectedHorizon === h;
            const predPax = getPredictedPaxForHorizon(h);
            const predUtil = getPredictedUtilForHorizon(h);
            const deltaPax = predPax - predictedState.currentAttendees;

            return (
              <button
                key={h}
                onClick={() => onSelectHorizon(h)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-indigo-50/90 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20"
                    : "bg-[#F4F8FF]/70 border-[#C9D9F7]/80 hover:bg-[#F7FAFF] hover:border-[#C9BBA0]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isSelected ? "bg-indigo-600 text-white" : "bg-[#F0E9D6] text-[#382F27] border border-[#C9D9F7]"
                    }`}
                  >
                    PREDICTED +{h}M
                  </span>
                  <span
                    className={`text-[10px] font-bold font-mono ${
                      deltaPax >= 0 ? "text-emerald-600" : "text-blue-600"
                    }`}
                  >
                    {deltaPax >= 0 ? `+${deltaPax.toLocaleString()}` : deltaPax.toLocaleString()}
                  </span>
                </div>

                <div className="my-2">
                  <div className="text-lg font-black font-mono text-[#0B1120]">
                    {predPax.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[#6B6252] font-mono">
                    Projected: {predUtil}% Load
                  </div>
                </div>

                <span
                  className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border inline-block ${getStatusColor(
                    predUtil
                  )}`}
                >
                  {predUtil >= 90 ? "CRITICAL" : predUtil >= 75 ? "HIGH" : predUtil >= 60 ? "MODERATE" : "NORMAL"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#F7FAFF] border border-[#C9D9F7]/80">
            <button
              onClick={() => setSelectedMetric("crowd")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedMetric === "crowd"
                  ? "bg-[#F0E9D6] text-[#0B1120] shadow-xs"
                  : "text-[#4A4236] hover:text-[#0B1120]"
              }`}
            >
              <Users2 className="w-3.5 h-3.5" />
              <span>Overall Crowd</span>
            </button>

            <button
              onClick={() => setSelectedMetric("parking")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedMetric === "parking"
                  ? "bg-[#F0E9D6] text-[#0B1120] shadow-xs"
                  : "text-[#4A4236] hover:text-[#0B1120]"
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Parking Projection</span>
            </button>

            <button
              onClick={() => setSelectedMetric("transport")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedMetric === "transport"
                  ? "bg-[#F0E9D6] text-[#0B1120] shadow-xs"
                  : "text-[#4A4236] hover:text-[#0B1120]"
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>Transit Projection</span>
            </button>

            <button
              onClick={() => setSelectedMetric("zones")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedMetric === "zones"
                  ? "bg-[#F0E9D6] text-[#0B1120] shadow-xs"
                  : "text-[#4A4236] hover:text-[#0B1120]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Crowd Zones</span>
            </button>
          </div>

          <button
            onClick={() => setShowExplanation((prev) => !prev)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showExplanation ? "Hide Explanation" : "Why this is predicted"}</span>
          </button>
        </div>

        {/* Explanation Banner (No Black Box Guarantee) */}
        {showExplanation && (
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100/90 text-xs text-indigo-950 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>WHY THIS IS PREDICTED (Transparent Mathematical Provenance)</span>
            </div>
            <p className="text-[11px] leading-relaxed text-indigo-900/90 font-mono">
              {predictedState.explanation}
            </p>
          </div>
        )}

        {/* Tab 1: Crowd Forecast Table / Cards */}
        {selectedMetric === "crowd" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7] space-y-2">
              <span className="text-[10px] uppercase font-mono text-[#8C8272] font-bold block">
                Arrival Wave Forecast
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                    predictedState.arrivalWave.isWaveDetected
                      ? "bg-blue-100 text-blue-800 border-blue-300"
                      : "bg-emerald-100 text-emerald-800 border-emerald-200"
                  }`}
                >
                  {predictedState.arrivalWave.isWaveDetected
                    ? `Wave Detected (${predictedState.arrivalWave.waveIntensity})`
                    : "Nominal Arrival Ingress"}
                </span>
              </div>
              <p className="text-[11px] text-[#4A4236]">{predictedState.arrivalWave.description}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7] space-y-2">
              <span className="text-[10px] uppercase font-mono text-[#8C8272] font-bold block">
                Dispersal / Exit Forecast
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                    predictedState.exitWave.isDispersalWaveDetected
                      ? "bg-rose-100 text-rose-800 border-rose-300"
                      : "bg-[#EDE3CB] text-[#6b5024] border-[#C9D9F7]"
                  }`}
                >
                  {predictedState.exitWave.isDispersalWaveDetected
                    ? "Dispersal Active"
                    : "Post-Event Dispersal Projected"}
                </span>
              </div>
              <p className="text-[11px] text-[#4A4236]">{predictedState.exitWave.description}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7] space-y-2">
              <span className="text-[10px] uppercase font-mono text-[#8C8272] font-bold block">
                Predicted Peak Attendance
              </span>
              <div className="text-xl font-bold font-mono text-[#0B1120]">
                {predictedState.predictedAttendees60m.toLocaleString()}{" "}
                <span className="text-xs text-[#8C8272] font-normal">at +60m</span>
              </div>
              <p className="text-[11px] text-[#6B6252] font-mono">
                Projected Utilization: {predictedState.predictedUtilization60m}%
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Parking Forecast */}
        {selectedMetric === "parking" && (
          <div className="space-y-3 pt-1">
            {Object.values(predictedState.parkingForecasts).map((p) => (
              <div
                key={p.resourceId}
                className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#241E17] text-sm">{p.resourceName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0E9D6] text-[#4A4236] border">
                      Cap: {p.capacity.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#6B6252] font-mono">
                    Current: <strong className="text-[#241E17]">{p.currentUsage} ({p.currentUtilization}%)</strong> →
                    PREDICTED (+{selectedHorizon}m):{" "}
                    <strong className="text-indigo-700">
                      {selectedHorizon === 15
                        ? p.predictedUsage15m
                        : selectedHorizon === 30
                        ? p.predictedUsage30m
                        : selectedHorizon === 60
                        ? p.predictedUsage60m
                        : p.predictedUsage120m}{" "}
                      (
                      {selectedHorizon === 15
                        ? p.predictedUtilization15m
                        : selectedHorizon === 30
                        ? p.predictedUtilization30m
                        : selectedHorizon === 60
                        ? p.predictedUtilization60m
                        : p.predictedUtilization120m}
                      %)
                    </strong>
                  </div>
                  <p className="text-[10px] text-[#8C8272] font-mono">{p.explanation}</p>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded uppercase border ${getStatusColor(
                      selectedHorizon === 30 ? p.predictedUtilization30m : p.predictedUtilization60m
                    )}`}
                  >
                    PREDICTED: {p.predictedStatus}
                  </span>
                  {p.timeToThresholdMinutes && (
                    <span className="block text-[10px] font-mono text-blue-600 mt-1">
                      ⚠️ Crosses {p.targetThresholdName} in ~{p.timeToThresholdMinutes}m
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Transport Forecast */}
        {selectedMetric === "transport" && (
          <div className="space-y-3 pt-1">
            {Object.values(predictedState.transportForecasts).map((t) => (
              <div
                key={t.resourceId}
                className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#241E17] text-sm">{t.resourceName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0E9D6] text-[#4A4236] border">
                      Throughput Cap: {t.capacity.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#6B6252] font-mono">
                    Current Load: <strong className="text-[#241E17]">{t.currentUsage} ({t.currentUtilization}%)</strong> →
                    PREDICTED (+{selectedHorizon}m):{" "}
                    <strong className="text-indigo-700">
                      {selectedHorizon === 15
                        ? t.predictedUsage15m
                        : selectedHorizon === 30
                        ? t.predictedUsage30m
                        : selectedHorizon === 60
                        ? t.predictedUsage60m
                        : t.predictedUsage120m}{" "}
                      (
                      {selectedHorizon === 15
                        ? t.predictedUtilization15m
                        : selectedHorizon === 30
                        ? t.predictedUtilization30m
                        : selectedHorizon === 60
                        ? t.predictedUtilization60m
                        : t.predictedUtilization120m}
                      %)
                    </strong>
                  </div>
                  <p className="text-[10px] text-[#8C8272] font-mono">{t.explanation}</p>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded uppercase border ${getStatusColor(
                      selectedHorizon === 30 ? t.predictedUtilization30m : t.predictedUtilization60m
                    )}`}
                  >
                    PREDICTED: {t.predictedStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Crowd Zones Forecast */}
        {selectedMetric === "zones" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {Object.values(predictedState.zoneForecasts).map((z) => {
              const predCount =
                selectedHorizon === 15
                  ? z.predictedCount15m
                  : selectedHorizon === 30
                  ? z.predictedCount30m
                  : selectedHorizon === 60
                  ? z.predictedCount60m
                  : z.predictedCount120m;
              const predUtil =
                selectedHorizon === 15
                  ? z.predictedUtilization15m
                  : selectedHorizon === 30
                  ? z.predictedUtilization30m
                  : selectedHorizon === 60
                  ? z.predictedUtilization60m
                  : z.predictedUtilization120m;

              return (
                <div key={z.zoneId} className="p-3.5 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#241E17] truncate">{z.zoneName}</span>
                  </div>
                  <div className="text-xs font-mono space-y-0.5">
                    <div className="text-[#6B6252] text-[10px]">
                      Current: {z.currentCount.toLocaleString()} ({z.currentUtilization}%)
                    </div>
                    <div className="font-bold text-indigo-700">
                      PREDICTED: {predCount.toLocaleString()} ({predUtil}%)
                    </div>
                  </div>
                  <div className="w-full bg-[#C9D9F7] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        predUtil > 90 ? "bg-rose-500" : predUtil > 75 ? "bg-blue-500" : "bg-indigo-600"
                      }`}
                      style={{ width: `${Math.min(100, predUtil)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 20: Predicted Alerts & Potential Impact */}
      {predictedState.predictionAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-blue-600" />
              <span>Projected Operational Pressure Notices ({predictedState.predictionAlerts.length})</span>
            </span>
            <span className="text-[10px] font-mono text-blue-800 font-bold">
              EARLY WARNING SYSTEM
            </span>
          </div>

          <div className="space-y-2">
            {predictedState.predictionAlerts.map((alt) => (
              <div
                key={alt.predictionId}
                className="p-3 rounded-xl bg-[#F0E9D6] border border-blue-200 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0B1120]">{alt.title}</span>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {alt.severity.replace("PREDICTED_", "")}
                  </span>
                </div>
                <p className="text-[11px] text-[#4A4236]">{alt.message}</p>
                <div className="pt-1 border-t border-[#F7FAFF] flex items-center gap-1.5 text-[10px] text-[#6B6252]">
                  <span className="font-bold text-[#382F27]">POTENTIAL IMPACT:</span>
                  <span>{alt.potentialImpact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
