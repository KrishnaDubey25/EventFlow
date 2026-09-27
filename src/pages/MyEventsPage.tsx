import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  DoorOpen,
  ArrowRight,
  Ticket as TicketIcon,
  Compass,
  CheckCircle2,
  Sparkles,
  Search,
} from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import { getUserBookings, getUserTickets } from "../services/bookingService";
import { getStoredEventById } from "../services/eventStorageService";
import { SAMPLE_EVENTS } from "../data/eventsData";
import { Booking, EventFlowTicket } from "../types/booking";
import { AppEvent } from "../types/event";
import { getEventTimingStatus, EventTimingStatus } from "../utils/eventDateUtils";

interface BookedEventItem {
  bookingId: string;
  event: AppEvent;
  tickets: EventFlowTicket[];
  timingStatus: EventTimingStatus;
}

export const MyEventsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookedEvents, setBookedEvents] = useState<BookedEventItem[]>([]);
  const [filter, setFilter] = useState<"all" | "upcoming" | "event_day" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadBookedEvents = () => {
      if (!user?.id) return;

      const userBookings = getUserBookings(user.id);
      const userTickets = getUserTickets(user.id);

      // Group bookings by eventId
      const eventMap = new Map<string, BookedEventItem>();

      userBookings.forEach((b) => {
        const event = getStoredEventById(b.eventId);
        if (!event) return; // Skip deleted or unindexed events

        const timingStatus = getEventTimingStatus(event.date, event.time);
        const bookingTickets = userTickets.filter((t) => t.bookingId === b.bookingId || t.eventId === b.eventId);

        eventMap.set(b.eventId, {
          bookingId: b.bookingId,
          event,
          tickets: bookingTickets,
          timingStatus,
        });
      });

      // Check any lone tickets not captured by bookings
      userTickets.forEach((t) => {
        if (!eventMap.has(t.eventId)) {
          const event = getStoredEventById(t.eventId);
          if (event) {
            const timingStatus = getEventTimingStatus(event.date, event.time);
            eventMap.set(t.eventId, {
              bookingId: t.bookingId,
              event,
              tickets: [t],
              timingStatus,
            });
          }
        }
      });

      setBookedEvents(Array.from(eventMap.values()));
    };

    loadBookedEvents();

    const handleDeletedEvent = () => {
      loadBookedEvents();
    };

    window.addEventListener("eventflow_event_deleted", handleDeletedEvent);
    window.addEventListener("storage", handleDeletedEvent);

    return () => {
      window.removeEventListener("eventflow_event_deleted", handleDeletedEvent);
      window.removeEventListener("storage", handleDeletedEvent);
    };
  }, [user?.id]);

  // Filter events
  const filteredEvents = bookedEvents.filter((item) => {
    // Search match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.event.name.toLowerCase().includes(q) ||
        item.event.venue.toLowerCase().includes(q) ||
        item.event.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (filter === "upcoming") {
      return item.timingStatus.timingMode === "PRE_EVENT";
    }
    if (filter === "event_day") {
      return item.timingStatus.timingMode === "EVENT_DAY" || item.timingStatus.timingMode === "LIVE";
    }
    if (filter === "completed") {
      return item.timingStatus.timingMode === "COMPLETED";
    }

    return true;
  });

  const getStatusBadge = (timing: EventTimingStatus) => {
    switch (timing.timingMode) {
      case "EVENT_DAY":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-800 border border-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            EVENT DAY MODE
          </span>
        );
      case "LIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            LIVE NOW
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F7FAFF] text-[#4A4236] border border-[#C9D9F7]">
            COMPLETED
          </span>
        );
      case "PRE_EVENT":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F7FAFF] text-[#2D5FD2] border border-[#C9D9F7]">
            <Calendar className="w-3.5 h-3.5" />
            {timing.days > 0 ? `${timing.days} Days to Go` : `Starts in ${timing.hours}h`}
          </span>
        );
    }
  };

  return (
    <AppLayout pageTitle="My Events" pageBadge={`${bookedEvents.length} Booked Event${bookedEvents.length === 1 ? "" : "s"}`}>
      <div className="max-w-5xl mx-auto space-y-6 pb-20 font-sans">
        {/* Header Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0B1120] font-heading">
              Your Booked Event Journeys
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6252] mt-1">
              Access dedicated Event Hubs, gate passes, arrival windows, and live transit schedules.
            </p>
          </div>

          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F7FAFF] text-[#2D5FD2] hover:bg-[#EDE3CB] font-bold text-xs transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>Discover More Events</span>
          </Link>
        </div>

        {/* Filter Tabs & Search */}
        {bookedEvents.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilter("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filter === "all"
                    ? "bg-[#0B1120] text-white font-bold"
                    : "text-[#4A4236] hover:text-[#0B1120] hover:bg-[#F7FAFF]"
                }`}
              >
                All ({bookedEvents.length})
              </button>
              <button
                onClick={() => setFilter("event_day")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filter === "event_day"
                    ? "bg-blue-600 text-white font-bold"
                    : "text-[#4A4236] hover:text-[#0B1120] hover:bg-[#F7FAFF]"
                }`}
              >
                Event Day
              </button>
              <button
                onClick={() => setFilter("upcoming")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filter === "upcoming"
                    ? "bg-[#4F7CFF] text-white font-bold"
                    : "text-[#4A4236] hover:text-[#0B1120] hover:bg-[#F7FAFF]"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filter === "completed"
                    ? "bg-[#382F27] text-white font-bold"
                    : "text-[#4A4236] hover:text-[#0B1120] hover:bg-[#F7FAFF]"
                }`}
              >
                Past
              </button>
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-[#8C8272] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search booked events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7] text-xs text-[#241E17] placeholder-[#8C8272] focus:outline-none focus:border-[#4F7CFF] focus:bg-[#F0E9D6]"
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {bookedEvents.length === 0 ? (
          <div className="p-12 sm:p-16 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-sm text-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F7FAFF] text-[#4F7CFF] flex items-center justify-center mx-auto shadow-2xs">
              <TicketIcon className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#0B1120] font-heading">
                No Upcoming Events Yet
              </h3>
              <p className="text-xs text-[#6B6252] leading-relaxed">
                You haven't reserved admission to any live events yet. Explore upcoming summits, stadiums, and concerts in your city.
              </p>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white font-bold text-xs transition-colors shadow-sm"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Events</span>
            </Link>
          </div>
        ) : (
          /* Booked Events Cards Grid */
          <div className="grid grid-cols-1 gap-5">
            {filteredEvents.map(({ bookingId, event, tickets, timingStatus }) => {
              const primaryTicket = tickets[0];
              return (
                <div
                  key={event.id}
                  className="rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col md:flex-row group"
                >
                  {/* Thumbnail / Visual Banner */}
                  <div className="md:w-72 h-48 md:h-auto relative overflow-hidden bg-[#0B1120] shrink-0">
                    <img
                      src={event.image}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/60" />

                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wider font-mono border border-white/20">
                        {event.category}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white text-xs space-y-0.5 md:hidden">
                      <div className="font-semibold">{event.venue}</div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      {/* Status Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        {getStatusBadge(timingStatus)}

                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Booking Confirmed</span>
                        </div>
                      </div>

                      {/* Event Title */}
                      <h2 className="text-lg sm:text-xl font-bold text-[#0B1120] font-heading leading-snug group-hover:text-[#4F7CFF] transition-colors">
                        {event.name}
                      </h2>

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#4A4236] pt-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#4F7CFF] shrink-0" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#4F7CFF] shrink-0" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 sm:col-span-2">
                          <MapPin className="w-3.5 h-3.5 text-[#4F7CFF] shrink-0" />
                          <span className="truncate">{event.venue}, {event.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-4 border-t border-[#F7FAFF] flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-mono text-[#8C8272] block font-bold">
                            ASSIGNED GATE
                          </span>
                          <span className="font-bold text-[#0B1120]">
                            {primaryTicket?.assignedGate || "Gate 1"}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-mono text-[#8C8272] block font-bold">
                            PASSES
                          </span>
                          <span className="font-bold text-[#2D5FD2]">
                            {tickets.length} Digital Pass{tickets.length > 1 ? "es" : ""}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/my-event/${event.id}?tab=live`)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                      >
                        <span>Open live event</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredEvents.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7] text-xs text-[#6B6252]">
                No events match this filter.
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
