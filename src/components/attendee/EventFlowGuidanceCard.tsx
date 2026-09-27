import React from "react";
import { Sparkles, Check, ShieldCheck, Info } from "lucide-react";

interface EventFlowGuidanceCardProps {
  ticketId?: string;
  assignedGate: string;
  entryWindow: string;
  eventName: string;
}

export const EventFlowGuidanceCard: React.FC<EventFlowGuidanceCardProps> = ({
  ticketId,
  assignedGate,
  entryWindow,
  eventName,
}) => {
  const guidanceItems = [
    {
      id: "ticket-confirmed",
      text: ticketId
        ? `Your ticket is confirmed (${ticketId}).`
        : "Your ticket is confirmed.",
    },
    {
      id: "assigned-gate",
      text: `Your assigned entry gate is ${assignedGate}.`,
    },
    {
      id: "qr-ready",
      text: "Keep your QR ticket ready before reaching the venue.",
    },
    {
      id: "entry-window",
      text: `Arrive within your entry window (${entryWindow}).`,
    },
    {
      id: "signage-staff",
      text: "Follow venue signage and staff instructions.",
    },
  ];

  return (
    <div
      id="eventflow-guidance"
      className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-white via-[#F7FAFF]/20 to-indigo-50/20 border border-[#C9D9F7]/80 shadow-sm space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDE3CB] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#4F7CFF] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#2D5FD2] block">
              Pre-Event Ingress Briefing
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#0B1120] font-heading">
              EventFlow Guidance
            </h2>
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
          Official Protocol
        </span>
      </div>

      <div className="space-y-2.5 pt-1">
        {guidanceItems.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3 rounded-2xl bg-[#F0E9D6]/80 border border-[#C9D9F7]/70 shadow-2xs text-xs sm:text-sm text-[#241E17]"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="font-medium leading-relaxed">{item.text}</span>
          </div>
        ))}
      </div>

      <div className="pt-2 text-[11px] text-[#6B6252] flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 text-[#4F7CFF] shrink-0" />
        <span>
          Pre-event operational guidance configured specifically for attendees of{" "}
          <strong className="text-[#382F27] font-semibold">{eventName}</strong>.
        </span>
      </div>
    </div>
  );
};
