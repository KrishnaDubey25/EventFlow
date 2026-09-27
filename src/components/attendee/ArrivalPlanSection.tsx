import React from "react";
import { DoorOpen, Clock, MapPin, Compass, AlertCircle, Sparkles } from "lucide-react";
import { getRecommendedArrivalTime } from "../../utils/eventDateUtils";

interface ArrivalPlanSectionProps {
  assignedGate: string;
  entryWindow: string;
  venue: string;
  eventTime: string;
  location?: string;
}

export const ArrivalPlanSection: React.FC<ArrivalPlanSectionProps> = ({
  assignedGate,
  entryWindow,
  venue,
  eventTime,
  location,
}) => {
  const recommendedTime = getRecommendedArrivalTime(entryWindow, eventTime);

  return (
    <div
      id="arrival-plan"
      className="p-6 sm:p-7 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-sm space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F7FAFF] pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#F7FAFF] text-[#4F7CFF] flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B6252] block">
              Gate Ingress Strategy
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#0B1120] font-heading">
              Your Arrival Plan
            </h2>
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-[#F7FAFF] text-[#2D5FD2] border border-[#C9D9F7]">
          Personalized Ingress
        </span>
      </div>

      {/* 4 Core Parameter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* YOUR GATE */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800">
            <DoorOpen className="w-4 h-4 text-emerald-700" />
            <span>YOUR GATE</span>
          </div>
          <div className="text-lg font-bold text-emerald-950 truncate">
            {assignedGate}
          </div>
          <div className="text-[11px] text-emerald-800/80">
            Designated turnstile portal
          </div>
        </div>

        {/* ENTRY WINDOW */}
        <div className="p-4 rounded-2xl bg-[#F7FAFF]/60 border border-[#C9D9F7] space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#6b5024]">
            <Clock className="w-4 h-4 text-[#2D5FD2]" />
            <span>ENTRY WINDOW</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-[#0B1120] font-mono truncate">
            {entryWindow}
          </div>
          <div className="text-[11px] text-[#6b5024]/80">
            Scheduled ingress slot
          </div>
        </div>

        {/* RECOMMENDED ARRIVAL */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-800">
            <Clock className="w-4 h-4 text-indigo-700" />
            <span>RECOMMENDED ARRIVAL</span>
          </div>
          <div className="text-lg font-bold text-indigo-950 font-mono">
            {recommendedTime}
          </div>
          <div className="text-[11px] text-indigo-800/80">
            Optimal check-in timing
          </div>
        </div>

        {/* VENUE */}
        <div className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/80 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#4A4236]">
            <MapPin className="w-4 h-4 text-[#4F7CFF]" />
            <span>VENUE</span>
          </div>
          <div className="text-sm sm:text-base font-bold text-[#0B1120] line-clamp-2">
            {venue}
          </div>
          {location && (
            <div className="text-[11px] text-[#6B6252] truncate">
              {location}
            </div>
          )}
        </div>
      </div>

      {/* Prototype Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/90 text-blue-900 flex items-start gap-3 text-xs leading-relaxed">
        <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="font-semibold block text-blue-950">
            Prototype Recommendation Notice
          </strong>
          <span>
            This arrival schedule is a personalized recommendation based on your ticket tier, travel mode, and scheduled gate allocation, updated dynamically with live event conditions.
          </span>
        </div>
      </div>
    </div>
  );
};
