import React from "react";
import {
  DoorOpen,
  Clock,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Accessibility,
  MapPin,
  Sparkles,
} from "lucide-react";
import { AppEvent } from "../../types/event";
import { EventFlowTicket } from "../../types/booking";

interface EventHubArrivalTabProps {
  event: AppEvent;
  primaryTicket?: EventFlowTicket;
}

export const EventHubArrivalTab: React.FC<EventHubArrivalTabProps> = ({
  event,
  primaryTicket,
}) => {
  const permitted = event.guidelines?.permitted || [
    "Small clear bags under 12\" x 12\"",
    "Smartphone with EventFlow digital admission pass",
    "Government photo identification",
    "Empty reusable silicone/plastic water bottle",
    "Prescription medicines with matching prescription label",
  ];

  const prohibited = event.guidelines?.prohibited || [
    "Large backpacks, suitcases, or luggage",
    "Professional DSLR cameras with detachable lenses",
    "Outside food, alcoholic beverages, and canned sodas",
    "Power banks, selfie sticks, and laser pointers",
    "Vaping devices, flammable items, and pocket knives",
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Assigned Gate Recommendation Card */}
      <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F7FAFF]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F7FAFF] text-[#4F7CFF] flex items-center justify-center font-bold">
              <DoorOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0B1120] font-heading">
                Your Designated Gate
              </h3>
              <span className="text-[11px] text-[#6B6252]">Fastest route to your stand or hall</span>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-[#2D5FD2] bg-[#F7FAFF] px-3 py-1 rounded-full border border-[#C9D9F7]">
            {primaryTicket?.assignedGate || "Gate 1 — Main Concourse"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/70 space-y-1">
            <span className="text-[10px] uppercase font-mono text-[#8C8272] font-bold block">
              RECOMMENDED ARRIVAL TIME
            </span>
            <div className="text-sm font-bold text-[#0B1120] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#4F7CFF]" />
              <span>{primaryTicket?.entryWindow || "45 minutes before commencement"}</span>
            </div>
            <p className="text-[11px] text-[#6B6252] pt-0.5">
              Arriving during your designated window ensures under 5 minutes turnstile queue.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/70 space-y-1">
            <span className="text-[10px] uppercase font-mono text-[#8C8272] font-bold block">
              STAND / SECTION ROUTING
            </span>
            <div className="text-sm font-bold text-[#0B1120] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#4F7CFF]" />
              <span>{primaryTicket?.section || "Main Arena Pavilion"}</span>
            </div>
            <p className="text-[11px] text-[#6B6252] pt-0.5">
              After clearing security at {primaryTicket?.assignedGate || "Gate 1"}, take Concourse Escalators to Level 2.
            </p>
          </div>
        </div>
      </div>

      {/* Permitted & Prohibited Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Permitted Items */}
        <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h4 className="text-sm font-bold text-[#0B1120] font-heading">
              Permitted Items
            </h4>
          </div>

          <ul className="space-y-2 text-xs text-[#4A4236]">
            {permitted.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Prohibited Items */}
        <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-rose-600" />
            <h4 className="text-sm font-bold text-[#0B1120] font-heading">
              Strictly Prohibited
            </h4>
          </div>

          <ul className="space-y-2 text-xs text-[#4A4236]">
            {prohibited.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-rose-50/50 border border-rose-100">
                <span className="text-rose-600 font-bold shrink-0 mt-0.5">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bag Policy & Accessibility */}
      <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Accessibility className="w-5 h-5 text-[#4F7CFF]" />
          <h4 className="text-sm font-bold text-[#0B1120] font-heading">
            Accessibility & Special Assistance
          </h4>
        </div>

        <p className="text-xs text-[#4A4236] leading-relaxed">
          {event.guidelines?.bagPolicy || "Ramp access and step-free elevators are operational at all gates. Dedicated accessibility staff are stationed at Gate 1 for wheelchair transfer and companion escort."}
        </p>
      </div>
    </div>
  );
};
