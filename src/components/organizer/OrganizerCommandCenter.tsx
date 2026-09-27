import React, { useState } from "react";
import { MegaEvent, GateInfo, IncidentAlert, DecisionSupportResult, DecisionAction } from "../../types";
import { PrecinctMap } from "../common/PrecinctMap";
import { 
  AlertTriangle, 
  ArrowUpRight, 
  Brain, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  DoorOpen, 
  Flame, 
  Layers, 
  Radio, 
  RefreshCw, 
  Send, 
  ShieldAlert, 
  Sparkles, 
  Train, 
  Users, 
  Zap,
  TrendingUp,
  Activity
} from "lucide-react";

interface OrganizerCommandCenterProps {
  event: MegaEvent;
  aiDecision: DecisionSupportResult | null;
  isLoadingAi: boolean;
  onRefreshAi: () => void;
  onExecuteAction: (action: DecisionAction) => void;
  onResolveIncident: (incidentId: string) => void;
  onOpenGateOverflow: (gateId: string) => void;
  onBroadcastNotification: (message: string) => void;
}

export const OrganizerCommandCenter: React.FC<OrganizerCommandCenterProps> = ({
  event,
  aiDecision,
  isLoadingAi,
  onRefreshAi,
  onExecuteAction,
  onResolveIncident,
  onOpenGateOverflow,
  onBroadcastNotification,
}) => {
  const [selectedGate, setSelectedGate] = useState<GateInfo | null>(null);
  const [customBroadcast, setCustomBroadcast] = useState("");
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Compute aggregate metrics
  const occupancyPct = Math.round((event.currentAttendance / event.capacity) * 100);
  const totalThroughput = event.gates.reduce((sum, g) => sum + g.currentThroughput, 0);
  const totalQueue = event.gates.reduce((sum, g) => sum + g.queueLength, 0);
  const criticalGates = event.gates.filter((g) => g.status === "critical" || g.status === "congested");
  const openIncidents = event.incidents.filter((i) => i.status !== "resolved");

  const handleSendCustomBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customBroadcast.trim()) return;
    onBroadcastNotification(customBroadcast);
    setCustomBroadcast("");
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 3000);
  };

  return (
    <div id="organizer-command-center" className="space-y-6">
      {/* Top Banner / Event Phase Alert */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#0B1120] via-indigo-950/40 to-[#0B1120] border border-indigo-500/20 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Radio className="w-6 h-6 animate-pulse text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono uppercase">
                {event.status}
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">{event.name}</h2>
            </div>
            <p className="text-xs text-[#8C8272] mt-0.5">
              Venue: <span className="text-[#C9D9F7]">{event.venue}</span> • Phase:{" "}
              <span className="text-indigo-300 font-semibold">{event.currentPhase}</span> • Weather:{" "}
              <span className="text-[#C9BBA0]">{event.weather.temp}, {event.weather.condition}</span>
            </p>
          </div>
        </div>

        {/* Quick Phase Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={onRefreshAi}
            disabled={isLoadingAi}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#241E17] text-[#C9D9F7] hover:bg-[#382F27] border border-[#382F27] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAi ? "animate-spin text-indigo-400" : ""}`} />
            <span>Re-evaluate Telemetry</span>
          </button>
        </div>
      </div>

      {/* Macro KPI Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Attendance */}
        <div className="p-4 rounded-xl bg-[#0B1120]/90 border border-[#241E17]/80">
          <div className="flex items-center justify-between text-xs text-[#8C8272]">
            <span>Occupancy</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{event.currentAttendance.toLocaleString()}</span>
            <span className="text-xs text-[#8C8272] font-mono">/ {event.capacity.toLocaleString()}</span>
          </div>
          <div className="mt-2 w-full bg-[#241E17] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                occupancyPct > 90 ? "bg-rose-500" : occupancyPct > 75 ? "bg-blue-500" : "bg-indigo-500"
              }`}
              style={{ width: `${occupancyPct}%` }}
            />
          </div>
          <span className="text-[11px] text-[#8C8272] mt-1 block">{occupancyPct}% venue load</span>
        </div>

        {/* Ingress Rate */}
        <div className="p-4 rounded-xl bg-[#0B1120]/90 border border-[#241E17]/80">
          <div className="flex items-center justify-between text-xs text-[#8C8272]">
            <span>Throughput Flow</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{totalThroughput}</span>
            <span className="text-xs text-[#8C8272] font-mono">pax/min</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Active turnstiles: {event.gates.reduce((s, g) => s + g.turnstilesActive, 0)}</span>
          </div>
        </div>

        {/* Turnstile Queues */}
        <div className="p-4 rounded-xl bg-[#0B1120]/90 border border-[#241E17]/80">
          <div className="flex items-center justify-between text-xs text-[#8C8272]">
            <span>Perimeter Queues</span>
            <DoorOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{totalQueue}</span>
            <span className="text-xs text-[#8C8272] font-mono">in line</span>
          </div>
          <div className="mt-2 text-xs text-blue-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Peak wait: {Math.max(...event.gates.map((g) => g.avgWaitMins))} mins</span>
          </div>
        </div>

        {/* Transit Surge */}
        <div className="p-4 rounded-xl bg-[#0B1120]/90 border border-[#241E17]/80">
          <div className="flex items-center justify-between text-xs text-[#8C8272]">
            <span>Transit Load</span>
            <Train className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">
              {Math.round(event.transitLines.reduce((s, t) => s + t.crowdLoadPercent, 0) / event.transitLines.length)}%
            </span>
            <span className="text-xs text-[#8C8272] font-mono">fleet load</span>
          </div>
          <div className="mt-2 text-xs text-sky-300">
            <span>{event.transitLines.filter((t) => t.status === "surging" || t.status === "congested").length} lines at peak</span>
          </div>
        </div>

        {/* Open Incidents */}
        <div className="p-4 rounded-xl bg-[#0B1120]/90 border border-[#241E17]/80 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-[#8C8272]">
            <span>Critical Flags</span>
            <AlertTriangle className={`w-4 h-4 ${openIncidents.length > 0 ? "text-rose-400" : "text-emerald-400"}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{openIncidents.length}</span>
            <span className="text-xs text-[#8C8272] font-mono">active alerts</span>
          </div>
          <div className="mt-2 text-xs text-[#8C8272]">
            {openIncidents.length > 0 ? (
              <span className="text-rose-400 font-medium">Action required</span>
            ) : (
              <span className="text-emerald-400">All corridors nominal</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Spatial Precinct Map (Left) + AI Incident Commander & Decision Engine (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Spatial Precinct Map & Gate Status */}
        <div className="lg:col-span-7 space-y-6">
          <PrecinctMap
            event={event}
            onSelectGate={(gate) => setSelectedGate(gate)}
            highlightGateId={selectedGate?.id}
          />

          {/* Gate Capacity & Throughput Monitor */}
          <div className="p-5 rounded-2xl bg-[#0B1120]/90 border border-[#241E17]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DoorOpen className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#C9D9F7]">
                  Perimeter Gate Throughput & Queue Lengths
                </h3>
              </div>
              <span className="text-xs text-[#8C8272] font-mono">{event.gates.length} monitored gates</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {event.gates.map((gate) => {
                const isChoked = gate.status === "critical" || gate.status === "congested";
                const isClosed = gate.status === "closed";

                return (
                  <div
                    key={gate.id}
                    onClick={() => setSelectedGate(gate)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      selectedGate?.id === gate.id
                        ? "bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10"
                        : isChoked
                        ? "bg-[#0B1120]/60 border-blue-500/30 hover:border-blue-500/60"
                        : isClosed
                        ? "bg-[#0B1120]/40 border-[#241E17] opacity-60 hover:opacity-100"
                        : "bg-[#0B1120]/60 border-[#241E17] hover:border-[#382F27]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{gate.name}</h4>
                        <p className="text-[11px] text-[#8C8272] line-clamp-1 mt-0.5">
                          {gate.assignedZones.join(", ")}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full font-mono shrink-0 ${
                          gate.status === "critical"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                            : gate.status === "congested"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                            : gate.status === "overflow_open"
                            ? "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                            : gate.status === "closed"
                            ? "bg-[#241E17] text-[#8C8272]"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {gate.status === "overflow_open" ? "OVERFLOW ACTIVE" : gate.status}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      <div className="text-[#8C8272]">
                        Queue: <strong className="text-[#C9D9F7]">{gate.queueLength} pax</strong>
                      </div>
                      <div
                        className={`font-semibold ${
                          gate.avgWaitMins > 10 ? "text-blue-400" : "text-emerald-400"
                        }`}
                      >
                        {gate.avgWaitMins > 0 ? `${gate.avgWaitMins} min wait` : "No queue"}
                      </div>
                    </div>

                    {/* Action buttons if gate is congested or closed */}
                    {gate.id === "gate-overflow-3b" && gate.status === "closed" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenGateOverflow(gate.id);
                        }}
                        className="mt-2.5 w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Deploy Auxiliary Gate 3B</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: AI Decision Support & Predictive Incident Commander */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Decision Support Panel */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0B1120] to-[#0B1120] border border-indigo-500/30 shadow-xl relative overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b border-[#241E17]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Brain className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    AI Incident Commander
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  </h3>
                  <p className="text-xs text-[#8C8272]">Predictive Cross-Ecosystem Decision Engine</p>
                </div>
              </div>

              {aiDecision && (
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full uppercase border ${
                    aiDecision.riskLevel === "CRITICAL"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/40 animate-pulse"
                      : aiDecision.riskLevel === "ELEVATED"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/40"
                      : aiDecision.riskLevel === "MODERATE"
                      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/40"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/40"
                  }`}
                >
                  {aiDecision.riskLevel} RISK
                </span>
              )}
            </div>

            {isLoadingAi ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <RefreshCw className="w-7 h-7 text-indigo-400 animate-spin" />
                <p className="text-xs text-[#C9BBA0] font-medium">
                  Synthesizing venue sensors, crowd vectors & transit schedule...
                </p>
                <span className="text-[11px] text-[#6B6252] font-mono">Gemini 3.8 Flash Engine</span>
              </div>
            ) : aiDecision ? (
              <div className="mt-4 space-y-4">
                {/* Executive Assessment */}
                <div className="p-3.5 rounded-xl bg-[#0B1120]/80 border border-[#241E17]/80">
                  <span className="text-[11px] uppercase tracking-wider text-[#8C8272] font-bold block mb-1">
                    Situational Assessment
                  </span>
                  <p className="text-xs text-[#C9D9F7] leading-relaxed">{aiDecision.executiveSummary}</p>
                </div>

                {/* 15-30 Min Impact Projection */}
                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300 mb-1">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Predicted 15–30 Min Trajectory</span>
                  </div>
                  <p className="text-xs text-blue-200/90 leading-relaxed">{aiDecision.predictedImpact}</p>
                </div>

                {/* Actionable Interventions with 1-Click Execution */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider text-[#8C8272] font-bold">
                      Recommended Orchestrated Actions
                    </span>
                    <span className="text-[11px] text-indigo-400 font-mono">Click to coordinate</span>
                  </div>

                  <div className="space-y-2">
                    {aiDecision.recommendedActions.map((action, idx) => (
                      <div
                        key={action.id || idx}
                        className={`p-3 rounded-xl border transition-all ${
                          action.executed
                            ? "bg-emerald-950/20 border-emerald-500/30 opacity-80"
                            : "bg-[#0B1120]/90 border-[#241E17] hover:border-indigo-500/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${
                                  action.priority === "IMMEDIATE"
                                    ? "bg-rose-500/20 text-rose-300"
                                    : action.priority === "HIGH"
                                    ? "bg-blue-500/20 text-blue-300"
                                    : "bg-[#241E17] text-[#C9BBA0]"
                                }`}
                              >
                                {action.priority}
                              </span>
                              <span className="text-[11px] font-semibold text-indigo-300">
                                [{action.domain}]
                              </span>
                            </div>
                            <p className="text-xs text-[#C9D9F7]">{action.action}</p>
                          </div>

                          <button
                            onClick={() => onExecuteAction(action)}
                            disabled={action.executed}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                              action.executed
                                ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default"
                                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                            }`}
                          >
                            {action.executed ? (
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Done
                              </span>
                            ) : (
                              "Execute"
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Attendee Mobile Broadcast Draft */}
                <div className="p-3.5 rounded-xl bg-[#0B1120]/90 border border-[#241E17]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase tracking-wider text-[#8C8272] font-bold">
                      Synchronized Attendee Mobile Notice
                    </span>
                    <button
                      onClick={() => onBroadcastNotification(aiDecision.attendeeBroadcast)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" /> Push to Passes
                    </button>
                  </div>
                  <p className="text-xs text-[#C9BBA0] italic bg-[#0B1120]/60 p-2.5 rounded-lg border border-[#241E17]/80">
                    "{aiDecision.attendeeBroadcast}"
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Active Incidents Stream & Dispatch */}
          <div className="p-5 rounded-2xl bg-[#0B1120]/90 border border-[#241E17] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#C9D9F7]">
                  Active Incidents & Alerts ({openIncidents.length})
                </h3>
              </div>
              <span className="text-xs text-[#8C8272] font-mono">Real-time log</span>
            </div>

            <div className="space-y-2.5">
              {openIncidents.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#8C8272]">
                  No active incidents detected. Venue flow nominal.
                </div>
              ) : (
                openIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="p-3.5 rounded-xl bg-[#0B1120]/80 border border-[#241E17] space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            incident.severity === "critical"
                              ? "bg-rose-500 animate-ping"
                              : "bg-blue-500"
                          }`}
                        />
                        <h4 className="text-xs font-bold text-white">{incident.title}</h4>
                      </div>
                      <span className="text-[10px] text-[#8C8272] font-mono">{incident.timestamp}</span>
                    </div>

                    <p className="text-xs text-[#C9BBA0]">{incident.description}</p>

                    <div className="pt-2 border-t border-[#241E17]/80 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-indigo-300">
                        Recommended: {incident.suggestedAction}
                      </span>
                      <button
                        onClick={() => onResolveIncident(incident.id)}
                        className="text-xs px-2.5 py-1 rounded bg-[#241E17] hover:bg-[#382F27] text-[#C9BBA0] hover:text-white transition-colors"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Custom Notification Broadcaster */}
            <form onSubmit={handleSendCustomBroadcast} className="pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Dispatch custom mobile notice to attendees..."
                  value={customBroadcast}
                  onChange={(e) => setCustomBroadcast(e.target.value)}
                  className="flex-1 bg-[#0B1120] text-xs px-3 py-2 rounded-xl border border-[#241E17] text-[#C9D9F7] placeholder-[#6B6252] focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!customBroadcast.trim()}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
              {broadcastSent && (
                <span className="text-[11px] text-emerald-400 mt-1 block">
                  ✓ Broadcast sent to all registered mobile passes!
                </span>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
