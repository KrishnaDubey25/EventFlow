import { LiveVenueLink } from "../../components/live/LiveVenueLink";
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Layers,
  Truck,
  Car,
  UtensilsCrossed,
  HeartPulse,
  Building,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sliders,
  Save,
  MapPinned,
  ListChecks,
} from "lucide-react";
import { OperatorLayout } from "../../components/operator/OperatorLayout";
import { useAuth } from "../../context/AuthContext";
import { getStoredEventById } from "../../services/eventStorageService";
import {
  getOperatorAssignedResources,
  updateOperatorResourceState,
  getOperatorActionLogs,
} from "../../services/operatorAssignmentService";
import { ResolvedOperatorResource, OperatorResourceType } from "../../types/operator";
import { getFieldAssignments, getHelpRequests, updateFieldAssignment, updateHelpRequest } from "../../services/eventCollaborationService";

export const OperatorEventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const operatorId = user?.id || "";
  const operatorName = user?.fullName || user?.name || "Operator";

  const [selectedType, setSelectedType] = useState<string>("all");
  const [feedback, setFeedback] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const event = eventId ? getStoredEventById(eventId) : null;
  const allAssigned = eventId ? getOperatorAssignedResources(operatorId, eventId) : [];
  const eventLogs = eventId ? getOperatorActionLogs(operatorId, eventId).slice(0, 6) : [];
  const fieldTasks = eventId ? getFieldAssignments(eventId).filter((task) => task.status !== "DONE") : [];
  const helpRequests = eventId ? getHelpRequests(eventId).filter((request) => request.status !== "RESOLVED") : [];

  useEffect(() => {
    const handleUpdate = () => setRefreshKey((k) => k + 1);
    window.addEventListener("eventflow_live_state_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("eventflow_collaboration_updated", handleUpdate);
    return () => {
      window.removeEventListener("eventflow_live_state_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("eventflow_collaboration_updated", handleUpdate);
    };
  }, []);

  if (!event) {
    return (
      <OperatorLayout title="Event Not Found">
        <div className="bg-[#F0E9D6] rounded-2xl p-12 text-center border border-[#C9D9F7]">
          <h3 className="text-base font-bold text-[#0B1120] font-heading">Event Not Found</h3>
          <p className="text-xs text-[#6B6252] mt-1">The specified event could not be located or was removed.</p>
          <Link
            to="/operators/events"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#4F7CFF] text-white text-xs font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assigned Events
          </Link>
        </div>
      </OperatorLayout>
    );
  }

  const filteredResources = allAssigned.filter((r) => {
    if (selectedType === "all") return true;
    return r.resource.type === selectedType;
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "transport":
        return Truck;
      case "parking":
        return Car;
      case "food":
        return UtensilsCrossed;
      case "medical":
        return HeartPulse;
      default:
        return Building;
    }
  };

  const handleQuickStatusChange = (
    resource: ResolvedOperatorResource,
    newStatus: string
  ) => {
    const res = updateOperatorResourceState(
      operatorId,
      operatorName,
      event.id,
      resource.resource.id,
      resource.resource.type,
      { status: newStatus }
    );

    if (res.success) {
      setFeedback({ msg: `Updated ${resource.resource.name} status to ${newStatus}`, type: "success" });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ msg: res.error || "Update failed", type: "error" });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <OperatorLayout
      title={event.name}
      subtitle={`Assigned Operational Resources for ${event.venue}`}
    >
      <div className="grid gap-3 lg:grid-cols-[auto_1fr]">
        <Link to={`/operators/events/${event.id}/venue-map`} className="inline-flex min-h-20 items-center gap-3 rounded-2xl border border-[#C9D9F7] bg-[#F0E9D6] px-4 py-3 text-[#0B1120] shadow-2xs hover:border-[#6EA8FF]">
          <span className="rounded-xl bg-[#4F7CFF]/10 p-2.5 text-[#4F7CFF]"><MapPinned className="h-5 w-5"/></span>
          <span><b className="block text-sm">Indoor live map</b><small className="text-[#6B6252]">Attendees · operators · routes</small></span>
        </Link>
        <div className="rounded-2xl border border-[#C9D9F7] bg-[#F0E9D6] p-3">
          <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><ListChecks className="h-4 w-4 text-[#4F7CFF]"/><b className="text-sm text-[#0B1120]">Field checklist</b></div><span className="rounded-full bg-[#0B1120] px-2 py-1 text-[10px] font-bold text-white">{fieldTasks.length + helpRequests.length}</span></div>
          {(fieldTasks.length || helpRequests.length) ? <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {helpRequests.slice(0,2).map(request => <div key={request.id} className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs"><b className="text-[#0B1120]">Help · {request.attendeeName}</b><div className="mt-1 text-[#6B6252]">{request.location.label} · {request.operatorLabel}</div><div className="mt-2 flex gap-2">{request.status==='NEW'&&<button onClick={()=>{updateHelpRequest(event.id,request.id,'ACKNOWLEDGED');setRefreshKey(k=>k+1);}} className="rounded-lg bg-[#4F7CFF] px-2 py-1 text-[10px] font-bold text-white">Acknowledge</button>}<button onClick={()=>{updateHelpRequest(event.id,request.id,'RESOLVED');setRefreshKey(k=>k+1);}} className="rounded-lg border border-amber-200 bg-white px-2 py-1 text-[10px] font-bold text-[#0B1120]">Resolved</button></div></div>)}
            {fieldTasks.slice(0,Math.max(0,4-helpRequests.length)).map(task => <div key={task.id} className="rounded-xl border border-[#C9D9F7] bg-white p-2.5 text-xs"><b className="text-[#0B1120]">{task.assigneeLabel}</b><div className="mt-1 text-[#6B6252]">{task.message}</div><div className="mt-2 flex gap-2">{task.status==='NEW'&&<button onClick={()=>{updateFieldAssignment(event.id,task.id,'ACKNOWLEDGED');setRefreshKey(k=>k+1);}} className="rounded-lg bg-[#4F7CFF] px-2 py-1 text-[10px] font-bold text-white">Acknowledge</button>}<button onClick={()=>{updateFieldAssignment(event.id,task.id,'DONE');setRefreshKey(k=>k+1);}} className="rounded-lg border border-[#C9D9F7] px-2 py-1 text-[10px] font-bold text-[#0B1120]">Done</button></div></div>)}
          </div> : <div className="mt-2 text-xs text-[#6B6252]">No active field tasks.</div>}
        </div>
      </div>
      <LiveVenueLink eventId={event.id} staff />
      {/* Back Link & Feedback Banner */}
      <div className="flex items-center justify-between">
        <Link
          to="/operators/events"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A4236] hover:text-[#0B1120] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </Link>

        {feedback && (
          <div
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedback.msg}</span>
          </div>
        )}
      </div>

      {/* Event Header Card */}
      <div className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7] overflow-hidden shadow-xs">
        <div className="relative h-44 sm:h-52 w-full bg-[#0B1120]">
          <img
            src={event.image}
            alt={event.name}
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/40 to-transparent" />

          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-md bg-[#4F7CFF]/30 text-[#C9D9F7] text-xs font-bold border border-[#4F7CFF]/30">
                {event.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight font-heading">
                {event.name}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#C9BBA0] mt-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  <span>{event.venue}, {event.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  <span>{event.time}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0B1120]/80 backdrop-blur-sm border border-[#382F27]/80 px-4 py-2.5 rounded-xl flex items-center gap-3 self-start sm:self-auto">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div>
                <span className="text-[10px] text-[#8C8272] uppercase font-bold tracking-wider block">
                  Your Scope
                </span>
                <span className="text-xs font-bold text-white">
                  {allAssigned.length} Assigned Services
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["all", "transport", "parking", "food", "medical", "other"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedType(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
              selectedType === cat
                ? "bg-[#0B1120] text-white shadow-xs"
                : "bg-[#F0E9D6] text-[#4A4236] hover:bg-[#F7FAFF] border border-[#C9D9F7]"
            }`}
          >
            {cat === "all" ? "All Assigned Resources" : cat}
          </button>
        ))}
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {filteredResources.length === 0 ? (
            <div className="bg-[#F0E9D6] rounded-2xl p-10 text-center border border-[#C9D9F7]">
              <Layers className="w-10 h-10 text-[#C9BBA0] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#241E17]">No resources assigned in this category</p>
              <p className="text-xs text-[#6B6252] mt-0.5">
                Check other categories or view all assigned resources.
              </p>
            </div>
          ) : (
            filteredResources.map((item) => {
              const Icon = getResourceIcon(item.resource.type);
              const statusStr = String(item.resource.status).toUpperCase();

              return (
                <div
                  key={item.resource.id}
                  className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7] p-5 shadow-xs hover:border-[#C9BBA0] transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-[#F7FAFF] text-[#4F7CFF]">
                        <Icon className="w-5 h-5 text-[#4F7CFF]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-[#0B1120]">{item.resource.name}</h4>
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F7FAFF] text-[#2D5FD2] border border-[#C9D9F7] uppercase">
                            {item.resource.type}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B6252] mt-0.5 flex items-center gap-1.5">
                          <span>{item.resource.location || "On-site Venue Facility"}</span>
                          {item.resource.operatingHours && (
                            <>
                              <span>•</span>
                              <span>{item.resource.operatingHours}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/operators/events/${event.id}/resources/${item.resource.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#4F7CFF] hover:bg-[#4F7CFF] text-white text-xs font-bold transition-colors self-start sm:self-auto shadow-xs shadow-[#4F7CFF]/20"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Full Controls</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Status & Capacity Indicators */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF] text-xs">
                    <div>
                      <span className="text-[#6B6252] text-[11px] block">Current Status</span>
                      <strong className="text-[#0B1120] font-bold text-sm">{item.resource.status}</strong>
                    </div>

                    <div>
                      <span className="text-[#6B6252] text-[11px] block">Capacity</span>
                      <strong className="text-[#0B1120] font-bold text-sm">
                        {item.resource.capacity}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[#6B6252] text-[11px] block">
                        {item.resource.type === "parking" ? "Occupied Spaces" : "Current Demand"}
                      </span>
                      <strong className="text-[#0B1120] font-bold text-sm">
                        {item.resource.currentDemand}
                      </strong>
                    </div>

                    {item.resource.available !== undefined && (
                      <div>
                        <span className="text-[#6B6252] text-[11px] block">Available Spaces</span>
                        <strong className="text-emerald-600 font-bold text-sm">
                          {item.resource.available}
                        </strong>
                      </div>
                    )}

                    {item.resource.notes && (
                      <div className="col-span-2 sm:col-span-3 pt-2 border-t border-[#C9D9F7]/60 text-[#4A4236] text-[11px]">
                        <strong>Note:</strong> {item.resource.notes}
                      </div>
                    )}
                  </div>

                  {/* Quick Status Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#F7FAFF]">
                    <span className="text-[11px] font-bold text-[#6B6252] mr-1">Quick Status:</span>
                    {item.resource.type === "transport" && (
                      <>
                        {["ACTIVE", "DELAYED", "DISRUPTED", "STANDBY"].map((s) => (
                          <button
                            key={s}
                            onClick={() => handleQuickStatusChange(item, s)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                              statusStr === s
                                ? "bg-[#4F7CFF] text-white border-[#4F7CFF] shadow-xs"
                                : "bg-[#F0E9D6] text-[#382F27] border-[#C9D9F7] hover:bg-[#F4F8FF]"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </>
                    )}

                    {item.resource.type === "parking" && (
                      <>
                        {["AVAILABLE", "FILLING", "NEAR CAPACITY", "FULL"].map((s) => (
                          <button
                            key={s}
                            onClick={() => handleQuickStatusChange(item, s)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                              statusStr === s
                                ? "bg-[#4F7CFF] text-white border-[#4F7CFF] shadow-xs"
                                : "bg-[#F0E9D6] text-[#382F27] border-[#C9D9F7] hover:bg-[#F4F8FF]"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </>
                    )}

                    {item.resource.type !== "transport" && item.resource.type !== "parking" && (
                      <>
                        {["Operational", "High Demand", "Limited", "Standby"].map((s) => (
                          <button
                            key={s}
                            onClick={() => handleQuickStatusChange(item, s)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                              String(item.resource.status).toLowerCase() === s.toLowerCase()
                                ? "bg-[#4F7CFF] text-white border-[#4F7CFF] shadow-xs"
                                : "bg-[#F0E9D6] text-[#382F27] border-[#C9D9F7] hover:bg-[#F4F8FF]"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right 1 Col: Event Operational Activity Feed */}
        <div className="space-y-4">
          <div className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7] p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#0B1120] pb-3 border-b border-[#F7FAFF] font-heading">
              Event Operational Log
            </h3>
            <div className="mt-3 space-y-3">
              {eventLogs.length === 0 ? (
                <p className="text-xs text-[#8C8272] py-4 text-center">No recorded actions for this event yet.</p>
              ) : (
                eventLogs.map((l) => (
                  <div key={l.id} className="p-2.5 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF] text-xs">
                    <div className="flex items-center justify-between text-[#8C8272] text-[10px]">
                      <span>{l.timestamp}</span>
                      <span className="font-semibold text-[#4F7CFF]">{l.resourceType}</span>
                    </div>
                    <p className="font-semibold text-[#241E17] mt-1">{l.action}</p>
                    {l.newValue && (
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        New: <strong>{l.newValue}</strong>
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </OperatorLayout>
  );
};
