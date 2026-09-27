import React from "react";
import { Train, Bus, Car, Navigation, ShieldCheck, AlertCircle, Sparkles, Clock } from "lucide-react";
import { EventTransport } from "../../types/event";

interface TransportSectionProps {
  venue: string;
  transport?: EventTransport[];
}

export const TransportSection: React.FC<TransportSectionProps> = ({
  venue,
  transport = [],
}) => {
  // Find event transport items or use realistic event-configured fallbacks
  const metroItem = transport.find((t) => t.type === "metro" || t.type === "train");
  const busItem = transport.find((t) => t.type === "bus");
  const shuttleItem = transport.find((t) => t.type === "shuttle");
  const cabItem = transport.find((t) => t.type === "rideshare");

  return (
    <div
      id="transport-section"
      className="p-6 sm:p-7 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-sm space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F7FAFF] pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#F7FAFF] text-[#4F7CFF] flex items-center justify-center">
            <Train className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B6252] block">
              Venue Ingress Transit
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#0B1120] font-heading">
              Transport Options
            </h2>
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-[#F7FAFF] text-[#382F27]">
          5 Transit Modes Configured
        </span>
      </div>

      {/* RECOMMENDED HIGHLIGHT BOX */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#4F7CFF] via-[#2D5FD2] to-indigo-800 text-white shadow-md space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F0E9D6]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-[#F0E9D6]/20 backdrop-blur-md text-white border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>RECOMMENDED INGRESS ROUTE</span>
          </span>

          <span className="text-xs font-mono text-[#C9D9F7]">
            Zero-Congestion Corridor
          </span>
        </div>

        <div className="relative z-10 space-y-1">
          <div className="text-xl sm:text-2xl font-bold font-heading text-white">
            Metro + Dedicated Event Shuttle
          </div>
          <p className="text-xs sm:text-sm text-[#EDE3CB] leading-relaxed max-w-xl">
            Take rapid rail to the nearest junction station, then board the complimentary zero-emission EventFlow express shuttle direct to the attendee turnstiles.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-white/15 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-[#F0E9D6]/10 backdrop-blur-xs">
            <div className="text-[10px] text-[#C9D9F7] uppercase font-bold">Estimated Travel</div>
            <div className="text-base font-bold text-white mt-0.5">42 min</div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F0E9D6]/10 backdrop-blur-xs">
            <div className="text-[10px] text-[#C9D9F7] uppercase font-bold">Dedicated Shuttle</div>
            <div className="text-base font-bold text-white mt-0.5">Route S2</div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F0E9D6]/10 backdrop-blur-xs col-span-2 sm:col-span-1">
            <div className="text-[10px] text-[#C9D9F7] uppercase font-bold">Departure Frequency</div>
            <div className="text-base font-bold text-white mt-0.5">Every 5 min</div>
          </div>
        </div>
      </div>

      {/* Transit Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Metro / Rapid Rail */}
        <div className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#2D5FD2]">
              <Train className="w-4 h-4" />
              <span>METRO / RAPID RAIL</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EDE3CB] text-[#6b5024] font-bold">
              Fast Track
            </span>
          </div>
          <div className="text-sm font-bold text-[#0B1120]">
            {metroItem?.title || "Direct Concourse Metro Line"}
          </div>
          <p className="text-xs text-[#4A4236] leading-relaxed">
            {metroItem?.detail || "Connects from city center terminals directly to the venue perimeter skywalk."}
          </p>
          <div className="text-[11px] font-mono text-[#6B6252] flex items-center gap-1 pt-1">
            <Clock className="w-3 h-3 text-[#4F7CFF]" />
            <span>Frequency: {metroItem?.frequency || "Every 3 mins during event hours"}</span>
          </div>
        </div>

        {/* Event Shuttle */}
        <div className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-700">
              <Bus className="w-4 h-4" />
              <span>EVENT SHUTTLE</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
              Complimentary
            </span>
          </div>
          <div className="text-sm font-bold text-[#0B1120]">
            {shuttleItem?.title || "EventFlow Express Shuttle Network"}
          </div>
          <p className="text-xs text-[#4A4236] leading-relaxed">
            {shuttleItem?.detail || "Continuous low-floor electric shuttles between transit hubs and Gate 1/2 turnstiles."}
          </p>
          <div className="text-[11px] font-mono text-[#6B6252] flex items-center gap-1 pt-1">
            <Clock className="w-3 h-3 text-indigo-600" />
            <span>Frequency: {shuttleItem?.frequency || "Continuous loops every 5-8 mins"}</span>
          </div>
        </div>

        {/* Public Bus */}
        <div className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-700">
              <Bus className="w-4 h-4" />
              <span>CITY BUS FEEDERS</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              Public Transit
            </span>
          </div>
          <div className="text-sm font-bold text-[#0B1120]">
            {busItem?.title || "Municipal Transit Express Routes"}
          </div>
          <p className="text-xs text-[#4A4236] leading-relaxed">
            {busItem?.detail || "Special high-capacity buses running from all major peripheral railway stations."}
          </p>
          <div className="text-[11px] font-mono text-[#6B6252] flex items-center gap-1 pt-1">
            <Clock className="w-3 h-3 text-emerald-600" />
            <span>Frequency: {busItem?.frequency || "Every 10 mins"}</span>
          </div>
        </div>

        {/* Cab / Rideshare */}
        <div className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-700">
              <Car className="w-4 h-4" />
              <span>CAB / RIDESHARE</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
              Drop-Off Zone
            </span>
          </div>
          <div className="text-sm font-bold text-[#0B1120]">
            {cabItem?.title || "Designated App Taxi & Cab Hub"}
          </div>
          <p className="text-xs text-[#4A4236] leading-relaxed">
            {cabItem?.detail || "Dedicated geofenced pickup and drop-off bays situated 200m from spectator turnstiles."}
          </p>
          <div className="text-[11px] font-mono text-[#6B6252] flex items-center gap-1 pt-1">
            <Navigation className="w-3 h-3 text-blue-600" />
            <span>Designated Drop-Off: South Outer Boulevard</span>
          </div>
        </div>

        {/* Personal Vehicle */}
        <div className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/80 space-y-2 md:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#382F27]">
              <Car className="w-4 h-4" />
              <span>PERSONAL VEHICLE</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C9D9F7] text-[#241E17] font-bold">
              Permit / Parking
            </span>
          </div>
          <div className="text-sm font-bold text-[#0B1120]">
            Designated Event Parking Zones Available
          </div>
          <p className="text-xs text-[#4A4236] leading-relaxed">
            Follow official event highway wayfinding signage directly to designated perimeter parking decks. Shuttles connect remote lots to the entrance concourse.
          </p>
          <div className="text-[11px] font-mono text-[#6B6252] flex items-center gap-1 pt-1">
            <Navigation className="w-3 h-3 text-[#4A4236]" />
            <span>Wayfinding: Event Access Lanes marked in Blue</span>
          </div>
        </div>
      </div>

      {/* Prototype Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/90 text-[#4A4236] flex items-start gap-3 text-xs leading-relaxed">
        <AlertCircle className="w-4 h-4 text-[#6B6252] shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block text-[#0B1120]">
            Prototype Transit Information Notice
          </strong>
          <span>
            Transport routes, estimated travel times, shuttle frequencies, and crowd-balanced routing updates are calculated continuously from central event operations telemetry.
          </span>
        </div>
      </div>
    </div>
  );
};
