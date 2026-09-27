import React, { useState } from "react";
import {
  Briefcase,
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
  Building2,
  Layers,
  Award,
} from "lucide-react";
import { EventFlowTicket } from "../../types/booking";
import { EventFlowQrCode } from "./EventFlowQrCode";

interface ConferenceTicketCardProps {
  ticket: EventFlowTicket;
  showActions?: boolean;
}

export const ConferenceTicketCard: React.FC<ConferenceTicketCardProps> = ({
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
      {/* Conference Delegate Lanyard Badge Shell */}
      <div className="relative rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        {/* Lanyard Top Slot Styling */}
        <div className="bg-[#0B1120] pt-3 pb-2 px-6 flex items-center justify-center">
          <div className="w-20 h-2 bg-[#241E17] rounded-full border border-[#382F27]" />
        </div>

        {/* Executive Summit Header */}
        <div className="bg-gradient-to-r from-[#0B1120] via-[#102A43] to-[#1F3A60] text-white p-6 sm:p-7 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#4F7CFF]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Summit Header Bar */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#4F7CFF]/20 border border-[#4F7CFF]/30 flex items-center justify-center text-[#6EA8FF]">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#6EA8FF] font-bold">
                OFFICIAL DELEGATE CREDENTIAL
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#4F7CFF]/20 text-[#C9D9F7] border border-[#4F7CFF]/30">
              <Award className="w-3.5 h-3.5 text-[#6EA8FF]" />
              <span>{ticket.ticketType || "DELEGATE PASS"}</span>
            </div>
          </div>

          {/* Prominent Attendee Name Display */}
          <div className="relative z-10 mt-5 space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#6EA8FF] font-semibold block">
              ACCREDITED DELEGATE
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-heading">
              {ticket.attendeeName}
            </h1>
            <p className="text-xs text-[#C9BBA0]">{ticket.attendeeEmail}</p>
          </div>

          {/* Event & Venue */}
          <div className="relative z-10 mt-4 pt-3 border-t border-white/10 space-y-1">
            <div className="text-xs font-bold text-[#F7FAFF]">{ticket.eventName}</div>
            <div className="flex items-center gap-1.5 text-xs text-[#C9BBA0]">
              <MapPin className="w-3.5 h-3.5 text-[#4F7CFF] shrink-0" />
              <span className="truncate">{ticket.venue}</span>
            </div>
          </div>
        </div>

        {/* Hall & Access Strip */}
        <div className="bg-[#F7FAFF]/90 text-[#241E17] px-6 py-4 border-y border-[#C9D9F7] grid grid-cols-3 gap-3 text-center divide-x divide-[#C9D9F7]">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-[#6B6252] font-bold">
              CONFERENCE HALL
            </div>
            <div className="text-xs sm:text-sm font-bold text-[#0B1120] mt-0.5 truncate">
              {ticket.section || "Convention Hall A-B"}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-[#6B6252] font-bold">
              SESSION ACCESS
            </div>
            <div className="text-xs sm:text-sm font-bold text-[#2D5FD2] mt-0.5 truncate">
              Keynotes & Pavilions
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-[#6B6252] font-bold">
              REGISTRATION GATE
            </div>
            <div className="text-xs sm:text-sm font-bold text-[#0B1120] mt-0.5 truncate">
              {ticket.assignedGate || "Gate 1 (Grand Ingress)"}
            </div>
          </div>
        </div>

        {/* Body Details with QR and Ingress Times */}
        <div className="p-6 sm:p-7 grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-[#F0E9D6]">
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Event Schedule */}
              <div className="p-3.5 rounded-2xl bg-[#F4F8FF] border border-[#F7FAFF] space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#8C8272] font-bold block">
                  CONFERENCE DATES
                </span>
                <div className="text-xs font-bold text-[#0B1120] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  <span>{ticket.eventDate}</span>
                </div>
                <div className="text-xs text-[#6B6252] flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-[#8C8272]" />
                  <span>{ticket.eventTime}</span>
                </div>
              </div>

              {/* Badge Collection & Entry Window */}
              <div className="p-3.5 rounded-2xl bg-[#F7FAFF]/60 border border-[#EDE3CB] space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#2D5FD2] font-bold block">
                  BADGE INGRESS WINDOW
                </span>
                <div className="text-xs font-bold text-[#0B1120] flex items-center gap-1.5">
                  <DoorOpen className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  <span>{ticket.entryWindow || "08:30 - 09:30 IST"}</span>
                </div>
                <div className="text-[11px] text-[#2D5FD2]">Breakfast & Networking from 08:30</div>
              </div>
            </div>

            {/* Delegate Credential ID */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF] text-xs">
              <div>
                <span className="text-[#8C8272] block text-[10px] uppercase font-mono font-bold">
                  BADGE CREDENTIAL ID
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
            <span className="text-[10px] font-mono text-[#382F27] uppercase mt-2 font-bold tracking-wider">
              FAST-TRACK CHECK-IN
            </span>
            <span className="text-[10px] text-[#6B6252] mt-0.5">
              Tap at Smart Kiosks
            </span>
          </div>
        </div>

        {/* Security Footer */}
        <div className="px-6 py-3.5 bg-[#F4F8FF]/90 border-t border-[#F7FAFF] flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B6252]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#4F7CFF]" />
            <span className="font-medium text-[#382F27]">Non-transferable Delegate Credential</span>
          </div>
          <span className="font-mono text-[11px] text-[#8C8272]">Badge Pickup: Level 1 Atrium</span>
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
            <span>Print Conference Pass</span>
          </button>

          <button
            onClick={handleCopyId}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#2D5FD2] bg-[#F7FAFF] border border-[#C9D9F7] hover:bg-[#EDE3CB] transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4 text-[#4F7CFF]" />
            <span>{copied ? "ID Copied" : "Copy Badge ID"}</span>
          </button>
        </div>
      )}
    </div>
  );
};
