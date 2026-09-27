import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Radio,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Building2,
  Layers,
  MapPin,
  Mail,
  Phone,
  QrCode,
  Scan,
  Check,
  AlertTriangle,
  XCircle,
  Sparkles,
  ShieldCheck,
  Activity,
  Send,
  DoorOpen,
  Users2,
  Bus,
  Car,
  HeartPulse,
  Sliders,
  Volume2,
  Search,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { OperatorUser } from "../types/auth";
import { AppLayout } from "../components/layout/AppLayout";
import { getAllStoredEvents } from "../services/eventStorageService";
import {
  getEventLiveState,
  createOperationalAlert,
  updateGateStatus,
  recordOperationalAction,
} from "../services/operationalStateService";
import { validateTicket, checkInTicket, getAllTickets } from "../services/bookingService";
import { AppEvent } from "../types/event";
import { EventOperationalLiveState } from "../types/operational";
import { EventFlowTicket } from "../types/booking";

export const OperatorsPlaceholderPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const operator = user?.role === "operator" ? (user as OperatorUser) : null;

  // Active Event & State
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("mumbai-tech-ai-expo-2026");
  const [liveState, setLiveState] = useState<EventOperationalLiveState | null>(null);

  // Duty Station
  const [dutyStation, setDutyStation] = useState<string>("Gate 1 (Main Ingress)");
  const [stationType, setStationType] = useState<"gate" | "transport" | "parking" | "medical">("gate");

  // Scanner State
  const [scannedCode, setScannedCode] = useState<string>("");
  const [scanResult, setScanResult] = useState<{
    valid: boolean;
    checkedIn?: boolean;
    ticket?: EventFlowTicket;
    message: string;
  } | null>(null);
  const [recentScans, setRecentScans] = useState<
    { ticketId: string; name: string; seat: string; time: string; valid: boolean }[]
  >([]);

  // Incident reporting state
  const [incidentTitle, setIncidentTitle] = useState("");
  const [incidentSeverity, setIncidentSeverity] = useState<"INFO" | "WARNING" | "CRITICAL">("WARNING");
  const [incidentMessage, setIncidentMessage] = useState("");
  const [incidentNotice, setIncidentNotice] = useState<string | null>(null);

  // Load events
  useEffect(() => {
    const all = getAllStoredEvents();
    setEvents(all);
    if (all.length > 0 && !selectedEventId) {
      setSelectedEventId(all[0].id);
    }
  }, []);

  // Sync live state for chosen event
  useEffect(() => {
    if (selectedEventId) {
      const state = getEventLiveState(selectedEventId);
      setLiveState(state);
    }
  }, [selectedEventId]);

  const activeEvent = events.find((e) => e.id === selectedEventId) || events[0];

  const handleLogout = () => {
    logout();
    navigate("/signin", { replace: true });
  };

  const handleValidateAndCheckIn = (codeToTest?: string) => {
    const code = codeToTest || scannedCode;
    if (!code.trim()) return;

    const validation = validateTicket(code);

    if (validation.valid && validation.ticket) {
      const checkInRes = checkInTicket(validation.ticket.ticketId, dutyStation, user?.name || "Operator");
      setScanResult({
        valid: true,
        checkedIn: true,
        ticket: checkInRes.ticket || validation.ticket,
        message: checkInRes.message,
      });

      setRecentScans((prev) => [
        {
          ticketId: validation.ticket!.ticketId,
          name: validation.ticket!.attendeeName,
          seat: validation.ticket!.seat,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          valid: true,
        },
        ...prev.slice(0, 7),
      ]);
    } else {
      setScanResult({
        valid: false,
        ticket: validation.ticket,
        message: validation.message,
      });

      setRecentScans((prev) => [
        {
          ticketId: code.substring(0, 16),
          name: validation.ticket?.attendeeName || "Unknown Visitor",
          seat: validation.ticket?.seat || "N/A",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          valid: false,
        },
        ...prev.slice(0, 7),
      ]);
    }

    setScannedCode("");
  };

  const handleDispatchIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentTitle.trim() || !incidentMessage.trim() || !activeEvent) return;

    createOperationalAlert({
      eventId: activeEvent.id,
      alertType: "Field Incident",
      severity: incidentSeverity,
      title: incidentTitle.trim(),
      message: `${incidentMessage.trim()} (Reported by: ${user?.name || "Operator"} at ${dutyStation})`,
      affectedArea: dutyStation,
      audience: "Operators",
      startTime: new Date().toISOString(),
      createdBy: `${user?.name || "Field Staff"} (${dutyStation})`,
    });

    recordOperationalAction(activeEvent.id, {
      action: "INCIDENT_REPORTED",
      details: `Field incident dispatched from ${dutyStation}: "${incidentTitle.trim()}"`,
      user: user?.name || "Field Operator",
      resource: dutyStation,
    });

    // Refresh live state
    const refreshed = getEventLiveState(activeEvent.id);
    setLiveState({ ...refreshed });

    setIncidentNotice("Incident dispatched to Command Center live radar.");
    setIncidentTitle("");
    setIncidentMessage("");
    setTimeout(() => setIncidentNotice(null), 3500);
  };

  // Sample tickets for quick operator testing
  const allTickets = getAllTickets();
  const sampleTestTickets = allTickets.slice(0, 4);

  return (
    <AppLayout pageTitle="Field Operator Terminal" pageBadge="Station Terminal">
      <div className="max-w-6xl mx-auto space-y-6 pb-20 font-sans">
        {/* Top Control Bar: Event & Duty Station Selector */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-[#0B1120] font-heading">
                  Field Dispatch & Scanner Terminal
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-[#6B6252]">
                Staff: <strong className="text-[#241E17]">{user?.name}</strong> • Provider:{" "}
                <strong className="text-[#241E17]">{operator?.organization || "Event Staff Operations"}</strong>
              </p>
            </div>
          </div>

          {/* Quick Event Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-semibold text-[#6B6252]">Monitoring Event:</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#F4F8FF] border border-[#C9D9F7] text-[#241E17] focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer ml-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Station Mode Grid Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => {
              setStationType("gate");
              setDutyStation(activeEvent?.gates?.[0]?.name || "Gate 1 (Main Ingress)");
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              stationType === "gate"
                ? "bg-teal-600 text-white border-teal-700 shadow-sm"
                : "bg-[#F0E9D6] text-[#382F27] border-[#C9D9F7] hover:border-teal-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <DoorOpen className="w-5 h-5" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-80">STATION 01</span>
            </div>
            <div className="text-xs font-bold font-heading">Gate & Turnstiles</div>
            <div className="text-[11px] opacity-80">Access scanning & ingress flow</div>
          </button>

          <button
            onClick={() => {
              setStationType("transport");
              setDutyStation("Transit Interchange & Shuttle Stop");
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              stationType === "transport"
                ? "bg-teal-600 text-white border-teal-700 shadow-sm"
                : "bg-[#F0E9D6] text-[#382F27] border-[#C9D9F7] hover:border-teal-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Bus className="w-5 h-5" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-80">STATION 02</span>
            </div>
            <div className="text-xs font-bold font-heading">Shuttle & Transit</div>
            <div className="text-[11px] opacity-80">Bus dispatch & platform queues</div>
          </button>

          <button
            onClick={() => {
              setStationType("parking");
              setDutyStation("North Parking Bay Alpha");
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              stationType === "parking"
                ? "bg-teal-600 text-white border-teal-700 shadow-sm"
                : "bg-[#F0E9D6] text-[#382F27] border-[#C9D9F7] hover:border-teal-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Car className="w-5 h-5" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-80">STATION 03</span>
            </div>
            <div className="text-xs font-bold font-heading">Parking Lot Marshall</div>
            <div className="text-[11px] opacity-80">Bay capacity & traffic guidance</div>
          </button>

          <button
            onClick={() => {
              setStationType("medical");
              setDutyStation("First-Aid Medical Hub Charlie");
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              stationType === "medical"
                ? "bg-teal-600 text-white border-teal-700 shadow-sm"
                : "bg-[#F0E9D6] text-[#382F27] border-[#C9D9F7] hover:border-teal-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <HeartPulse className="w-5 h-5" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-80">STATION 04</span>
            </div>
            <div className="text-xs font-bold font-heading">Medical & Safety</div>
            <div className="text-[11px] opacity-80">First-aid triage & assistance</div>
          </button>
        </div>

        {/* Main Work Surface: Scanner & Check-in + Incident Dispatcher */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Ticket Check-in Scanner (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scan className="w-5 h-5 text-teal-600" />
                  <h2 className="text-base font-bold text-[#0B1120] font-heading">
                    Digital Pass & QR Turnstile Scanner
                  </h2>
                </div>
                <div className="text-xs font-mono font-semibold text-[#6B6252] bg-[#F7FAFF] px-3 py-1 rounded-lg">
                  Station: {dutyStation}
                </div>
              </div>

              {/* Optical Scan Simulation Box */}
              <div className="relative rounded-2xl bg-[#0B1120] p-6 text-white text-center overflow-hidden border border-[#241E17]">
                {/* Visual laser scanline */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-pulse" />

                <div className="w-20 h-20 rounded-2xl bg-teal-500/10 border-2 border-teal-400/60 border-dashed flex items-center justify-center mx-auto mb-4 relative">
                  <QrCode className="w-10 h-10 text-teal-400" />
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-teal-400" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-teal-400" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-teal-400" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-teal-400" />
                </div>

                <p className="text-xs text-[#C9BBA0] mb-4 max-w-sm mx-auto">
                  Scan attendee QR pass from mobile device or enter Ticket ID manually:
                </p>

                {/* Input & Scan Button */}
                <div className="flex items-center gap-2 max-w-md mx-auto">
                  <input
                    type="text"
                    placeholder="Enter Ticket ID (e.g. EF-2026-EXP-AR01)"
                    value={scannedCode}
                    onChange={(e) => setScannedCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleValidateAndCheckIn()}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#0B1120]/90 border border-[#382F27] text-white placeholder-[#6B6252] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                  <button
                    onClick={() => handleValidateAndCheckIn()}
                    className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-[#0B1120] font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>Check In</span>
                  </button>
                </div>

                {/* Test Fast Clicks */}
                {sampleTestTickets.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#241E17] text-left">
                    <span className="text-[10px] uppercase font-mono text-[#8C8272] font-bold block mb-1.5">
                      Fast-Simulate Active Attendee Passes:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {sampleTestTickets.map((t) => (
                        <button
                          key={t.ticketId}
                          onClick={() => handleValidateAndCheckIn(t.ticketId)}
                          className="px-2.5 py-1 rounded-lg bg-[#241E17] hover:bg-teal-900/60 hover:border-teal-500 text-[11px] font-mono text-[#C9BBA0] border border-[#382F27] transition-all cursor-pointer"
                        >
                          {t.ticketId} ({t.attendeeName.split(" ")[0]})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Scan Feedback Outcome Card */}
              {scanResult && (
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    scanResult.valid
                      ? "bg-emerald-50/90 border-emerald-200 text-emerald-950"
                      : "bg-rose-50/90 border-rose-200 text-rose-950"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        scanResult.valid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {scanResult.valid ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider font-mono">
                          {scanResult.valid ? "ADMISSION APPROVED" : "SCAN REJECTED"}
                        </span>
                        <span className="text-[10px] text-[#6B6252] font-mono">
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs font-semibold">{scanResult.message}</p>

                      {scanResult.ticket && (
                        <div className="mt-2 pt-2 border-t border-emerald-200/60 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                          <div>
                            <span className="text-[#6B6252] block">Attendee:</span>
                            <strong className="text-[#0B1120]">{scanResult.ticket.attendeeName}</strong>
                          </div>
                          <div>
                            <span className="text-[#6B6252] block">Seat/Tier:</span>
                            <strong className="text-[#0B1120]">{scanResult.ticket.seat}</strong>
                          </div>
                          <div>
                            <span className="text-[#6B6252] block">Designated Gate:</span>
                            <strong className="text-[#0B1120]">{scanResult.ticket.assignedGate}</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Scan History Feed */}
              <div>
                <h3 className="text-xs font-bold text-[#241E17] uppercase tracking-wider font-mono mb-3">
                  Station Scan Audit Log
                </h3>
                {recentScans.length === 0 ? (
                  <p className="text-xs text-[#8C8272] py-3 text-center bg-[#F4F8FF] rounded-xl border border-[#F7FAFF]">
                    No tickets scanned in current session yet.
                  </p>
                ) : (
                  <div className="divide-y divide-[#F7FAFF] bg-[#F4F8FF]/70 rounded-2xl border border-[#C9D9F7]/80 overflow-hidden">
                    {recentScans.map((item, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.valid ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          <span className="font-mono font-bold text-[#241E17]">{item.ticketId}</span>
                          <span className="text-[#6B6252] truncate max-w-[120px]">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[#4A4236] text-[11px]">{item.seat}</span>
                          <span className="text-[#8C8272] font-mono text-[10px]">{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Incident Dispatch & Broadcast Feed (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Dispatch Incident to Command Center */}
            <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-blue-500" />
                <h2 className="text-base font-bold text-[#0B1120] font-heading">
                  Field Incident Dispatch
                </h2>
              </div>
              <p className="text-xs text-[#6B6252] leading-relaxed">
                Direct telemetry uplink to Organizer Command Center. Dispatched alerts trigger live operational routing.
              </p>

              {incidentNotice && (
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{incidentNotice}</span>
                </div>
              )}

              <form onSubmit={handleDispatchIncident} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[#382F27] block mb-1">
                    Incident Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Turnstile 3 Lane Congestion / Lost Bag"
                    value={incidentTitle}
                    onChange={(e) => setIncidentTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7] text-xs text-[#0B1120] focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(["INFO", "WARNING", "CRITICAL"] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setIncidentSeverity(sev)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        incidentSeverity === sev
                          ? sev === "CRITICAL"
                            ? "bg-rose-600 text-white"
                            : sev === "WARNING"
                            ? "bg-blue-500 text-white"
                            : "bg-[#4F7CFF] text-white"
                          : "bg-[#F7FAFF] text-[#4A4236] hover:bg-[#C9D9F7]"
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#382F27] block mb-1">
                    Situation Details
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Describe situation and assistance needed..."
                    value={incidentMessage}
                    onChange={(e) => setIncidentMessage(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7] text-xs text-[#0B1120] focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Broadcast to Command Center</span>
                </button>
              </form>
            </div>

            {/* Command Center Live Broadcast Feed */}
            <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-[#4F7CFF]" />
                  <h3 className="text-sm font-bold text-[#0B1120] font-heading">
                    Command Broadcast Feed
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#8C8272]">LIVE FEED</span>
              </div>

              <div className="space-y-2.5">
                {(liveState?.activeAlerts || []).length === 0 ? (
                  <p className="text-xs text-[#6B6252] py-3 text-center bg-[#F4F8FF] rounded-xl">
                    All sectors operating under normal conditions. No active advisories.
                  </p>
                ) : (
                  (liveState?.activeAlerts || []).slice(0, 3).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                        alert.severity === "CRITICAL"
                          ? "bg-rose-50 border-rose-200 text-rose-950"
                          : alert.severity === "WARNING"
                          ? "bg-blue-50 border-blue-200 text-blue-950"
                          : "bg-[#F7FAFF] border-[#C9D9F7] text-[#0B1120]"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{alert.title}</span>
                        <span className="text-[10px] font-mono opacity-80">{alert.severity}</span>
                      </div>
                      <p className="text-[11px] opacity-90 leading-relaxed">{alert.message}</p>
                      <div className="text-[10px] opacity-70 pt-1">Target: {alert.affectedArea}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

