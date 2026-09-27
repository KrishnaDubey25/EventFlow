import React, { useState, useEffect } from "react";
import {
  Wrench,
  HardHat,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Sparkles,
  Zap,
  Building,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import { OperatorLayout } from "../../components/operator/OperatorLayout";
import { useAuth } from "../../context/AuthContext";
import { OperatorUser } from "../../types/auth";

export interface VenueTicketItem {
  id: string;
  reportedAt: string;
  serviceArea: string;
  category: string;
  issueDescription: string;
  priority: "Urgent" | "High" | "Medium" | "Low" | "Blocker";
  status: "Open" | "In Progress" | "Resolved" | "Escalated";
  assignedTech: string;
}

const STORAGE_KEY = "eventflow_venue_issues";

function getStoredIssues(): VenueTicketItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  const initialIssues: VenueTicketItem[] = [
    {
      id: "venue-iss-01",
      reportedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      serviceArea: "Concourse Main Soundboard",
      category: "Electrical",
      issueDescription: "Secondary power circuit breaker trip on auxiliary PA speaker array.",
      priority: "Urgent",
      status: "In Progress",
      assignedTech: "Vikram electrical crew",
    },
    {
      id: "venue-iss-02",
      reportedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      serviceArea: "Gate 4 Restroom Block B",
      category: "Sanitation",
      issueDescription: "Water pressure drop on secondary supply manifold.",
      priority: "Medium",
      status: "Resolved",
      assignedTech: "Plumbing taskforce",
    },
    {
      id: "venue-iss-03",
      reportedAt: new Date(Date.now() - 1800000).toISOString(),
      serviceArea: "West Concourse Truss Rigging",
      category: "Structural",
      issueDescription: "Cable safety tension clamp calibration required before spotlight repositioning.",
      priority: "Urgent",
      status: "Open",
      assignedTech: "Stage Rigging Unit",
    },
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialIssues));
  return initialIssues;
}

