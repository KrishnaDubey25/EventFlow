import { LiveVenueLink } from "../components/live/LiveVenueLink";
import { EventPlan } from "../components/journey/EventPlan";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  DoorOpen,
  Layers,
  Sparkles,
  Ticket as TicketIcon,
  Navigation,
  Car,
  Utensils,
  LayoutDashboard,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  Info,
  Radio,
} from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import { SAMPLE_EVENTS } from "../data/eventsData";
import { getStoredEventById } from "../services/eventStorageService";
import { getUserBookings, getUserTickets } from "../services/bookingService";
import { useLiveEvent } from "../utils/useLiveEvent";
import { AppEvent } from "../types/event";
import { Booking, EventFlowTicket } from "../types/booking";
import { getEventTimingStatus, EventTimingStatus } from "../utils/eventDateUtils";

import { EventHubOverviewTab } from "../components/event-hub/EventHubOverviewTab";
import { EventHubTicketTab } from "../components/event-hub/EventHubTicketTab";
import { EventHubScheduleTab } from "../components/event-hub/EventHubScheduleTab";
import { EventHubArrivalTab } from "../components/event-hub/EventHubArrivalTab";
import { EventHubTransportTab } from "../components/event-hub/EventHubTransportTab";
import { EventHubParkingTab } from "../components/event-hub/EventHubParkingTab";
import { EventHubServicesTab } from "../components/event-hub/EventHubServicesTab";
import { EventHubJourneyTab } from "../components/event-hub/EventHubJourneyTab";

type HubTab = "live" | "overview" | "journey" | "ticket" | "schedule" | "arrival" | "transport" | "parking" | "services";

