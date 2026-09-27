import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  HeartPulse,
  Plus,
  Clock,
  CheckCircle2,
  PhoneCall,
  Search,
  Sparkles,
  Ambulance,
  ShieldAlert,
  UserCheck,
  Building,
} from "lucide-react";
import { OperatorLayout } from "../../components/operator/OperatorLayout";
import { useAuth } from "../../context/AuthContext";
import { OperatorUser } from "../../types/auth";

export interface MedicalLogRecord {
  id: string;
  reportedAt: string;
  location: string;
  description: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "Triaged" | "In Treatment" | "Dispatched" | "Resolved";
  triageStaff: string;
  actionsTaken: string;
}

const STORAGE_KEY = "eventflow_medical_incidents";

function getStoredIncidents(): MedicalLogRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  const initialIncidents: MedicalLogRecord[] = [
    {
      id: "med-inc-01",
      reportedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      location: "East Concourse Section B",
      description: "Severe dehydration and mild heat exhaustion reported by attendee near gate.",
      severity: "Medium",
      status: "In Treatment",
      triageStaff: "Dr. Aanya Sharma",
      actionsTaken: "Administered oral electrolytes and placed in air-cooled recovery station.",
    },
    {
      id: "med-inc-02",
      reportedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      location: "West Stand Level 2",
      description: "Minor ankle sprain while descending stairwell aisle.",
      severity: "Low",
      status: "Resolved",
      triageStaff: "Paramedic Rahul",
      actionsTaken: "Applied compression bandage and cold pack. Attendee ambulatory.",
    },
    {
      id: "med-inc-03",
      reportedAt: new Date(Date.now() - 1800000).toISOString(),
      location: "Grand Stand Gate 3",
      description: "Attendee experiencing acute chest tightness and shortness of breath.",
      severity: "Critical",
      status: "Dispatched",
      triageStaff: "Emergency Response Unit 1",
      actionsTaken: "Oxygen provided, vitals stabilized. Advanced cardiac life support ambulance dispatched to Lilavati Hospital.",
    },
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialIncidents));
  return initialIncidents;
}

