import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  Building2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Compass,
  Bus,
  Car,
  Coffee,
  Navigation,
  Share2,
  X,
  ExternalLink,
  Info,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  Download,
  Copy,
  PhoneCall,
  BadgeCheck,
  Ticket as TicketIcon,
} from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { useEventSelection } from "../context/EventContext";
import { AppEvent } from "../types/event";

export const EventDetailsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { getEventById, selectEvent, selectedEventId } = useEventSelection();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [shareToast, setShareToast] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    document.body.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [eventId]);

  const event = eventId ? getEventById(eventId) : undefined;
  const isCurrentEventSelected = selectedEventId === eventId;

  if (!event) {
    return (
      <AppLayout pageTitle="Event Not Found">
        <div className="py-16 text-center space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-[#0B1120] font-heading">
            Event Not Found
          </h2>
          <p className="text-sm text-[#6B6252]">
            The event you are searching for does not exist or may have been updated.
          </p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#4F7CFF] hover:bg-[#2D5FD2] transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Discover Events</span>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const handleSelectEvent = () => {
    selectEvent(event);
    setShowConfirmation(true);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: `Check out ${event.name} on EventFlow!`,
          url,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  // Google Calendar Link generator
  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(event.name);
    const details = encodeURIComponent(
      `${event.description}\n\nVenue: ${event.venue}, ${event.location}\nPowered by EventFlow`
    );
    const location = encodeURIComponent(`${event.venue}, ${event.location}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  // Google Maps navigation link
  const getGoogleMapsUrl = () => {
    const query = encodeURIComponent(`${event.venue}, ${event.location}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  return (
    <AppLayout pageTitle={event.name} pageBadge={event.category}>
      <div className="space-y-8 max-w-5xl mx-auto pb-24">
        {/* Navigation Breadcrumb & Utility Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            id="back-to-events-link"
            to="/events"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#4A4236] hover:text-[#0B1120] transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#8C8272] group-hover:-translate-x-1 transition-transform" />
            <span>Back to Discover Events</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Share Event Button */}
            <button
              id="share-event-btn"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#382F27] bg-[#F0E9D6] hover:bg-[#F4F8FF] border border-[#C9D9F7]/80 shadow-2xs transition-all cursor-pointer"
              title="Share event link"
            >
              <Share2 className="w-3.5 h-3.5 text-[#6B6252]" />
              <span>Share</span>
            </button>

            {/* Save to Calendar Button */}
            <a
              id="add-calendar-btn"
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#382F27] bg-[#F0E9D6] hover:bg-[#F4F8FF] border border-[#C9D9F7]/80 shadow-2xs transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-[#4F7CFF]" />
              <span>Add to Calendar</span>
            </a>

            {isCurrentEventSelected && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Selected Event</span>
              </span>
            )}
          </div>
        </div>

        {/* Share Feedback Toast */}
        {shareToast && (
          <div className="fixed top-5 right-5 z-50 bg-[#0B1120] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Event link copied to clipboard!</span>
          </div>
        )}

        {/* Hero Event Visual Banner */}
        <div className="relative rounded-3xl overflow-hidden shadow-lg bg-[#0B1120] border border-[#C9D9F7]/80 aspect-[16/9] sm:aspect-[21/9] max-h-[460px]">
          <img
            src={event.image}
            alt={event.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />

          {/* High-contrast multi-stop gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/45 to-[#0B1120]/15 pointer-events-none" />

          {/* Category & Status Overlay */}
          <div className="absolute top-5 left-5 sm:top-6 sm:left-6 flex flex-wrap items-center gap-2 z-10">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide bg-[#F0E9D6]/95 text-[#0B1120] backdrop-blur-md shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4F7CFF]" />
              {event.category}
            </span>

            {event.statusBadge && (
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#4F7CFF]/90 text-white backdrop-blur-md shadow-xs border border-[#4F7CFF]/30">
                {event.statusBadge}
              </span>
            )}

            {event.organizerInfo?.verified && (
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600/90 text-white backdrop-blur-md shadow-xs flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5 text-white" />
                Verified Organizer
              </span>
            )}
          </div>

          {/* Bottom Title & Venue Details */}
          <div className="absolute bottom-5 left-5 right-5 sm:bottom-8 sm:left-8 sm:right-8 z-10 text-white space-y-2.5">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight font-heading leading-tight text-white drop-shadow-md">
              {event.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs sm:text-sm text-[#C9D9F7] font-medium">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#4F7CFF] shrink-0" />
                <span className="font-semibold">{event.venue}</span>
              </div>
              <span className="text-[#8C8272] hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[#6EA8FF]">📍</span>
                <span>{event.district ? `${event.district} District, ${event.state}` : event.location}</span>
              </div>
              <span className="text-[#8C8272] hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#4F7CFF] shrink-0" />
                <span>{event.date}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Meta Grid & Selection Action Bar */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full lg:w-auto">
            {/* Date */}
            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-wider text-[#8C8272] font-mono font-bold">
                Date & Time
              </div>
              <div className="text-sm sm:text-base font-bold text-[#0B1120]">
                {event.date}
              </div>
              <div className="text-xs text-[#6B6252] font-medium">
                {event.time}
              </div>
            </div>

            {/* Expected Attendance */}
            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-wider text-[#8C8272] font-mono font-bold">
                Expected Crowd
              </div>
              <div className="text-sm sm:text-base font-bold text-[#4F7CFF]">
                {event.expectedAttendance}
              </div>
              <div className="text-xs text-[#6B6252]">
                Registered Attendees
              </div>
            </div>

            {/* Capacity */}
            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-wider text-[#8C8272] font-mono font-bold">
                Venue Capacity
              </div>
              <div className="text-sm sm:text-base font-bold text-[#0B1120]">
                {event.capacity}
              </div>
              <div className="text-xs text-[#6B6252]">
                Total Seating & Stands
              </div>
            </div>

            {/* Duration & Age */}
            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-wider text-[#8C8272] font-mono font-bold">
                Show Duration
              </div>
              <div className="text-sm sm:text-base font-bold text-[#0B1120]">
                {event.duration || "4 Hours"}
              </div>
              <div className="text-xs text-[#6B6252]">
                {event.agePolicy ? event.agePolicy.split(".")[0] : "All Ages"}
              </div>
            </div>
          </div>

          {/* Primary Action Button: Book Ticket → */}
          <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              id="book-tickets-primary-cta"
              to={`/events/${event.id}/book`}
              className="px-8 py-4 rounded-xl text-sm sm:text-base font-bold bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white shadow-[#4F7CFF]/20 hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <TicketIcon className="w-5 h-5 text-white" />
              <span>Book Ticket →</span>
            </Link>

            <button
              id="select-this-event-cta"
              onClick={handleSelectEvent}
              className={`px-6 py-4 rounded-xl text-sm sm:text-base font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
                isCurrentEventSelected
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-[#F0E9D6] hover:bg-[#F4F8FF] text-[#382F27] border border-[#C9D9F7]"
              }`}
            >
              {isCurrentEventSelected ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Selected Event ✓</span>
                </>
              ) : (
                <span>Set as Active Event</span>
              )}
            </button>
          </div>
        </div>

        {/* Event Story & Comprehensive Description */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F7FAFF] pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#8C8272] font-mono">
              About This Mega Event
            </h2>
            <span className="text-xs font-medium text-[#6B6252]">
              Language: <strong className="text-[#241E17]">{event.language || "English & Regional"}</strong>
            </span>
          </div>

          <p className="text-[#382F27] text-base sm:text-lg leading-relaxed">
            {event.description}
          </p>

          {/* Key Event Highlights Pills */}
          {event.highlights && event.highlights.length > 0 && (
            <div className="pt-3 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#6B6252] font-mono">
                Event Highlights & Attractions
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {event.highlights.map((highlight, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7]/80 flex items-center gap-2.5 text-xs font-semibold text-[#241E17]"
                  >
                    <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Venue & Location Information */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F7FAFF] pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C8272] font-mono">
                Venue & Location
              </h3>
              <div className="text-lg font-bold text-[#0B1120] font-heading mt-0.5">
                {event.venue}
              </div>
            </div>

            <a
              id="open-google-maps-btn"
              href={getGoogleMapsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#4F7CFF] bg-[#F7FAFF] hover:bg-[#EDE3CB] transition-colors w-fit"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Get Directions on Google Maps</span>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF] space-y-1">
              <span className="font-mono text-[11px] uppercase text-[#8C8272] font-bold block">
                District / Region
              </span>
              <span className="font-bold text-[#0B1120] text-sm">
                {event.district || "Central District"}
              </span>
              <span className="text-[#6B6252] block">
                {event.state}, {event.country}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF] space-y-1">
              <span className="font-mono text-[11px] uppercase text-[#8C8272] font-bold block">
                Transit Accessibility
              </span>
              <span className="font-bold text-[#0B1120] text-sm">
                Metro & Dedicated Express
              </span>
              <span className="text-[#6B6252] block">
                Pedestrian skywalk & shuttle links
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF] space-y-1">
              <span className="font-mono text-[11px] uppercase text-[#8C8272] font-bold block">
                Ingress Guidance
              </span>
              <span className="font-bold text-[#0B1120] text-sm">
                Barcode / RFID Entry
              </span>
              <span className="text-[#6B6252] block">
                Gates open 2 to 3 hours prior
              </span>
            </div>
          </div>
        </div>

        {/* Event Guidelines & Entry Policies */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-xs space-y-5">
          <div className="border-b border-[#F7FAFF] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C8272] font-mono">
              Event Guidelines & Entry Policies
            </h3>
            <p className="text-xs text-[#6B6252] mt-1">
              Please review attendee entry policies for a smooth, secure check-in experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Permitted Items */}
            <div className="p-4 sm:p-5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Permitted Items</span>
              </div>
              <ul className="space-y-2 text-xs text-[#382F27]">
                {event.guidelines?.permitted?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                )) || (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Smartphones and personal power banks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Clear PVC bags up to 12" x 12"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Prescription medicines with badge</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Prohibited Items */}
            <div className="p-4 sm:p-5 rounded-xl bg-rose-50/60 border border-rose-200/80 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Prohibited Items</span>
              </div>
              <ul className="space-y-2 text-xs text-[#382F27]">
                {event.guidelines?.prohibited?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">✕</span>
                    <span>{item}</span>
                  </li>
                )) || (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">✕</span>
                      <span>Professional cameras with detachable lenses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">✕</span>
                      <span>Outside food, canned drinks, and alcohol</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">✕</span>
                      <span>Laser pointers, fireworks, and sharp objects</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Bag & Re-entry Policy Strip */}
          <div className="p-4 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7]/80 text-xs text-[#4A4236] space-y-1">
            <div>
              <strong className="text-[#0B1120]">Bag Policy: </strong>
              {event.guidelines?.bagPolicy || "Clear bags up to 12x12 inches permitted. Cloakrooms available outside main gates."}
            </div>
            <div>
              <strong className="text-[#0B1120]">Entry & Wristbands: </strong>
              {event.guidelines?.entryRules || "Please keep your digital barcode pass or official RFID wristband visible at all times."}
            </div>
          </div>
        </div>

        {/* Organizer Verification & Safety Accreditation */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0B1120] to-[#241E17] text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F0E9D6]/10 text-white flex items-center justify-center shrink-0 border border-white/10">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6EA8FF] font-mono">
                  Official Organizer
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-400/30">
                  Accredited
                </span>
              </div>
              <div className="text-base font-bold text-white">
                {event.organizerInfo?.name || "Official EventFlow Partner"}
              </div>
              <div className="text-xs text-[#C9BBA0]">
                License: {event.organizerInfo?.licenseNo || "EVF-ACCRED-2026"}
              </div>
            </div>
          </div>

          {event.organizerInfo?.supportContact && (
            <div className="flex items-center gap-2 text-xs text-[#C9BBA0] bg-[#F0E9D6]/5 border border-white/10 px-4 py-2 rounded-xl">
              <PhoneCall className="w-3.5 h-3.5 text-[#4F7CFF]" />
              <span>Attendee Helpline: </span>
              <strong className="text-white font-mono">{event.organizerInfo.supportContact}</strong>
            </div>
          )}
        </div>

        {/* COMPACT SECTION: EVENTFLOW SUPPORTS */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#4F7CFF]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#382F27] font-mono">
              EVENTFLOW PLATFORM CAPABILITIES
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl bg-[#F0E9D6] border border-[#C9D9F7]/80 shadow-2xs space-y-1">
              <div className="w-7 h-7 rounded-lg bg-[#F7FAFF] text-[#4F7CFF] flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <h4 className="font-bold text-xs text-[#0B1120]">Venue Flow</h4>
              <p className="text-[11px] text-[#6B6252] leading-snug">Concourses & turnstiles</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F0E9D6] border border-[#C9D9F7]/80 shadow-2xs space-y-1">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Bus className="w-3.5 h-3.5" />
              </div>
              <h4 className="font-bold text-xs text-[#0B1120]">Transport</h4>
              <p className="text-[11px] text-[#6B6252] leading-snug">Subway & park shuttles</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F0E9D6] border border-[#C9D9F7]/80 shadow-2xs space-y-1">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Car className="w-3.5 h-3.5" />
              </div>
              <h4 className="font-bold text-xs text-[#0B1120]">Parking</h4>
              <p className="text-[11px] text-[#6B6252] leading-snug">Reserved parking decks</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F0E9D6] border border-[#C9D9F7]/80 shadow-2xs space-y-1">
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Coffee className="w-3.5 h-3.5" />
              </div>
              <h4 className="font-bold text-xs text-[#0B1120]">Hospitality</h4>
              <p className="text-[11px] text-[#6B6252] leading-snug">Food stalls & water hubs</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F0E9D6] border border-[#C9D9F7]/80 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Navigation className="w-3.5 h-3.5" />
              </div>
              <h4 className="font-bold text-xs text-[#0B1120]">Guidance</h4>
              <p className="text-[11px] text-[#6B6252] leading-snug">Live crowd wayfinding</p>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions Accordion */}
        {event.faqs && event.faqs.length > 0 && (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#F7FAFF] pb-3">
              <HelpCircle className="w-4 h-4 text-[#4F7CFF]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#382F27] font-mono">
                Frequently Asked Questions
              </h3>
            </div>

            <div className="space-y-2.5">
              {event.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-[#C9D9F7]/80 overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between gap-3 text-sm font-semibold text-[#0B1120] hover:bg-[#F4F8FF] transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#8C8272] transition-transform ${
                          isOpen ? "rotate-180 text-[#4F7CFF]" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="p-4 pt-1 text-xs sm:text-sm text-[#4A4236] bg-[#F4F8FF]/50 leading-relaxed border-t border-[#F7FAFF]">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar for Mobile & Quick Trigger */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#F0E9D6]/95 backdrop-blur-md border-t border-[#C9D9F7] p-3 sm:hidden shadow-lg flex items-center justify-between gap-3">
        <div className="truncate">
          <div className="text-xs font-bold text-[#0B1120] truncate">{event.name}</div>
          <div className="text-[10px] text-[#6B6252]">{event.venue}</div>
        </div>
        <button
          onClick={handleSelectEvent}
          className={`shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs ${
            isCurrentEventSelected
              ? "bg-emerald-600"
              : "bg-[#4F7CFF] hover:bg-[#2D5FD2]"
          }`}
        >
          {isCurrentEventSelected ? "Selected ✓" : "Select Event"}
        </button>
      </div>

      {/* Confirmation State Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1120]/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#F0E9D6] border border-[#C9D9F7] rounded-3xl p-7 sm:p-8 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setShowConfirmation(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-[#8C8272] hover:text-[#382F27] hover:bg-[#F7FAFF] transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Checkmark Circle */}
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            {/* Confirmation Text */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 font-mono">
                EVENT ACTIVATED
              </div>
              <h3 className="text-xl font-bold text-[#0B1120] font-heading leading-snug">
                {event.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#4A4236] max-w-sm mx-auto leading-relaxed">
                EventFlow is now personalized for your journey at{" "}
                <span className="font-semibold text-[#0B1120]">{event.venue}</span>.
                Your event selection is saved locally and will guide your attendee experience.
              </p>
            </div>

            {/* Key Event Summary Pill */}
            <div className="p-3.5 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7]/80 grid grid-cols-2 gap-3 text-left text-xs">
              <div>
                <span className="text-[#8C8272] text-[10px] uppercase font-mono font-bold block">
                  Date
                </span>
                <span className="font-semibold text-[#241E17]">{event.date}</span>
              </div>
              <div>
                <span className="text-[#8C8272] text-[10px] uppercase font-mono font-bold block">
                  District & State
                </span>
                <span className="font-semibold text-[#241E17] truncate block">
                  {event.district || event.location}, {event.state || "India"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  navigate(`/events/${event.id}/book`);
                }}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-[#4F7CFF] hover:bg-[#2D5FD2] active:scale-[0.98] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Book Tickets for This Event</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setShowConfirmation(false)}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-[#4A4236] hover:text-[#0B1120] transition-colors cursor-pointer"
              >
                Continue Exploring Event Details
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
