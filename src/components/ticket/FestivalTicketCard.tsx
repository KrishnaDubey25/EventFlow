import React, { useState } from "react";
import {
  Sparkles,
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
  Tent,
  Layers,
  Globe2,
} from "lucide-react";
import { EventFlowTicket } from "../../types/booking";
import { EventFlowQrCode } from "./EventFlowQrCode";

interface FestivalTicketCardProps {
  ticket: EventFlowTicket;
  showActions?: boolean;
}

export const FestivalTicketCard: React.FC<FestivalTicketCardProps> = ({
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
      {/* Festival & Large Gathering Shell */}
      <div className="relative rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        {/* Top Header: Energetic Amber-Emerald-Teal Gradient */}
        <div className="bg-gradient-to-br from-[#064E3B] via-[#047857] to-[#0F766E] text-white p-6 sm:p-8 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-10 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />

          {/* Micro Header */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/20">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-400/20 flex items-center justify-center text-emerald-200 border border-emerald-300/30">
                <Globe2 className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-100 font-bold">
                MEGA-CONVENTION ALL-ACCESS PASS
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-400/20 text-blue-200 border border-blue-300/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>ACCESS: {ticket.ticketType || "ALL-ACCESS BADGE"}</span>
            </div>
          </div>

          {/* Event Identity */}
          <div className="relative z-10 mt-4 space-y-1.5">
            <div className="text-xs uppercase font-mono tracking-wider text-blue-300 font-semibold">
              MULTI-ZONE SUMMIT ACCREDITATION
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-heading leading-snug">
              {ticket.eventName}
            </h2>
            <div className="flex items-center gap-2 text-xs text-emerald-100 pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-blue-300 shrink-0" />
              <span className="truncate">{ticket.venue}</span>
            </div>
          </div>

          {/* Validity & Schedule */}
          <div className="relative z-10 mt-5 pt-3 border-t border-white/20 flex flex-wrap items-center gap-5 text-xs text-emerald-50 font-medium">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-300" />
              <span>{ticket.eventDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-300" />
              <span>{ticket.eventTime}</span>
            </div>
            <div className="inline-flex items-center gap-1 text-blue-300 font-semibold">
              <span>★ Valid for all exhibition days</span>
            </div>
          </div>
        </div>

        {/* Festival Pass Visual Grid */}
        <div className="bg-[#022C22] text-white px-6 py-4 border-y border-emerald-900 grid grid-cols-3 gap-2 text-center divide-x divide-emerald-800/60">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-blue-400 font-bold">
              ZONE
            </div>
            <div className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">
              {ticket.section || "Hall 1 — Quantum"}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-300 font-bold">
              ACCESS LEVEL
            </div>
            <div className="text-xs sm:text-sm font-bold text-blue-300 mt-0.5 truncate">
              Full Summit Access
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-blue-400 font-bold">
              CAMPUS GATE
            </div>
            <div className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">
              {ticket.assignedGate || "Gate 1 (Tumkur)"}
            </div>
          </div>
        </div>

        {/* Scalloped Divider */}
        <div className="relative flex items-center justify-between py-1 bg-[#F0E9D6]">
          <div className="w-5 h-8 bg-[#FBFBFC] rounded-r-full border-r border-y border-[#C9D9F7]/90 -ml-1" />
          <div className="flex-1 border-b-2 border-dashed border-[#C9D9F7] mx-3" />
          <div className="w-5 h-8 bg-[#FBFBFC] rounded-l-full border-l border-y border-[#C9D9F7]/90 -mr-1" />
        </div>

        {/* Body Info & QR */}
        <div className="p-6 sm:p-7 grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-[#F0E9D6]">
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Attendee Details */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-700 font-bold block">
                  PASS HOLDER
                </span>
                <div className="text-sm font-bold text-[#0B1120] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{ticket.attendeeName}</span>
                </div>
                <div className="text-xs text-[#6B6252] truncate">{ticket.attendeeEmail}</div>
              </div>

              {/* Gate Ingress Window */}
              <div className="p-3.5 rounded-2xl bg-[#F4F8FF] border border-[#F7FAFF] space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#8C8272] font-bold block">
                  CAMPUS INGRESS WINDOW
                </span>
                <div className="text-sm font-bold text-[#0B1120] flex items-center gap-1.5">
                  <DoorOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{ticket.entryWindow || "08:30 - 10:00 IST"}</span>
                </div>
                <div className="text-[11px] text-[#6B6252]">Includes direct Metro Skywalk</div>
              </div>
            </div>

            {/* Token ID */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF] text-xs">
              <div>
                <span className="text-[#8C8272] block text-[10px] uppercase font-mono font-bold">
                  VALIDATION TOKEN
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
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50/30 border border-emerald-100 text-center">
            <EventFlowQrCode value={ticket.qrToken} size={140} />
            <span className="text-[10px] font-mono text-emerald-900 uppercase mt-2 font-bold tracking-wider">
              SMART NFC / BARCODE
            </span>
            <span className="text-[10px] text-[#6B6252] mt-0.5">
              Turnstile Multi-Scan Ready
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F4F8FF]/90 border-t border-[#F7FAFF] flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B6252]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-medium text-[#382F27]">Official BIEC Convention Pass</span>
          </div>
          <span className="font-mono text-[11px] text-[#8C8272]">Wristband / Badge Station Gate 1</span>
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
            <span>Print Festival Pass</span>
          </button>

          <button
            onClick={handleCopyId}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4 text-emerald-700" />
            <span>{copied ? "Ticket ID Copied" : "Copy Ticket ID"}</span>
          </button>
        </div>
      )}
    </div>
  );
};
