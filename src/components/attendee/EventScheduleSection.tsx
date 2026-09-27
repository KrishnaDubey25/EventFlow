import React from "react";
import { Calendar, Clock, MapPin, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import { EventScheduleItem } from "../../types/event";

interface EventScheduleSectionProps {
  schedule?: EventScheduleItem[];
  eventName: string;
}

export const EventScheduleSection: React.FC<EventScheduleSectionProps> = ({
  schedule = [],
  eventName,
}) => {
  if (!schedule || schedule.length === 0) {
    return null;
  }

  // Next upcoming item: default to first item if upcoming
  // We can treat index 0 as the next upcoming milestone prior to the event
  const nextUpIndex = 0;

  return (
    <div
      id="event-schedule"
      className="p-6 sm:p-7 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-sm space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F7FAFF] pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#F7FAFF] text-[#4F7CFF] flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B6252] block">
              Official Agenda
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#0B1120] font-heading">
              Event Schedule & Milestones
            </h2>
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-[#F7FAFF] text-[#382F27]">
          {schedule.length} Milestones Scheduled
        </span>
      </div>

      {/* Schedule Items List */}
      <div className="space-y-4">
        {schedule.map((item, idx) => {
          const isNextUp = idx === nextUpIndex;

          return (
            <div
              key={`${item.time}-${idx}`}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isNextUp
                  ? "bg-gradient-to-r from-[#F7FAFF]/70 via-indigo-50/40 to-white border-[#6EA8FF] shadow-xs ring-1 ring-[#4F7CFF]/20"
                  : "bg-[#F4F8FF]/60 border-[#C9D9F7]/80 hover:bg-[#F4F8FF]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Left: Time & Activity */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold shrink-0 flex items-center gap-1.5 ${
                      isNextUp
                        ? "bg-[#4F7CFF] text-white shadow-xs"
                        : "bg-[#F0E9D6] border border-[#C9D9F7] text-[#382F27]"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.time}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`text-sm sm:text-base font-bold font-heading ${
                          isNextUp ? "text-[#0B1120]" : "text-[#0B1120]"
                        }`}
                      >
                        {item.activity}
                      </h3>

                      {isNextUp && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#4F7CFF] text-white animate-pulse">
                          <Sparkles className="w-3 h-3" />
                          <span>NEXT UP</span>
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-xs text-[#4A4236] leading-relaxed max-w-2xl">
                        {item.description}
                      </p>
                    )}

                    {item.location && (
                      <div className="flex items-center gap-1 text-[11px] text-[#6B6252] font-medium pt-0.5">
                        <MapPin className="w-3 h-3 text-[#4F7CFF]" />
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Milestone status */}
                <div className="shrink-0 self-start sm:self-center">
                  <span
                    className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg ${
                      isNextUp
                        ? "bg-[#EDE3CB]/80 text-[#6b5024] border border-[#C9D9F7]"
                        : "text-[#6B6252] bg-[#F0E9D6] border border-[#C9D9F7]"
                    }`}
                  >
                    {isNextUp ? "Active Upcoming" : `Session 0${idx + 1}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
