import React, { useState, useEffect } from "react";
import {
  MapPin,
  Clock,
  Navigation,
  Car,
  Bus,
  UtensilsCrossed,
  HelpCircle,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Sliders,
  ArrowRight,
  TrendingUp,
  Info,
  Layers,
} from "lucide-react";
import { AppEvent } from "../../types/event";
import { EventFlowTicket } from "../../types/booking";
import {
  getAttendeeContext,
  getAttendeePersonalizedTravelReport,
  updateAttendeePreferences,
  AttendeePersonalizedTravelReport,
} from "../../services/attendeeIntelligenceService";
import { LiveEventService } from "../../services/liveEventService";

interface AttendeeLiveStatusGuideProps {
  event: AppEvent;
  ticket?: EventFlowTicket;
  userId?: string;
  onSelectTab?: (tabId: string) => void;
}

export const AttendeeLiveStatusGuide: React.FC<AttendeeLiveStatusGuideProps> = ({
  event,
  ticket,
  userId = "usr_demo_attendee",
  onSelectTab,
}) => {
  const [report, setReport] = useState<AttendeePersonalizedTravelReport | null>(null);
  const [context, setContext] = useState(() => getAttendeeContext(userId, event.id, ticket));
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  // Form states for customization
  const [originInput, setOriginInput] = useState(context.origin || "");
  const [selectedTravelMode, setSelectedTravelMode] = useState(context.travelMode || "transit");
  const [selectedParking, setSelectedParking] = useState(context.selectedParking || "park-p1");
  const [selectedHospitality, setSelectedHospitality] = useState(context.selectedHospitality || "hosp-rest-1");

  const loadReport = async () => {
    const updatedCtx = getAttendeeContext(userId, event.id, ticket);
    setContext(updatedCtx);
    const rep = await getAttendeePersonalizedTravelReport(updatedCtx, event);
    setReport(rep);
  };

  useEffect(() => {
    loadReport();

    const handleUpdate = () => {
      loadReport();
    };

    window.addEventListener("eventflow_live_state_updated", handleUpdate);
    window.addEventListener("eventflow_attendee_context_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("eventflow_live_state_updated", handleUpdate);
      window.removeEventListener("eventflow_attendee_context_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [event.id, userId, ticket?.ticketId]);

  const handleSavePreferences = () => {
    const updated = updateAttendeePreferences(userId, event.id, {
      origin: originInput,
      travelMode: selectedTravelMode as any,
      selectedParking,
      selectedHospitality,
    });
    setContext(updated);
    setShowPreferencesModal(false);
    loadReport();
  };

  if (!report) {
    return (
      <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs font-sans text-center">
        <p className="text-xs text-[#8C8272]">Loading personalized live travel guidance...</p>
      </div>
    );
  }

  const { answers } = report;

  return (
    <div className="rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs p-6 space-y-6 font-sans">
      {/* Header & Personalization Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#F7FAFF]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#0B1120] font-heading">
                Live Event Travel & Journey Guide
              </h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                Connected
              </span>
            </div>
            <p className="text-xs text-[#6B6252] mt-0.5">
              Personalized for your ticket ({context.ticketZone || "Zone B"}) from {context.origin || "Origin"}.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowPreferencesModal((prev) => !prev)}
          className="px-3 py-2 rounded-xl text-xs font-bold bg-[#F4F8FF] hover:bg-[#F7FAFF] text-[#382F27] border border-[#C9D9F7] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-600" />
          <span>Customize Preferences</span>
        </button>
      </div>

      {/* Preferences Modal / Inline Drawer */}
      {showPreferencesModal && (
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-4 text-xs">
          <div className="flex items-center justify-between font-bold text-indigo-950">
            <span>Customize Your Journey Choices</span>
            <span className="text-[10px] font-mono text-indigo-700">Updates live recommendations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-mono uppercase font-bold text-[#4A4236] block mb-1">
                Your Departure Origin
              </label>
              <input
                type="text"
                value={originInput}
                onChange={(e) => setOriginInput(e.target.value)}
                placeholder="e.g. Indiranagar, Bengaluru"
                className="w-full px-3 py-1.5 rounded-xl bg-[#F0E9D6] border border-[#C9D9F7] text-xs text-[#241E17]"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase font-bold text-[#4A4236] block mb-1">
                Preferred Travel Mode
              </label>
              <select
                value={selectedTravelMode}
                onChange={(e) => setSelectedTravelMode(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#F0E9D6] border border-[#C9D9F7] text-xs text-[#241E17]"
              >
                <option value="transit">Public Transit / Metro</option>
                <option value="driving">Driving & Parking</option>
                <option value="rideshare">Cab / Rideshare</option>
                <option value="shuttle">Event Express Shuttle</option>
                <option value="walking">Walking</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase font-bold text-[#4A4236] block mb-1">
                Selected Parking Area
              </label>
              <select
                value={selectedParking}
                onChange={(e) => setSelectedParking(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#F0E9D6] border border-[#C9D9F7] text-xs text-[#241E17]"
              >
                <option value="park-p1">Parking P1 (North Boulevard)</option>
                <option value="park-p2">Parking P2 (East Multi-level)</option>
                <option value="park-p3">Parking P3 (South Overflow)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase font-bold text-[#4A4236] block mb-1">
                Selected Dining / Lounge
              </label>
              <select
                value={selectedHospitality}
                onChange={(e) => setSelectedHospitality(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#F0E9D6] border border-[#C9D9F7] text-xs text-[#241E17]"
              >
                <option value="hosp-rest-1">Restaurant A (North Concourse)</option>
                <option value="hosp-rest-2">Restaurant B (East Food Plaza)</option>
                <option value="food-zone-vip">VIP Concourse Lounge</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setShowPreferencesModal(false)}
              className="px-3 py-1.5 rounded-xl bg-[#F0E9D6] border border-[#C9D9F7] text-[#4A4236] font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePreferences}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-2xs cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* Recalculated Departure Notice if triggered */}
      {report.isDepartureTimeRecalculated && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">Recommended Departure Recalculated</span>
            <p className="text-[11px] text-blue-800 leading-relaxed">{report.recalculationReason}</p>
          </div>
        </div>
      )}

      {/* Primary 6 Questions Grid (Requirements 9, 10, 15, 22) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. WHERE DO I GO? */}
        <div className="p-4 rounded-2xl bg-[#F4F8FF]/80 border border-[#C9D9F7]/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2D5FD2] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Where Do I Go?</span>
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#EDE3CB] text-[#6b5024] font-bold">
              {answers.whereDoIGo.assignedGate}
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="font-bold text-[#0B1120]">{answers.whereDoIGo.venueName}</div>
            <div className="text-[#6B6252] text-[11px]">{answers.whereDoIGo.address}</div>
            <div className="text-[11px] text-[#0B1120] bg-[#F7FAFF]/70 p-2 rounded-xl border border-[#EDE3CB] mt-2">
              {answers.whereDoIGo.directions}
            </div>
          </div>
        </div>

        {/* 2. WHEN SHOULD I LEAVE? */}
        <div className="p-4 rounded-2xl bg-[#F4F8FF]/80 border border-[#C9D9F7]/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>When Should I Leave?</span>
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              Target: {answers.whenShouldILeave.arrivalTime}
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-emerald-800">
                {answers.whenShouldILeave.departureTime}
              </span>
              <span className="text-[11px] text-[#6B6252] font-mono">
                (~{answers.whenShouldILeave.travelTimeMinutes}m ride + {answers.whenShouldILeave.bufferMinutes}m buffer)
              </span>
            </div>
            <p className="text-[11px] text-[#4A4236] leading-relaxed pt-1">{answers.whenShouldILeave.summary}</p>
          </div>
        </div>

        {/* 3. HOW SHOULD I TRAVEL? */}
        <div className="p-4 rounded-2xl bg-[#F4F8FF]/80 border border-[#C9D9F7]/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" />
              <span>How Should I Travel?</span>
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold uppercase">
              {answers.howShouldITravel.status}
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="font-bold text-[#0B1120]">{answers.howShouldITravel.mode}</div>
            <p className="text-[11px] text-[#4A4236]">{answers.howShouldITravel.details}</p>
            {answers.howShouldITravel.alternativeSuggestion && (
              <div className="text-[11px] text-purple-900 bg-purple-50 p-2 rounded-xl border border-purple-100 mt-1">
                💡 {answers.howShouldITravel.alternativeSuggestion}
              </div>
            )}
          </div>
        </div>

        {/* 4. WHERE SHOULD I PARK? */}
        <div className="p-4 rounded-2xl bg-[#F4F8FF]/80 border border-[#C9D9F7]/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#382F27] flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-[#4F7CFF]" />
              <span>Where Should I Park?</span>
            </span>
            <span
              className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                typeof answers.whereShouldIPark.occupancyPercent === "number" && answers.whereShouldIPark.occupancyPercent >= 85
                  ? "bg-rose-100 text-rose-800"
                  : "bg-[#F7FAFF] text-[#241E17]"
              }`}
            >
              {answers.whereShouldIPark.occupancyPercent}% Load
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="font-bold text-[#0B1120]">{answers.whereShouldIPark.selectedName}</div>
            <div className="text-[11px] text-[#6B6252] font-mono">
              {answers.whereShouldIPark.availableSpaces} spaces currently open
            </div>
            {answers.whereShouldIPark.warning && (
              <div className="text-[11px] text-blue-900 bg-blue-50 p-2 rounded-xl border border-blue-200 mt-1">
                ⚠️ {answers.whereShouldIPark.warning}
              </div>
            )}
          </div>
        </div>

        {/* 5. WHICH TRANSPORT SHOULD I TAKE? */}
        <div className="p-4 rounded-2xl bg-[#F4F8FF]/80 border border-[#C9D9F7]/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#382F27] flex items-center gap-1.5">
              <Bus className="w-3.5 h-3.5 text-[#4F7CFF]" />
              <span>Which Transport To Take?</span>
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase">
              {answers.whichTransportShouldITake.status}
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="font-bold text-[#0B1120]">{answers.whichTransportShouldITake.selectedName}</div>
            <p className="text-[11px] text-[#4A4236]">{answers.whichTransportShouldITake.details}</p>
            {answers.whichTransportShouldITake.alternativeSuggestion && (
              <div className="text-[11px] text-[#0B1120] bg-[#F7FAFF] p-2 rounded-xl border border-[#EDE3CB] mt-1">
                💡 {answers.whichTransportShouldITake.alternativeSuggestion}
              </div>
            )}
          </div>
        </div>

        {/* 6. WHICH HOSPITALITY OPTION SHOULD I USE? */}
        <div className="p-4 rounded-2xl bg-[#F4F8FF]/80 border border-[#C9D9F7]/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#382F27] flex items-center gap-1.5">
              <UtensilsCrossed className="w-3.5 h-3.5 text-[#4F7CFF]" />
              <span>Which Dining / Lounge?</span>
            </span>
            <span
              className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                answers.whichHospitalityShouldIUse.status === "UNAVAILABLE"
                  ? "bg-rose-100 text-rose-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {answers.whichHospitalityShouldIUse.status}
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="font-bold text-[#0B1120]">{answers.whichHospitalityShouldIUse.selectedName}</div>
            {answers.whichHospitalityShouldIUse.warning ? (
              <div className="text-[11px] text-rose-900 bg-rose-50 p-2 rounded-xl border border-rose-200 mt-1 space-y-1">
                <div>⚠️ {answers.whichHospitalityShouldIUse.warning}</div>
                {answers.whichHospitalityShouldIUse.recommendedAlternative && (
                  <div className="font-semibold text-emerald-800 pt-0.5">
                    → Alternative: {answers.whichHospitalityShouldIUse.recommendedAlternative.name} (
                    {answers.whichHospitalityShouldIUse.recommendedAlternative.details})
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-[#4A4236]">{answers.whichHospitalityShouldIUse.details}</p>
            )}
          </div>
        </div>
      </div>

      {/* WHAT HAS CHANGED & WHY HAS IT CHANGED (Requirement 22 & 34) */}
      {(answers.whatHasChanged.length > 0 || answers.whyHasItChanged.length > 0) && (
        <div className="p-5 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#382F27] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              <span>What Changed & Why? (Live Operational Audit Feed)</span>
            </span>
            <span className="text-[10px] font-mono text-[#8C8272]">Sync with Central State</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase text-[#6B6252] block">What Changed:</span>
              {answers.whatHasChanged.map((c, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-[#F0E9D6] border border-[#C9D9F7] space-y-0.5">
                  <div className="font-bold text-[#0B1120]">{c.title}</div>
                  <p className="text-[11px] text-[#4A4236]">{c.description}</p>
                  <span className="text-[9px] font-mono text-[#8C8272]">{c.timestamp} • {c.source}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase text-[#6B6252] block">Why It Changed:</span>
              {answers.whyHasItChanged.map((w, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-[#F0E9D6] border border-[#C9D9F7] space-y-0.5">
                  <div className="font-bold text-indigo-900">{w.change}</div>
                  <p className="text-[11px] text-[#4A4236] font-medium">{w.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
