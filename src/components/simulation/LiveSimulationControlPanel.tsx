import React, { useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  TrendingUp,
  Car,
  Bus,
  Users2,
  AlertTriangle,
  Sliders,
  Flame,
  Radio,
  Clock,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { LiveSimulationConfig, TelemetrySourceType } from "../../types/operational";

interface LiveSimulationControlPanelProps {
  eventId: string;
  isSimulating: boolean;
  simulationConfig?: LiveSimulationConfig;
  sourceType?: TelemetrySourceType;
  onStartSimulation: (config?: Partial<LiveSimulationConfig>) => void;
  onPauseSimulation: () => void;
  onResetSimulation: () => void;
  onIncreaseArrivalRate: (delta?: number) => void;
  onIncreaseParkingDemand: (delta?: number) => void;
  onIncreaseTransportDemand: (delta?: number) => void;
  onTriggerCrowdSurge: () => void;
  onTriggerParkingPressure: () => void;
  onTriggerTransportPressure: () => void;
  onTriggerEventDispersal: () => void;
  onSetPhase14TestStage?: (stage: 0 | 1 | 2 | 3) => void;
  onRunPhase16Workflow?: () => void;
}

export const LiveSimulationControlPanel: React.FC<LiveSimulationControlPanelProps> = ({
  eventId,
  isSimulating,
  simulationConfig,
  sourceType,
  onStartSimulation,
  onPauseSimulation,
  onResetSimulation,
  onIncreaseArrivalRate,
  onIncreaseParkingDemand,
  onIncreaseTransportDemand,
  onTriggerCrowdSurge,
  onTriggerParkingPressure,
  onTriggerTransportPressure,
  onTriggerEventDispersal,
  onSetPhase14TestStage,
  onRunPhase16Workflow,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [activePreset, setActivePreset] = useState<string>("nominal");

  const isRunning = isSimulating || simulationConfig?.isRunning;

  return (
    <div className="rounded-3xl bg-[#0B1120] border-2 border-indigo-500/40 text-white shadow-2xl p-5 sm:p-6 font-sans relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with mandatory DEMO / SIMULATION CONTROLS banner */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#241E17]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                DEMO / SIMULATION CONTROLS
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                  isRunning
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/40 animate-pulse"
                    : "bg-[#241E17] text-[#8C8272] border-[#382F27]"
                }`}
              >
                ● {isRunning ? "SIMULATION ACTIVE" : "SIMULATION PAUSED"}
              </span>
            </div>
            <p className="text-xs text-[#8C8272] mt-1">
              Controlled synthetic event telemetry generator. Real-time changes propagate to Organizer, Operator, and Attendee views.
            </p>
          </div>
        </div>

        {/* Global Simulation Primary Toggles */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {!isRunning ? (
            <button
              onClick={() => onStartSimulation()}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Simulation</span>
            </button>
          ) : (
            <button
              onClick={onPauseSimulation}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause Simulation</span>
            </button>
          )}

          <button
            onClick={onResetSimulation}
            title="Reset to Baseline"
            className="px-3 py-2 rounded-xl text-xs font-bold bg-[#241E17] hover:bg-[#382F27] text-[#C9BBA0] border border-[#382F27] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* Controlled Parameter Rates Readout & Increments */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-[#241E17]/80">
        {/* Arrival Rate */}
        <div className="p-3 rounded-2xl bg-[#241E17]/60 border border-[#382F27]/60">
          <div className="flex items-center justify-between text-[#8C8272] text-[10px] font-mono uppercase">
            <span>Arrival Rate</span>
            <Users2 className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-1 text-lg font-bold font-mono text-white">
            {simulationConfig?.arrivalRate || 60}{" "}
            <span className="text-[10px] font-normal text-[#8C8272]">pax/min</span>
          </div>
          <button
            onClick={() => onIncreaseArrivalRate(80)}
            className="mt-2 w-full py-1 text-[10px] font-bold rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <TrendingUp className="w-2.5 h-2.5" />
            <span>+80 pax/min</span>
          </button>
        </div>

        {/* Parking Demand Rate */}
        <div className="p-3 rounded-2xl bg-[#241E17]/60 border border-[#382F27]/60">
          <div className="flex items-center justify-between text-[#8C8272] text-[10px] font-mono uppercase">
            <span>Parking Inflow</span>
            <Car className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-1 text-lg font-bold font-mono text-white">
            {simulationConfig?.parkingDemandRate || 25}{" "}
            <span className="text-[10px] font-normal text-[#8C8272]">cars/min</span>
          </div>
          <button
            onClick={() => onIncreaseParkingDemand(30)}
            className="mt-2 w-full py-1 text-[10px] font-bold rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <TrendingUp className="w-2.5 h-2.5" />
            <span>+30 cars/min</span>
          </button>
        </div>

        {/* Transport Demand Rate */}
        <div className="p-3 rounded-2xl bg-[#241E17]/60 border border-[#382F27]/60">
          <div className="flex items-center justify-between text-[#8C8272] text-[10px] font-mono uppercase">
            <span>Transit Demand</span>
            <Bus className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-1 text-lg font-bold font-mono text-white">
            {simulationConfig?.transportDemandRate || 30}{" "}
            <span className="text-[10px] font-normal text-[#8C8272]">pax/min</span>
          </div>
          <button
            onClick={() => onIncreaseTransportDemand(35)}
            className="mt-2 w-full py-1 text-[10px] font-bold rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <TrendingUp className="w-2.5 h-2.5" />
            <span>+35 pax/min</span>
          </button>
        </div>

        {/* Exit / Dispersal Rate */}
        <div className="p-3 rounded-2xl bg-[#241E17]/60 border border-[#382F27]/60">
          <div className="flex items-center justify-between text-[#8C8272] text-[10px] font-mono uppercase">
            <span>Exit Rate</span>
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-1 text-lg font-bold font-mono text-white">
            {simulationConfig?.exitRate || 5}{" "}
            <span className="text-[10px] font-normal text-[#8C8272]">pax/min</span>
          </div>
          <div className="mt-2 text-[10px] text-center text-[#8C8272] font-mono py-1">
            Dynamic relationship
          </div>
        </div>
      </div>

      {/* Standard Verification Sequence */}
      {onSetPhase14TestStage && (
        <div className="relative z-10 py-3 border-b border-[#241E17] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Standard Test Verification Sequence:</span>
            </span>
            <span className="text-[10px] text-[#8C8272] font-mono">
              10,000 → 12,000 → 15,000 → 18,000 pax
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => onSetPhase14TestStage(0)}
              className="px-3 py-2 rounded-xl bg-[#241E17] hover:bg-[#382F27]/80 border border-[#382F27] text-left transition-colors cursor-pointer"
            >
              <div className="text-[11px] font-bold text-white">Stage 0: 10,000</div>
              <div className="text-[10px] text-[#8C8272] font-mono">Park: 60% • Trans: 55%</div>
            </button>

            <button
              onClick={() => onSetPhase14TestStage(1)}
              className="px-3 py-2 rounded-xl bg-[#241E17] hover:bg-[#382F27]/80 border border-[#382F27] text-left transition-colors cursor-pointer"
            >
              <div className="text-[11px] font-bold text-white">Stage 1: 12,000</div>
              <div className="text-[10px] text-[#8C8272] font-mono">Park: 72% • Trans: 68%</div>
            </button>

            <button
              onClick={() => onSetPhase14TestStage(2)}
              className="px-3 py-2 rounded-xl bg-[#241E17] hover:bg-[#382F27]/80 border border-[#382F27] text-left transition-colors cursor-pointer"
            >
              <div className="text-[11px] font-bold text-blue-300">Stage 2: 15,000</div>
              <div className="text-[10px] text-blue-400/80 font-mono">Park: 84% • Trans: 82% ⚠️</div>
            </button>

            <button
              onClick={() => onSetPhase14TestStage(3)}
              className="px-3 py-2 rounded-xl bg-[#241E17] hover:bg-[#382F27]/80 border border-[#382F27] text-left transition-colors cursor-pointer"
            >
              <div className="text-[11px] font-bold text-rose-300">Stage 3: 18,000</div>
              <div className="text-[10px] text-rose-400/80 font-mono">Park: 92% • Trans: 91% 🚨</div>
            </button>
          </div>
        </div>
      )}

      {/* Rapid Operational Stress Scenario Triggers */}
      <div className="relative z-10 pt-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C8272] font-bold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>Trigger Realistic Stress Scenarios:</span>
          </span>
          <span className="text-[10px] text-[#6B6252] font-mono">
            Directly exercises Central Alert & Action Engine
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {/* Trigger 1: Crowd Surge */}
          <button
            onClick={onTriggerCrowdSurge}
            className="p-3 rounded-2xl bg-[#241E17]/80 hover:bg-[#241E17] border border-[#382F27] hover:border-blue-500/50 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300 group-hover:text-blue-200">
                Crowd Surge
              </span>
              <Users2 className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <p className="text-[10px] text-[#8C8272] mt-1 leading-snug">
              +2,500 rapid arrivals. Zone A &amp; Gate 1 turnstile pressure (&gt;90%).
            </p>
          </button>

          {/* Trigger 2: Parking Pressure */}
          <button
            onClick={onTriggerParkingPressure}
            className="p-3 rounded-2xl bg-[#241E17]/80 hover:bg-[#241E17] border border-[#382F27] hover:border-rose-500/50 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300 group-hover:text-rose-200">
                Parking Pressure
              </span>
              <Car className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <p className="text-[10px] text-[#8C8272] mt-1 leading-snug">
              Lots fill to 94%. Triggers automated critical parking alert & transit diversion.
            </p>
          </button>

          {/* Trigger 3: Transport Pressure */}
          <button
            onClick={onTriggerTransportPressure}
            className="p-3 rounded-2xl bg-[#241E17]/80 hover:bg-[#241E17] border border-[#382F27] hover:border-sky-500/50 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-300 group-hover:text-sky-200">
                Transit Surge
              </span>
              <Bus className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <p className="text-[10px] text-[#8C8272] mt-1 leading-snug">
              Metro & Feeder corridors jump to 92% load. Triggers backup shuttle dispatch alert.
            </p>
          </button>

          {/* Trigger 4: Event Dispersal */}
          <button
            onClick={onTriggerEventDispersal}
            className="p-3 rounded-2xl bg-[#241E17]/80 hover:bg-[#241E17] border border-[#382F27] hover:border-indigo-500/50 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 group-hover:text-indigo-200">
                Event Dispersal
              </span>
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <p className="text-[10px] text-[#8C8272] mt-1 leading-snug">
              Exit rate surges to 120 pax/min. Egress corridors activate; parking departs.
            </p>
          </button>
        </div>

        {/* Complete 3-Role Connected Workflow Test Button */}
        {onRunPhase16Workflow && (
          <div className="pt-2">
            <button
              onClick={onRunPhase16Workflow}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-[#4F7CFF] hover:from-indigo-500 hover:to-[#4F7CFF] text-white font-bold text-xs flex items-center justify-between shadow-lg shadow-indigo-950/50 border border-indigo-400/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-[#F0E9D6]/20 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-heading font-bold">Run Connected 3-Role Workflow Test (Acceptance Suite)</div>
                  <div className="text-[10px] text-indigo-100 font-normal">
                    Simulates Hospitality Unavailability &amp; Parking 95% Pressure across Organizer ↔ Operator ↔ Attendee
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase bg-[#F0E9D6]/20 px-2.5 py-1 rounded-lg font-bold">
                Test Chain
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Provenance note */}
      <div className="relative z-10 mt-4 pt-3 border-t border-[#241E17] text-[10px] text-[#8C8272] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-400 uppercase">Provenance Guarantee:</span>
          <span>All telemetry generated by this panel is tagged with sourceType: SIMULATION.</span>
        </div>
        <span className="text-[#6B6252] font-mono">
          Last tick: {simulationConfig?.lastTickAt ? new Date(simulationConfig.lastTickAt).toLocaleTimeString() : "Idle"}
        </span>
      </div>
    </div>
  );
};
