import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  DoorOpen,
  ShieldCheck,
  AlertCircle,
  Ticket as TicketIcon,
  CheckCircle2,
  Navigation,
  HelpCircle,
  PhoneCall,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
  Check,
  Zap,
  Car,
  Bus,
} from "lucide-react";
import { AppEvent } from "../../types/event";
import { Booking, EventFlowTicket } from "../../types/booking";
import { EventTimingStatus } from "../../utils/eventDateUtils";
import { EventFlowQrCode } from "../ticket/EventFlowQrCode";
interface EventHubOverviewTabProps {
  event: AppEvent;
  booking?: Booking;
  tickets: EventFlowTicket[];
  timingStatus: EventTimingStatus;
  onSelectTab: (tabId: string) => void;
}

export const EventHubOverviewTab: React.FC<EventHubOverviewTabProps> = ({
  event,
  booking,
  tickets,
  timingStatus,
  onSelectTab,
}) => {
  const primaryTicket = tickets[0];
  const { timingMode, days, hours, minutes } = timingStatus;

  // Render EVENT DAY MODE view
  if (timingMode === "EVENT_DAY") {
    return (
      <div className="space-y-6">
        {/* Urgent Event-Day Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#4F7CFF] via-indigo-600 to-[#2D5FD2] text-white shadow-lg flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F0E9D6]/20 text-white text-xs font-mono font-bold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              EVENT DAY ACTIVE
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-heading">
              Gates are opening today for {event.name}
            </h3>
            <p className="text-xs text-[#EDE3CB]">
              Have your digital admission QR pass ready at turnstiles. Follow designated gate lanes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right bg-[#F0E9D6]/10 px-4 py-2 rounded-xl border border-white/20">
              <div className="text-[10px] uppercase font-mono text-[#C9D9F7]">Ingress Starts In</div>
              <div className="text-lg font-black font-mono">
                {hours}h {minutes}m
              </div>
            </div>
            <button
              onClick={() => onSelectTab("ticket")}
              className="px-4 py-2.5 rounded-xl bg-[#F0E9D6] text-[#2D5FD2] hover:bg-[#F7FAFF] font-bold text-xs transition-colors shadow-sm cursor-pointer"
            >
              Show Full Ticket
            </button>
          </div>
        </div>

        {/* Quick Access Digital Pass Widget */}
        {primaryTicket && (
          <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F7FAFF]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F7FAFF] text-[#4F7CFF] flex items-center justify-center font-bold">
                  <TicketIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0B1120] font-heading">Quick Access Pass</h4>
                  <span className="text-[11px] text-[#6B6252]">Scan directly at venue turnstile</span>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Gate Ready
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/70">
                <EventFlowQrCode value={primaryTicket.qrToken} size={130} />
                <span className="text-[10px] font-mono text-[#6B6252] mt-2 font-bold uppercase">
                  Pass #{primaryTicket.ticketId.slice(0, 12)}
                </span>
              </div>

              <div className="md:col-span-3 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#F7FAFF]/60 border border-[#EDE3CB]">
                    <span className="text-[10px] uppercase font-mono text-[#4F7CFF] font-bold block">
                      ASSIGNED GATE
                    </span>
                    <span className="text-base sm:text-lg font-black text-[#0B1120]">
                      {primaryTicket.assignedGate || "Gate 1"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7]/70">
                    <span className="text-[10px] uppercase font-mono text-[#6B6252] font-bold block">
                      SECTION / ZONE
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[#0B1120] truncate block">
                      {primaryTicket.section || "Main Arena"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7]/70">
                    <span className="text-[10px] uppercase font-mono text-[#6B6252] font-bold block">
                      SEAT / ACCESS
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[#0B1120] truncate block">
                      {primaryTicket.seat || "General"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-[#4A4236]">
                    <DoorOpen className="w-4 h-4 text-[#4F7CFF]" />
                    <span>
                      Recommended Ingress Window: <strong className="text-[#0B1120]">{primaryTicket.entryWindow}</strong>
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectTab("ticket")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F7CFF] hover:text-[#2D5FD2] cursor-pointer"
                  >
                    <span>View All {tickets.length} Digital Passes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ingress Guidance & Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Venue Entry Checklist */}
          <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#4F7CFF]" />
              <h4 className="text-sm font-bold text-[#0B1120] font-heading">
                Venue Entry Checklist
              </h4>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-900">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Digital Admission Pass</strong>
                  <span className="text-emerald-700">QR token active in EventFlow app</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F7FAFF]/60 border border-[#EDE3CB] text-[#0B1120]">
                <Check className="w-4 h-4 text-[#4F7CFF] shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Government Photo Identification</strong>
                  <span className="text-[#2D5FD2]">Aadhaar, Passport, or Driver's License</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-blue-900">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Bag Regulation Notice</strong>
                  <span className="text-blue-700">Only compact bags under 12"x12" allowed. Fast-track lanes for zero-bag attendees.</span>
                </div>
              </div>
            </div>
          </div>

          {/* On-Site Support & Helpdesk */}
          <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              <h4 className="text-sm font-bold text-[#0B1120] font-heading">
                On-Site Assistance & Medical
              </h4>
            </div>

            <div className="space-y-3 text-xs text-[#4A4236] leading-relaxed">
              <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF] space-y-1">
                <div className="font-bold text-[#0B1120]">Primary Helpdesk Station</div>
                <div>Located inside {primaryTicket?.assignedGate || "Gate 1"} main concourse.</div>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF] space-y-1">
                <div className="font-bold text-[#0B1120]">Emergency Medical Center</div>
                <div>Staffed medical booth located adjacent to Stand B / Lower Level Atrium.</div>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <button
                  onClick={() => onSelectTab("services")}
                  className="text-xs font-bold text-[#4F7CFF] hover:text-[#2D5FD2] flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore Restrooms & Hydration</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render LIVE view
  if (timingMode === "LIVE") {
    return (
      <div className="space-y-6">
        {/* Live Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0E9D6]/20 text-white text-xs font-mono font-bold tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F0E9D6] animate-ping" />
            <span>EVENT IN PROGRESS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading">
            {event.name} is currently live!
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            Enjoy the experience. Turnstiles remain staffed for late entry and security assistance. Check schedule and food stalls anytime.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectTab("ticket")}
              className="px-4 py-2 rounded-xl bg-[#F0E9D6] text-emerald-800 hover:bg-emerald-50 font-bold text-xs transition-colors cursor-pointer"
            >
              Open Ticket Pass
            </button>
            <button
              onClick={() => onSelectTab("schedule")}
              className="px-4 py-2 rounded-xl bg-emerald-800/60 hover:bg-emerald-800 text-white border border-white/20 font-bold text-xs transition-colors cursor-pointer"
            >
              Check Live Schedule
            </button>
          </div>
        </div>

        {/* Quick Venue Location Info */}
        <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF]">
            <span className="text-[10px] uppercase font-mono text-[#8C8272] font-bold block">VENUE</span>
            <span className="text-sm font-bold text-[#0B1120]">{event.venue}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF]">
            <span className="text-[10px] uppercase font-mono text-[#8C8272] font-bold block">YOUR GATE</span>
            <span className="text-sm font-bold text-[#2D5FD2]">{primaryTicket?.assignedGate || "Gate 1"}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF]">
            <span className="text-[10px] uppercase font-mono text-[#8C8272] font-bold block">DEPARTURE TRANSIT</span>
            <button
              onClick={() => onSelectTab("transport")}
              className="text-xs font-bold text-[#4F7CFF] hover:text-[#2D5FD2] block mt-1 cursor-pointer"
            >
              View Metro & Cab Zones →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render COMPLETED view
  if (timingMode === "COMPLETED") {
    return (
      <div className="space-y-6">
        <div className="p-6 rounded-3xl bg-[#0B1120] text-white shadow-md space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#241E17] text-[#C9BBA0] text-xs font-mono font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>EVENT CONCLUDED</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading">
            Thank you for attending {event.name}
          </h2>
          <p className="text-xs sm:text-sm text-[#C9BBA0] max-w-xl">
            We hope you had a safe and memorable journey. Your booking records and admission receipts remain archived below.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onSelectTab("ticket")}
              className="px-4 py-2 rounded-xl bg-[#F0E9D6] text-[#0B1120] hover:bg-[#F7FAFF] font-bold text-xs transition-colors cursor-pointer"
            >
              View Archived Ticket
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default: PRE-EVENT VIEW (Event is several days or hours away)
  return (
    <div className="space-y-6">
      {/* Pre-Event Countdown & Stage Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0B1120] via-[#102A43] to-[#1C2541] text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#4F7CFF]/20 text-[#6EA8FF] text-xs font-mono font-bold">
              <Calendar className="w-3.5 h-3.5" />
              <span>PRE-EVENT PLANNING STAGE</span>
            </div>
            <h3 className="text-xl font-bold font-heading">
              {days > 0 ? `${days} Days to Go` : `Starts in ${hours}h ${minutes}m`}
            </h3>
            <p className="text-xs text-[#C9BBA0] max-w-md">
              Everything is confirmed. Full Event Day mode will unlock 24 hours prior to the event with live gate queues and rapid transit routing.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-center">
            <div className="p-3 rounded-2xl bg-[#F0E9D6]/10 border border-white/15 min-w-[64px]">
              <div className="text-xl font-black text-white">{days}</div>
              <div className="text-[10px] text-[#8C8272] uppercase">Days</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#F0E9D6]/10 border border-white/15 min-w-[64px]">
              <div className="text-xl font-black text-white">{hours}</div>
              <div className="text-[10px] text-[#8C8272] uppercase">Hours</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#F0E9D6]/10 border border-white/15 min-w-[64px]">
              <div className="text-xl font-black text-white">{minutes}</div>
              <div className="text-[10px] text-[#8C8272] uppercase">Mins</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onSelectTab("ticket")}
          className="p-4 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 hover:border-[#6EA8FF] hover:bg-[#F7FAFF]/40 text-left transition-all shadow-2xs group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-[#F7FAFF] text-[#4F7CFF] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <TicketIcon className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-[#0B1120] group-hover:text-[#2D5FD2]">Digital Passes</div>
          <div className="text-[11px] text-[#6B6252] mt-0.5">{tickets.length} Confirmed</div>
        </button>

        <button
          onClick={() => onSelectTab("arrival")}
          className="p-4 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 hover:border-[#6EA8FF] hover:bg-[#F7FAFF]/40 text-left transition-all shadow-2xs group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <DoorOpen className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-[#0B1120] group-hover:text-[#2D5FD2]">Gate & Ingress</div>
          <div className="text-[11px] text-[#6B6252] mt-0.5">{primaryTicket?.assignedGate || "Gate 1"}</div>
        </button>

        <button
          onClick={() => onSelectTab("transport")}
          className="p-4 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 hover:border-[#6EA8FF] hover:bg-[#F7FAFF]/40 text-left transition-all shadow-2xs group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Navigation className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-[#0B1120] group-hover:text-[#2D5FD2]">Transit & Metro</div>
          <div className="text-[11px] text-[#6B6252] mt-0.5">Route Plan</div>
        </button>

        <button
          onClick={() => onSelectTab("schedule")}
          className="p-4 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 hover:border-[#6EA8FF] hover:bg-[#F7FAFF]/40 text-left transition-all shadow-2xs group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-[#0B1120] group-hover:text-[#2D5FD2]">Full Schedule</div>
          <div className="text-[11px] text-[#6B6252] mt-0.5">{event.schedule?.length || 4} Sessions</div>
        </button>
      </div>

      {/* Event Details & Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-4">
          <h4 className="text-sm font-bold text-[#0B1120] font-heading">
            About the Event
          </h4>
          <p className="text-xs sm:text-sm text-[#4A4236] leading-relaxed">
            {event.description}
          </p>

          {event.highlights && event.highlights.length > 0 && (
            <div className="pt-2 space-y-2">
              <span className="text-xs font-bold text-[#241E17] block font-heading">Key Highlights</span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#4A4236]">
                {event.highlights.map((hl, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#4F7CFF] shrink-0" />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Venue Quick Card */}
        <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-4">
          <h4 className="text-sm font-bold text-[#0B1120] font-heading">
            Venue & Logistics
          </h4>

          <div className="space-y-3 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-mono text-[#8C8272] font-bold block">VENUE ADDRESS</span>
              <div className="font-bold text-[#0B1120]">{event.venue}</div>
              <div className="text-[#6B6252]">{event.location}</div>
            </div>

            <div className="space-y-0.5 pt-2 border-t border-[#F7FAFF]">
              <span className="text-[10px] uppercase font-mono text-[#8C8272] font-bold block">YOUR ENTRANCE</span>
              <div className="font-bold text-[#2D5FD2]">{primaryTicket?.assignedGate || "Gate 1"}</div>
            </div>

            <div className="space-y-0.5 pt-2 border-t border-[#F7FAFF]">
              <span className="text-[10px] uppercase font-mono text-[#8C8272] font-bold block">RECOMMENDED ARRIVAL</span>
              <div className="font-semibold text-[#241E17]">{primaryTicket?.entryWindow || "30 mins prior"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
