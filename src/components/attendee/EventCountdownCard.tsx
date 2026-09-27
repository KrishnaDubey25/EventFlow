import React, { useState, useEffect } from "react";
import { Clock, Radio, CheckCircle2, Sparkles, Calendar } from "lucide-react";
import {
  parseEventDates,
  getEventStatusAndCountdown,
  EventCountdownResult,
} from "../../utils/eventDateUtils";

interface EventCountdownCardProps {
  eventDate: string;
  eventTime: string;
  eventName: string;
  venue: string;
}

export const EventCountdownCard: React.FC<EventCountdownCardProps> = ({
  eventDate,
  eventTime,
  eventName,
  venue,
}) => {
  const [countdown, setCountdown] = useState<EventCountdownResult>(() => {
    const { startDate, endDate } = parseEventDates(eventDate, eventTime);
    return getEventStatusAndCountdown(startDate, endDate);
  });

  useEffect(() => {
    const { startDate, endDate } = parseEventDates(eventDate, eventTime);

    const updateTimer = () => {
      setCountdown(getEventStatusAndCountdown(startDate, endDate));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [eventDate, eventTime]);

  return (
    <div
      id="countdown-card"
      className="p-6 sm:p-7 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-sm space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F7FAFF] pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#F7FAFF] text-[#4F7CFF] flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B6252] block">
              Event Ingress Status
            </span>
            <span className="text-sm font-bold text-[#0B1120] font-heading">
              {countdown.status === "UPCOMING"
                ? "Live Operational Countdown"
                : countdown.status === "LIVE"
                ? "Event In Session"
                : "Event Concluded"}
            </span>
          </div>
        </div>

        {/* Status Pill Badge */}
        {countdown.status === "UPCOMING" ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#F7FAFF] text-[#2D5FD2] border border-[#C9D9F7]">
            <span className="w-2 h-2 rounded-full bg-[#4F7CFF] animate-ping" />
            <span>EVENT STARTS IN</span>
          </span>
        ) : countdown.status === "LIVE" ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>🟢 EVENT LIVE</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#F7FAFF] text-[#382F27] border border-[#C9BBA0]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#6B6252]" />
            <span>EVENT COMPLETED</span>
          </span>
        )}
      </div>

      {/* Countdown Content Display */}
      {countdown.status === "UPCOMING" ? (
        <div className="space-y-3">
          <div className="text-xs text-[#6B6252] font-medium">
            Countdown calculated from official scheduled start ({eventDate}, {eventTime}):
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
            {/* Days */}
            <div className="p-3 sm:p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/80">
              <div className="text-2xl sm:text-4xl font-extrabold text-[#0B1120] font-mono tracking-tight">
                {String(countdown.days).padStart(2, "0")}
              </div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#6B6252] mt-1 font-mono">
                {countdown.days === 1 ? "Day" : "Days"}
              </div>
            </div>

            {/* Hours */}
            <div className="p-3 sm:p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/80">
              <div className="text-2xl sm:text-4xl font-extrabold text-[#0B1120] font-mono tracking-tight">
                {String(countdown.hours).padStart(2, "0")}
              </div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#6B6252] mt-1 font-mono">
                {countdown.hours === 1 ? "Hour" : "Hours"}
              </div>
            </div>

            {/* Minutes */}
            <div className="p-3 sm:p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/80">
              <div className="text-2xl sm:text-4xl font-extrabold text-[#0B1120] font-mono tracking-tight">
                {String(countdown.minutes).padStart(2, "0")}
              </div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#6B6252] mt-1 font-mono">
                {countdown.minutes === 1 ? "Minute" : "Minutes"}
              </div>
            </div>

            {/* Seconds */}
            <div className="p-3 sm:p-4 rounded-2xl bg-[#F7FAFF]/50 border border-[#C9D9F7]/60">
              <div className="text-2xl sm:text-4xl font-extrabold text-[#4F7CFF] font-mono tracking-tight">
                {String(countdown.seconds).padStart(2, "0")}
              </div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#4F7CFF]/80 mt-1 font-mono">
                Seconds
              </div>
            </div>
          </div>
        </div>
      ) : countdown.status === "LIVE" ? (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-base">
            <Radio className="w-5 h-5 text-emerald-600 animate-pulse" />
            <span>The event is currently underway!</span>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Turnstiles and active session halls at <strong className="font-semibold">{venue}</strong> are operating live. Present your digital pass for entry.
          </p>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7] text-[#382F27] space-y-2">
          <div className="flex items-center gap-2 font-bold text-base text-[#0B1120]">
            <CheckCircle2 className="w-5 h-5 text-[#6B6252]" />
            <span>Event Successfully Concluded</span>
          </div>
          <p className="text-xs text-[#6B6252] leading-relaxed">
            This scheduled event at <strong className="text-[#241E17]">{venue}</strong> has concluded. Thank you for participating with EventFlow.
          </p>
        </div>
      )}
    </div>
  );
};
