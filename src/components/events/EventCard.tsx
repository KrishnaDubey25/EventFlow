import React from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  CheckCircle2,
  Navigation,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { AppEvent } from "../../types/event";
import { useTicket } from "../../context/TicketContext";

interface EventCardProps {
  event: AppEvent;
  index: number;
  isSelected?: boolean;
  userDistrict?: string | null;
  userState?: string | null;
  distanceKm?: number | null;
}

const CATEGORY_STYLES: Record<
  string,
  { badge: string; dot: string; glow: string }
> = {
  Sports: {
    badge: "bg-[#4F7CFF]/90 text-white border-[#4F7CFF]/40",
    dot: "bg-[#6EA8FF]",
    glow: "group-hover:border-[#4F7CFF]/60 group-hover:shadow-[#4F7CFF]/10",
  },
  Concerts: {
    badge: "bg-indigo-600/90 text-white border-indigo-400/40",
    dot: "bg-indigo-300",
    glow: "group-hover:border-indigo-400/60 group-hover:shadow-indigo-500/10",
  },
  Conferences: {
    badge: "bg-teal-600/90 text-white border-teal-400/40",
    dot: "bg-teal-300",
    glow: "group-hover:border-teal-400/60 group-hover:shadow-teal-500/10",
  },
  Festivals: {
    badge: "bg-purple-600/90 text-white border-purple-400/40",
    dot: "bg-purple-300",
    glow: "group-hover:border-purple-400/60 group-hover:shadow-purple-500/10",
  },
  "Large Gatherings": {
    badge: "bg-emerald-600/90 text-white border-emerald-400/40",
    dot: "bg-emerald-300",
    glow: "group-hover:border-emerald-400/60 group-hover:shadow-emerald-500/10",
  },
};

export const EventCard: React.FC<EventCardProps> = ({
  event,
  index,
  isSelected,
  userDistrict,
  userState,
  distanceKm,
}) => {
  const { userTickets } = useTicket();
  const booked = userTickets.some(t => t.eventId === event.id);
  const catStyle =
    CATEGORY_STYLES[event.category] || CATEGORY_STYLES["Sports"];

  // Check proximity to user
  const isUserDistrict =
    Boolean(userDistrict &&
    event.district &&
    userDistrict.toLowerCase().includes(event.district.toLowerCase()));

  const isUserState =
    Boolean(userState &&
    event.state &&
    userState.toLowerCase().includes(event.state.toLowerCase()));

  return (
    <motion.article
      id={`event-card-${event.id}`}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.06, 0.35),
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -6 }}
      className={`group relative flex flex-col bg-[#F0E9D6] rounded-2xl border transition-all duration-300 overflow-hidden shadow-xs hover:shadow-xl ${
        catStyle.glow
      } ${
        isSelected
          ? "border-[#4F7CFF] ring-2 ring-[#4F7CFF]/25 shadow-lg shadow-[#4F7CFF]/10"
          : "border-[#C9D9F7]/90 hover:border-[#C9BBA0]"
      }`}
    >
      {booked && <Link to={`/my-event/${event.id}?tab=live`} className="relative z-10 flex items-center justify-between gap-3 bg-gradient-to-r from-[#2D5FD2] to-indigo-700 px-4 py-3 text-white text-xs font-bold hover:from-[#6b5024] hover:to-indigo-800"><span>Ticket booked · event companion available</span><span className="flex items-center gap-1">Open live event <ArrowRight className="w-4 h-4"/></span></Link>}
      {/* Visual Image Container with high-res framing */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0B1120]">
        <img
          src={event.image}
          alt={event.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/95 via-[#0B1120]/30 to-[#0B1120]/10 pointer-events-none" />

        {/* Top Badges Row */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2 pointer-events-none">
          {/* Category Tag */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border shadow-xs ${catStyle.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
            {event.category}
          </span>

          {/* Selected State or Proximity/Status */}
          {isSelected ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#4F7CFF] text-white shadow-md border border-[#4F7CFF]/40">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active Event
            </span>
          ) : isUserDistrict ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/95 text-[#0B1120] backdrop-blur-md shadow-xs border border-blue-300">
              <Navigation className="w-3 h-3 fill-[#0B1120]" />
              In Your District
            </span>
          ) : event.statusBadge ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#0B1120]/80 text-white backdrop-blur-md border border-white/20">
              {event.statusBadge}
            </span>
          ) : null}
        </div>

        {/* Bottom Overlay: District, State, and Live Distance */}
        <div className="absolute bottom-3 left-3 right-3 z-10 text-white">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[#C9D9F7] font-medium truncate drop-shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-[#4F7CFF] shrink-0" />
              <span className="truncate font-semibold text-white">
                {event.district || event.location.split(",")[0]}, {event.state || "India"}
              </span>
            </div>

            {/* Distance badge if available */}
            {typeof distanceKm === "number" && (
              <span className="shrink-0 text-[11px] font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full backdrop-blur-xs">
                {distanceKm < 1 ? "Nearby" : `${distanceKm} km away`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Event Title */}
          <Link to={`/events/${event.id}`}>
            <h3 className="text-lg font-bold tracking-tight text-[#0B1120] font-heading leading-snug group-hover:text-[#4F7CFF] transition-colors line-clamp-2">
              {event.name}
            </h3>
          </Link>

          {/* Venue and Schedule */}
          <div className="space-y-1.5 text-xs text-[#4A4236]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#4F7CFF] shrink-0" />
              <span className="font-semibold text-[#241E17]">{event.date}</span>
              <span className="text-[#C9BBA0]">•</span>
              <span className="text-[#6B6252] font-medium">{event.time}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 text-center text-[#8C8272] shrink-0 mt-0.5">🏟️</span>
              <span className="text-[#4A4236] font-medium line-clamp-1">
                {event.venue}
              </span>
            </div>
          </div>

          {/* Key Feature Highlight Pill */}
          {event.highlights && event.highlights.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-[#382F27] bg-[#F4F8FF] border border-[#C9D9F7]/70 px-2.5 py-1.5 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate font-medium">{event.highlights[0]}</span>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="pt-3 border-t border-[#F7FAFF] flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#6B6252]">
            <Users className="w-3.5 h-3.5 text-[#4F7CFF] shrink-0" />
            <span>
              Expected:{" "}
              <strong className="font-semibold text-[#0B1120]">
                {event.expectedAttendance}
              </strong>
            </span>
          </div>

          <Link
            id={`view-event-btn-${event.id}`}
            to={`/events/${event.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F7CFF] hover:text-[#2D5FD2] group-hover:translate-x-0.5 transition-all cursor-pointer py-1"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
};
