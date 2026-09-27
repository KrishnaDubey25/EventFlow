import React from "react";
import { Bell, Info, ShieldAlert, CheckCircle2, Phone, AlertCircle } from "lucide-react";

interface EventUpdatesSectionProps {
  eventName: string;
  eventTime: string;
  assignedGate: string;
  bagPolicy?: string;
  supportContact?: string;
}

export const EventUpdatesSection: React.FC<EventUpdatesSectionProps> = ({
  eventName,
  eventTime,
  assignedGate,
  bagPolicy,
  supportContact,
}) => {
  // Derive static gate open time e.g. "08:00 AM" or from event time
  const timeMatch = eventTime.match(/(\d{1,2}:\d{2})/);
  const gateOpenTime = timeMatch ? timeMatch[0] : "08:00 AM";

  const updates = [
    {
      id: "gates-open",
      icon: Info,
      type: "info",
      title: `Gates open at ${gateOpenTime}.`,
      detail: `Turnstiles at ${assignedGate} will be operational from ${gateOpenTime}. Early arrival within your designated window is strongly recommended.`,
    },
    {
      id: "carry-ticket",
      icon: Info,
      type: "info",
      title: "Carry your EventFlow ticket for entry.",
      detail:
        "Please have your digital QR pass ready on your smartphone or a printed physical credential. Turnstiles require active optical scanning.",
    },
    {
      id: "bag-policy",
      icon: ShieldAlert,
      type: "security",
      title: "Venue Security & Bag Protocol.",
      detail:
        bagPolicy ||
        "Transparent PVC bags up to 12x12 inches permitted. Backpack cloakrooms are situated beside the main admission turnstiles.",
    },
  ];

  if (supportContact) {
    updates.push({
      id: "support-desk",
      icon: Phone,
      type: "support",
      title: "Organizer Assistance Available.",
      detail: `For accessibility accommodations or ticketing queries, contact the event operations desk at ${supportContact}.`,
    });
  }

  return (
    <div
      id="event-updates-section"
      className="p-6 sm:p-7 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-sm space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F7FAFF] pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#F7FAFF] text-[#4F7CFF] flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B6252] block">
              Official Bulletins
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#0B1120] font-heading">
              Event Updates
            </h2>
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-[#F7FAFF] text-[#382F27]">
          Static Event Notices
        </span>
      </div>

      {/* Bulletins List */}
      <div className="space-y-3">
        {updates.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-[#F4F8FF]/70 border border-[#C9D9F7]/80 flex items-start gap-3.5 text-[#241E17]"
          >
            <div className="w-7 h-7 rounded-xl bg-[#EDE3CB]/70 text-[#2D5FD2] flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-bold text-[#0B1120] flex items-center gap-1.5">
                <span>ℹ️</span>
                <span>{item.title}</span>
              </div>
              <p className="text-xs text-[#4A4236] leading-relaxed">
                {item.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Prototype Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/90 text-[#4A4236] flex items-start gap-3 text-xs leading-relaxed">
        <AlertCircle className="w-4 h-4 text-[#6B6252] shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block text-[#0B1120]">
            Advisory Notice
          </strong>
          <span>
            These advisories and bulletins are broadcast directly by event organizers and live operator command teams.
          </span>
        </div>
      </div>
    </div>
  );
};