export const OperatorIncidentsPage: React.FC = () => {
  const { user } = useAuth();
  const operatorUser = user as OperatorUser | null;

  const [incidents, setIncidents] = useState<MedicalLogRecord[]>(getStoredIncidents());
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form State
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"Low" | "Medium" | "High" | "Critical">("Medium");
  const [triageStaff, setTriageStaff] = useState("Dr. Aanya Sharma");
  const [actionsTaken, setActionsTaken] = useState("");

  const saveIncidents = (updated: MedicalLogRecord[]) => {
    setIncidents(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newInc: MedicalLogRecord = {
      id: `med-inc-${Date.now()}`,
      reportedAt: new Date().toISOString(),
      location: location.trim() || "West Stand Main Concourse",
      description: description.trim(),
      severity,
      status: severity === "Critical" ? "Dispatched" : "Triaged",
      triageStaff: triageStaff.trim() || "Active Medical Officer",
      actionsTaken: actionsTaken.trim() || "Initial triage assessment recorded.",
    };

    saveIncidents([newInc, ...incidents]);
    setIsModalOpen(false);
    setLocation("");
    setDescription("");
    setActionsTaken("");
    setFeedback("New medical incident logged successfully.");
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleUpdateStatus = (id: string, newStatus: MedicalLogRecord["status"]) => {
    const updated = incidents.map((inc) => (inc.id === id ? { ...inc, status: newStatus } : inc));
    saveIncidents(updated);
    setFeedback(`Incident marked as ${newStatus}`);
    setTimeout(() => setFeedback(null), 2500);
  };

  const filtered = incidents.filter((inc) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      inc.description.toLowerCase().includes(q) ||
      inc.location.toLowerCase().includes(q) ||
      inc.triageStaff.toLowerCase().includes(q);
    const matchSeverity = severityFilter === "ALL" || inc.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

  const totalIncidents = incidents.length;
  const criticalCount = incidents.filter((i) => i.severity === "Critical").length;
  const inTreatmentCount = incidents.filter((i) => i.status === "In Treatment" || i.status === "Triaged").length;
  const resolvedCount = incidents.filter((i) => i.status === "Resolved").length;

  return (
    <OperatorLayout
      title="Medical Incident Logs & Triage Post"
      subtitle="Record attendee medical emergencies, monitor first-aid treatment stations, and track ambulance dispatches."
    >
      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Total Incidents</span>
            <div className="p-2 rounded-xl bg-[#F7FAFF] text-[#4F7CFF]">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0B1120] mt-2 font-heading">{totalIncidents}</p>
          <p className="text-xs text-[#6B6252] mt-0.5">Recorded across all event zones</p>
        </div>

        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Active in Care</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-2 font-heading">{inTreatmentCount}</p>
          <p className="text-xs text-[#6B6252] mt-0.5">Under active observation</p>
        </div>

        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Critical / Dispatched</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-700 mt-2 font-heading">{criticalCount}</p>
          <p className="text-xs text-[#6B6252] mt-0.5">Hospital ambulances deployed</p>
        </div>

        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Resolved Cases</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2 font-heading">{resolvedCount}</p>
          <p className="text-xs text-[#6B6252] mt-0.5">Treated and safely discharged</p>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-600">✕</button>
        </div>
      )}

      {/* Filter and Action Bar */}
      <div className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7]/80 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 text-[#8C8272] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search incidents by location, symptoms, doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs font-medium text-[#382F27] focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Report Medical Incident</span>
        </button>
      </div>

      {/* Incidents Card Grid */}
      <div className="space-y-3">
        {filtered.map((inc) => (
          <div
            key={inc.id}
            className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7]/80 p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    inc.severity === "Critical"
                      ? "bg-rose-100 text-rose-800 border border-rose-300 animate-pulse"
                      : inc.severity === "High"
                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                      : inc.severity === "Medium"
                      ? "bg-[#EDE3CB] text-[#6b5024] border border-[#C9D9F7]"
                      : "bg-[#F7FAFF] text-[#382F27] border border-[#C9D9F7]"
                  }`}
                >
                  {inc.severity} Severity
                </span>
                <span className="text-xs font-bold text-[#241E17]">{inc.location}</span>
                <span className="text-[#C9BBA0]">•</span>
                <span className="text-[11px] text-[#8C8272]">
                  {new Date(inc.reportedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  inc.status === "Resolved"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : inc.status === "In Treatment"
                    ? "bg-[#F7FAFF] text-[#2D5FD2] border border-[#C9D9F7]"
                    : inc.status === "Dispatched"
                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                {inc.status}
              </span>
            </div>

            <p className="text-xs text-[#382F27] leading-relaxed font-medium">{inc.description}</p>

            <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7]/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-[#4A4236]">Attending Officer:</span>{" "}
                <strong className="text-[#241E17]">{inc.triageStaff}</strong>
                {inc.actionsTaken && (
                  <p className="text-[11px] text-[#6B6252] mt-0.5">
                    <strong>Action:</strong> {inc.actionsTaken}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {inc.status !== "In Treatment" && inc.status !== "Resolved" && (
                  <button
                    onClick={() => handleUpdateStatus(inc.id, "In Treatment")}
                    className="px-2.5 py-1 rounded-lg bg-[#F7FAFF] hover:bg-[#EDE3CB] text-[#2D5FD2] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Start Treatment
                  </button>
                )}
                {inc.status !== "Resolved" && (
                  <button
                    onClick={() => handleUpdateStatus(inc.id, "Resolved")}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolve</span>
                  </button>
                )}
                {inc.severity === "Critical" && inc.status !== "Dispatched" && (
                  <button
                    onClick={() => handleUpdateStatus(inc.id, "Dispatched")}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Ambulance className="w-3.5 h-3.5" />
                    <span>Dispatch Ambulance</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Incident Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F0E9D6] rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#C9D9F7] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#F7FAFF]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0B1120] font-heading">Report Medical Incident</h3>
                  <p className="text-xs text-[#6B6252]">Record a patient casualty or first-aid triage request</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#8C8272] hover:text-[#4A4236]">✕</button>
            </div>

            <form onSubmit={handleCreateIncident} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#382F27] mb-1">Incident Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. West Stand Gate 3"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#382F27] mb-1">Severity Level</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none"
                  >
                    <option value="Low">Low (Minor cut / bruise)</option>
                    <option value="Medium">Medium (Dehydration / sprain)</option>
                    <option value="High">High (Fainting / deep laceration)</option>
                    <option value="Critical">Critical (Cardiac / Trauma / Ambulance needed)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#382F27] mb-1">Incident Symptoms & Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe patient condition, symptoms observed, vital signs..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#382F27] mb-1">Attending Staff</label>
                  <input
                    type="text"
                    placeholder="Doctor / Paramedic Name"
                    value={triageStaff}
                    onChange={(e) => setTriageStaff(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#382F27] mb-1">Initial Action Taken</label>
                  <input
                    type="text"
                    placeholder="e.g. Oxygen administered, cold pack applied"
                    value={actionsTaken}
                    onChange={(e) => setActionsTaken(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F7FAFF]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#4A4236] hover:bg-[#F7FAFF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Log Medical Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </OperatorLayout>
  );
};
