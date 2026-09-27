import React, { useState, useEffect } from "react";
import { Check, Circle, Compass, ArrowRight } from "lucide-react";
import {
  parseEventDates,
  getEventStatusAndCountdown,
  EventTimelineStage,
} from "../../utils/eventDateUtils";

interface EventTimelineJourneyProps {
  eventDate: string;
  eventTime: string;
}

export const EventTimelineJourney: React.FC<EventTimelineJourneyProps> = ({
  eventDate,
  eventTime,
}) => {
  const [stages, setStages] = useState<EventTimelineStage[]>(() => {
    const { startDate, endDate } = parseEventDates(eventDate, eventTime);
    return getEventStatusAndCountdown(startDate, endDate).timelineStages;
  });

  useEffect(() => {
    const { startDate, endDate } = parseEventDates(eventDate, eventTime);

    const update = () => {
      setStages(getEventStatusAndCountdown(startDate, endDate).timelineStages);
    };

    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [eventDate, eventTime]);

  return (
    <div
      id="event-timeline-journey"
      className="p-6 sm:p-7 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-sm space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F7FAFF] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B6252] block">
              Attendee Lifecycle
            </span>
            <h3 className="text-sm font-bold text-[#0B1120] font-heading">
              Event Journey Milestones
            </h3>
          </div>
        </div>

        <div className="text-[11px] font-mono text-[#6B6252] bg-[#F4F8FF] px-2.5 py-1 rounded-lg border border-[#C9D9F7]">
          Synchronized to Event Time
        </div>
      </div>

      {/* Progress Timeline Pipeline */}
      <div className="pt-2">
        {/* Horizontal Desktop View */}
        <div className="hidden sm:grid sm:grid-cols-5 gap-2 relative">
          {/* Connector line behind steps */}
          <div className="absolute top-5 left-8 right-8 h-0.5 bg-[#C9D9F7] -z-0" />

          {stages.map((stage) => {
            const isCompleted = stage.status === "completed";
            const isActive = stage.status === "active";

            return (
              <div
                key={stage.id}
                className="relative z-10 flex flex-col items-center text-center px-1"
              >
                {/* Marker */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-xs ${
                    isCompleted
                      ? "bg-emerald-600 text-white ring-4 ring-emerald-50"
                      : isActive
                      ? "bg-[#4F7CFF] text-white ring-4 ring-[#EDE3CB] ring-offset-1"
                      : "bg-[#F0E9D6] text-[#8C8272] border-2 border-[#C9BBA0]"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : isActive ? (
                    <span className="w-3.5 h-3.5 rounded-full bg-[#F0E9D6] animate-pulse" />
                  ) : (
                    <Circle className="w-3 h-3 text-[#C9BBA0]" />
                  )}
                </div>

                {/* Stage Title */}
                <div className="mt-3 space-y-0.5">
                  <div
                    className={`text-xs font-bold font-mono tracking-wider ${
                      isActive
                        ? "text-[#4F7CFF]"
                        : isCompleted
                        ? "text-[#0B1120]"
                        : "text-[#8C8272]"
                    }`}
                  >
                    {isCompleted ? "✓ " : isActive ? "● " : "○ "}
                    {stage.label}
                  </div>
                  <div className="text-[11px] text-[#6B6252] leading-tight">
                    {stage.sublabel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Vertical Mobile View */}
        <div className="sm:hidden space-y-3">
          {stages.map((stage, idx) => {
            const isCompleted = stage.status === "completed";
            const isActive = stage.status === "active";

            return (
              <div
                key={stage.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  isActive
                    ? "bg-[#F7FAFF]/70 border-[#C9D9F7] ring-1 ring-[#4F7CFF]/20"
                    : isCompleted
                    ? "bg-emerald-50/40 border-emerald-200/80"
                    : "bg-[#F4F8FF]/60 border-[#C9D9F7]/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      isCompleted
                        ? "bg-emerald-600 text-white text-xs font-bold"
                        : isActive
                        ? "bg-[#4F7CFF] text-white text-xs font-bold"
                        : "bg-[#F0E9D6] border-2 border-[#C9BBA0] text-[#8C8272] text-xs"
                    }`}
                  >
                    {isCompleted ? "✓" : isActive ? "●" : idx + 1}
                  </div>
                  <div>
                    <div
                      className={`text-xs font-bold font-mono ${
                        isActive
                          ? "text-[#2D5FD2]"
                          : isCompleted
                          ? "text-[#0B1120]"
                          : "text-[#6B6252]"
                      }`}
                    >
                      {stage.label}
                    </div>
                    <div className="text-[11px] text-[#6B6252]">
                      {stage.sublabel}
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  {isActive ? (
                    <span className="text-[#2D5FD2] bg-[#EDE3CB]/80 px-2 py-0.5 rounded">
                      ACTIVE
                    </span>
                  ) : isCompleted ? (
                    <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                      DONE
                    </span>
                  ) : (
                    <span className="text-[#8C8272]">PENDING</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
