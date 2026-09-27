import React, { useState } from "react";
import { Ticket as TicketIcon, ShieldCheck, Info } from "lucide-react";
import { AppEvent } from "../../types/event";
import { EventFlowTicket } from "../../types/booking";
import { CategoryTicketRenderer } from "../ticket/CategoryTicketRenderer";

interface EventHubTicketTabProps {
  event: AppEvent;
  tickets: EventFlowTicket[];
}

export const EventHubTicketTab: React.FC<EventHubTicketTabProps> = ({
  event,
  tickets,
}) => {
  const [selectedTicketIndex, setSelectedTicketIndex] = useState(0);

  if (!tickets || tickets.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7] text-[#6B6252]">
        <TicketIcon className="w-10 h-10 mx-auto text-[#8C8272] mb-3" />
        <h4 className="text-base font-bold text-[#241E17]">No Tickets Found</h4>
        <p className="text-xs text-[#6B6252] mt-1">No valid passes were found for this booking.</p>
      </div>
    );
  }

  const activeTicket = tickets[selectedTicketIndex] || tickets[0];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Multi-Ticket Selector if user booked multiple passes */}
      {tickets.length > 1 && (
        <div className="p-2 rounded-2xl bg-[#F7FAFF] border border-[#C9D9F7]/80 flex flex-wrap gap-2">
          {tickets.map((t, idx) => {
            const isSelected = selectedTicketIndex === idx;
            return (
              <button
                key={t.ticketId}
                onClick={() => setSelectedTicketIndex(idx)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? "bg-[#F0E9D6] text-[#0B1120] shadow-xs font-bold"
                    : "text-[#4A4236] hover:text-[#0B1120] hover:bg-[#F0E9D6]/50"
                }`}
              >
                <TicketIcon className="w-3.5 h-3.5 text-[#4F7CFF]" />
                <span>
                  Pass #{idx + 1}: {t.ticketType} ({t.seat || t.section || "General"})
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Render Category-Specific Ticket Template */}
      <CategoryTicketRenderer
        ticket={activeTicket}
        eventCategory={event.category}
        showActions={true}
      />

      {/* Ingress Turnstile Presentation Guidance */}
      <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-[#0B1120] font-bold text-sm font-heading">
          <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
          <span>Turnstile Presentation Guidelines</span>
        </div>

        <ul className="text-xs text-[#4A4236] space-y-2 list-disc list-inside leading-relaxed">
          <li>
            Proceed to <strong className="text-[#0B1120] font-semibold">{activeTicket.assignedGate || "Gate 1"}</strong> during your arrival window (<strong className="text-[#0B1120]">{activeTicket.entryWindow || "30 mins prior"}</strong>).
          </li>
          <li>
            Maximize screen brightness when presenting your dynamic QR code to the turnstile reader.
          </li>
          <li>
            Each QR token is cryptographically signed and valid for single entry. Offline access is supported.
          </li>
        </ul>
      </div>
    </div>
  );
};
