import React from "react";
import { ExperienceMode, MegaEvent } from "../../types";
import { 
  Activity, 
  Compass, 
  SlidersHorizontal, 
  Ticket, 
  Workflow, 
  Zap, 
  Layers, 
  Calendar,
  MapPin,
  Clock
} from "lucide-react";

interface HeaderProps {
  events: MegaEvent[];
  selectedEventId: string;
  onSelectEvent: (eventId: string) => void;
  currentMode: ExperienceMode;
  onSelectMode: (mode: ExperienceMode) => void;
  onOpenSimulator: () => void;
  isAiThinking?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
  currentMode,
  onSelectMode,
  onOpenSimulator,
  isAiThinking = false,
}) => {
  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B1120]/90 border-b border-[#241E17]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Logo & Platform Title */}
          <div className="flex items-center justify-between w-full lg:w-auto gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
                <Workflow className="w-5 h-5 text-white" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#0B1120] animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                    EventFlow
                    <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                      v2.8 Orchestrator
                    </span>
                  </h1>
                </div>
                <p className="text-xs text-[#8C8272]">Intelligent Mega-Event Platform</p>
              </div>
            </div>

            {/* Mobile Simulator Trigger */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={onOpenSimulator}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/30 hover:bg-blue-500/20 transition-all"
              >
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                <span>Simulate</span>
              </button>
            </div>
          </div>

          {/* Event Switcher Dropdown */}
          <div className="flex items-center gap-2 w-full lg:w-auto bg-[#0B1120]/80 p-1.5 rounded-xl border border-[#241E17]">
            <Calendar className="w-4 h-4 text-indigo-400 ml-2 hidden sm:block" />
            <select
              value={selectedEventId}
              onChange={(e) => onSelectEvent(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-semibold text-[#C9D9F7] outline-none cursor-pointer py-1 px-2 w-full lg:w-72"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id} className="bg-[#0B1120] text-[#C9D9F7]">
                  {evt.name} ({evt.city})
                </option>
              ))}
            </select>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#241E17] text-[#8C8272] hidden xl:inline-block">
              {currentEvent.currentPhase}
            </span>
          </div>

          {/* 3 Main Role Experiences Switcher */}
          <div className="flex items-center justify-between sm:justify-start gap-1 bg-[#0B1120]/90 p-1 rounded-xl border border-[#241E17] w-full sm:w-auto">
            <button
              onClick={() => onSelectMode("organizer")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentMode === "organizer"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-[#8C8272] hover:text-[#C9D9F7] hover:bg-[#241E17]/50"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Organizer</span>
            </button>

            <button
              onClick={() => onSelectMode("operator")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentMode === "operator"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-[#8C8272] hover:text-[#C9D9F7] hover:bg-[#241E17]/50"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Operator</span>
            </button>

            <button
              onClick={() => onSelectMode("attendee")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentMode === "attendee"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-[#8C8272] hover:text-[#C9D9F7] hover:bg-[#241E17]/50"
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Attendee</span>
            </button>
          </div>

          {/* Simulation Trigger & Telemetry Status */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={onOpenSimulator}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-300 border border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/20 transition-all shadow-sm group"
            >
              <Zap className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>Simulate Scenario</span>
            </button>

            {isAiThinking ? (
              <div className="flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <span className="font-mono text-[11px]">AI Commander Processing</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-[#8C8272] font-mono bg-[#0B1120] px-3 py-1.5 rounded-xl border border-[#241E17]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>SYNCED 0.8s</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
