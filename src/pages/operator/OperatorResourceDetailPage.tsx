import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Truck,
  Car,
  UtensilsCrossed,
  HeartPulse,
  Building,
  Clock,
  MapPin,
  Calendar,
  Radio,
  FileText,
  Sliders,
  History,
} from "lucide-react";
import { OperatorLayout } from "../../components/operator/OperatorLayout";
import { useAuth } from "../../context/AuthContext";
import { getStoredEventById } from "../../services/eventStorageService";
import {
  getOperatorResource,
  isOperatorAuthorizedForResource,
  updateOperatorResourceState,
  getOperatorActionLogs,
} from "../../services/operatorAssignmentService";
import { ResolvedOperatorResource, OperatorResourceType } from "../../types/operator";

export const OperatorResourceDetailPage: React.FC = () => {
  const params = useParams<{ eventId?: string; resourceId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const operatorId = user?.id || "";
  const operatorName = user?.fullName || user?.name || "Operator";

  const [resourceData, setResourceData] = useState<ResolvedOperatorResource | null>(null);
  const [status, setStatus] = useState<string>("");
  const [capacity, setCapacity] = useState<number>(0);
  const [currentDemand, setCurrentDemand] = useState<string | number>("");
  const [totalSpaces, setTotalSpaces] = useState<number>(0);
  const [occupiedSpaces, setOccupiedSpaces] = useState<number>(0);
  const [availableSpaces, setAvailableSpaces] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [operatingHours, setOperatingHours] = useState<string>("");

  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load resource details
  useEffect(() => {
    if (!operatorId || !params.resourceId) return;

    let eventId = params.eventId;
    // If eventId wasn't passed in URL, search across operator resources
    if (!eventId) {
      const all = getOperatorResource(operatorId, "", params.resourceId);
      if (all) {
        eventId = all.event.id;
      }
    }

    if (eventId) {
      const res = getOperatorResource(operatorId, eventId, params.resourceId);
      if (res) {
        setResourceData(res);
        setStatus(res.resource.status);
        setCapacity(typeof res.resource.capacity === "number" ? res.resource.capacity : parseInt(String(res.resource.capacity), 10) || 100);
        setCurrentDemand(res.resource.currentDemand);
        setTotalSpaces(typeof res.resource.capacity === "number" ? res.resource.capacity : 500);
        setOccupiedSpaces(res.resource.occupied ?? 0);
        setAvailableSpaces(res.resource.available ?? 0);
        setNotes(res.resource.notes || "");
        setOperatingHours(res.resource.operatingHours || "");
      }
    }
  }, [operatorId, params.eventId, params.resourceId]);

  if (!resourceData) {
    return (
      <OperatorLayout title="Resource Details">
        <div className="bg-[#F0E9D6] rounded-2xl p-12 text-center border border-[#C9D9F7]">
          <AlertTriangle className="w-12 h-12 text-blue-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#0B1120] font-heading">Resource Not Accessible</h3>
          <p className="text-xs text-[#6B6252] max-w-md mx-auto mt-1">
            Either this operational resource does not exist, or your account does not have permission to manage it.
          </p>
          <Link
            to="/operators/resources"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#4F7CFF] text-white text-xs font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assigned Resources
          </Link>
        </div>
      </OperatorLayout>
    );
  }

  const { event, resource, assignment } = resourceData;
  const resourceLogs = getOperatorActionLogs(operatorId, event.id).filter(
    (l) => l.resourceId === resource.id || l.resourceName === resource.name
  );

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

  const Icon = getResourceIcon(resource.type);

  // Parking auto calculation helper
  const handleOccupiedChange = (newOccupied: number) => {
    const occ = Math.max(0, newOccupied);
    setOccupiedSpaces(occ);
    setValidationError(null);
    if (occ <= totalSpaces) {
      setAvailableSpaces(totalSpaces - occ);
    }
  };

  const handleTotalSpacesChange = (newTotal: number) => {
    const tot = Math.max(0, newTotal);
    setTotalSpaces(tot);
    setValidationError(null);
    if (occupiedSpaces <= tot) {
      setAvailableSpaces(tot - occupiedSpaces);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMessage(null);
    setIsSaving(true);

    let updatesPayload: any = {
      status,
      notes: notes.trim(),
      operatingHours: operatingHours.trim(),
    };

    if (resource.type === "transport") {
      updatesPayload.capacity = Number(capacity);
      updatesPayload.currentDemand = Number(currentDemand);
    } else if (resource.type === "parking") {
      // Validate
      if (totalSpaces < 0 || occupiedSpaces < 0 || availableSpaces < 0) {
        setValidationError("Parking counts cannot be negative numbers.");
        setIsSaving(false);
        return;
      }
      if (occupiedSpaces > totalSpaces) {
        setValidationError(`Occupied spaces (${occupiedSpaces}) cannot exceed total capacity (${totalSpaces}).`);
        setIsSaving(false);
        return;
      }
      if (occupiedSpaces + availableSpaces > totalSpaces) {
        setValidationError(`Occupied (${occupiedSpaces}) + Available (${availableSpaces}) cannot exceed Total (${totalSpaces}).`);
        setIsSaving(false);
        return;
      }

      updatesPayload.totalSpaces = totalSpaces;
      updatesPayload.occupiedSpaces = occupiedSpaces;
      updatesPayload.availableSpaces = availableSpaces;
    } else {
      // Accommodation, Food, Medical, Other
      updatesPayload.capacity = capacity;
      updatesPayload.currentDemand = String(currentDemand);
    }

    const result = updateOperatorResourceState(
      operatorId,
      operatorName,
      event.id,
      resource.id,
      resource.type,
      updatesPayload
    );

    setIsSaving(false);

    if (result.success) {
      setSuccessMessage("Operational updates broadcast successfully to Organizer Command & Event Hub.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setValidationError(result.error || "Failed to update resource.");
    }
  };

  return (
    <OperatorLayout
      title={`Manage: ${resource.name}`}
      subtitle={`Operational Control • ${event.name}`}
    >
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to={`/operators/events/${event.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A4236] hover:text-[#0B1120] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Event Resources</span>
        </Link>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#F7FAFF] text-[#6b5024] border border-[#C9D9F7]">
          Assignment Status: {assignment.status}
        </span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Configuration Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7] p-6 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-[#F7FAFF] text-[#2D5FD2] border border-[#C9D9F7]/60">
                <Icon className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#EDE3CB] text-[#6b5024] uppercase tracking-wide">
                    {resource.type}
                  </span>
                  <span className="text-xs text-[#8C8272]">•</span>
                  <span className="text-xs font-semibold text-[#4A4236]">{event.name}</span>
                </div>
                <h2 className="text-xl font-bold text-[#0B1120] mt-1 font-heading">{resource.name}</h2>
                <p className="text-xs text-[#6B6252] mt-0.5 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#8C8272]" />
                  <span>{resource.location || event.venue}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7] p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#F7FAFF]">
              <div>
                <h3 className="text-base font-bold text-[#0B1120] font-heading">Live Status & Capacity Controls</h3>
                <p className="text-xs text-[#6B6252]">
                  Updates sync instantly to Organizer Command Center and Attendee Event Hubs.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>DIRECT SYNC</span>
              </div>
            </div>

            {/* Error / Success Alerts */}
            {validationError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold">{validationError}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{successMessage}</span>
              </div>
            )}

            {/* Status Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#382F27] block">
                Operational Status
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {resource.type === "transport" &&
                  ["ACTIVE", "DELAYED", "DISRUPTED", "STANDBY"].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`p-3 rounded-xl text-xs font-bold border transition-all text-center ${
                        status === s
                          ? "bg-[#4F7CFF] text-white border-[#4F7CFF] shadow-xs"
                          : "bg-[#F4F8FF] text-[#382F27] border-[#C9D9F7] hover:bg-[#F7FAFF]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}

                {resource.type === "parking" &&
                  ["AVAILABLE", "FILLING", "NEAR CAPACITY", "FULL", "CLOSED"].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                        status === s
                          ? "bg-[#4F7CFF] text-white border-[#4F7CFF] shadow-xs"
                          : "bg-[#F4F8FF] text-[#382F27] border-[#C9D9F7] hover:bg-[#F7FAFF]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}

                {resource.type !== "transport" &&
                  resource.type !== "parking" &&
                  ["Operational", "High Demand", "Limited", "Standby", "Closed"].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                        status === s
                          ? "bg-[#4F7CFF] text-white border-[#4F7CFF] shadow-xs"
                          : "bg-[#F4F8FF] text-[#382F27] border-[#C9D9F7] hover:bg-[#F7FAFF]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
              </div>
            </div>

            {/* Type-Specific Capacity & Demand Fields */}
            {resource.type === "parking" ? (
              <div className="space-y-4 p-4 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7]/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#241E17]">
                  Parking Space Allocation
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#382F27] block mb-1">
                      Total Capacity (Spaces)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={totalSpaces}
                      onChange={(e) => handleTotalSpacesChange(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 bg-[#F0E9D6] border border-[#C9D9F7] rounded-lg text-sm text-[#0B1120] font-bold focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#382F27] block mb-1">
                      Occupied Spaces
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={occupiedSpaces}
                      onChange={(e) => handleOccupiedChange(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 bg-[#F0E9D6] border border-[#C9D9F7] rounded-lg text-sm text-[#0B1120] font-bold focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-emerald-800 block mb-1">
                      Available Spaces (Auto)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={availableSpaces}
                      onChange={(e) => {
                        setAvailableSpaces(parseInt(e.target.value, 10) || 0);
                        setValidationError(null);
                      }}
                      className="w-full px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-900 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-[#6B6252]">
                  Validation rule: Occupied + Available cannot exceed Total Capacity. Negative numbers are rejected.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#382F27] block mb-1">
                    Resource Capacity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-lg text-sm text-[#0B1120] font-semibold focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#382F27] block mb-1">
                    Current Demand / Load
                  </label>
                  <input
                    type="text"
                    value={currentDemand}
                    onChange={(e) => setCurrentDemand(e.target.value)}
                    placeholder="e.g. 45 or High"
                    className="w-full px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-lg text-sm text-[#0B1120] font-semibold focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF]"
                  />
                </div>
              </div>
            )}

            {/* Operating Hours */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#382F27] block mb-1">
                Operating Hours / Service Window
              </label>
              <input
                type="text"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                placeholder="e.g. 08:00 - 23:30 IST"
                className="w-full px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-lg text-sm text-[#0B1120] focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF]"
              />
            </div>

            {/* Operational Notes */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#382F27] block mb-1">
                Operational Note & Field Advisory
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Vehicle arriving 8 minutes late due to traffic diversion. Extra marshals deployed at bay."
                className="w-full px-3.5 py-2.5 bg-[#F4F8FF] border border-[#C9D9F7] rounded-lg text-sm text-[#0B1120] focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF] resize-none"
              />
              <p className="text-[11px] text-[#8C8272] mt-1">
                This note will be logged in the event's audit trail and visible to the Organizer.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#F7FAFF] flex items-center justify-end gap-3">
              <Link
                to={`/operators/events/${event.id}`}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#4A4236] hover:bg-[#F7FAFF] border border-[#C9D9F7] transition-colors"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F7CFF] hover:bg-[#4F7CFF] text-white text-xs font-bold transition-all shadow-xs shadow-[#4F7CFF]/20 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Broadcasting..." : "Save & Broadcast Update"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Audit Trail & Permissions */}
        <div className="space-y-6">
          {/* Assignment Permissions Card */}
          <div className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7] p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#0B1120] pb-3 border-b border-[#F7FAFF] font-heading">
              Your Assignment Details
            </h3>
            <div className="mt-3 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#6B6252]">Operator ID:</span>
                <span className="font-mono text-[#382F27]">{operatorId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B6252]">Authorized Role:</span>
                <span className="font-semibold text-[#2D5FD2]">Resource Operator</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B6252]">Assignment ID:</span>
                <span className="font-mono text-[#382F27] text-[11px] truncate max-w-[150px]">
                  {assignment.assignmentId}
                </span>
              </div>
              <div className="pt-2 border-t border-[#F7FAFF]">
                <span className="text-[#6B6252] block mb-1">Granted Permissions:</span>
                <div className="flex flex-wrap gap-1">
                  {assignment.permissions.map((p) => (
                    <span
                      key={p}
                      className="px-2 py-0.5 rounded bg-[#F7FAFF] text-[#382F27] text-[10px] font-bold"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action History for this Resource */}
          <div className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#F7FAFF]">
              <h3 className="text-sm font-bold text-[#0B1120] flex items-center gap-1.5 font-heading">
                <History className="w-4 h-4 text-[#8C8272]" />
                <span>Resource History</span>
              </h3>
              <span className="text-[10px] text-[#8C8272] font-mono">Shared Log</span>
            </div>

            <div className="mt-3 space-y-3">
              {resourceLogs.length === 0 ? (
                <p className="text-xs text-[#8C8272] py-4 text-center">
                  No previous modifications recorded for this resource.
                </p>
              ) : (
                resourceLogs.map((l) => (
                  <div key={l.id} className="p-3 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF] text-xs">
                    <div className="flex items-center justify-between text-[#8C8272] text-[10px]">
                      <span>{l.timestamp}</span>
                      <span className="font-semibold text-[#2D5FD2]">{l.operatorName}</span>
                    </div>
                    <p className="font-semibold text-[#0B1120] mt-1">{l.action}</p>
                    {l.newValue && (
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        Update: <strong>{l.newValue}</strong>
                      </p>
                    )}
                    {l.details && <p className="text-[11px] text-[#6B6252] mt-1">{l.details}</p>}
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
