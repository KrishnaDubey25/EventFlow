import React, { useState } from "react";
import { Clock, MapPin, Search, Calendar, Sparkles, Filter } from "lucide-react";
import { AppEvent, EventScheduleItem } from "../../types/event";

interface EventHubScheduleTabProps {
  event: AppEvent;
}

export const EventHubScheduleTab: React.FC<EventHubScheduleTabProps> = ({ event }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const scheduleList: EventScheduleItem[] = event.schedule || [];

  const filteredSchedule = scheduleList.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.activity.toLowerCase().includes(q) ||
      (item.location && item.location.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Schedule Header & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs">
        <div>
          <h3 className="text-base font-bold text-[#0B1120] font-heading">
            Official Event Schedule
          </h3>
          <p className="text-xs text-[#6B6252] mt-0.5">
            Times in IST • Subject to live on-stage announcements
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#8C8272] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sessions or halls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7] text-xs text-[#241E17] placeholder-[#8C8272] focus:outline-none focus:border-[#4F7CFF] focus:bg-[#F0E9D6] transition-all"
          />
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-4 relative before:absolute before:inset-0 before:left-6 sm:before:left-8 before:w-0.5 before:bg-[#C9D9F7] before:hidden sm:before:block">
        {filteredSchedule.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs sm:ml-12 relative transition-all hover:border-[#C9D9F7] hover:shadow-xs space-y-2"
          >
            {/* Timeline Bullet Indicator on Desktop */}
            <div className="hidden sm:flex absolute -left-12 top-6 w-5 h-5 rounded-full bg-[#4F7CFF] text-white items-center justify-center font-bold text-[10px] ring-4 ring-white shadow-xs">
              {idx + 1}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F7FAFF] text-[#2D5FD2] text-xs font-mono font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>{item.time}</span>
              </div>

              {item.location && (
                <div className="inline-flex items-center gap-1 text-xs text-[#6B6252] font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  <span>{item.location}</span>
                </div>
              )}
            </div>

            <h4 className="text-sm font-bold text-[#0B1120] font-heading">
              {item.activity}
            </h4>

            {item.description && (
              <p className="text-xs text-[#4A4236] leading-relaxed">
                {item.description}
              </p>
            )}
          </div>
        ))}

        {filteredSchedule.length === 0 && (
          <div className="p-8 text-center rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7] text-xs text-[#6B6252]">
            {scheduleList.length === 0 ? "The organizer has not published an event programme yet." : `No schedule items match your search "${searchQuery}".`}
          </div>
        )}
      </div>
    </div>
  );
};