export const OperatorIssuesPage: React.FC = () => {
  const { user } = useAuth();
  const operatorUser = user as OperatorUser | null;

  const [issues, setIssues] = useState<VenueTicketItem[]>(getStoredIssues());
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form State
  const [serviceArea, setServiceArea] = useState("");
  const [category, setCategory] = useState("Electrical");
  const [issueDescription, setIssueDescription] = useState("");
  const [priority, setPriority] = useState<any>("Medium");
  const [assignedTech, setAssignedTech] = useState("On-Duty Tech Team");

  const saveIssues = (updated: VenueTicketItem[]) => {
    setIssues(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueDescription.trim()) return;

    const newIssue: VenueTicketItem = {
      id: `venue-iss-${Date.now()}`,
      reportedAt: new Date().toISOString(),
      serviceArea: serviceArea.trim() || "Main Concourse",
      category,
      issueDescription: issueDescription.trim(),
      priority,
      status: "Open",
      assignedTech: assignedTech.trim() || "Technical Crew",
    };

    saveIssues([newIssue, ...issues]);
    setIsModalOpen(false);
    setServiceArea("");
    setIssueDescription("");
    setFeedback("Maintenance work order created.");
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleUpdateStatus = (id: string, newStatus: VenueTicketItem["status"]) => {
    const updated = issues.map((iss) => (iss.id === id ? { ...iss, status: newStatus } : iss));
    saveIssues(updated);
    setFeedback(`Issue updated to "${newStatus}"`);
    setTimeout(() => setFeedback(null), 2500);
  };

  const filtered = issues.filter((iss) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      iss.issueDescription.toLowerCase().includes(q) ||
      iss.serviceArea.toLowerCase().includes(q) ||
      iss.category.toLowerCase().includes(q);
    const matchPriority = priorityFilter === "ALL" || iss.priority === priorityFilter;
    return matchSearch && matchPriority;
  });

  const totalIssues = issues.length;
  const openCount = issues.filter((i) => i.status === "Open").length;
  const inProgressCount = issues.filter((i) => i.status === "In Progress").length;
  const resolvedCount = issues.filter((i) => i.status === "Resolved").length;

  return (
    <OperatorLayout
      title="Venue Maintenance & Issue Tracking"
      subtitle="Log technical repairs, manage power/rigging tasks, assign maintenance crews, and clear facilities."
    >
      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Total Tasks</span>
            <div className="p-2 rounded-xl bg-[#F7FAFF] text-[#4F7CFF]">
              <HardHat className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0B1120] mt-2 font-heading">{totalIssues}</p>
          <p className="text-xs text-[#6B6252] mt-0.5">Recorded work orders</p>
        </div>

        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Open Requests</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-2 font-heading">{openCount}</p>
          <p className="text-xs text-[#6B6252] mt-0.5">Awaiting dispatch</p>
        </div>

        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Under Repair</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-indigo-700 mt-2 font-heading">{inProgressCount}</p>
          <p className="text-xs text-[#6B6252] mt-0.5">Crews currently on-site</p>
        </div>

        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Resolved & Tested</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2 font-heading">{resolvedCount}</p>
          <p className="text-xs text-[#6B6252] mt-0.5">Cleared for event operation</p>
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
              placeholder="Search work orders by location, description, system..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs font-medium text-[#382F27] focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="Blocker">Blocker</option>
            <option value="Urgent">Urgent</option>
            <option value="Medium">Medium</option>
            <option value="Minor">Minor</option>
          </select>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Report Maintenance Issue</span>
        </button>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {filtered.map((iss) => (
          <div
            key={iss.id}
            className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7]/80 p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    iss.priority === "Blocker"
                      ? "bg-rose-100 text-rose-800 border border-rose-300 animate-pulse"
                      : iss.priority === "Urgent"
                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                      : "bg-[#F7FAFF] text-[#382F27] border border-[#C9D9F7]"
                  }`}
                >
                  {iss.priority} Priority
                </span>
                <span className="text-xs font-bold text-[#241E17]">{iss.serviceArea}</span>
                <span className="text-[#C9BBA0]">•</span>
                <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  {iss.category}
                </span>
              </div>

              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  iss.status === "Resolved"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : iss.status === "In Progress"
                    ? "bg-[#F7FAFF] text-[#2D5FD2] border border-[#C9D9F7]"
                    : iss.status === "Escalated"
                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                {iss.status}
              </span>
            </div>

            <p className="text-xs text-[#382F27] font-medium">{iss.issueDescription}</p>

            <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7]/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-[#4A4236]">Assigned Unit:</span>{" "}
                <strong className="text-[#241E17]">{iss.assignedTech}</strong>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {iss.status !== "In Progress" && iss.status !== "Resolved" && (
                  <button
                    onClick={() => handleUpdateStatus(iss.id, "In Progress")}
                    className="px-2.5 py-1 rounded-lg bg-[#F7FAFF] hover:bg-[#EDE3CB] text-[#2D5FD2] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Start Work
                  </button>
                )}
                {iss.status !== "Resolved" && (
                  <button
                    onClick={() => handleUpdateStatus(iss.id, "Resolved")}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete & Clear</span>
                  </button>
                )}
                {iss.status !== "Escalated" && iss.status !== "Resolved" && (
                  <button
                    onClick={() => handleUpdateStatus(iss.id, "Escalated")}
                    className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Escalate</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F0E9D6] rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#C9D9F7] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#F7FAFF]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0B1120] font-heading">Report Maintenance Request</h3>
                  <p className="text-xs text-[#6B6252]">Dispatch technical team to resolve ground defect</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#8C8272] hover:text-[#4A4236]">✕</button>
            </div>

            <form onSubmit={handleCreateIssue} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#382F27] mb-1">Service Area / Zone *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. North Concourse Lighting"
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#382F27] mb-1">Service Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none"
                  >
                    <option value="Electrical">Electrical & Power</option>
                    <option value="Rigging">Stage Rigging & AV</option>
                    <option value="Sanitation">Sanitation & Water</option>
                    <option value="HVAC">HVAC & Ventilation</option>
                    <option value="Structural">Structural & Barrier</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#382F27] mb-1">Defect Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the failure observed, exact location, equipment model..."
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#382F27] mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none"
                  >
                    <option value="Minor">Minor (Non-urgent)</option>
                    <option value="Medium">Medium (Attention required)</option>
                    <option value="Urgent">Urgent (Immediate fix needed)</option>
                    <option value="Blocker">Blocker (Safety or event hazard)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#382F27] mb-1">Assigned Unit</label>
                  <input
                    type="text"
                    placeholder="Crew or contractor name"
                    value={assignedTech}
                    onChange={(e) => setAssignedTech(e.target.value)}
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
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Create Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </OperatorLayout>
  );
};
