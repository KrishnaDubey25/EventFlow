import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Radio,
  Check,
  Filter,
  Layers,
  ArrowRight,
  Zap,
  Play,
  RotateCcw,
} from "lucide-react";
import { OperatorLayout } from "../../components/operator/OperatorLayout";
import { useAuth } from "../../context/AuthContext";
import {
  getOperatorAlerts,
  getAcknowledgedAlertIds,
  acknowledgeAlert,
  getOperatorEvents,
} from "../../services/operatorAssignmentService";
import {
  getStoredActions,
  updateActionStatus,
} from "../../services/operationalActionService";
import { OperationalAlert, AlertSeverity } from "../../types/operational";
import { OperationalActionRecord, OperationalActionStatus } from "../../types/intelligence";

export const OperatorAlertsPage: React.FC = () => {
  const { user } = useAuth();
  const operatorId = user?.id || "";

  const [filter, setFilter] = useState<"all" | "active" | "acknowledged">("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [operationalActions, setOperationalActions] = useState<OperationalActionRecord[]>([]);

  const assignedEvents = getOperatorEvents(operatorId);
  const primaryEventId = assignedEvents[0]?.id;

  const loadActions = () => {
    const all = getStoredActions();
    if (primaryEventId) {
      setOperationalActions(all.filter((a) => a.eventId === primaryEventId));
    } else {
      setOperationalActions(all);
    }
  };

  useEffect(() => {
    loadActions();
    const handleUpdate = () => {
      setRefreshKey((k) => k + 1);
      loadActions();
    };
    window.addEventListener("eventflow_live_state_updated", handleUpdate);
    window.addEventListener("eventflow_action_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("eventflow_live_state_updated", handleUpdate);
      window.removeEventListener("eventflow_action_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [primaryEventId]);

  const handleUpdateAction = (actionId: string, status: OperationalActionStatus) => {
    updateActionStatus(actionId, status);
    loadActions();
  };

  const alerts = getOperatorAlerts(operatorId);
  const ackedIds = getAcknowledgedAlertIds(operatorId);

  const handleAcknowledge = (alertId: string) => {
    acknowledgeAlert(operatorId, alertId);
    setRefreshKey((k) => k + 1);
  };

  const filteredAlerts = alerts.filter((a) => {
    const isAcked = ackedIds.includes(a.id);
    if (filter === "active") return !isAcked && a.status === "ACTIVE";
    if (filter === "acknowledged") return isAcked;
    return true;
  });

  const getSeverityBadge = (sev: AlertSeverity) => {
    switch (sev) {
      case "CRITICAL":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
            CRITICAL
          </span>
        );
      case "WARNING":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
            WARNING
          </span>
        );
      case "NOTICE":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EDE3CB] text-[#6b5024] border border-[#C9D9F7]">
            NOTICE
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F7FAFF] text-[#241E17] border border-[#C9D9F7]">
            INFO
          </span>
        );
    }
  };

  return (
    <OperatorLayout
      title="Operational Alerts"
      subtitle="Broadcast notifications affecting your assigned operational zones."
    >
      {/* Header & Filter Tabs */}
      <div className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7] p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filter === "all"
                ? "bg-[#0B1120] text-white shadow-xs"
                : "bg-[#F4F8FF] text-[#4A4236] hover:bg-[#F7FAFF] border border-[#C9D9F7]"
            }`}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filter === "active"
                ? "bg-[#0B1120] text-white shadow-xs"
                : "bg-[#F4F8FF] text-[#4A4236] hover:bg-[#F7FAFF] border border-[#C9D9F7]"
            }`}
          >
            Unacknowledged ({alerts.filter((a) => !ackedIds.includes(a.id) && a.status === "ACTIVE").length})
          </button>
          <button
            onClick={() => setFilter("acknowledged")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filter === "acknowledged"
                ? "bg-[#0B1120] text-white shadow-xs"
                : "bg-[#F4F8FF] text-[#4A4236] hover:bg-[#F7FAFF] border border-[#C9D9F7]"
            }`}
          >
            Acknowledged ({alerts.filter((a) => ackedIds.includes(a.id)).length})
          </button>
        </div>

        <span className="text-xs text-[#6B6252] font-medium">
          Real-time feed from Command Center
        </span>
      </div>

      {/* ASSIGNED OPERATIONAL DIRECTIVES (EVENTFLOW LOOP) */}
      <div className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7] p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F7FAFF]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F7FAFF] text-[#4F7CFF] flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0B1120] font-heading">
                Tactical Directives & Assigned Actions
              </h3>
              <p className="text-xs text-[#6B6252]">
                Directives issued from EventFlow Command. Update status to propagate operational results to Organizer & Attendees.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#2D5FD2] bg-[#F7FAFF] px-2.5 py-0.5 rounded-full border border-[#C9D9F7]">
            {operationalActions.length} Assigned Actions
          </span>
        </div>

        {operationalActions.length === 0 ? (
          <p className="text-xs text-[#6B6252] italic py-2">No pending operational directives assigned.</p>
        ) : (
          <div className="space-y-3">
            {operationalActions.map((action) => (
              <div
                key={action.actionId}
                className="p-4 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border ${
                        action.status === "VERIFIED" || action.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : action.status === "IN_PROGRESS"
                          ? "bg-[#EDE3CB] text-[#6b5024] border-[#6EA8FF]"
                          : action.status === "APPROVED"
                          ? "bg-purple-100 text-purple-800 border-purple-300"
                          : "bg-blue-100 text-blue-800 border-blue-300"
                      }`}
                    >
                      {action.status}
                    </span>
                    <span className="text-[10px] font-mono text-[#8C8272]">ID: {action.actionId}</span>
                    <span className="text-[10px] font-mono uppercase text-[#4A4236] bg-[#F0E9D6] px-1.5 py-0.5 rounded border border-[#C9D9F7]">
                      {action.category}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#0B1120] font-heading">{action.title}</h4>
                  <p className="text-xs text-[#4A4236] leading-relaxed">{action.description}</p>

                  {action.postActionMetric && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-0.5">
                      <strong className="block font-bold">✓ Field Impact Verified</strong>
                      <p className="text-[11px] text-emerald-800">{action.postActionMetric.impactSummary}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {action.status === "PROPOSED" && (
                    <button
                      onClick={() => handleUpdateAction(action.actionId, "APPROVED")}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Approve Action
                    </button>
                  )}

                  {action.status === "APPROVED" && (
                    <button
                      onClick={() => handleUpdateAction(action.actionId, "IN_PROGRESS")}
                      className="px-3 py-1.5 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Execution</span>
                    </button>
                  )}

                  {action.status === "IN_PROGRESS" && (
                    <button
                      onClick={() => handleUpdateAction(action.actionId, "COMPLETED")}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Deployed & Verify</span>
                    </button>
                  )}

                  {(action.status === "COMPLETED" || action.status === "VERIFIED") && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Closed & Verified</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7] p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#0B1120] font-heading">No active alerts for your resources</h3>
            <p className="text-xs text-[#6B6252] max-w-sm mx-auto mt-1">
              All assigned sectors and transport routes are operating normally without active advisories.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isAcked = ackedIds.includes(alert.id);

            return (
              <div
                key={alert.id}
                className={`bg-[#F0E9D6] rounded-2xl border p-5 shadow-xs transition-all ${
                  isAcked ? "border-[#C9D9F7]/60 opacity-80" : "border-[#C9BBA0] ring-1 ring-[#4F7CFF]/10"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getSeverityBadge(alert.severity)}
                      <span className="text-xs font-bold text-[#4A4236] bg-[#F7FAFF] px-2 py-0.5 rounded">
                        {alert.alertType}
                      </span>
                      {alert.affectedArea && (
                        <span className="text-xs font-medium text-[#6b5024] bg-[#F7FAFF] px-2 py-0.5 rounded border border-[#C9D9F7]/50">
                          Sector: {alert.affectedArea}
                        </span>
                      )}
                      <span className="text-[#8C8272] text-xs flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(alert.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-[#0B1120] font-heading">{alert.title}</h4>
                    <p className="text-xs text-[#4A4236] leading-relaxed max-w-3xl">
                      {alert.message}
                    </p>

                    <div className="pt-2 text-[11px] text-[#8C8272]">
                      Published by <strong className="text-[#382F27]">{alert.createdBy}</strong> for{" "}
                      <span className="font-semibold text-[#382F27]">{alert.audience}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {isAcked ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F7FAFF] text-[#4A4236] text-xs font-bold">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Acknowledged</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#4F7CFF] text-white text-xs font-bold transition-all shadow-xs shadow-[#4F7CFF]/20"
                      >
                        <Check className="w-4 h-4" />
                        <span>Mark Acknowledged</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </OperatorLayout>
  );
};
