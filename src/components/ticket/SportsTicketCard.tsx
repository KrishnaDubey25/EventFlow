import React, { useState } from "react";
import {
  Trophy,
  MapPin,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  DoorOpen,
  Sparkles,
  Zap,
} from "lucide-react";
import { EventFlowTicket } from "../../types/booking";
import { EventFlowQrCode } from "./EventFlowQrCode";

interface SportsTicketCardProps {
  ticket: EventFlowTicket;
  showActions?: boolean;
}

export const SportsTicketCard: React.FC<SportsTicketCardProps> = ({
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

  // Parse row and seat if combined or use direct
  const seatDisplay = ticket.seat || "General Stand";
  const rowMatch = seatDisplay.match(/Row\s*[-:]?\s*([A-Za-z0-9]+)/i);
  const seatMatch = seatDisplay.match(/Seat\s*[-:]?\s*([A-Za-z0-9]+)/i);

  const rowVal = rowMatch ? rowMatch[1] : "08";
  const seatVal = seatMatch ? seatMatch[1] : (seatDisplay.includes("Seat") ? seatDisplay.split("Seat")[1].trim() : "22");

  return (
    <div className="space-y-4 max-w-2xl mx-auto font-sans">
      {/* Stadium Ticket Shell */}
      <div className="relative rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        {/* Top Header: Stadium Midnight Blue with Emerald Pitch Accent */}
        <div className="bg-gradient-to-r from-[#061226] via-[#0B2545] to-[#133E68] text-white p-6 sm:p-7 relative overflow-hidden">
          {/* Subtle Stadium Floodlight Beams */}
          <div className="absolute top-0 right-10 w-48 h-48 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-10 w-48 h-48 bg-[#4F7CFF]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Stadium Top Micro Bar */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-300 font-bold flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                STADIUM MATCH PASS • SPORTS EDITION
              </span>
            </div>

            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>CONFIRMED ADMISSION</span>
            </div>
          </div>

          {/* Match & Event Title */}
          <div className="relative z-10 mt-4 space-y-1.5">
            <div className="text-xs uppercase font-mono tracking-wider text-emerald-300 font-semibold">
              {ticket.ticketType || "Stadium Club Pass"}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-heading leading-snug">
              {ticket.eventName}
            </h2>
            <div className="flex items-center gap-2 text-xs text-[#C9BBA0] pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{ticket.venue}</span>
            </div>
          </div>

          {/* Quick Date & Time Banner */}
          <div className="relative z-10 mt-5 pt-3 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-[#C9D9F7] font-medium">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#6EA8FF]" />
              <span>{ticket.eventDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#6EA8FF]" />
              <span>{ticket.eventTime}</span>
            </div>
          </div>
        </div>

        {/* Stadium Seat Block (High-Contrast Grid) */}
        <div className="bg-[#0B1120] text-white px-6 py-4 border-y border-[#241E17] grid grid-cols-4 gap-2 text-center divide-x divide-[#241E17]">
          <div className="px-1">
            <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold">
              GATE
            </div>
            <div className="text-base sm:text-lg font-bold text-white mt-0.5 truncate">
              {ticket.assignedGate?.replace(/Gate\s*/i, "G-") || "G-4"}
            </div>
          </div>
          <div className="px-1">
            <div className="text-[10px] uppercase font-mono tracking-wider text-[#8C8272] font-bold">
              STAND / SECTION
            </div>
            <div className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">
              {ticket.section || "Pavilion Level 2"}
            </div>
          </div>
          <div className="px-1">
            <div className="text-[10px] uppercase font-mono tracking-wider text-[#8C8272] font-bold">
              ROW
            </div>
            <div className="text-base sm:text-lg font-bold text-emerald-300 mt-0.5">
              {rowVal}
            </div>
          </div>
          <div className="px-1">
            <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold">
              SEAT
            </div>
            <div className="text-base sm:text-lg font-bold text-white mt-0.5">
              {seatVal}
            </div>
          </div>
        </div>

        {/* Notched Tear-off Line with Punch Holes */}
        <div className="relative flex items-center justify-between py-1 bg-[#F0E9D6]">
          <div className="w-5 h-8 bg-[#FBFBFC] rounded-r-full border-r border-y border-[#C9D9F7]/90 -ml-1" />
          <div className="flex-1 border-b-2 border-dashed border-[#C9D9F7] mx-3" />
          <div className="w-5 h-8 bg-[#FBFBFC] rounded-l-full border-l border-y border-[#C9D9F7]/90 -mr-1" />
        </div>

        {/* Middle Body: Attendee & Turnstile Entry Window */}
        <div className="p-6 sm:p-7 grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-[#F0E9D6]">
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Attendee Details */}
              <div className="p-3.5 rounded-2xl bg-[#F4F8FF] border border-[#F7FAFF] space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#8C8272] font-bold block">
                  TICKET HOLDER
                </span>
                <div className="text-sm font-bold text-[#0B1120] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  <span>{ticket.attendeeName}</span>
                </div>
                <div className="text-xs text-[#6B6252] truncate">{ticket.attendeeEmail}</div>
              </div>

              {/* Recommended Entry Window */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-700 font-bold block">
                  ENTRY WINDOW
                </span>
                <div className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                  <DoorOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{ticket.entryWindow || "16:30 - 18:30 IST"}</span>
                </div>
                <div className="text-[11px] text-emerald-700">Turnstiles open 3 hrs prior</div>
              </div>
            </div>

            {/* Turnstile Access Pass Token ID */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF] text-xs">
              <div>
                <span className="text-[#8C8272] block text-[10px] uppercase font-mono font-bold">
                  PASS SERIAL NO.
                </span>
                <span className="font-mono font-bold text-[#241E17]">{ticket.ticketId}</span>
              </div>
              <button
                onClick={handleCopyId}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F0E9D6] border border-[#C9D9F7] text-[#382F27] hover:bg-[#F7FAFF] text-xs font-semibold cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* QR Code Column */}
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F4F8FF] border border-[#F7FAFF] text-center">
            <EventFlowQrCode value={ticket.qrToken} size={140} />
            <span className="text-[10px] font-mono text-[#6B6252] uppercase mt-2 font-bold tracking-wider">
              SCAN AT TURNSTILE
            </span>
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-1">
              <Zap className="w-3 h-3" />
              <span>Direct Barcode Ingress</span>
            </div>
          </div>
        </div>

        {/* Bottom Security Footer */}
        <div className="px-6 py-3.5 bg-[#F4F8FF]/90 border-t border-[#F7FAFF] flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B6252]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-medium text-[#382F27]">Official BCCI / MCA Validated Admission Pass</span>
          </div>
          <span className="font-mono text-[11px] text-[#8C8272]">Section G2 • Fast-Track Ingress</span>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#382F27] bg-[#F0E9D6] border border-[#C9D9F7] hover:bg-[#F4F8FF] transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#6B6252]" />
            <span>Print Match Pass</span>
          </button>

          <button
            onClick={handleCopyId}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#2D5FD2] bg-[#F7FAFF] border border-[#C9D9F7] hover:bg-[#EDE3CB] transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4 text-[#4F7CFF]" />
            <span>{copied ? "Ticket ID Copied" : "Copy Ticket ID"}</span>
          </button>
        </div>
      )}
    </div>
  );
};