export const EventHubPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [event, setEvent] = useState<AppEvent | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [tickets, setTickets] = useState<EventFlowTicket[]>([]);
  const [activeTab, setActiveTab] = useState<HubTab>("overview");
  const [timingStatus, setTimingStatus] = useState<EventTimingStatus | null>(null);

  // Sync tab with URL search parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab") as HubTab;
    if (
      tabParam &&
      ["live", "overview", "journey", "ticket", "schedule", "arrival", "transport", "parking", "services"].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: HubTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    if (!eventId) return;

    // Look up event from storage or SAMPLE_EVENTS
    const foundEvent = getStoredEventById(eventId) || SAMPLE_EVENTS.find((e) => e.id === eventId);
    if (foundEvent) {
      setEvent(foundEvent);
      const status = getEventTimingStatus(foundEvent.date, foundEvent.time);
      setTimingStatus(status);
    }

    // Load bookings & tickets for current user
    if (user?.id) {
      const userBookings = getUserBookings(user.id);
      const matchingBooking = userBookings.find((b) => b.eventId === eventId);
      if (matchingBooking) {
        setBooking(matchingBooking);
      }
      const allUserTickets = getUserTickets(user.id);
      const matchingTickets = allUserTickets.filter((t) => t.eventId === eventId);
      setTickets(matchingTickets);
    }
  }, [eventId, user?.id]);

  // Hook into centralized Live Event Engine
  const { liveState, clockInfo, isStale } = useLiveEvent(event?.id, event || undefined);

  if (!event) {
    return (
      <AppLayout pageTitle="Event Hub">
        <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
          <h2 className="text-xl font-bold text-[#241E17]">Event Not Found</h2>
          <p className="text-xs text-[#6B6252]">
            The requested event could not be located in your schedule.
          </p>
          <Link
            to="/my-event"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F7CFF] text-white font-bold text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Events</span>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const primaryTicket = tickets[0];
  const timing = timingStatus || getEventTimingStatus(event.date, event.time);
  const isEventLive = liveState?.status === "LIVE";

  // Derive relevant attendee live notices strictly from central live state
  const parkingOccupancyRatio =
    liveState && Object.values(liveState.parkingResources || {}).length > 0
      ? Object.values(liveState.parkingResources).reduce((s, p) => s + p.currentUsage, 0) /
        Math.max(1, Object.values(liveState.parkingResources).reduce((s, p) => s + p.capacity, 0))
      : 0;

  const hasHighParkingPressure = parkingOccupancyRatio >= 0.85;

  const tabs: { id: HubTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    ...(primaryTicket ? [{ id: "live" as HubTab, label: "Open live event", icon: Radio }] : []),
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "journey", label: "Event Journey", icon: Navigation },
    { id: "ticket", label: "Ticket", icon: TicketIcon },
    { id: "schedule", label: "Schedule", icon: Clock },
    { id: "arrival", label: "Arrival", icon: DoorOpen },
    { id: "transport", label: "Transport", icon: Sparkles },
    { id: "parking", label: "Parking", icon: Car },
    { id: "services", label: "Services", icon: Utensils },
  ];

  const getStatusBadgeStyle = () => {
    if (isEventLive) {
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    }
    switch (timing.timingMode) {
      case "EVENT_DAY":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
      case "LIVE":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "COMPLETED":
        return "bg-[#382F27]/50 text-[#C9BBA0] border-[#4A4236]";
      case "PRE_EVENT":
      default:
        return "bg-[#4F7CFF]/20 text-[#6EA8FF] border-[#4F7CFF]/30";
    }
  };

  return (
    <AppLayout pageTitle={event.name} pageBadge="Attendee Event Hub">
      <div className="max-w-4xl mx-auto space-y-6 pb-20 font-sans">
        {/* Top Back Breadcrumb */}
        <div>
          <Link
            to="/my-event"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6252] hover:text-[#0B1120] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Events</span>
          </Link>
        </div>

        {/* Hero Header Shell */}
        <div className="ef-hub-hero relative rounded-3xl bg-[#0B1120] text-white border border-[#27476E] p-6 sm:p-8 shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#4F7CFF]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-5">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#F0E9D6]/10 text-white font-bold border border-white/15">
                  {event.category}
                </span>

                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeStyle()}`}
                >
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  <span>
                    {isEventLive ? "● LIVE NOW" : timing.statusBadgeLabel}
                  </span>
                </div>

                {liveState && (
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                      liveState.sourceType === "SIMULATION"
                        ? "bg-indigo-900/60 text-indigo-300 border-indigo-700/60"
                        : "bg-emerald-900/60 text-emerald-300 border-emerald-700/60"
                    }`}
                  >
                    {liveState.sourceType === "SIMULATION" ? "SIMULATION" : "LIVE DATA"}
                  </span>
                )}
              </div>

              {/* Live Clock Card */}
              <div className="flex items-center gap-2">
                {clockInfo && (
                  <div className="text-right px-3 py-1 rounded-xl bg-[#F0E9D6]/10 border border-white/15 font-mono">
                    <span className="block text-[8px] uppercase tracking-wider text-[#C9BBA0]">
                      {clockInfo.label}
                    </span>
                    <span className="text-xs font-bold text-emerald-300">
                      {clockInfo.timeString}
                    </span>
                  </div>
                )}

                {primaryTicket && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#C9D9F7] bg-[#0B1120]/40 px-3 py-1 rounded-full border border-[#2D5FD2]/50">
                    <span>Pass #{primaryTicket.ticketId.slice(0, 10)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Event Name */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-heading leading-tight">
                {event.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#C9BBA0] mt-2 font-medium">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#4F7CFF] shrink-0" />
                  <span className="truncate">{event.venue}, {event.location || event.district || event.state}</span>
                </div>
              </div>
            </div>

            {/* Dedicated Gate & Seat Pill Strip */}
            <div className="pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#F0E9D6]/5 p-2.5 rounded-xl border border-white/10">
                <span className="text-[10px] uppercase font-mono text-[#6EA8FF] block font-bold">ASSIGNED GATE</span>
                <span className="font-bold text-white text-sm truncate block">
                  {primaryTicket?.assignedGate || "Check your ticket"}
                </span>
              </div>
              <div className="bg-[#F0E9D6]/5 p-2.5 rounded-xl border border-white/10">
                <span className="text-[10px] uppercase font-mono text-[#8C8272] block font-bold">SECTION / ZONE</span>
                <span className="font-bold text-white text-sm truncate block">
                  {primaryTicket?.section || "Check your ticket"}
                </span>
              </div>
              <div className="bg-[#F0E9D6]/5 p-2.5 rounded-xl border border-white/10">
                <span className="text-[10px] uppercase font-mono text-[#8C8272] block font-bold">SEAT / PASS</span>
                <span className="font-bold text-white text-sm truncate block">
                  {primaryTicket?.seat || "Check your ticket"}
                </span>
              </div>
              <div className="bg-[#F0E9D6]/5 p-2.5 rounded-xl border border-white/10">
                <span className="text-[10px] uppercase font-mono text-emerald-400 block font-bold">ENTRY WINDOW</span>
                <span className="font-bold text-emerald-200 text-sm truncate block">
                  {primaryTicket?.entryWindow || "Check your ticket"}
                </span>
              </div>
            </div>
          </div>
        </div>


        <div className="grid gap-3 sm:grid-cols-[.8fr_1.2fr]">
          <Link to={`/my-event/${event.id}/venue-map`} className="flex items-center gap-3 rounded-2xl border border-[#C9D9F7] bg-[#F0E9D6] p-4 text-[#0B1120] shadow-2xs hover:border-[#6EA8FF]">
            <span className="rounded-xl bg-[#4F7CFF]/10 p-2.5 text-[#4F7CFF]"><Navigation className="h-5 w-5"/></span>
            <span><b className="block text-sm">Indoor map</b><small className="text-[#6B6252]">Route · operators · help</small></span>
            <ChevronRight className="ml-auto h-4 w-4 text-[#6B6252]"/>
          </Link>
          <div className="flex items-center gap-3 rounded-2xl border border-[#C9D9F7] bg-[#F7FAFF] p-4">
            <MapPin className="h-5 w-5 shrink-0 text-[#4F7CFF]"/>
            <div className="min-w-0"><b className="block truncate text-sm text-[#0B1120]">{event.venue}</b><small className="block truncate text-[#6B6252]">{event.location || event.district || event.state || 'Location pending'}</small></div>
          </div>
        </div>

        <EventPlan event={event} ticket={primaryTicket} action={primaryTicket ? <button onClick={() => handleTabChange('live')} className="inline-flex items-center gap-2 rounded-xl bg-[#2D5FD2] px-5 py-3 text-white text-xs font-bold hover:bg-[#6b5024]"><Radio className="w-4 h-4"/>Open live event</button> : <Link to={`/events/${event.id}/book`} className="rounded-xl bg-[#2D5FD2] px-5 py-3 text-white text-xs font-bold">Book a ticket</Link>}/>

        {/* Derived Real-Time Attendee Guidance Alert (Only shown when relevant) */}
        {hasHighParkingPressure && (
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-900 flex items-start gap-3 text-xs">
            <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-[#0B1120]">
                Live Parking Advisory ({Math.round(parkingOccupancyRatio * 100)}% Capacity)
              </span>
              <p className="text-[#4A4236] mt-0.5">
                Perimeter parking bays are filling rapidly. Dedicated electric feeder shuttles and Metro corridors are operating on high frequency to ensure smooth entry through your assigned Gate.
              </p>
            </div>
          </div>
        )}


        {/* Tab Navigation Bar */}
        <div className="bg-[#F0E9D6] border border-[#C9D9F7]/90 rounded-2xl p-1.5 shadow-2xs overflow-x-auto">
          <nav className="flex items-center gap-1 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#4F7CFF] text-white shadow-xs font-bold"
                      : "text-[#4A4236] hover:text-[#0B1120] hover:bg-[#F4F8FF]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Active Tab Panel */}
        <div className="pt-2">
          {activeTab === "live" && primaryTicket && <LiveVenueLink eventId={event.id} />}
          {activeTab === "overview" && (
            <EventHubOverviewTab
              event={event}
              booking={booking || undefined}
              tickets={tickets}
              timingStatus={timing}
              onSelectTab={(t) => handleTabChange(t as HubTab)}
            />
          )}

          {activeTab === "journey" && (
            <EventHubJourneyTab
              event={event}
              tickets={tickets}
              booking={booking || undefined}
            />
          )}

          {activeTab === "ticket" && (
            <EventHubTicketTab event={event} tickets={tickets} />
          )}

          {activeTab === "schedule" && (
            <EventHubScheduleTab event={event} />
          )}

          {activeTab === "arrival" && (
            <EventHubArrivalTab event={event} primaryTicket={primaryTicket} />
          )}

          {activeTab === "transport" && (
            <EventHubTransportTab event={event} />
          )}

          {activeTab === "parking" && (
            <EventHubParkingTab event={event} />
          )}

          {activeTab === "services" && (
            <EventHubServicesTab event={event} />
          )}
        </div>
      </div>
    </AppLayout>
  );
};
