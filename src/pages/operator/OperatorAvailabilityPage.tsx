import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Search,
  Filter,
} from "lucide-react";
import { OperatorLayout } from "../../components/operator/OperatorLayout";
import { useAuth } from "../../context/AuthContext";
import { OperatorUser, normalizeOperatorType } from "../../types/auth";
import {
  getOperatorResources,
  updateOperatorResource,
} from "../../services/operatorResourceService";
import { OperatorResourceRecord } from "../../types/operator";

export const OperatorAvailabilityPage: React.FC = () => {
  const { user } = useAuth();
  const operatorUser = user as OperatorUser | null;
  const operatorId = user?.id || "";
  const operatorType = normalizeOperatorType(operatorUser?.operatorType);

  const [resources, setResources] = useState<OperatorResourceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadResources = () => {
    const list = getOperatorResources(operatorId, operatorType);
    setResources(list);
  };

  useEffect(() => {
    loadResources();
    const handleUpdate = () => loadResources();
    window.addEventListener("eventflow_live_state_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("eventflow_live_state_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [operatorId, operatorType]);

  const handleToggleStatus = (res: OperatorResourceRecord, newStatus: "ACTIVE" | "INACTIVE" | "MAINTENANCE") => {
    updateOperatorResource(operatorId, res.id, {
      status: newStatus,
      notes: `Operating status set to ${newStatus}`,
    });

    setFeedback(`Set "${res.name}" status to ${newStatus}`);
    setTimeout(() => setFeedback(null), 2500);
    loadResources();
  };

  const filtered = resources.filter((r) => {
    const q = searchQuery.toLowerCase();
    return r.name.toLowerCase().includes(q) || (r.location && r.location.toLowerCase().includes(q));
  });

  const activeCount = resources.filter((r) => r.status === "ACTIVE").length;
  const maintenanceCount = resources.filter((r) => r.status === "MAINTENANCE").length;
  const inactiveCount = resources.filter((r) => r.status === "INACTIVE").length;

  return (
    <OperatorLayout
      title="Live Availability Matrix"
      subtitle="Instantly publish, suspend, or put your resources under maintenance across attendee and organizer portals."
    >
      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Available / Active</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2 font-heading">{activeCount}</p>
          <p className="text-xs text-[#6B6252] mt-0.5">Visible to attendees and bookable</p>
        </div>

        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Under Maintenance</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-2 font-heading">{maintenanceCount}</p>
          <p className="text-xs text-[#6B6252] mt-0.5">Temporarily suspended for service</p>
        </div>

        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Offline / Inactive</span>
            <div className="p-2 rounded-xl bg-[#F7FAFF] text-[#4A4236]">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#382F27] mt-2 font-heading">{inactiveCount}</p>
          <p className="text-xs text-[#6B6252] mt-0.5">Not taking bookings or passenger trips</p>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-600">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7]/80 p-4 shadow-2xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8C8272] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search resources by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF]"
          />
        </div>

        <div className="text-xs text-[#6B6252] font-medium hidden sm:flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Updates immediately reflect on public attendee booking cards</span>
        </div>
      </div>

      {/* Availability Matrix Grid */}
      <div className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7]/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F8FF]/70 border-b border-[#C9D9F7] text-[11px] font-bold uppercase tracking-wider text-[#6B6252]">
                <th className="py-3.5 px-4">Resource & Location</th>
                <th className="py-3.5 px-4">Capacity Load</th>
                <th className="py-3.5 px-4">Current Mode</th>
                <th className="py-3.5 px-4 text-right">Quick Mode Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F7FAFF] text-xs">
              {filtered.map((res) => {
                const isOnline = res.status === "ACTIVE";
                const isMaint = res.status === "MAINTENANCE";

                return (
                  <tr key={res.id} className="hover:bg-[#F4F8FF]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#0B1120]">{res.name}</p>
                      <p className="text-[11px] text-[#6B6252]">{res.location || "On-site Sector"}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#241E17]">
                        {res.occupiedCapacity || 0} / {res.capacity} units
                      </span>
                      <p className="text-[10px] text-[#8C8272]">
                        {Math.max(0, res.capacity - (res.occupiedCapacity || 0))} available right now
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isOnline
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isMaint
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-[#F7FAFF] text-[#4A4236] border border-[#C9D9F7]"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOnline ? "bg-emerald-500" : isMaint ? "bg-blue-500" : "bg-[#8C8272]"
                          }`}
                        />
                        {res.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(res, "ACTIVE")}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            isOnline
                              ? "bg-emerald-600 text-white shadow-2xs"
                              : "bg-[#F7FAFF] text-[#4A4236] hover:bg-emerald-50 hover:text-emerald-700"
                          }`}
                        >
                          Available
                        </button>
                        <button
                          onClick={() => handleToggleStatus(res, "MAINTENANCE")}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            isMaint
                              ? "bg-blue-600 text-white shadow-2xs"
                              : "bg-[#F7FAFF] text-[#4A4236] hover:bg-blue-50 hover:text-blue-700"
                          }`}
                        >
                          Maintenance
                        </button>
                        <button
                          onClick={() => handleToggleStatus(res, "INACTIVE")}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            res.status === "INACTIVE"
                              ? "bg-[#241E17] text-white shadow-2xs"
                              : "bg-[#F7FAFF] text-[#4A4236] hover:bg-rose-50 hover:text-rose-700"
                          }`}
                        >
                          Offline
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </OperatorLayout>
  );
};
