import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Network,
  Layers,
  Clock,
  Car,
  Bus,
  Hotel,
  Utensils,
  HeartPulse,
  Wrench,
  HelpCircle,
  DoorOpen,
  Users,
  ArrowRight,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Plus,
  Edit2,
  Share2,
  ChevronRight,
  Shield,
  Eye,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
} from "lucide-react";
import { OrganizerLayout } from "../../components/organizer/OrganizerLayout";
import { useAuth } from "../../context/AuthContext";
import { getOrganizerEvents, getStoredEventById } from "../../services/eventStorageService";
import {
  getEventEcosystem,
  updateEcosystemResource,
  saveAllEventEcosystems,
  getAllEventEcosystems,
} from "../../services/eventEcosystemService";
import { AppEvent } from "../../types/event";
import {
  EventEcosystem,
  EcosystemResourceItem,
  EcosystemResourceType,
  EcosystemResourceStatus,
  EventTimelineMilestone,
} from "../../types/ecosystem";

type ViewTab = "network" | "resources" | "timeline" | "dependencies";

export const OrganizerEcosystemPage: React.FC = () => {
  const { eventId: paramEventId } = useParams<{ eventId?: string }>();
  const { user } = useAuth();

  const [organizerEvents, setOrganizerEvents] = useState<AppEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [currentEvent, setCurrentEvent] = useState<AppEvent | null>(null);
  const [ecosystem, setEcosystem] = useState<EventEcosystem | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>("network");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Editing state for Quick Edit modal
  const [editingResource, setEditingResource] = useState<EcosystemResourceItem | null>(null);
  const [editCapacity, setEditCapacity] = useState<number>(0);
  const [editUsage, setEditUsage] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<EcosystemResourceStatus>("AVAILABLE");
  const [editCondition, setEditCondition] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");

  // Inspect node modal
  const [inspectingResource, setInspectingResource] = useState<EcosystemResourceItem | null>(null);

  // Load organizer events
  useEffect(() => {
    if (user?.id) {
      const events = getOrganizerEvents(user.id);
      setOrganizerEvents(events);

      if (events.length > 0) {
        const targetId = paramEventId || events[0].id;
        const exists = events.find((e) => e.id === targetId) ? targetId : events[0].id;
        setSelectedEventId(exists);
      }
    }
  }, [user?.id, paramEventId]);

  // Load selected event & ecosystem
  useEffect(() => {
    if (!selectedEventId) return;
    const evt = getStoredEventById(selectedEventId);
    if (evt) {
      setCurrentEvent(evt);
      const eco = getEventEcosystem(selectedEventId);
      setEcosystem(eco);
    }
  }, [selectedEventId]);

  // Listen for live updates
  useEffect(() => {
    const handleUpdate = () => {
      if (selectedEventId) {
        const eco = getEventEcosystem(selectedEventId);
        setEcosystem({ ...eco });
      }
    };
    window.addEventListener("eventflow_ecosystem_updated", handleUpdate);
    window.addEventListener("eventflow_live_state_updated", handleUpdate);
    return () => {
      window.removeEventListener("eventflow_ecosystem_updated", handleUpdate);
      window.removeEventListener("eventflow_live_state_updated", handleUpdate);
    };
  }, [selectedEventId]);

  const handleOpenEdit = (res: EcosystemResourceItem) => {
    setEditingResource(res);
    setEditCapacity(res.totalCapacity);
    setEditUsage(res.currentUsage);
    setEditStatus(res.status);
    setEditCondition(res.condition || "");
    setEditNotes(res.notes || "");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource || !selectedEventId) return;

    const updatedEco = updateEcosystemResource(
      selectedEventId,
      editingResource.id,
      {
        totalCapacity: editCapacity,
        currentUsage: editUsage,
        status: editStatus,
        condition: editCondition,
        notes: editNotes,
      },
      user?.fullName || "Organizer"
    );

    setEcosystem({ ...updatedEco });
    setEditingResource(null);
  };

  if (organizerEvents.length === 0) {
    return (
      <OrganizerLayout pageTitle="Event Ecosystem & Network">
        <div className="p-12 text-center bg-[#F0E9D6] rounded-3xl border border-[#C9D9F7] shadow-2xs font-sans space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F7FAFF] text-[#4F7CFF] flex items-center justify-center mx-auto">
            <Network className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#241E17]">No Events Found</h3>
          <p className="text-xs text-[#6B6252] max-w-sm mx-auto">
            Create an event in the Operations Center to view and manage its connected ecosystem topology.
          </p>
          <Link
            to="/operations/events"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white font-bold text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </Link>
        </div>
      </OrganizerLayout>
    );
  }

  if (!ecosystem || !currentEvent) {
    return (
      <OrganizerLayout pageTitle="Event Ecosystem">
        <div className="p-12 text-center text-[#8C8272] font-sans">
          Loading event ecosystem network...
        </div>
      </OrganizerLayout>
    );
  }

  // Derived Ecosystem Aggregates
  const totalResources = ecosystem.resources.length;
  const totalCap = ecosystem.resources.reduce((s, r) => s + (r.totalCapacity || 0), 0);
  const totalUsed = ecosystem.resources.reduce((s, r) => s + (r.currentUsage || 0), 0);
  const totalAvail = Math.max(0, totalCap - totalUsed);
  const overallOccupancy = totalCap > 0 ? Math.round((totalUsed / totalCap) * 100) : 0;
  const totalAssignedOperators = ecosystem.resources.filter((r) => r.assignedOperatorId).length;

  // Categorized resources for visual network nodes
  const gateResources = ecosystem.resources.filter((r) => r.category === "gate");
  const transportResources = ecosystem.resources.filter((r) => r.category === "transport");
  const parkingResources = ecosystem.resources.filter((r) => r.category === "parking");
  const accommodationResources = ecosystem.resources.filter((r) => r.category === "accommodation");
  const foodResources = ecosystem.resources.filter((r) => r.category === "food");
  const medicalResources = ecosystem.resources.filter((r) => r.category === "medical");
  const venueServiceResources = ecosystem.resources.filter((r) => r.category === "venue_services");
  const otherResources = ecosystem.resources.filter((r) => r.category === "other");

  // Filtered resources list for matrix
  const filteredResources = ecosystem.resources.filter((r) => {
    if (categoryFilter !== "ALL" && r.category !== categoryFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        (r.assignedOperatorName && r.assignedOperatorName.toLowerCase().includes(q)) ||
        (r.notes && r.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getStatusBadge = (status: EcosystemResourceStatus) => {
    switch (status) {
      case "AVAILABLE":
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "LIMITED":
      case "NEAR CAPACITY":
      case "STANDBY":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "FULL":
      case "UNAVAILABLE":
      case "INACTIVE":
      case "MAINTENANCE":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-[#F4F8FF] text-[#382F27] border-[#C9D9F7]";
    }
  };

  const getCategoryIcon = (cat: EcosystemResourceType) => {
    switch (cat) {
      case "gate":
        return DoorOpen;
      case "transport":
        return Bus;
      case "parking":
        return Car;
      case "accommodation":
        return Hotel;
      case "food":
        return Utensils;
      case "medical":
        return HeartPulse;
      case "venue_services":
        return Wrench;
      default:
        return HelpCircle;
    }
  };

  return (
    <OrganizerLayout
      pageTitle="Event Ecosystem & Operational Topology"
      pageSubtitle="Comprehensive inter-connected resource network and visitor journey framework."
      pageBadge="Ecosystem Engine"
      activeEvent={currentEvent}
      onSelectEventId={setSelectedEventId}
    >
      <div className="space-y-6 font-sans">
        {/* Top Header Summary & Metrics Strip */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0B1120] via-[#102A43] to-[#1C2541] text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-widest px-2.5 py-1 rounded-full bg-[#F0E9D6]/10 text-white font-bold border border-white/15">
                  {currentEvent.category} ECOSYSTEM
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SHARED STATE CONNECTED
                </span>
              </div>

              <div className="text-xs font-mono text-[#C9BBA0]">
                Event ID: <span className="text-white font-bold">{currentEvent.id}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-[#F0E9D6]/10 border border-white/10">
                <span className="text-[10px] uppercase font-mono text-[#6EA8FF] block font-bold">
                  CONNECTED NODES
                </span>
                <span className="text-xl sm:text-2xl font-black text-white">{totalResources}</span>
                <span className="text-[11px] text-[#C9BBA0] block mt-0.5">Active ecosystem resources</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F0E9D6]/10 border border-white/10">
                <span className="text-[10px] uppercase font-mono text-[#C9BBA0] block font-bold">
                  TOTAL CAPACITY
                </span>
                <span className="text-xl sm:text-2xl font-black text-white">{totalCap.toLocaleString()}</span>
                <span className="text-[11px] text-[#C9BBA0] block mt-0.5">Aggregate slots / throughput</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F0E9D6]/10 border border-white/10">
                <span className="text-[10px] uppercase font-mono text-emerald-400 block font-bold">
                  AVAILABLE CAPACITY
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-300">{totalAvail.toLocaleString()}</span>
                <span className="text-[11px] text-emerald-200/80 block mt-0.5">{100 - overallOccupancy}% headroom</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F0E9D6]/10 border border-white/10">
                <span className="text-[10px] uppercase font-mono text-purple-300 block font-bold">
                  ASSIGNED OPERATORS
                </span>
                <span className="text-xl sm:text-2xl font-black text-white">{totalAssignedOperators}</span>
                <span className="text-[11px] text-[#C9BBA0] block mt-0.5">Field staff active</span>
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F0E9D6] border border-[#C9D9F7]/90 rounded-2xl p-1.5 shadow-2xs">
          <div className="flex items-center gap-1 overflow-x-auto min-w-max">
            <button
              onClick={() => setActiveTab("network")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "network"
                  ? "bg-[#4F7CFF] text-white font-bold shadow-xs"
                  : "text-[#4A4236] hover:text-[#0B1120] hover:bg-[#F4F8FF]"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Event Network Map</span>
            </button>

            <button
              onClick={() => setActiveTab("resources")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "resources"
                  ? "bg-[#4F7CFF] text-white font-bold shadow-xs"
                  : "text-[#4A4236] hover:text-[#0B1120] hover:bg-[#F4F8FF]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Resource Inventory ({totalResources})</span>
            </button>

            <button
              onClick={() => setActiveTab("timeline")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "timeline"
                  ? "bg-[#4F7CFF] text-white font-bold shadow-xs"
                  : "text-[#4A4236] hover:text-[#0B1120] hover:bg-[#F4F8FF]"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Event Timeline</span>
            </button>

            <button
              onClick={() => setActiveTab("dependencies")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "dependencies"
                  ? "bg-[#4F7CFF] text-white font-bold shadow-xs"
                  : "text-[#4A4236] hover:text-[#0B1120] hover:bg-[#F4F8FF]"
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Dependencies</span>
            </button>
          </div>

          <div className="px-3 text-xs text-[#6B6252] font-mono hidden md:block">
            Last Synced: {new Date(ecosystem.lastUpdated).toLocaleTimeString()}
          </div>
        </div>

        {/* TAB 1: CONNECTED VISUAL NETWORK (TOPOLOGY & IMPACT MAP) */}
        {activeTab === "network" && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F7FAFF]">
                <div>
                  <h3 className="text-base font-bold text-[#0B1120] font-heading">
                    Event Ecosystem Flow & Network Topology
                  </h3>
                  <p className="text-xs text-[#6B6252]">
                    Live operational relationship pipeline: Ingress, Transit, Parking, In-Venue Services, and Egress Dispersal.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#4A4236] bg-[#F7FAFF] px-3 py-1.5 rounded-xl">
                    Click any node to inspect details
                  </span>
                </div>
              </div>

              {/* Connected Visual Pipeline */}
              <div className="space-y-6">
                {/* 1. Ingress & Travel Pipeline */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 relative">
                  {/* ATTENDEES NODE */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F7FAFF] to-indigo-50 border border-[#C9D9F7] shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-[#4F7CFF] text-white flex items-center justify-center font-bold">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono uppercase font-bold text-[#2D5FD2] bg-[#EDE3CB] px-2 py-0.5 rounded-full">
                        START
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0B1120]">ATTENDEES</h4>
                      <p className="text-xs text-[#4A4236] mt-0.5">
                        Target Crowd: <strong className="text-[#0B1120]">{ecosystem.venueCapacity.toLocaleString()}</strong>
                      </p>
                    </div>
                    <div className="text-[11px] text-[#6B6252] bg-[#F0E9D6]/80 p-2 rounded-xl border border-[#EDE3CB]">
                      Ingress Demand Flow
                    </div>
                  </div>

                  {/* TRANSPORT NODE */}
                  <div
                    onClick={() => setInspectingResource(transportResources[0] || null)}
                    className="p-5 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7] hover:border-[#4F7CFF] hover:shadow-xs transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                        <Bus className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(transportResources[0]?.status || "AVAILABLE")}`}>
                        {transportResources[0]?.status || "AVAILABLE"}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0B1120]">TRANSPORT & SHUTTLES</h4>
                      <p className="text-xs text-[#4A4236] mt-0.5">
                        {transportResources.length} Corridors Active
                      </p>
                    </div>
                    <div className="text-[11px] text-[#6B6252] bg-[#F4F8FF] p-2 rounded-xl border border-[#F7FAFF] truncate">
                      {transportResources[0]?.name || "Metro & Rapid Shuttles"}
                    </div>
                  </div>

                  {/* PARKING NODE */}
                  <div
                    onClick={() => setInspectingResource(parkingResources[0] || null)}
                    className="p-5 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7] hover:border-[#4F7CFF] hover:shadow-xs transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                        <Car className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(parkingResources[0]?.status || "AVAILABLE")}`}>
                        {parkingResources[0]?.status || "AVAILABLE"}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0B1120]">PARKING FACILITIES</h4>
                      <p className="text-xs text-[#4A4236] mt-0.5">
                        {parkingResources.length} Lots Configured
                      </p>
                    </div>
                    <div className="text-[11px] text-[#6B6252] bg-[#F4F8FF] p-2 rounded-xl border border-[#F7FAFF] truncate">
                      {parkingResources[0]?.name || "Concourse Parking"}
                    </div>
                  </div>

                  {/* ACCOMMODATION (BRANCHED) */}
                  <div
                    onClick={() => setInspectingResource(accommodationResources[0] || null)}
                    className="p-5 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7] hover:border-[#4F7CFF] hover:shadow-xs transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                        <Hotel className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(accommodationResources[0]?.status || "AVAILABLE")}`}>
                        {accommodationResources[0]?.status || "AVAILABLE"}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0B1120]">ACCOMMODATION</h4>
                      <p className="text-xs text-[#4A4236] mt-0.5">
                        {accommodationResources.length} Lodging Partners
                      </p>
                    </div>
                    <div className="text-[11px] text-[#6B6252] bg-[#F4F8FF] p-2 rounded-xl border border-[#F7FAFF] truncate">
                      {accommodationResources[0]?.name || "Partner Hotels"}
                    </div>
                  </div>
                </div>

                {/* Central Connector Arrow */}
                <div className="flex items-center justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F7FAFF] text-[#4A4236] text-xs font-mono font-bold">
                    <span>PERIMETER INGRESS</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  </div>
                </div>

                {/* 2. Venue & Turnstiles Hub */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* GATES NODE */}
                  <div
                    onClick={() => setInspectingResource(gateResources[0] || null)}
                    className="p-5 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7] hover:border-[#4F7CFF] hover:shadow-xs transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                        <DoorOpen className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {gateResources.length} GATES ONLINE
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0B1120]">ENTRY GATES & TURNSTILES</h4>
                      <p className="text-xs text-[#4A4236] mt-0.5">
                        Digital QR Ingress & Bag Policy Enforcement
                      </p>
                    </div>
                    <div className="text-[11px] text-[#6B6252] bg-[#F4F8FF] p-2 rounded-xl border border-[#F7FAFF]">
                      {gateResources.map((g) => g.name).join(", ")}
                    </div>
                  </div>

                  {/* CENTRAL VENUE CORE */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0B1120] to-[#102A43] text-white shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase font-bold text-[#6EA8FF] bg-[#0B1120]/60 px-2.5 py-0.5 rounded-full border border-[#4F7CFF]/40">
                        CENTRAL VENUE CORE
                      </span>
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        {Math.round((ecosystem.venueCurrentUsage / ecosystem.venueCapacity) * 100)}% OCCUPANCY
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white font-heading">{ecosystem.venueName}</h4>
                      <p className="text-xs text-[#C9BBA0] mt-0.5">
                        Capacity: {ecosystem.venueCapacity.toLocaleString()} • Expected: {ecosystem.venueCurrentUsage.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-full bg-[#F0E9D6]/20 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (ecosystem.venueCurrentUsage / ecosystem.venueCapacity) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* FOOD & IN-VENUE SERVICES */}
                  <div
                    onClick={() => setInspectingResource(foodResources[0] || null)}
                    className="p-5 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7] hover:border-[#4F7CFF] hover:shadow-xs transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                        <Utensils className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                        {foodResources.length + medicalResources.length + venueServiceResources.length} SERVICES
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0B1120]">FOOD, MEDICAL & SERVICES</h4>
                      <p className="text-xs text-[#4A4236] mt-0.5">
                        Concessions, Hydration, First Aid & Sanitation
                      </p>
                    </div>
                    <div className="text-[11px] text-[#6B6252] bg-[#F4F8FF] p-2 rounded-xl border border-[#F7FAFF] truncate">
                      {foodResources[0]?.name || "Concourse F&B Hubs"}
                    </div>
                  </div>
                </div>

                {/* Central Connector Arrow */}
                <div className="flex items-center justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F7FAFF] text-[#4A4236] text-xs font-mono font-bold">
                    <span>POST-EVENT EGRESS</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#4F7CFF]" />
                  </div>
                </div>

                {/* 3. Egress & Return Pipeline */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7] space-y-2">
                    <span className="text-[10px] uppercase font-mono text-[#8C8272] font-bold block">
                      STAGE 1: ARENA DISPERSAL
                    </span>
                    <h5 className="text-xs font-bold text-[#0B1120]">Staged Exit Waves</h5>
                    <p className="text-xs text-[#6B6252]">
                      Tier-by-tier egress announcements avoid choke points at lower concourses.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7] space-y-2">
                    <span className="text-[10px] uppercase font-mono text-purple-600 font-bold block">
                      STAGE 2: SURGE TRANSIT
                    </span>
                    <h5 className="text-xs font-bold text-[#0B1120]">High-Frequency Shuttle Corridor</h5>
                    <p className="text-xs text-[#6B6252]">
                      Metro lines run at 3-min headways with dedicated crowd marshalling lanes.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7] space-y-2">
                    <span className="text-[10px] uppercase font-mono text-emerald-600 font-bold block">
                      STAGE 3: SAFE RETURN
                    </span>
                    <h5 className="text-xs font-bold text-[#0B1120]">Return Journey Complete</h5>
                    <p className="text-xs text-[#6B6252]">
                      Attendees safely reach suburban transit terminals and hotel hubs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RESOURCE INVENTORY & CAPACITY MATRIX */}
        {activeTab === "resources" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F0E9D6] p-4 rounded-2xl border border-[#C9D9F7]/90 shadow-2xs">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  "ALL",
                  "GATE",
                  "TRANSPORT",
                  "PARKING",
                  "ACCOMMODATION",
                  "FOOD",
                  "MEDICAL",
                  "VENUE_SERVICES",
                  "OTHER",
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      categoryFilter === cat
                        ? "bg-[#0B1120] text-white font-bold"
                        : "bg-[#F4F8FF] text-[#4A4236] hover:bg-[#F7FAFF]"
                    }`}
                  >
                    {cat.replace("_", " ")}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#8C8272] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl pl-8 pr-3 py-2 text-[#241E17] placeholder-[#8C8272] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF]"
                />
              </div>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((res) => {
                const Icon = getCategoryIcon(res.category);
                const occupancyPercent =
                  res.totalCapacity > 0
                    ? Math.round((res.currentUsage / res.totalCapacity) * 100)
                    : 0;

                return (
                  <div
                    key={res.id}
                    className="p-5 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 hover:border-[#C9BBA0] shadow-2xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#F7FAFF] text-[#382F27] flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono uppercase font-bold text-[#8C8272] block">
                              {res.category.replace("_", " ")}
                            </span>
                            <h4 className="text-sm font-bold text-[#0B1120] leading-tight">
                              {res.name}
                            </h4>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border shrink-0 ${getStatusBadge(
                            res.status
                          )}`}
                        >
                          {res.status}
                        </span>
                      </div>

                      <div className="text-xs text-[#6B6252] flex items-center gap-1 truncate">
                        <span>📍 {res.location}</span>
                      </div>

                      {/* Capacity Meter */}
                      <div className="space-y-1.5 p-3 rounded-2xl bg-[#F4F8FF] border border-[#F7FAFF]">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-[#4A4236]">Capacity Load</span>
                          <span className="font-mono text-[#0B1120] font-bold">
                            {res.currentUsage.toLocaleString()} / {res.totalCapacity.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-[#C9D9F7] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              occupancyPercent >= 90
                                ? "bg-rose-500"
                                : occupancyPercent >= 70
                                ? "bg-blue-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(100, occupancyPercent)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#6B6252] pt-0.5">
                          <span>Available: <strong className="text-emerald-600">{res.availableCapacity.toLocaleString()}</strong></span>
                          <span>{occupancyPercent}% full</span>
                        </div>
                      </div>

                      {/* Operator Assignment Badge */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-[#6B6252] text-[11px]">Assigned Operator:</span>
                        {res.assignedOperatorName ? (
                          <span className="font-semibold text-[#2D5FD2] bg-[#F7FAFF] px-2 py-0.5 rounded-lg border border-[#EDE3CB] text-[11px]">
                            {res.assignedOperatorName}
                          </span>
                        ) : (
                          <span className="text-[#8C8272] italic text-[11px]">Unassigned</span>
                        )}
                      </div>

                      {res.condition && (
                        <div className="text-[11px] text-[#4A4236] bg-[#F4F8FF] p-2 rounded-xl border border-[#F7FAFF]">
                          <strong>Condition:</strong> {res.condition}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#F7FAFF] flex items-center justify-between gap-2">
                      <button
                        onClick={() => setInspectingResource(res)}
                        className="text-xs font-semibold text-[#4A4236] hover:text-[#0B1120] flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      <button
                        onClick={() => handleOpenEdit(res)}
                        className="px-3 py-1.5 rounded-xl bg-[#F7FAFF] hover:bg-[#EDE3CB] text-[#2D5FD2] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Quick Edit</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: EVENT TIMELINE */}
        {activeTab === "timeline" && (
          <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F7FAFF]">
              <div>
                <h3 className="text-base font-bold text-[#0B1120] font-heading">
                  Event Day Schedule & Operational Timeline
                </h3>
                <p className="text-xs text-[#6B6252]">
                  Defines critical milestones from perimeter turnstile opening to egress conclusion.
                </p>
              </div>

              <div className="text-xs font-mono font-bold text-[#382F27] bg-[#F7FAFF] px-3 py-1.5 rounded-xl">
                Event Date: {ecosystem.timeline.date}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-[#F7FAFF] border border-[#EDE3CB]">
                <span className="text-[10px] uppercase font-mono text-[#4F7CFF] font-bold block">GATES OPEN</span>
                <span className="text-lg font-black text-[#0B1120] font-mono">{ecosystem.timeline.gatesOpenTime}</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="text-[10px] uppercase font-mono text-emerald-600 font-bold block">EVENT START</span>
                <span className="text-lg font-black text-[#0B1120] font-mono">{ecosystem.timeline.eventStartTime}</span>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100">
                <span className="text-[10px] uppercase font-mono text-blue-600 font-bold block">INTERVAL / BREAK</span>
                <span className="text-lg font-black text-[#0B1120] font-mono">{ecosystem.timeline.intervalTime || "17:15"}</span>
              </div>
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100">
                <span className="text-[10px] uppercase font-mono text-purple-600 font-bold block">EVENT CONCLUSION</span>
                <span className="text-lg font-black text-[#0B1120] font-mono">{ecosystem.timeline.eventEndTime}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]">
                <span className="text-[10px] uppercase font-mono text-[#4A4236] font-bold block">EGRESS WINDOW</span>
                <span className="text-sm font-black text-[#0B1120] font-mono mt-1">
                  {ecosystem.timeline.egressStartTime} - {ecosystem.timeline.egressEndTime}
                </span>
              </div>
            </div>

            {/* Timeline Milestones Sequence */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-[#241E17] uppercase font-mono tracking-wider">
                Sequential Milestones ({ecosystem.timeline.milestones.length})
              </h4>

              <div className="relative pl-6 border-l-2 border-[#C9D9F7] space-y-6">
                {ecosystem.timeline.milestones.map((m, idx) => (
                  <div key={m.id || idx} className="relative group">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#4F7CFF] border-4 border-white shadow-xs" />
                    <div className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/80 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-[#2D5FD2] bg-[#EDE3CB] px-2 py-0.5 rounded-md">
                          {m.time} IST
                        </span>
                        <span className="text-[10px] font-mono uppercase font-bold text-[#6B6252] bg-[#F0E9D6] px-2 py-0.5 rounded-full border border-[#C9D9F7]">
                          {m.phase}
                        </span>
                      </div>
                      <h5 className="text-sm font-bold text-[#0B1120]">{m.title}</h5>
                      <p className="text-xs text-[#4A4236]">{m.description}</p>
                      {m.location && (
                        <div className="text-[11px] text-[#6B6252] pt-1 font-mono">📍 {m.location}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RESOURCE DEPENDENCIES */}
        {activeTab === "dependencies" && (
          <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-6">
            <div className="pb-3 border-b border-[#F7FAFF]">
              <h3 className="text-base font-bold text-[#0B1120] font-heading">
                Ecosystem Resource Dependencies
              </h3>
              <p className="text-xs text-[#6B6252]">
                Defined multi-resource connections enabling coordinated traffic routing, shuttle feeder demand, and crowd dispersal.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-blue-700" />
                  <ArrowRight className="w-3.5 h-3.5 text-[#8C8272]" />
                  <Bus className="w-4 h-4 text-purple-700" />
                  <strong className="text-xs font-bold text-[#0B1120]">Parking ⇄ Shuttle Feeder Dependency</strong>
                </div>
                <p className="text-xs text-[#4A4236] leading-relaxed">
                  Remote parking lots (P2 / P3) automatically trigger high-frequency feeder shuttle loops when lot occupancy exceeds 70%.
                </p>
                <div className="text-[10px] font-mono text-blue-800 bg-blue-100/80 px-2.5 py-1 rounded-lg inline-block">
                  Impact Level: HIGH • Prevents perimeter traffic gridlock
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Hotel className="w-4 h-4 text-indigo-700" />
                  <ArrowRight className="w-3.5 h-3.5 text-[#8C8272]" />
                  <Bus className="w-4 h-4 text-purple-700" />
                  <strong className="text-xs font-bold text-[#0B1120]">Accommodation ⇄ Transit Surge Demand</strong>
                </div>
                <p className="text-xs text-[#4A4236] leading-relaxed">
                  Affiliated delegate hotels generate synchronized arrivals 90 minutes before gate opening and return transit surge after event conclusion.
                </p>
                <div className="text-[10px] font-mono text-indigo-800 bg-indigo-100/80 px-2.5 py-1 rounded-lg inline-block">
                  Impact Level: MEDIUM • Coordinated VIP coach loops
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2">
                  <DoorOpen className="w-4 h-4 text-emerald-700" />
                  <ArrowRight className="w-3.5 h-3.5 text-[#8C8272]" />
                  <Users className="w-4 h-4 text-[#2D5FD2]" />
                  <strong className="text-xs font-bold text-[#0B1120]">Perimeter Gates ⇄ Venue Bowl Ingress</strong>
                </div>
                <p className="text-xs text-[#4A4236] leading-relaxed">
                  Turnstile scanning rates directly govern stand seating concourse density. Real-time alternate gate recommendations divert overflow.
                </p>
                <div className="text-[10px] font-mono text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg inline-block">
                  Impact Level: CRITICAL • Regulates turnstile choke points
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-700" />
                  <ArrowRight className="w-3.5 h-3.5 text-[#8C8272]" />
                  <Utensils className="w-4 h-4 text-indigo-700" />
                  <strong className="text-xs font-bold text-[#0B1120]">Event Interval ⇄ F&B Concessions Spike</strong>
                </div>
                <p className="text-xs text-[#4A4236] leading-relaxed">
                  Halftime and session breaks concentrate 40% of daily food & hydration demand into a 20-minute window. Express POS lanes active.
                </p>
                <div className="text-[10px] font-mono text-indigo-800 bg-indigo-100/80 px-2.5 py-1 rounded-lg inline-block">
                  Impact Level: HIGH • Express queue management active
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Edit Modal */}
        {editingResource && (
          <div className="fixed inset-0 z-50 bg-[#0B1120]/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#F0E9D6] rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-[#C9D9F7] space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#F7FAFF]">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-[#4F7CFF] block">
                    QUICK EDIT RESOURCE
                  </span>
                  <h3 className="text-base font-bold text-[#0B1120]">{editingResource.name}</h3>
                </div>
                <button
                  onClick={() => setEditingResource(null)}
                  className="p-1.5 rounded-lg text-[#8C8272] hover:text-[#382F27] hover:bg-[#F7FAFF] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#382F27] block mb-1">Total Capacity</label>
                    <input
                      type="number"
                      value={editCapacity}
                      onChange={(e) => setEditCapacity(Number(e.target.value))}
                      className="w-full bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl px-3 py-2 text-[#0B1120] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF] font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#382F27] block mb-1">Current Usage</label>
                    <input
                      type="number"
                      value={editUsage}
                      onChange={(e) => setEditUsage(Number(e.target.value))}
                      className="w-full bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl px-3 py-2 text-[#0B1120] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#382F27] block mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as EcosystemResourceStatus)}
                    className="w-full bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl px-3 py-2 text-[#0B1120] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF]"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="LIMITED">LIMITED</option>
                    <option value="NEAR CAPACITY">NEAR CAPACITY</option>
                    <option value="FULL">FULL</option>
                    <option value="UNAVAILABLE">UNAVAILABLE</option>
                    <option value="STANDBY">STANDBY</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#382F27] block mb-1">Current Condition / Headway</label>
                  <input
                    type="text"
                    value={editCondition}
                    onChange={(e) => setEditCondition(e.target.value)}
                    className="w-full bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl px-3 py-2 text-[#0B1120] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#382F27] block mb-1">Operational Notes</label>
                  <textarea
                    rows={2}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl px-3 py-2 text-[#0B1120] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F7FAFF]">
                  <button
                    type="button"
                    onClick={() => setEditingResource(null)}
                    className="px-4 py-2 rounded-xl text-[#4A4236] hover:bg-[#F7FAFF] font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white font-bold cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Inspect Modal */}
        {inspectingResource && (
          <div className="fixed inset-0 z-50 bg-[#0B1120]/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#F0E9D6] rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-[#C9D9F7] space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#F7FAFF]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-[#F7FAFF] text-[#2D5FD2] border border-[#C9D9F7]">
                    {inspectingResource.category}
                  </span>
                  <h3 className="text-base font-bold text-[#0B1120]">{inspectingResource.name}</h3>
                </div>
                <button
                  onClick={() => setInspectingResource(null)}
                  className="p-1.5 rounded-lg text-[#8C8272] hover:text-[#382F27] hover:bg-[#F7FAFF] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-[#F4F8FF] border border-[#F7FAFF] space-y-1">
                  <span className="text-[10px] uppercase font-mono text-[#8C8272] font-bold block">LOCATION</span>
                  <div className="text-[#241E17] font-semibold">{inspectingResource.location}</div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF]">
                    <span className="text-[10px] uppercase font-mono text-[#8C8272] block">TOTAL</span>
                    <strong className="text-sm font-black text-[#0B1120]">{inspectingResource.totalCapacity}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF]">
                    <span className="text-[10px] uppercase font-mono text-[#8C8272] block">USED</span>
                    <strong className="text-sm font-black text-[#0B1120]">{inspectingResource.currentUsage}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-[10px] uppercase font-mono text-emerald-600 block">AVAILABLE</span>
                    <strong className="text-sm font-black text-emerald-700">{inspectingResource.availableCapacity}</strong>
                  </div>
                </div>

                {inspectingResource.condition && (
                  <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF]">
                    <span className="text-[10px] uppercase font-mono text-[#8C8272] font-bold block">CONDITION</span>
                    <div className="text-[#241E17]">{inspectingResource.condition}</div>
                  </div>
                )}

                {inspectingResource.notes && (
                  <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF]">
                    <span className="text-[10px] uppercase font-mono text-[#8C8272] font-bold block">OPERATIONAL NOTES</span>
                    <div className="text-[#4A4236]">{inspectingResource.notes}</div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#F7FAFF] flex items-center justify-end">
                <button
                  onClick={() => setInspectingResource(null)}
                  className="px-5 py-2 rounded-xl bg-[#0B1120] hover:bg-black text-white font-bold text-xs cursor-pointer"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </OrganizerLayout>
  );
};
