import React, { useState, useEffect } from "react";
import {
  Navigation,
  Car,
  Hotel,
  Utensils,
  DoorOpen,
  Ticket as TicketIcon,
  LogOut,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  Bus,
  Train,
  Printer,
  Compass,
  Zap,
  RotateCcw,
} from "lucide-react";
import { AppEvent } from "../../types/event";
import { Booking, EventFlowTicket } from "../../types/booking";
import { AttendeeJourneyStage, AttendeeJourneyState } from "../../types/ecosystem";
import {
  getAttendeeJourneyState,
  updateAttendeeJourneyState,
  getEventEcosystem,
} from "../../services/eventEcosystemService";
import {
  evaluateEventIntelligence,
  getAttendeeGuidance,
} from "../../services/eventIntelligenceService";
import {
  getAttendeeContext,
  saveAttendeeContext,
  evaluateAttendeeInsights,
} from "../../services/attendeeIntelligenceService";
import { getStoredActions } from "../../services/operationalActionService";
import {
  AttendeeContext,
  PersonalizedAttendeeInsight,
} from "../../types/intelligence";
import { useAuth } from "../../context/AuthContext";

interface EventHubJourneyTabProps {
  event: AppEvent;
  tickets: EventFlowTicket[];
  booking?: Booking;
}

const STAGES: { id: AttendeeJourneyStage; label: string; shortLabel: string; icon: React.ElementType }[] = [
  { id: "NOT_STARTED", label: "Pre-Event Planning", shortLabel: "Planning", icon: Clock },
  { id: "TRAVELLING", label: "Travelling to City / Venue", shortLabel: "Travel", icon: Navigation },
  { id: "ARRIVED_AT_DESTINATION", label: "Arrived at Destination", shortLabel: "Arrived", icon: MapPin },
  { id: "AT_PARKING", label: "Parking & Transit Bay", shortLabel: "Parking", icon: Car },
  { id: "IN_TRANSIT", label: "In-Transit / Shuttle", shortLabel: "Transit", icon: Bus },
  { id: "AT_VENUE", label: "At Venue Perimeter", shortLabel: "Venue", icon: DoorOpen },
  { id: "INSIDE_EVENT", label: "Inside Event Arena", shortLabel: "Inside", icon: TicketIcon },
  { id: "EXITING", label: "Egress & Exiting", shortLabel: "Exiting", icon: LogOut },
  { id: "RETURNING", label: "Returning Journey", shortLabel: "Return", icon: Navigation },
  { id: "COMPLETED", label: "Journey Completed", shortLabel: "Completed", icon: CheckCircle2 },
];

