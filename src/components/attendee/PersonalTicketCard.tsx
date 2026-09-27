import React from "react";
import { Link } from "react-router-dom";
import {
  Ticket as TicketIcon,
  User,
  DoorOpen,
  Clock,
  Armchair,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  QrCode,
} from "lucide-react";
import { Booking, EventFlowTicket } from "../../types/booking";

interface PersonalTicketCardProps {
  booking: Booking;
  ticket?: EventFlowTicket | null;
  onViewTicketModal?: () => void;
}

export const PersonalTicketCard: React.FC<PersonalTicketCardProps> = ({
  booking,
  ticket,
  onViewTicketModal,
}) => {
  const displayTicketId = ticket?.ticketId || booking.ticketIds[0] || booking.bookingId;
  const displayGate = ticket?.assignedGate || booking.assignedGate || "Main Concourse Gate";
  const displayWindow = ticket?.entryWindow || booking.entryWindow || "08:00 AM – 10:00 AM";
  const displaySeat =
    booking.seatLabel ||
    (Array.isArray(booking.seats) && booking.seats.length > 0
      ? booking.seats.join(", ")
      : "General Admission - Open Concourse");

  return (
    <div
      id="ticket-card"
      className="rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-sm overflow-hidden space-y-0 transition-all hover:shadow-md"
    >
      {/* Card Header */}
      <div className="bg-gradient-to-r from-[#0B1120] via-[#0B1120] to-[#1C2541] text-white p-6 sm:p-7 relative overflow-hidden">
        {/* Subtle geometric glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#4F7CFF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4F7CFF]/20 border border-[#4F7CFF]/30 flex items-center justify-center text-[#4F7CFF]">
              <TicketIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#6EA8FF] block">
                YOUR TICKET
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white font-heading">
                Official Digital Admission Credential
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>🟢 BOOKING CONFIRMED</span>
            </span>
          </div>
        </div>
      </div>

      {/* Ticket Body: Key Parameters Grid */}
      <div className="p-6 sm:p-7 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Attendee Name */}
          <div className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/80 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B6252]">
              <User className="w-3.5 h-3.5 text-[#4F7CFF]" />
              <span>Attendee Name</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-[#0B1120] truncate">
              {booking.attendeeName}
            </div>
            <div className="text-[11px] text-[#6B6252]">
              Registered Attendee
            </div>
          </div>

          {/* Ticket Type */}
          <div className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/80 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B6252]">
              <TicketIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ticket Type</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-[#0B1120] truncate">
              {booking.ticketType}
            </div>
            <div className="text-[11px] text-[#6B6252]">
              Quantity: {booking.quantity} Pass{booking.quantity > 1 ? "es" : ""}
            </div>
          </div>

          {/* Ticket ID */}
          <div className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/80 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B6252]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ticket ID</span>
            </div>
            <div className="text-sm sm:text-base font-mono font-bold text-[#0B1120] truncate">
              {displayTicketId}
            </div>
            <div className="text-[11px] text-[#6B6252]">
              Verified Cryptographic Token
            </div>
          </div>

          {/* Section & Seat */}
          <div className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/80 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B6252]">
              <Armchair className="w-3.5 h-3.5 text-blue-600" />
              <span>Section & Seat</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-[#0B1120] truncate">
              {displaySeat}
            </div>
            <div className="text-[11px] text-[#6B6252] truncate">
              Section: {booking.section || "General"}
            </div>
          </div>
        </div>

        {/* Assigned Gate & Entry Window Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Assigned Gate */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-emerald-800">
                <DoorOpen className="w-4 h-4 text-emerald-700" />
                <span>Assigned Gate</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                RECOMMENDED
              </span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-emerald-950">
              {displayGate}
            </div>
            <div className="text-xs text-emerald-800/80">
              Your ticket is prioritized for this specific ingress checkpoint.
            </div>
          </div>

          {/* Entry Window */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F7FAFF]/70 border border-[#C9D9F7] space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#6b5024]">
                <Clock className="w-4 h-4 text-[#2D5FD2]" />
                <span>Entry Window</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#C9D9F7] text-[#0B1120]">
                SCHEDULED
              </span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-[#0B1120] font-mono">
              {displayWindow}
            </div>
            <div className="text-xs text-[#6b5024]/80">
              Arrive within this allocated window for prompt turnstile processing.
            </div>
          </div>
        </div>

        {/* Action Button & Metadata */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-[#F7FAFF]">
          <div className="flex items-center gap-2 text-xs text-[#6B6252]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Booking Reference: <strong className="font-mono text-[#241E17]">{booking.bookingId}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onViewTicketModal && (
              <button
                type="button"
                onClick={onViewTicketModal}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#382F27] bg-[#F7FAFF] hover:bg-[#C9D9F7] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-[#382F27]" />
                <span>Quick QR Preview</span>
              </button>
            )}

            <Link
              id="view-ticket-btn"
              to="/ticket"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#4F7CFF] hover:bg-[#2D5FD2] transition-all shadow-md shadow-[#4F7CFF]/20 flex items-center gap-2 cursor-pointer"
            >
              <TicketIcon className="w-4 h-4" />
              <span>View Ticket →</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
