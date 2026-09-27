import { LiveVenueLink } from "../../components/live/LiveVenueLink";
import { CrowdPresenceMiniMap } from "../../components/crowd/CrowdPresenceMiniMap";
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Users2,
  DoorOpen,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Plus,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Zap,
  Info,
  Clock,
  Layers,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { OrganizerLayout } from "../../components/organizer/OrganizerLayout";
import {
  getStoredEventById,
  getOrganizerEvents,
} from "../../services/eventStorageService";
import {
  getEventLiveState,
  updateGateStatus,
  updateGateCapacity,
  saveEventLiveState,
  recordOperationalAction,
} from "../../services/operationalStateService";
import { AppEvent } from "../../types/event";
import {
  EventOperationalLiveState,
  GateOperationalState,
  GateOperationalStatus,
} from "../../types/operational";
import { loadSpatialTwin } from "../../services/spatialTwinStorage";
import { getEventPresence, getSimulatedEventPresence, type EventPresence } from "../../services/eventCollaborationService";
import type { FloorPlan } from "../../types/floorPlan";

export const OrganizerCrowdPage: React.FC = () => {
  const params = useParams<{ eventId?: string }>();
  const { user } = useAuth();

  const [events, setEvents] = useState<AppEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<AppEvent | null>(null);
  const [liveState, setLiveState] = useState<EventOperationalLiveState | null>(null);
  const [selectedGateForCapacity, setSelectedGateForCapacity] = useState<GateOperationalState | null>(null);
  const [additionalLanes, setAdditionalLanes] = useState(1);
  const [scannerMultiplier, setScannerMultiplier] = useState(1.5);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [floorPlan, setFloorPlan] = useState<FloorPlan | null>(null);
  const [liveAttendees, setLiveAttendees] = useState<EventPresence[]>([]);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [showSimulatedData, setShowSimulatedData] = useState(false);
  const [simulationFrame, setSimulationFrame] = useState(0);

  useEffect(() => {
    if (user?.id) {
      const orgEvents = getOrganizerEvents(user.id);
      setEvents(orgEvents);

      if (orgEvents.length === 0) {
        setCurrentEvent(null);
        setLiveState(null);
        return;
      }

      const targetId = params.eventId || orgEvents[0]?.id;
      const evt = orgEvents.find((e) => e.id === targetId) || orgEvents[0];

      if (evt) {
        setCurrentEvent(evt);
        const state = getEventLiveState(evt.id, evt);
        setLiveState(state);
      }
    }
  }, [user?.id, params.eventId]);


  useEffect(() => {
    if (!currentEvent) return;
    let alive = true;
    const refresh = async () => {
      const twin = await loadSpatialTwin(currentEvent.id);
      if (!alive) return;
      const plan=twin?.floorPlan || null;
      setFloorPlan(plan);
      setLiveAttendees(getEventPresence(currentEvent.id));
    };
    refresh();
    const handler = () => refresh();
    window.addEventListener('eventflow_collaboration_updated', handler);
    window.addEventListener('eventflow_floor_plan_updated', handler);
    window.addEventListener('storage', handler);
    const timer = window.setInterval(refresh, 5000);
    return () => { alive = false; window.removeEventListener('eventflow_collaboration_updated', handler); window.removeEventListener('eventflow_floor_plan_updated', handler); window.removeEventListener('storage', handler); window.clearInterval(timer); };
  }, [currentEvent?.id]);

  useEffect(() => {
    if (!simulationRunning) return;
    const timer = window.setInterval(() => setSimulationFrame((v) => v + 1), 1400);
    return () => window.clearInterval(timer);
  }, [simulationRunning]);

  useEffect(() => {
    if (!currentEvent) return;
    const real = getEventPresence(currentEvent.id);
    const demo = floorPlan && simulationRunning
      ? getSimulatedEventPresence(currentEvent.id, floorPlan, 36, simulationFrame)
      : [];
    setLiveAttendees([...real, ...demo]);
  }, [currentEvent?.id, floorPlan, simulationRunning, simulationFrame]);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleGateStatusChange = (gateId: string, status: GateOperationalStatus) => {
    if (!currentEvent || !user?.name) return;
    const updated = updateGateStatus(currentEvent.id, gateId, status, user.name);
    setLiveState({ ...updated });
    showNotice(`Operational action recorded: ${updated.gateStates[gateId]?.name} marked as ${status}`);
  };

  const handleApplyCapacityIncrease = () => {
    if (!currentEvent || !selectedGateForCapacity || !user?.name) return;
    const updated = updateGateCapacity(
      currentEvent.id,
      selectedGateForCapacity.id,
      additionalLanes,
      scannerMultiplier,
      user.name
    );
    setLiveState({ ...updated });
    setSelectedGateForCapacity(null);
    showNotice(
      `Operational action recorded: Increased entry capacity for ${selectedGateForCapacity.name} (+${additionalLanes} lanes, ${scannerMultiplier}x scanning multiplier)`
    );
  };

  if (events.length === 0) {
    return (
      <OrganizerLayout pageTitle="Crowd & Gate Management">
        <div className="p-12 text-center bg-[#F0E9D6] rounded-3xl border border-[#C9D9F7] shadow-2xs font-sans space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <DoorOpen className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#0B1120] font-heading">No Events Found</h3>
            <p className="text-xs text-[#6B6252] mt-1">
              Create an event to configure ingress turnstiles, regulate gate pressures, and adjust entry capacities.
            </p>
          </div>
          <Link
            to="/operations/events"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#4F7CFF] text-white hover:bg-[#2D5FD2] shadow-2xs"
          >
            <span>Go to Events Manager</span>
          </Link>
        </div>
      </OrganizerLayout>
    );
  }

  if (!currentEvent || !liveState) {
    return (
      <OrganizerLayout pageTitle="Crowd & Gate Management">
        <div className="p-12 text-center bg-[#F0E9D6] rounded-3xl border border-[#C9D9F7] shadow-2xs font-sans">
          <p className="text-sm text-[#6B6252]">Loading crowd metrics...</p>
        </div>
      </OrganizerLayout>
    );
  }

  const gatesList = Object.values(liveState.gateStates || {}) as GateOperationalState[];
  const realPresenceCount = liveAttendees.filter((p) => !p.simulated).length;
  const simulatedPresenceCount = liveAttendees.filter((p) => p.simulated).length;
  const simulatedPreview = floorPlan && currentEvent
    ? getSimulatedEventPresence(currentEvent.id, floorPlan, 12, simulationFrame)
    : [];

  return (
    <OrganizerLayout
      activeEvent={currentEvent}
      pageTitle={`Crowd Management: ${currentEvent.name}`}
      pageSubtitle="Monitor turnstile throughput, manage gate ingress pressure, and re-allocate lane capacities."
      pageBadge="Crowd Control"
    >
      <div className="space-y-8 font-sans">
        {/* Action Notice Toast */}
        {actionNotice && (
          <div className="p-4 rounded-2xl bg-[#0B1120] text-white shadow-xl flex items-center justify-between gap-3 border border-[#241E17] animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-xs text-[#8C8272] hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={()=>setSimulationRunning(v=>!v)} className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${simulationRunning?'border-[#D9B876]/60 bg-[#16213B]':'border-[#C9D9F7] bg-[#F0E9D6]'}`}>
            <span className="flex items-center gap-3"><span className={`grid h-9 w-9 place-items-center rounded-xl ${simulationRunning?'bg-[#D9B876] text-[#0B1120]':'bg-[#102A43] text-[#F5EFE2]'}`}><Zap className="h-4 w-4"/></span><span><b className={simulationRunning?'block text-sm text-[#F5EFE2]':'block text-sm text-[#0B1120]'}>{simulationRunning?'Stop Simulation':'Run Simulation'}</b><small className={simulationRunning?'text-[#B9C1CC]':'text-[#6B6252]'}>Animate demo attendee movement on the published map</small></span></span>
            <span className={`rounded-full px-2 py-1 text-[9px] font-black ${simulationRunning?'bg-emerald-400/15 text-emerald-300':'bg-[#E8E0CD] text-[#6B6252]'}`}>{simulationRunning?'RUNNING':'READY'}</span>
          </button>
          <button type="button" onClick={()=>setShowSimulatedData(v=>!v)} className="flex items-center justify-between rounded-2xl border border-[#C9D9F7] bg-[#F0E9D6] px-4 py-3 text-left transition hover:border-[#9FB9E4]">
            <span className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#102A43] text-[#F5EFE2]"><Layers className="h-4 w-4"/></span><span><b className="block text-sm text-[#0B1120]">Simulated Data</b><small className="text-[#6B6252]">Preview fake GPS-enabled demo devices</small></span></span>
            <span className="rounded-full bg-[#E8E0CD] px-2 py-1 text-[9px] font-black text-[#6B6252]">SIMULATED</span>
          </button>
        </div>

        {showSimulatedData && <div className="rounded-2xl border border-[#C9D9F7] bg-[#F7FAFF] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-sm font-black text-[#0B1120]">Nearby demo devices</h3><p className="text-[11px] text-[#6B6252]">Synthetic entries for presentation/testing only — not detected real phones.</p></div><span className="rounded-full bg-[#EEE7D6] px-2 py-1 text-[9px] font-black text-[#6B6252]">{simulatedPreview.length} FAKE GPS ENTRIES</span></div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{simulatedPreview.map((p,i)=><div key={p.userId} className="rounded-xl border border-[#D8E1ED] bg-white p-3"><div className="flex items-center justify-between gap-2"><b className="text-xs text-[#0B1120]">Demo Phone {String(i+1).padStart(2,'0')}</b><span className="text-[9px] font-black text-emerald-700">GPS ON</span></div><div className="mt-1 text-[10px] font-semibold text-[#596779]">{p.sourceLabel || 'Venue zone'}</div><div className="mt-2 text-[9px] font-black uppercase tracking-wider text-[#6A56D8]">SIMULATED</div></div>)}</div>
        </div>}

        <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
          {floorPlan ? <CrowdPresenceMiniMap plan={floorPlan} attendees={liveAttendees}/> : <div className="rounded-2xl border border-dashed border-[#C9D9F7] bg-[#F7FAFF] p-6 text-sm text-[#6B6252]">Publish the indoor map to unlock live attendee positioning.</div>}
          <div className="rounded-2xl border border-[#C9D9F7] bg-[#F0E9D6] p-4">
            <div className="flex items-center justify-between"><div><span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8272]">Inside event</span><div className="mt-1 text-3xl font-black text-[#0B1120]">{realPresenceCount + simulatedPresenceCount}</div></div><Users2 className="h-6 w-6 text-[#4F7CFF]"/></div>
            <div className="mt-3 text-xs text-[#6B6252]">{realPresenceCount} opted-in real · {simulatedPresenceCount} simulated. Demo points appear only when simulation is running.</div>
            <Link to={`/operations/events/${currentEvent.id}/3d-venue`} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#4F7CFF] px-3 py-2 text-xs font-bold text-white">Open map & dispatch operators <ArrowRight className="h-4 w-4"/></Link>
          </div>
        </div>

        <LiveVenueLink eventId={currentEvent.id} staff />
        {/* Top Crowd KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Expected */}
          <div className="p-4 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs">
            <span className="text-[10px] uppercase font-mono font-bold text-[#8C8272] block">
              Total Expected
            </span>
            <div className="mt-1 text-xl font-bold font-mono text-[#0B1120]">
              {liveState.crowdState.totalExpected.toLocaleString()}
            </div>
          </div>

          {/* Current Attendance */}
          <div className="p-4 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs">
            <span className="text-[10px] uppercase font-mono font-bold text-[#8C8272] block">
              Reported Attendance
            </span>
            <div className="mt-1 text-xl font-bold font-mono text-[#4F7CFF]">
              {liveState.crowdState.currentAttendance.toLocaleString()}
            </div>
          </div>

          {/* Entry Rate */}
          <div className="p-4 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs">
            <span className="text-[10px] uppercase font-mono font-bold text-[#8C8272] block">
              Entry Rate
            </span>
            <div className="mt-1 text-xl font-bold font-mono text-emerald-600 flex items-center gap-1">
              <span>{liveState.crowdState.entryRate}</span>
              <span className="text-[10px] font-normal text-[#6B6252] font-sans">/ min</span>
            </div>
          </div>

          {/* Exit Rate */}
          <div className="p-4 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs">
            <span className="text-[10px] uppercase font-mono font-bold text-[#8C8272] block">
              Exit Rate
            </span>
            <div className="mt-1 text-xl font-bold font-mono text-[#382F27] flex items-center gap-1">
              <span>{liveState.crowdState.exitRate}</span>
              <span className="text-[10px] font-normal text-[#6B6252] font-sans">/ min</span>
            </div>
          </div>

          {/* Venue Capacity */}
          <div className="p-4 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs">
            <span className="text-[10px] uppercase font-mono font-bold text-[#8C8272] block">
              Venue Capacity
            </span>
            <div className="mt-1 text-xl font-bold font-mono text-[#241E17]">
              {liveState.crowdState.venueCapacity.toLocaleString()}
            </div>
          </div>

          {/* Occupancy % */}
          <div className="p-4 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs">
            <span className="text-[10px] uppercase font-mono font-bold text-[#8C8272] block">
              Occupancy Load
            </span>
            <div
              className={`mt-1 text-xl font-bold font-mono ${
                liveState.crowdState.occupancyPercent > 85
                  ? "text-rose-600"
                  : liveState.crowdState.occupancyPercent > 65
                  ? "text-blue-600"
                  : "text-[#4F7CFF]"
              }`}
            >
              {liveState.crowdState.occupancyPercent}%
            </div>
          </div>
        </div>

        {/* Ingress Gate Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0B1120] font-heading">
                Turnstiles & Ingress Gates ({gatesList.length})
              </h3>
              <p className="text-xs text-[#6B6252]">
                Adjust gate operational status, inspect ticket access constraints, and dynamically expand scanning capacity.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {gatesList.map((gate) => {
              const eligibleAlternates = (gate.alternateGateIds || [])
                .map((altId) => liveState.gateStates[altId])
                .filter(Boolean);

              return (
                <div
                  key={gate.id}
                  className={`rounded-3xl bg-[#F0E9D6] border p-6 shadow-2xs space-y-5 transition-all ${
                    gate.status === "HIGH PRESSURE"
                      ? "border-rose-300 ring-2 ring-rose-500/20"
                      : gate.status === "BUSY"
                      ? "border-blue-300"
                      : "border-[#C9D9F7]/90"
                  }`}
                >
                  {/* Gate Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <DoorOpen className="w-5 h-5 text-[#4F7CFF]" />
                        <h4 className="text-base font-bold text-[#0B1120] font-heading">{gate.name}</h4>
                      </div>
                      <p className="text-xs text-[#6B6252]">
                        Assigned Sections: <span className="text-[#241E17] font-bold">{(gate.assignedSections || []).join(", ")}</span>
                      </p>
                    </div>

                    {/* Status Select Pill */}
                    <div className="relative shrink-0">
                      <select
                        value={gate.status}
                        onChange={(e) => handleGateStatusChange(gate.id, e.target.value as any)}
                        className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer appearance-none pr-7 shadow-2xs ${
                          gate.status === "NORMAL"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : gate.status === "BUSY"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : gate.status === "HIGH PRESSURE"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : gate.status === "RESTRICTED"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-[#F7FAFF] text-[#4A4236] border-[#C9BBA0]"
                        }`}
                      >
                        <option value="NORMAL">NORMAL</option>
                        <option value="BUSY">BUSY</option>
                        <option value="HIGH PRESSURE">HIGH PRESSURE</option>
                        <option value="RESTRICTED">RESTRICTED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </div>
                  </div>

                  {/* Gate Metrics Bar */}
                  <div className="grid grid-cols-3 gap-3 text-xs bg-[#F4F8FF] p-3.5 rounded-2xl border border-[#F7FAFF]">
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-[#8C8272] block">
                        Base Capacity
                      </span>
                      <span className="font-mono font-bold text-[#241E17]">
                        {gate.capacity} pax/min
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-[#8C8272] block">
                        Current Entry Rate
                      </span>
                      <span className="font-mono font-bold text-[#2D5FD2]">
                        {gate.entryRate} pax/min
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-[#8C8272] block">
                        Total Processed
                      </span>
                      <span className="font-mono font-bold text-[#241E17]">
                        {gate.currentCount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Allowed Ticket Groups & Capacity Enhancements */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#6B6252] font-medium">Allowed Ticket Groups:</span>
                      <div className="flex items-center gap-1 font-mono uppercase font-bold">
                        {(gate.allowedTicketGroups || ["ga"]).map((tg) => (
                          <span
                            key={tg}
                            className="px-2 py-0.5 rounded-md bg-[#F7FAFF] text-[#382F27] text-[10px] border border-[#C9D9F7]"
                          >
                            {tg}
                          </span>
                        ))}
                      </div>
                    </div>

                    {gate.additionalLanes > 0 && (
                      <div className="flex items-center justify-between text-[11px] p-2.5 rounded-xl bg-[#F7FAFF]/80 text-[#0B1120] border border-[#EDE3CB]">
                        <span className="font-bold flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-[#4F7CFF]" />
                          Enhanced Throughput Active:
                        </span>
                        <span className="font-mono font-bold">
                          +{gate.additionalLanes} lanes ({gate.scanningCapacityMultiplier}x speed)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Alternate Gate Advisor for High Pressure */}
                  {(gate.status === "HIGH PRESSURE" || gate.status === "BUSY") && (
                    <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs space-y-1.5">
                      <div className="font-bold text-blue-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span>High Arrival Pressure Detected</span>
                      </div>
                      <p className="text-blue-800 text-[11px]">
                        Eligible alternate turnstiles:{" "}
                        {eligibleAlternates.length > 0 ? (
                          <span className="font-bold">
                            {eligibleAlternates.map((a) => a.name).join(", ")}
                          </span>
                        ) : (
                          <span className="italic">No direct adjacent turnstile configured.</span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Gate Action Button */}
                  <div className="pt-2 border-t border-[#F7FAFF] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGateForCapacity(gate);
                        setAdditionalLanes(gate.additionalLanes || 1);
                        setScannerMultiplier(gate.scanningCapacityMultiplier || 1.5);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F7FAFF] hover:bg-[#EDE3CB] text-[#2D5FD2] transition-colors cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Increase Entry Capacity</span>
                    </button>

                    <span className="text-[10px] text-[#8C8272] font-mono">
                      Updated {new Date(gate.lastUpdated || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Increase Entry Capacity Modal */}
      {selectedGateForCapacity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="w-full max-w-md bg-[#F0E9D6] rounded-3xl shadow-2xl border border-[#C9D9F7] p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-[#0B1120] font-heading">
                Increase Entry Capacity
              </h3>
              <p className="text-xs text-[#6B6252] mt-0.5">
                Scale auxiliary scanning staff and turnstile lanes for{" "}
                <span className="font-bold text-[#241E17]">{selectedGateForCapacity.name}</span>.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#382F27] mb-1.5">
                  Additional Physical Lanes (+{additionalLanes})
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setAdditionalLanes(num)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        additionalLanes === num
                          ? "bg-[#4F7CFF] text-white shadow-2xs"
                          : "bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#382F27]"
                      }`}
                    >
                      +{num} Lanes
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#382F27] mb-1.5">
                  Scanning Capacity Multiplier ({scannerMultiplier}x)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1.25, 1.5, 2.0].map((mult) => (
                    <button
                      key={mult}
                      type="button"
                      onClick={() => setScannerMultiplier(mult)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        scannerMultiplier === mult
                          ? "bg-[#4F7CFF] text-white shadow-2xs"
                          : "bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#382F27]"
                      }`}
                    >
                      {mult}x Speed
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F7FAFF] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedGateForCapacity(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#4A4236] hover:bg-[#F7FAFF]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCapacityIncrease}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white shadow-2xs"
              >
                Apply Capacity Boost
              </button>
            </div>
          </div>
        </div>
      )}
    </OrganizerLayout>
  );
};
