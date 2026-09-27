import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Ticket as TicketIcon,
  Compass,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles,
  User,
  ShieldCheck,
  X,
} from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import { useTicket } from "../context/TicketContext";
import { useEventSelection } from "../context/EventContext";
import { EventCountdownCard } from "../components/attendee/EventCountdownCard";
import { EventTimelineJourney } from "../components/attendee/EventTimelineJourney";
import { PersonalTicketCard } from "../components/attendee/PersonalTicketCard";
import { ArrivalPlanSection } from "../components/attendee/ArrivalPlanSection";
import { EventScheduleSection } from "../components/attendee/EventScheduleSection";
import { TransportSection } from "../components/attendee/TransportSection";
import { ParkingSection } from "../components/attendee/ParkingSection";
import { NearbyServicesSection } from "../components/attendee/NearbyServicesSection";
import { EventFlowGuidanceCard } from "../components/attendee/EventFlowGuidanceCard";
import { EventUpdatesSection } from "../components/attendee/EventUpdatesSection";
import { EventFlowDigitalTicket } from "../components/ticket/EventFlowDigitalTicket";

export const MyEventPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userBookings, userTickets } = useTicket();
  const { getEventById } = useEventSelection();

  const [selectedBookingIndex, setSelectedBookingIndex] = useState<number>(0);
  const [showTicketModal, setShowTicketModal] = useState<boolean>(false);

  // Requirement 15: Always start at top of page on load
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  // Requirement 1: If user has no booking, show empty state
  if (!userBookings || userBookings.length === 0) {
    return (
      <AppLayout pageTitle="My Event" pageBadge="Attendee Pass">
        <div className="max-w-2xl mx-auto py-16 sm:py-24 px-4 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-[#F7FAFF] border border-[#EDE3CB] text-[#4F7CFF] flex items-center justify-center mx-auto shadow-xs">
            <TicketIcon className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0B1120] font-heading">
              No events booked yet.
            </h1>
            <p className="text-sm text-[#6B6252] max-w-md mx-auto leading-relaxed">
              You have not booked any events yet. Explore upcoming mega-events and secure your entry credential.
            </p>
          </div>

          <div className="pt-2">
            <Link
              id="discover-events-empty-cta"
              to="/events"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-[#4F7CFF] hover:bg-[#2D5FD2] transition-all shadow-md shadow-[#4F7CFF]/20 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Discover Events →</span>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Active booking for the logged-in user
  const currentBooking = userBookings[selectedBookingIndex] || userBookings[0];
  const currentEvent = getEventById(currentBooking.eventId);
  const currentTicket =
    userTickets.find((t) => t.eventId === currentBooking.eventId) || userTickets[0];

  // Helper smooth scroll
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <AppLayout pageTitle="My Event" pageBadge="Personal Event Command Center">
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        {/* Attendee Welcome Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#6B6252]">
            <span>
              Attendee: <strong className="text-[#0B1120] font-semibold">{user?.fullName || user?.name}</strong>
            </span>
            <span>•</span>
            <span>
              {userBookings.length} Active Booking{userBookings.length > 1 ? "s" : ""}
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>🟢 BOOKING CONFIRMED</span>
          </span>
        </div>

        {/* Multi-Booking Switcher (if user booked multiple events) */}
        {userBookings.length > 1 && (
          <div className="p-2 rounded-2xl bg-[#F7FAFF] border border-[#C9D9F7] space-y-1.5">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B6252] px-2 pt-1">
              Switch Booked Event:
            </div>
            <div className="flex flex-wrap gap-2">
              {userBookings.map((b, idx) => {
                const isSelected = idx === selectedBookingIndex;
                return (
                  <button
                    key={b.bookingId}
                    type="button"
                    onClick={() => setSelectedBookingIndex(idx)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? "bg-[#F0E9D6] text-[#2D5FD2] shadow-xs font-bold border border-[#C9D9F7]"
                        : "text-[#4A4236] hover:text-[#0B1120] hover:bg-[#F0E9D6]/60"
                    }`}
                  >
                    <TicketIcon className="w-3.5 h-3.5 text-[#4F7CFF]" />
                    <span className="truncate max-w-[200px] sm:max-w-xs">
                      {b.eventName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* 2. MY EVENT — TOP SECTION                          */}
        {/* ================================================== */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0B1120] via-[#0B1120] to-[#1C2541] text-white p-6 sm:p-10 shadow-xl border border-[#241E17]">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#4F7CFF]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Category and Booking Status Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#4F7CFF]/20 text-[#6EA8FF] border border-[#4F7CFF]/30">
                <TicketIcon className="w-3.5 h-3.5 text-[#4F7CFF]" />
                <span>{currentEvent?.category?.toUpperCase() || "CONFERENCE"}</span>
              </span>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>🟢 BOOKING CONFIRMED</span>
                </span>
              </div>
            </div>

            {/* Event Name & Metadata */}
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight font-heading leading-tight text-white">
                {currentBooking.eventName}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#C9BBA0] font-medium pt-1">
                {/* Date */}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#4F7CFF] shrink-0" />
                  <span className="text-white font-semibold">{currentBooking.eventDate}</span>
                </div>
                <span>•</span>

                {/* Time */}
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#4F7CFF] shrink-0" />
                  <span className="text-white font-semibold font-mono">{currentBooking.eventTime}</span>
                </div>
                <span>•</span>

                {/* Venue & Location */}
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#4F7CFF] shrink-0" />
                  <span className="text-white font-semibold">{currentBooking.venue}</span>
                  {currentEvent?.location && (
                    <span className="text-[#8C8272]">({currentEvent.location.split(",")[0]})</span>
                  )}
                </div>
              </div>
            </div>

            {/* Summary strip with attendee & booking ID */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-[#C9BBA0]">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-[#4F7CFF]" />
                <span>
                  Credential Holder: <strong className="text-white">{currentBooking.attendeeName}</strong>
                </span>
                <span>({currentBooking.ticketType})</span>
              </div>

              <div className="font-mono text-[#8C8272]">
                Ref: <span className="text-white font-bold">{currentBooking.bookingId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* 13. QUICK ACTIONS BAR                              */}
        {/* ================================================== */}
        <div className="p-3 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs">
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B6252] px-2">
                Quick Actions:
              </span>

              {/* View Ticket Action */}
              <button
                type="button"
                onClick={() => scrollToSection("ticket-card")}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#382F27] hover:text-[#2D5FD2] hover:bg-[#F7FAFF] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <TicketIcon className="w-3.5 h-3.5 text-[#4F7CFF]" />
                <span>View Ticket</span>
              </button>

              {/* Schedule Action */}
              <button
                type="button"
                onClick={() => scrollToSection("event-schedule")}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#382F27] hover:text-[#2D5FD2] hover:bg-[#F7FAFF] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-[#4F7CFF]" />
                <span>Event Schedule</span>
              </button>

              {/* Arrival Plan Action */}
              <button
                type="button"
                onClick={() => scrollToSection("arrival-plan")}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#382F27] hover:text-[#2D5FD2] hover:bg-[#F7FAFF] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-[#4F7CFF]" />
                <span>Arrival Plan</span>
              </button>

              {/* Transport Action */}
              <button
                type="button"
                onClick={() => scrollToSection("transport-section")}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#382F27] hover:text-[#2D5FD2] hover:bg-[#F7FAFF] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Transit</span>
              </button>

              {/* Parking Action */}
              {currentEvent?.parking && currentEvent.parking.length > 0 && (
                <button
                  type="button"
                  onClick={() => scrollToSection("parking-section")}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#382F27] hover:text-[#2D5FD2] hover:bg-[#F7FAFF] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Parking</span>
                </button>
              )}
            </div>

            {/* Event Details Link */}
            <Link
              to={`/events/${currentBooking.eventId}`}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#4F7CFF] hover:text-[#6b5024] hover:bg-[#F7FAFF] transition-colors flex items-center gap-1 shrink-0 ml-auto"
            >
              <span>Event Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ================================================== */}
        {/* 4. EVENT COUNTDOWN & LIVE STATUS                   */}
        {/* ================================================== */}
        <EventCountdownCard
          eventDate={currentBooking.eventDate}
          eventTime={currentBooking.eventTime}
          eventName={currentBooking.eventName}
          venue={currentBooking.venue}
        />

        {/* ================================================== */}
        {/* 11. EVENT TIMELINE JOURNEY                         */}
        {/* ================================================== */}
        <EventTimelineJourney
          eventDate={currentBooking.eventDate}
          eventTime={currentBooking.eventTime}
        />

        {/* ================================================== */}
        {/* 3. PERSONAL TICKET CARD                            */}
        {/* ================================================== */}
        <PersonalTicketCard
          booking={currentBooking}
          ticket={currentTicket}
          onViewTicketModal={() => setShowTicketModal(true)}
        />

        {/* ================================================== */}
        {/* 6. YOUR ARRIVAL PLAN                               */}
        {/* ================================================== */}
        <ArrivalPlanSection
          assignedGate={currentBooking.assignedGate || currentTicket?.assignedGate || "Gate 1"}
          entryWindow={currentBooking.entryWindow || currentTicket?.entryWindow || "08:00 AM – 10:00 AM"}
          venue={currentBooking.venue}
          eventTime={currentBooking.eventTime}
          location={currentEvent?.location}
        />

        {/* ================================================== */}
        {/* 5. EVENT SCHEDULE                                  */}
        {/* ================================================== */}
        {currentEvent?.schedule && currentEvent.schedule.length > 0 && (
          <EventScheduleSection
            schedule={currentEvent.schedule}
            eventName={currentBooking.eventName}
          />
        )}

        {/* ================================================== */}
        {/* 7. TRANSPORT                                       */}
        {/* ================================================== */}
        <TransportSection
          venue={currentBooking.venue}
          transport={currentEvent?.transport}
        />

        {/* ================================================== */}
        {/* 8. PARKING                                         */}
        {/* ================================================== */}
        {currentEvent?.parking && currentEvent.parking.length > 0 && (
          <ParkingSection
            parking={currentEvent.parking}
            venue={currentBooking.venue}
          />
        )}

        {/* ================================================== */}
        {/* 9. HOSPITALITY & SERVICES                          */}
        {/* ================================================== */}
        <NearbyServicesSection
          hospitality={currentEvent?.hospitality}
          venue={currentBooking.venue}
          district={currentEvent?.district}
        />

        {/* ================================================== */}
        {/* 10. EVENTFLOW GUIDANCE                             */}
        {/* ================================================== */}
        <EventFlowGuidanceCard
          ticketId={currentTicket?.ticketId || currentBooking.ticketIds[0]}
          assignedGate={currentBooking.assignedGate || currentTicket?.assignedGate || "Gate 1"}
          entryWindow={currentBooking.entryWindow || currentTicket?.entryWindow || "08:00 AM – 10:00 AM"}
          eventName={currentBooking.eventName}
        />

        {/* ================================================== */}
        {/* 12. ALERTS SECTION ("Event Updates")               */}
        {/* ================================================== */}
        <EventUpdatesSection
          eventName={currentBooking.eventName}
          eventTime={currentBooking.eventTime}
          assignedGate={currentBooking.assignedGate || currentTicket?.assignedGate || "Gate 1"}
          bagPolicy={currentEvent?.guidelines?.bagPolicy}
          supportContact={currentEvent?.organizerInfo?.supportContact}
        />
      </div>

      {/* Quick QR & Digital Ticket Modal */}
      {showTicketModal && currentTicket && (
        <div className="fixed inset-0 z-50 bg-[#0B1120]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#F0E9D6] rounded-3xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-4 px-6 border-b border-[#F7FAFF] bg-[#F4F8FF]">
              <div className="flex items-center gap-2">
                <TicketIcon className="w-5 h-5 text-[#4F7CFF]" />
                <span className="font-bold text-[#0B1120] text-sm font-heading">
                  EventFlow Digital Pass Preview
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowTicketModal(false)}
                className="w-8 h-8 rounded-full bg-[#C9D9F7]/80 hover:bg-[#C9BBA0] text-[#382F27] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              <EventFlowDigitalTicket ticket={currentTicket} showActions={true} />
            </div>

            <div className="p-4 bg-[#F4F8FF] border-t border-[#F7FAFF] flex items-center justify-between">
              <span className="text-xs text-[#6B6252]">
                Official encrypted optical admission token
              </span>
              <button
                type="button"
                onClick={() => setShowTicketModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-[#382F27] bg-[#F0E9D6] border border-[#C9BBA0] hover:bg-[#F7FAFF] transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
