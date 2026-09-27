import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Ticket as TicketIcon,
  Compass,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import { useTicket } from "../context/TicketContext";
import { CategoryTicketRenderer } from "../components/ticket/CategoryTicketRenderer";

export const TicketPage: React.FC = () => {
  const { user } = useAuth();
  const { userTickets } = useTicket();
  const [selectedTicketIndex, setSelectedTicketIndex] = useState<number>(0);

  // If user has no tickets issued, show clean empty state prompting to book
  if (!userTickets || userTickets.length === 0) {
    return (
      <AppLayout pageTitle="Digital Tickets" pageBadge="EventFlow Pass">
        <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-[#F7FAFF] border border-[#EDE3CB] text-[#4F7CFF] flex items-center justify-center mx-auto shadow-xs">
            <TicketIcon className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1120] font-heading">
              No tickets yet.
            </h2>
            <p className="text-sm text-[#6B6252] max-w-md mx-auto leading-relaxed">
              You do not have any active EventFlow tickets yet. Explore upcoming mega-events and book your admission passes.
            </p>
          </div>

          <div className="pt-2">
            <Link
              id="discover-events-empty-cta"
              to="/events"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-[#4F7CFF] hover:bg-[#2D5FD2] transition-all shadow-md shadow-[#4F7CFF]/20 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Discover Events →</span>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const activeTicket = userTickets[selectedTicketIndex] || userTickets[0];

  return (
    <AppLayout pageTitle="Your EventFlow Tickets" pageBadge={`${userTickets.length} Active Pass${userTickets.length > 1 ? "es" : ""}`}>
      <div className="max-w-3xl mx-auto space-y-8 pb-20">
        {/* Header information */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0B1120] font-heading">
              Official Digital Admission Passes
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6252] mt-0.5">
              Issued for <strong className="text-[#0B1120] font-semibold">{user?.fullName || user?.name}</strong>. Present at designated venue smart turnstiles.
            </p>
          </div>

          <Link
            to="/my-event"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F7CFF] hover:text-[#2D5FD2] transition-colors"
          >
            <span>View in My Event</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Multi-Ticket Selector Tabs if user has multiple tickets */}
        {userTickets.length > 1 && (
          <div className="p-2 rounded-2xl bg-[#F7FAFF] border border-[#C9D9F7] flex flex-wrap gap-2">
            {userTickets.map((t, idx) => {
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
                    Pass #{idx + 1}: {t.ticketType} ({t.seat})
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Selected EventFlow Digital Ticket */}
        <CategoryTicketRenderer ticket={activeTicket} showActions={true} />

        {/* Security & Turnstile Instructions */}
        <div className="p-6 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-[#0B1120] font-bold text-sm font-heading">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
            <span>Turnstile Presentation Guidelines</span>
          </div>

          <ul className="text-xs text-[#4A4236] space-y-2 list-disc list-inside leading-relaxed">
            <li>
              Proceed to <strong className="text-[#0B1120] font-semibold">{activeTicket.assignedGate}</strong> during your arrival window (<strong className="text-[#0B1120]">{activeTicket.entryWindow}</strong>).
            </li>
            <li>
              Scan the dynamic QR code directly from your smartphone at the optical reader of the turnstile.
            </li>
            <li>
              Keep your digital pass accessible offline; your ticket ID is registered under <strong className="text-[#0B1120] font-semibold">{activeTicket.ticketId}</strong>.
            </li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
};
