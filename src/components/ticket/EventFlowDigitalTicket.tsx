import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Printer,
  Share2,
  Sparkles,
  Ticket as TicketIcon,
  DoorOpen,
} from "lucide-react";
import { EventFlowTicket } from "../../types/booking";
import { EventFlowQrCode } from "./EventFlowQrCode";

interface EventFlowDigitalTicketProps {
  ticket: EventFlowTicket;
  showActions?: boolean;
}

export const EventFlowDigitalTicket: React.FC<EventFlowDigitalTicketProps> = ({
  ticket,
  showActions = true,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(ticket.ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Ticket Card Container */}
      <div className="relative rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        {/* Top Header Banner: Deep Navy & Cobalt Gradient */}
        <div className="bg-gradient-to-r from-[#0B1120] via-[#0B1120] to-[#1C2541] text-white p-6 sm:p-8 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#4F7CFF]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#4F7CFF]/20 border border-[#4F7CFF]/30 flex items-center justify-center text-[#4F7CFF]">
                <TicketIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#6EA8FF] font-bold block">
                  EVENTFLOW TICKET
                </span>
                <span className="text-xs text-[#8C8272]">Official Digital Admission Pass</span>
              </div>
            </div>

            {/* Booking Status Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Booking Status: CONFIRMED</span>
            </div>
          </div>

          {/* Event Title */}
          <div className="mt-5 space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white tracking-tight">
              {ticket.eventName}
            </h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-[#C9BBA0]">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#4F7CFF] shrink-0" />
                <span>{ticket.venue}</span>
              </div>
              <span className="text-[#6B6252]">•</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#4F7CFF] shrink-0" />
                <span>{ticket.eventDate}</span>
              </div>
              <span className="text-[#6B6252]">•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#4F7CFF] shrink-0" />
                <span>{ticket.eventTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notched Tear-line / Perforated Divider */}
        <div className="relative h-6 bg-[#F4F8FF] flex items-center justify-between overflow-hidden">
          {/* Left Notch */}
          <div className="w-6 h-6 rounded-full bg-[#F4F8FF] -ml-3 border-r border-[#C9D9F7]" />
          {/* Perforated Dashed Line */}
          <div className="flex-1 border-b-2 border-dashed border-[#C9BBA0] mx-2" />
          {/* Right Notch */}
          <div className="w-6 h-6 rounded-full bg-[#F4F8FF] -mr-3 border-l border-[#C9D9F7]" />
        </div>

        {/* Ticket Details & QR Section */}
        <div className="p-6 sm:p-8 bg-[#F0E9D6] space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Left 2 Columns: Credentials Grid */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                {/* Attendee Name */}
                <div className="p-3.5 rounded-2xl bg-[#F4F8FF]/80 border border-[#F7FAFF] space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C8272] font-bold flex items-center gap-1">
                    <User className="w-3 h-3 text-[#4F7CFF]" />
                    <span>Attendee Name</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-[#0B1120] truncate">
                    {ticket.attendeeName}
                  </div>
                </div>

                {/* Ticket Type */}
                <div className="p-3.5 rounded-2xl bg-[#F7FAFF]/60 border border-[#EDE3CB] space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#2D5FD2] font-bold">
                    Ticket Type
                  </div>
                  <div className="text-sm sm:text-base font-bold text-[#0B1120]">
                    {ticket.ticketType}
                  </div>
                </div>

                {/* Section */}
                <div className="p-3.5 rounded-2xl bg-[#F4F8FF]/80 border border-[#F7FAFF] space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C8272] font-bold">
                    Section
                  </div>
                  <div className="text-sm sm:text-base font-bold text-[#0B1120]">
                    {ticket.section}
                  </div>
                </div>

                {/* Seat */}
                <div className="p-3.5 rounded-2xl bg-[#F4F8FF]/80 border border-[#F7FAFF] space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C8272] font-bold">
                    Seat
                  </div>
                  <div className="text-sm sm:text-base font-bold text-[#0B1120]">
                    {ticket.seat}
                  </div>
                </div>

                {/* Assigned Gate */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold flex items-center gap-1">
                    <DoorOpen className="w-3 h-3 text-emerald-600" />
                    <span>Assigned Gate</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-emerald-900">
                    {ticket.assignedGate}
                  </div>
                </div>

                {/* Entry Window */}
                <div className="p-3.5 rounded-2xl bg-[#F4F8FF]/80 border border-[#F7FAFF] space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C8272] font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#6B6252]" />
                    <span>Entry Window</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-[#0B1120]">
                    {ticket.entryWindow}
                  </div>
                </div>
              </div>

              {/* Ticket ID Box */}
              <div className="p-3 rounded-xl bg-[#F7FAFF] border border-[#C9D9F7] flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase text-[#6B6252] font-bold">
                    Ticket ID
                  </div>
                  <div className="text-sm font-mono font-bold text-[#0B1120] tracking-wider">
                    {ticket.ticketId}
                  </div>
                </div>
                <button
                  onClick={handleCopyId}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#382F27] bg-[#F0E9D6] hover:bg-[#F4F8FF] border border-[#C9D9F7] transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                  title="Copy Ticket ID"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#6B6252]" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: QR Code */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#F4F8FF] border border-[#F7FAFF] text-center space-y-2.5">
              <EventFlowQrCode value={ticket.qrToken || ticket.ticketId} size={150} />
              <div className="space-y-0.5">
                <div className="text-[11px] font-mono font-bold text-[#382F27]">
                  Scan for Venue Turnstile
                </div>
                <div className="text-[10px] text-[#8C8272]">
                  Encrypted EventFlow Token
                </div>
              </div>
            </div>
          </div>

          {/* Footer Security Note */}
          <div className="pt-4 border-t border-[#F7FAFF] flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B6252]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>EventFlow Verified Security Token • Direct Smart Turnstile Access</span>
            </div>
            <div className="font-mono text-[11px] text-[#8C8272]">
              Pass #{ticket.ticketId.slice(-6)}
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#382F27] bg-[#F0E9D6] hover:bg-[#F4F8FF] border border-[#C9D9F7]/90 shadow-2xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#6B6252]" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      )}
    </div>
  );
};