export const EventHubJourneyTab: React.FC<EventHubJourneyTabProps> = ({
  event,
  tickets,
  booking,
}) => {
  const { user } = useAuth();
  const userId = user?.id || "demo_attendee";
  const primaryTicket = tickets[0];

  const [journeyState, setJourneyState] = useState<AttendeeJourneyState>(() =>
    getAttendeeJourneyState(userId, event.id)
  );

  const [context, setContext] = useState<AttendeeContext>(() =>
    getAttendeeContext(userId, event.id, primaryTicket)
  );

  const [insights, setInsights] = useState<PersonalizedAttendeeInsight[]>([]);
  const [isEditingOrigin, setIsEditingOrigin] = useState(false);
  const [customOrigin, setCustomOrigin] = useState(context.origin || "");

  const ecosystem = getEventEcosystem(event.id);

  // Sync and load personalized arrival insights
  useEffect(() => {
    let isMounted = true;
    const actions = getStoredActions(event.id);

    evaluateAttendeeInsights(context, event, actions).then((res) => {
      if (isMounted) {
        setInsights(res);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [context, event.id]);

  // Sync journey state when userId or event.id changes
  useEffect(() => {
    const current = getAttendeeJourneyState(userId, event.id);
    setJourneyState(current);
  }, [userId, event.id]);

  const handleStageChange = (newStage: AttendeeJourneyStage) => {
    const updated = updateAttendeeJourneyState(userId, event.id, newStage, {
      assignedGate: primaryTicket?.assignedGate || "Gate 1",
      seatInfo: primaryTicket ? `${primaryTicket.section} • Seat ${primaryTicket.seat}` : undefined,
    });
    setJourneyState({ ...updated });

    const updatedContext = { ...context, currentJourneyState: newStage };
    setContext(updatedContext);
    saveAttendeeContext(updatedContext);
  };

  const handleTravelModeChange = (mode: "driving" | "transit" | "rideshare" | "walking") => {
    const updated = { ...context, travelMode: mode };
    setContext(updated);
    saveAttendeeContext(updated);
  };

  const handleSaveOrigin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customOrigin.trim()) return;
    const updated = { ...context, origin: customOrigin.trim() };
    setContext(updated);
    saveAttendeeContext(updated);
    setIsEditingOrigin(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const currentIndex = STAGES.findIndex((s) => s.id === journeyState.currentStage);

  const getStageAdvice = () => {
    switch (journeyState.currentStage) {
      case "NOT_STARTED":
        return {
          title: "Pre-Event Planning & Confirmation",
          desc: `Your admission passes for ${event.name} are secured. Review recommended travel modes, gate arrival window, and transit links below.`,
          color: "blue",
          actionText: "Start My Journey to Event",
          nextStage: "TRAVELLING" as AttendeeJourneyStage,
        };
      case "TRAVELLING":
        return {
          title: `En Route to ${event.venue}`,
          desc: `Follow your personalized travel plan from ${context.origin}. Check traffic conditions or take public transit to bypass surface congestion.`,
          color: "purple",
          actionText: "I Have Arrived at Destination",
          nextStage: "ARRIVED_AT_DESTINATION" as AttendeeJourneyStage,
        };
      case "ARRIVED_AT_DESTINATION":
        return {
          title: "Destination Reached",
          desc: `You have arrived in the ${event.district || event.venue} district. Proceed to your reserved parking bay or hotel check-in.`,
          color: "indigo",
          actionText: "Head to Parking Facility",
          nextStage: "AT_PARKING" as AttendeeJourneyStage,
        };
      case "AT_PARKING":
        return {
          title: "At Parking Facility",
          desc: "Parked at designated sector. Feeder shuttles or pedestrian walkways lead directly to perimeter turnstiles.",
          color: "amber",
          actionText: "Proceed Toward Gates",
          nextStage: "IN_TRANSIT" as AttendeeJourneyStage,
        };
      case "IN_TRANSIT":
        return {
          title: `In-Transit to ${event.venue} Gates`,
          desc: `Approaching the perimeter. Have your EventFlow digital QR code ready for optical turnstile scanners at ${primaryTicket?.assignedGate || "Gate 1"}.`,
          color: "blue",
          actionText: "Arrived at Venue Perimeter",
          nextStage: "AT_VENUE" as AttendeeJourneyStage,
        };
      case "AT_VENUE":
        return {
          title: `At Venue Perimeter (${primaryTicket?.assignedGate || "Gate 1"})`,
          desc: `Proceed to ${primaryTicket?.assignedGate || "Gate 1"}. Zero-bag attendees use fast-track green turnstiles.`,
          color: "emerald",
          actionText: "Scanned Through Turnstiles",
          nextStage: "INSIDE_EVENT" as AttendeeJourneyStage,
        };
      case "INSIDE_EVENT":
        return {
          title: `Inside Arena — Welcome to ${event.name}`,
          desc: `Your designated section is ${primaryTicket?.section || "Main Seating"}. Concourse dining, hydration hubs, and first aid desks are active.`,
          color: "emerald",
          actionText: "Event Concluded — Start Exit",
          nextStage: "EXITING" as AttendeeJourneyStage,
        };
      case "EXITING":
        return {
          title: "Egress & Safe Dispersal",
          desc: "Follow directional signs toward perimeter transit plazas. Metro and express shuttles run with augmented post-event frequencies.",
          color: "rose",
          actionText: "On Return Transit",
          nextStage: "RETURNING" as AttendeeJourneyStage,
        };
      case "RETURNING":
        return {
          title: "Returning Journey",
          desc: "Safe travels heading back. Check post-event transit updates or rideshare designated pick-up bays.",
          color: "indigo",
          actionText: "Mark Journey Complete",
          nextStage: "COMPLETED" as AttendeeJourneyStage,
        };
      case "COMPLETED":
      default:
        return {
          title: "Journey Complete",
          desc: "Thank you for attending with EventFlow. Your booking records and memory log are safely archived.",
          color: "slate",
          actionText: "Reset Demo Journey",
          nextStage: "NOT_STARTED" as AttendeeJourneyStage,
        };
    }
  };

  const advice = getStageAdvice();

  // Extract primary arrival insight
  const primaryInsight = insights[0];

  // Discovered resources from ecosystem
  const transitResources = ecosystem.resources.filter((r) => r.category === "transport");
  const parkingResources = ecosystem.resources.filter((r) => r.category === "parking");
  const accommodationResources = ecosystem.resources.filter((r) => r.category === "accommodation");
  const diningResources = ecosystem.resources.filter((r) => r.category === "food");

  return (
    <div className="space-y-6 font-sans">
      {/* Personalized Travel & Arrival Plan Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0B1120] via-[#0F1E36] to-[#1C2541] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#4F7CFF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#4F7CFF]/20 border border-[#4F7CFF]/30 flex items-center justify-center text-[#4F7CFF]">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#6EA8FF] font-bold">
                  PERSONALIZED ARRIVAL COMPASS
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  {primaryInsight?.dataClassification || "ESTIMATED DATA"}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-heading text-white mt-0.5">
                Target Arrival Plan for {context.attendeeName}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-[#F0E9D6]/10 hover:bg-[#F0E9D6]/20 border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print Journey Plan"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Plan</span>
            </button>
          </div>
        </div>

        {/* Origin & Travel Mode Configuration */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {/* Origin selector */}
          <div className="p-3.5 rounded-2xl bg-[#F0E9D6]/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#8C8272] font-bold">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#4F7CFF]" />
                <span>Your Departure Origin</span>
              </span>
              <button
                onClick={() => setIsEditingOrigin(!isEditingOrigin)}
                className="text-[#6EA8FF] hover:text-[#C9D9F7] underline cursor-pointer"
              >
                {isEditingOrigin ? "Cancel" : "Change"}
              </button>
            </div>

            {isEditingOrigin ? (
              <form onSubmit={handleSaveOrigin} className="mt-1 flex items-center gap-1.5">
                <input
                  type="text"
                  value={customOrigin}
                  onChange={(e) => setCustomOrigin(e.target.value)}
                  placeholder="Enter starting area/landmark"
                  className="flex-1 bg-[#F0E9D6]/10 border border-white/20 rounded-lg px-2.5 py-1 text-xs text-white placeholder-[#8C8272] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF]"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded-lg bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Save
                </button>
              </form>
            ) : (
              <div className="text-sm font-bold text-white truncate pt-0.5">
                {context.origin}
              </div>
            )}
            <div className="text-[11px] text-[#C9BBA0] truncate">
              To: {event.venue}, {event.location.split(",")[0]}
            </div>
          </div>

          {/* Travel Mode Pills */}
          <div className="p-3.5 rounded-2xl bg-[#F0E9D6]/5 border border-white/10 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C8272] font-bold block">
              Travel Mode
            </span>
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: "transit", label: "Metro", icon: Train },
                { id: "driving", label: "Car", icon: Car },
                { id: "rideshare", label: "Cab", icon: Bus },
                { id: "walking", label: "Walk", icon: Navigation },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = context.travelMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleTravelModeChange(m.id as any)}
                    className={`py-1.5 px-1 rounded-xl text-[11px] font-semibold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#4F7CFF] text-white shadow-xs font-bold"
                        : "bg-[#F0E9D6]/5 text-[#C9BBA0] hover:bg-[#F0E9D6]/10 hover:text-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recommended Departure & Target Arrival Times */}
          <div className="p-3.5 rounded-2xl bg-[#4F7CFF]/15 border border-[#4F7CFF]/30 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6EA8FF] font-bold block">
              Intelligent Departure Window
            </span>
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <div>
                <span className="text-[10px] text-[#C9BBA0] block">Recommended Departure</span>
                <span className="text-base sm:text-lg font-black text-white font-mono">
                  {primaryInsight?.recommendedDepartureTime || "5:15 PM"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#C9BBA0] block">Venue Arrival Target</span>
                <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                  {primaryInsight?.recommendedArrivalTime || "6:00 PM"}
                </span>
              </div>
            </div>
            <div className="text-[10px] text-[#C9D9F7] flex items-center justify-between pt-0.5 border-t border-white/10 font-mono">
              <span>{primaryInsight?.routeInfo?.distanceKm || 14.5} km distance</span>
              <span>{primaryInsight?.routeInfo?.estimatedMinutes || 45} mins travel buffer</span>
            </div>
          </div>
        </div>

        {/* Live Traffic / Delay Advisory if present */}
        {insights.length > 1 && (
          <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
            {insights.slice(1).map((ins) => (
              <div
                key={ins.id}
                className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                  ins.priority === "WARNING"
                    ? "bg-blue-500/20 border-blue-400/40 text-blue-200"
                    : "bg-[#F0E9D6]/5 border-white/10 text-[#C9D9F7]"
                }`}
              >
                <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-white">{ins.title}</div>
                  <p className="text-[#C9BBA0] text-[11px] leading-relaxed">{ins.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Visitor Journey Stepper Banner */}
      <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#4F7CFF] bg-[#F7FAFF] px-2.5 py-0.5 rounded-full border border-[#C9D9F7]/80">
              <Sparkles className="w-3 h-3" />
              <span>LIVE VISITOR JOURNEY COMPASS</span>
            </div>
            <h3 className="text-base font-bold text-[#0B1120] font-heading mt-1">
              Your End-to-End Event Experience Flow
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#6B6252] bg-[#F4F8FF] px-3 py-1 rounded-xl border border-[#C9D9F7]">
              Stage {currentIndex + 1} of {STAGES.length}
            </span>
          </div>
        </div>

        {/* Stepper Node Strip */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center gap-1 min-w-[700px]">
            {STAGES.map((s, idx) => {
              const Icon = s.icon;
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <button
                  key={s.id}
                  onClick={() => handleStageChange(s.id)}
                  className={`flex-1 flex flex-col items-center text-center p-2 rounded-xl transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-[#4F7CFF] text-white font-bold shadow-xs"
                      : isPast
                      ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      : "bg-[#F4F8FF] text-[#6B6252] hover:bg-[#F7FAFF]"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center mb-1 ${
                      isCurrent
                        ? "bg-[#F0E9D6] text-[#4F7CFF]"
                        : isPast
                        ? "bg-emerald-200 text-emerald-900"
                        : "bg-[#C9D9F7] text-[#4A4236]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold leading-tight truncate max-w-[75px]">
                    {s.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Stage Callout Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#F7FAFF] via-indigo-50 to-[#F4F8FF] border border-[#C9D9F7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4F7CFF] animate-pulse" />
              <h4 className="text-sm font-bold text-[#0B1120] font-heading">{advice.title}</h4>
            </div>
            <p className="text-xs text-[#4A4236] max-w-xl">{advice.desc}</p>
          </div>

          <button
            onClick={() => handleStageChange(advice.nextStage)}
            className="px-4 py-2.5 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-2xs cursor-pointer"
          >
            <span>{advice.actionText}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Structured Sequential Journey Cards Anchored to THIS Event's Actual City Ecosystem */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[#382F27] uppercase font-mono tracking-wider">
            Connected Surrounding Ecosystem ({event.venue})
          </h4>
          <span className="text-[11px] font-mono text-[#6B6252]">
            Coordinates: {event.latitude?.toFixed(4)}, {event.longitude?.toFixed(4)}
          </span>
        </div>

        {/* 1. Travel & Transport */}
        <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0B1120] font-heading">
                  1. Travel & Rapid Transit
                </h4>
                <span className="text-[11px] text-[#6B6252]">
                  Connected transit lines serving {event.venue}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Active Corridors
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {transitResources.slice(0, 2).map((t) => (
              <div key={t.id} className="p-3.5 rounded-2xl bg-[#F4F8FF] border border-[#F7FAFF] space-y-1">
                <div className="font-bold text-[#0B1120] flex items-center justify-between">
                  <span>{t.name}</span>
                  <span className="text-[10px] font-mono text-[#8C8272]">
                    {t.status}
                  </span>
                </div>
                <div className="text-[#4A4236]">{t.location}</div>
                <div className="text-[11px] text-[#4F7CFF] font-semibold pt-1">
                  {t.condition}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Parking & Vehicle Access */}
        <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0B1120] font-heading">
                  2. Parking & Vehicle Access
                </h4>
                <span className="text-[11px] text-[#6B6252]">
                  Dedicated parking lots and ANPR gates around {event.venue}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#2D5FD2] bg-[#F7FAFF] px-2.5 py-0.5 rounded-full border border-[#C9D9F7]">
              EVENT-OPERATED DATA
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {parkingResources.slice(0, 2).map((p) => (
              <div key={p.id} className="p-3.5 rounded-2xl bg-[#F4F8FF] border border-[#F7FAFF] space-y-1">
                <div className="font-bold text-[#0B1120] flex items-center justify-between">
                  <span>{p.name}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      p.status === "AVAILABLE"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="text-[#4A4236]">{p.location}</div>
                <div className="text-[11px] text-emerald-700 font-semibold pt-1">
                  {p.availableCapacity} / {p.totalCapacity} spaces open • {p.condition}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Partner Accommodation */}
        <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <Hotel className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0B1120] font-heading">
                  3. Partner Accommodation & Cloakroom
                </h4>
                <span className="text-[11px] text-[#6B6252]">
                  Official lodging partners located near {event.venue}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Verified District
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {accommodationResources.slice(0, 2).map((a) => (
              <div key={a.id} className="p-3.5 rounded-2xl bg-[#F4F8FF] border border-[#F7FAFF] space-y-1">
                <div className="font-bold text-[#0B1120] flex items-center justify-between">
                  <span>{a.name}</span>
                  <span className="text-[10px] font-mono text-[#6B6252]">{a.status}</span>
                </div>
                <div className="text-[#4A4236]">{a.location}</div>
                <div className="text-[11px] text-indigo-600 font-semibold pt-1">
                  {a.condition}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Concourse Food & Dining */}
        <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0B1120] font-heading">
                  4. Concourse Food & Dining
                </h4>
                <span className="text-[11px] text-[#6B6252]">
                  Refreshments, food courts, and hydration points inside {event.venue}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Express Service
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {diningResources.slice(0, 2).map((d) => (
              <div key={d.id} className="p-3.5 rounded-2xl bg-[#F4F8FF] border border-[#F7FAFF] space-y-1">
                <div className="font-bold text-[#0B1120] flex items-center justify-between">
                  <span>{d.name}</span>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold">
                    {d.status}
                  </span>
                </div>
                <div className="text-[#4A4236]">{d.location}</div>
                <div className="text-[11px] text-[#6B6252] pt-1">
                  {d.condition} • {d.operatingHours}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
