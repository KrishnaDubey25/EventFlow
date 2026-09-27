import React, { useState } from "react";
import {
  Music,
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
  Radio,
  Disc,
} from "lucide-react";
import { EventFlowTicket } from "../../types/booking";
import { EventFlowQrCode } from "./EventFlowQrCode";

interface ConcertTicketCardProps {
  ticket: EventFlowTicket;
  showActions?: boolean;
}

export const ConcertTicketCard: React.FC<ConcertTicketCardProps> = ({
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
    <div className="space-y-4 max-w-2xl mx-auto font-sans">
      {/* Concert Ticket Shell */}
      <div className="relative rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        {/* Top Header: Immersive Entertainment Midnight Purple & Indigo Neon Glow */}
        <div className="bg-gradient-to-br from-[#12072B] via-[#1E0B4B] to-[#3B127A] text-white p-6 sm:p-8 relative overflow-hidden">
          {/* Stage Lighting Ambiance */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-10 w-64 h-64 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />

          {/* Micro Top Header */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/15">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-fuchsia-500/30 flex items-center justify-center text-fuchsia-300 border border-fuchsia-400/40">
                <Music className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-fuchsia-300 font-bold flex items-center gap-1.5">
                CONCERT TOUR PASS • LIVE EXPERIENCE
              </span>
            </div>

            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-500/40">
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
              <span>TIER: {ticket.ticketType || "GOLDEN CIRCLE PASS"}</span>
            </div>
          </div>

          {/* Artist & Concert Identity */}
          <div className="relative z-10 mt-4 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#F0E9D6]/10 text-xs font-mono text-purple-200 uppercase tracking-wider font-semibold">
              <Disc className="w-3 h-3 text-fuchsia-300 animate-spin" style={{ animationDuration: "6s" }} />
              <span>HEADLINE STAGE ADMISSION</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-heading leading-snug">
              {ticket.eventName}
            </h2>
            <div className="flex items-center gap-2 text-xs text-purple-200 pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
              <span className="truncate">{ticket.venue}</span>
            </div>
          </div>

          {/* Schedule Strip */}
          <div className="relative z-10 mt-5 pt-3 border-t border-white/15 flex flex-wrap items-center gap-5 text-xs text-purple-100 font-medium">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-fuchsia-300" />
              <span>{ticket.eventDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-fuchsia-300" />
              <span>{ticket.eventTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300 font-semibold">RFID Wristband Ready</span>
            </div>
          </div>
        </div>

        {/* Concert Zone & Tier Strip (High-Contrast Slate) */}
        <div className="bg-[#0D071E] text-white px-6 py-4 border-y border-purple-950 grid grid-cols-3 gap-2 text-center divide-x divide-purple-900/60">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-fuchsia-400 font-bold">
              GATE PORTAL
            </div>
            <div className="text-sm sm:text-base font-bold text-white mt-0.5 truncate">
              {ticket.assignedGate || "Gate 1 (Main Ingress)"}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-purple-300 font-bold">
              ZONE / SECTION
            </div>
            <div className="text-sm sm:text-base font-bold text-white mt-0.5 truncate">
              {ticket.section || "Main Pitch Standing"}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-fuchsia-400 font-bold">
              SEATING TYPE
            </div>
            <div className="text-sm sm:text-base font-bold text-fuchsia-200 mt-0.5 truncate">
              {ticket.seat || "Standing Zone"}
            </div>
          </div>
        </div>

        {/* Tear-off Scalloped Divider */}
        <div className="relative flex items-center justify-between py-1 bg-[#F0E9D6]">
          <div className="w-5 h-8 bg-[#FBFBFC] rounded-r-full border-r border-y border-[#C9D9F7]/90 -ml-1" />
          <div className="flex-1 border-b-2 border-dashed border-[#C9D9F7] mx-3" />
          <div className="w-5 h-8 bg-[#FBFBFC] rounded-l-full border-l border-y border-[#C9D9F7]/90 -mr-1" />
        </div>

        {/* Body Details */}
        <div className="p-6 sm:p-7 grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-[#F0E9D6]">
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Attendee Details */}
              <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-purple-600 font-bold block">
                  REGISTERED TICKET HOLDER
                </span>
                <div className="text-sm font-bold text-[#0B1120] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-600" />
                  <span>{ticket.attendeeName}</span>
                </div>
                <div className="text-xs text-[#6B6252] truncate">{ticket.attendeeEmail}</div>
              </div>

              {/* Entry Time Window */}
              <div className="p-3.5 rounded-2xl bg-[#F4F8FF] border border-[#F7FAFF] space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#8C8272] font-bold block">
                  DESIGNATED ENTRY TIME
                </span>
                <div className="text-sm font-bold text-[#0B1120] flex items-center gap-1.5">
                  <DoorOpen className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  <span>{ticket.entryWindow || "16:00 - 17:30 IST"}</span>
                </div>
                <div className="text-[11px] text-[#6B6252]">Early soundstage access</div>
              </div>
            </div>

            {/* Serial code */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF] text-xs">
              <div>
                <span className="text-[#8C8272] block text-[10px] uppercase font-mono font-bold">
                  PASS TOKEN / SERIAL
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

          {/* QR Code */}
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-purple-50/40 border border-purple-100 text-center">
            <EventFlowQrCode value={ticket.qrToken} size={140} />
            <span className="text-[10px] font-mono text-purple-900 uppercase mt-2 font-bold tracking-wider">
              SCAN FOR RFID BRACELET
            </span>
            <div className="text-[10px] text-[#6B6252] mt-0.5">
              Turnstile Barcode Ingress
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F4F8FF]/90 border-t border-[#F7FAFF] flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B6252]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-[#382F27]">Official Concert Producer Admission Pass</span>
          </div>
          <span className="font-mono text-[11px] text-[#8C8272]">Wristband Collection at Gate Portal</span>
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
            <span>Print Concert Pass</span>
          </button>

          <button
            onClick={handleCopyId}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4 text-purple-600" />
            <span>{copied ? "Ticket ID Copied" : "Copy Ticket ID"}</span>
          </button>
        </div>
      )}
    </div>
  );
};
