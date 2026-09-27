import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Coffee,
  HeartPulse,
  HelpCircle,
  Building2,
  Utensils,
  Droplets,
  CheckCircle2,
  Plus,
  MapPin,
  Sparkles,
  Clock,
  Activity,
  Bus,
  Car,
  Hotel,
  Info,
  Layers,
  ArrowRight,
  ArrowLeft,
  Search,
  Shield,
  Phone,
  BatteryCharging,
  Compass,
  AlertTriangle,
  Flame,
  Check,
  Zap,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { OrganizerLayout } from "../../components/organizer/OrganizerLayout";
import {
  getStoredEventById,
  getOrganizerEvents,
  saveStoredEvent,
} from "../../services/eventStorageService";
import {
  getEventLiveState,
  saveEventLiveState,
  updateTransportState,
  updateParkingState,
  updateHospitalityState,
  recordOperationalAction,
} from "../../services/operationalStateService";
import { AppEvent } from "../../types/event";
import {
  EventOperationalLiveState,
  HospitalityCategory,
  HospitalityOperationalState,
  HospitalityOperationalStatus,
  TransportOperationalState,
  TransportOperationalStatus,
  ParkingOperationalState,
  ParkingOperationalStatus,
} from "../../types/operational";
import { getEventImage } from "../../utils/eventImageResolver";

type HospitalityTab =
  | "overview"
  | "transport"
  | "parking"
  | "accommodation"
  | "food"
  | "medical"
  | "other";

export const OrganizerHospitalityPage: React.FC = () => {
  const params = useParams<{ eventId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [allOrganizerEvents, setAllOrganizerEvents] = useState<AppEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<HospitalityTab>("overview");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filter within tab
  const [filterSubtype, setFilterSubtype] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State for adding new resources
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addCategory, setAddCategory] = useState<HospitalityTab>("food");
  const [newItemName, setNewItemName] = useState("");
  const [newItemType, setNewItemType] = useState("");
  const [newItemLocation, setNewItemLocation] = useState("");
  const [newItemCapacity, setNewItemCapacity] = useState("");
  const [newItemDetail, setNewItemDetail] = useState("");
  const [newItemContact, setNewItemContact] = useState("");

  // Load organizer's events
  useEffect(() => {
    const refreshOrgEvents = () => {
      if (user?.id) {
        const orgEvents = getOrganizerEvents(user.id);
        setAllOrganizerEvents(orgEvents);
      }
    };

    if (user?.id) {
      refreshOrgEvents();

      // Check if eventId is specified in URL path or query parameter
      const queryEventId = searchParams.get("eventId");
      const pathEventId = params.eventId;
      const initialEventId = pathEventId || queryEventId || null;

      if (initialEventId) {
        setSelectedEventId(initialEventId);
      }

      // Check initial tab in query
      const tabParam = searchParams.get("tab") as HospitalityTab;
      if (
        tabParam &&
        ["overview", "transport", "parking", "accommodation", "food"].includes(tabParam)
      ) {
        setActiveTab(tabParam);
      }
    }

    const handleEventDeleted = (e: Event) => {
      const customEvt = e as CustomEvent<{ eventId: string }>;
      const deletedId = customEvt.detail?.eventId;
      refreshOrgEvents();
      if (deletedId && selectedEventId === deletedId) {
        setSelectedEventId(null);
      }
    };

    window.addEventListener("eventflow_event_deleted", handleEventDeleted);
    window.addEventListener("storage", refreshOrgEvents);

    return () => {
      window.removeEventListener("eventflow_event_deleted", handleEventDeleted);
      window.removeEventListener("storage", refreshOrgEvents);
    };
  }, [user?.id, params.eventId, searchParams, selectedEventId]);

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;
    return (
      allOrganizerEvents.find((e) => e.id === selectedEventId) ||
      getStoredEventById(selectedEventId) ||
      null
    );
  }, [allOrganizerEvents, selectedEventId]);

  const liveState = useMemo(() => {
    if (!selectedEvent) return null;
    return getEventLiveState(selectedEvent.id, selectedEvent);
  }, [selectedEvent, actionNotice]);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleSelectEvent = (evtId: string) => {
    setSelectedEventId(evtId);
    setSearchParams({ eventId: evtId, tab: "overview" });
  };

  const handleTabChange = (tab: HospitalityTab) => {
    setActiveTab(tab);
    setFilterSubtype("all");
    setSearchQuery("");
    if (selectedEventId) {
      setSearchParams({ eventId: selectedEventId, tab });
    }
  };

  const handleBackToEvents = () => {
    setSelectedEventId(null);
    setSearchParams({});
  };

  // Transport status update
  const handleUpdateTransportStatus = (
    transId: string,
    status: TransportOperationalStatus
  ) => {
    if (!selectedEvent || !user?.name) return;
    updateTransportState(selectedEvent.id, transId, { status }, user.name);
    showNotice(`Updated transport resource status to ${status}`);
  };

  // Parking status & spaces update
  const handleUpdateParking = (
    parkId: string,
    occupiedSpaces: number,
    status?: ParkingOperationalStatus
  ) => {
    if (!selectedEvent || !user?.name) return;
    const res = updateParkingState(
      selectedEvent.id,
      parkId,
      { occupiedSpaces, ...(status ? { status } : {}) },
      user.name
    );
    if (res.error) {
      showNotice(res.error);
    } else {
      showNotice(`Updated parking lot capacity & occupancy`);
    }
  };

  // Hospitality facility update
  const handleUpdateHospitalityStatus = (
    hospId: string,
    status: HospitalityOperationalStatus
  ) => {
    if (!selectedEvent || !user?.name) return;
    updateHospitalityState(selectedEvent.id, hospId, { status }, user.name);
    showNotice(`Updated facility operational status to ${status}`);
  };

  // Submit adding new resource
  const handleAddNewResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !liveState || !user?.name || !newItemName.trim()) return;

    if (addCategory === "transport") {
      const id = `trans-${Date.now()}`;
      const newTrans: TransportOperationalState = {
        id,
        name: newItemName.trim(),
        type: (newItemType as any) || "shuttle",
        capacity: parseInt(newItemCapacity) || 100,
        currentDemand: 0,
        status: "NORMAL",
        pickupDropLocation: newItemLocation.trim() || selectedEvent.venue,
        operatingWindow: "07:00 - 23:30 IST",
        notes: newItemDetail.trim() || "Organizer-managed fleet resource",
      };
      liveState.transportState[id] = newTrans;
      saveEventLiveState(liveState);
      recordOperationalAction(selectedEvent.id, {
        action: `Added organizer transport: ${newItemName}`,
        resource: newItemName,
        user: user.name,
        newState: "NORMAL",
      });
      showNotice(`Added organizer transport: ${newItemName}`);
    } else if (addCategory === "parking") {
      const id = `park-${Date.now()}`;
      const total = parseInt(newItemCapacity) || 500;
      const newPark: ParkingOperationalState = {
        id,
        zoneName: newItemName.trim(),
        totalSpaces: total,
        occupiedSpaces: 0,
        availableSpaces: total,
        status: "AVAILABLE",
        distanceFromVenue: newItemLocation.trim() || "300m (4 min walk)",
        entryRoute: newItemDetail.trim() || "Direct Gate Access",
        shuttleAvailable: true,
        fee: "₹200 / day",
      };
      liveState.parkingState[id] = newPark;
      saveEventLiveState(liveState);
      recordOperationalAction(selectedEvent.id, {
        action: `Added parking zone: ${newItemName}`,
        resource: newItemName,
        user: user.name,
        newState: "AVAILABLE",
      });
      showNotice(`Added parking zone: ${newItemName}`);
    } else {
      const id = `hosp-${Date.now()}`;
      let cat: HospitalityCategory = "Food Zones";
      if (addCategory === "accommodation") cat = "Accommodation";
      if (addCategory === "food") cat = "Restaurants";
      if (addCategory === "medical") cat = "Medical Assistance";
      if (addCategory === "other") cat = "Other Services";

      const newHosp: HospitalityOperationalState = {
        id,
        name: newItemName.trim(),
        category: cat,
        capacity: parseInt(newItemCapacity) || 200,
        currentDemand: "Normal",
        status: "Operational",
        location: newItemLocation.trim() || "Main Concourse",
        operatingHours: "08:00 - 23:00 IST",
        notes: `${newItemDetail.trim()} ${newItemContact ? `• Contact: ${newItemContact}` : ""}`,
      };
      liveState.hospitalityState[id] = newHosp;
      saveEventLiveState(liveState);
      recordOperationalAction(selectedEvent.id, {
        action: `Added hospitality facility: ${newItemName}`,
        resource: newItemName,
        user: user.name,
        newState: "Operational",
      });
      showNotice(`Added visitor resource: ${newItemName}`);
    }

    setIsAddModalOpen(false);
    setNewItemName("");
    setNewItemType("");
    setNewItemLocation("");
    setNewItemCapacity("");
    setNewItemDetail("");
    setNewItemContact("");
  };

  // Compute readiness stats
  const computeEventHospitalityMetrics = (evt: AppEvent) => {
    const state = getEventLiveState(evt.id, evt);
    const transCount = Object.values(state.transportState || {}).filter((t:any)=>['shuttle','bus','private','taxi','other'].includes(String(t.type))).length;
    const parkCount = Object.keys(state.parkingState || {}).length;
    const hospCount = Object.keys(state.hospitalityState || {}).length;
    const totalResources = transCount + parkCount + hospCount;
    const readinessPercent = Math.min(100, Math.round((totalResources / 8) * 100));

    return {
      transCount,
      parkCount,
      hospCount,
      totalResources,
      readinessPercent,
      eventStatus: state.eventStatus || evt.status || "UPCOMING",
    };
  };

  // ==========================================
  // VIEW 1: ORGANIZER'S EVENTS SELECTOR
  // ==========================================
  if (!selectedEventId || !selectedEvent) {
    return (
      <OrganizerLayout
        pageTitle="Hospitality & Resources"
        pageSubtitle="Manage every visitor-facing resource connected to your events."
        pageBadge="Organizer Hospitality Ops"
      >
        <div className="space-y-6 font-sans">
          {/* Header banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-[#F7FAFF] text-[#2D5FD2]">
                  <Coffee className="w-5 h-5" />
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#0B1120]">
                  Hospitality & Visitor Resources
                </h2>
              </div>
              <p className="text-sm text-[#4A4236] leading-relaxed">
                Configure organizer transport, parking, food, accommodation and guest resources across your events.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="px-4 py-2.5 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7] text-xs font-mono font-bold text-[#382F27]">
                {allOrganizerEvents.length} TOTAL EVENTS MANAGED
              </div>
            </div>
          </div>

          {/* Event Cards Grid */}
          {allOrganizerEvents.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <Coffee className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-[#0B1120] font-heading">No Events Found</h3>
                <p className="text-xs text-[#6B6252] mt-1">
                  Create an event in the Event Operations manager to configure organizer fleet, parking, dining zones, and lodging partners.
                </p>
              </div>
              <Link
                to="/operations/events"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#4F7CFF] text-white hover:bg-[#2D5FD2] shadow-2xs"
              >
                <span>Go to Events Manager</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allOrganizerEvents.map((evt) => {
              const metrics = computeEventHospitalityMetrics(evt);
              const eventBanner = getEventImage(evt);

              return (
                <div
                  key={evt.id}
                  className="rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs overflow-hidden flex flex-col hover:border-[#6EA8FF] transition-all hover:shadow-xs group"
                >
                  {/* Event Image */}
                  <div className="relative h-44 w-full bg-[#0B1120] overflow-hidden">
                    <img
                      src={eventBanner}
                      alt={evt.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/80 via-[#0B1120]/20 to-transparent" />

                    {/* Status badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase bg-[#0B1120]/90 text-white backdrop-blur-md border border-white/10">
                        {evt.category}
                      </span>
                      {evt.visibility && (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase ${
                            evt.visibility === "PUBLISHED"
                              ? "bg-emerald-500/90 text-white"
                              : "bg-blue-500/90 text-white"
                          }`}
                        >
                          {evt.visibility}
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                      <span className="text-xs font-mono font-medium flex items-center gap-1.5 text-[#C9D9F7]">
                        <Clock className="w-3.5 h-3.5 text-[#4F7CFF]" />
                        {evt.date}
                      </span>
                      <span className="text-xs font-mono font-bold bg-[#4F7CFF]/90 px-2 py-0.5 rounded-md">
                        {metrics.eventStatus}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-heading font-bold text-base text-[#0B1120] group-hover:text-[#4F7CFF] transition-colors line-clamp-1">
                        {evt.name}
                      </h3>
                      <p className="text-xs text-[#6B6252] flex items-center gap-1.5 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 text-[#8C8272] shrink-0" />
                        <span>{evt.venue}</span>
                      </p>
                    </div>

                    {/* Readiness & Stats */}
                    <div className="pt-3 border-t border-[#F7FAFF] space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#6B6252] font-medium">Expected Visitors</span>
                        <span className="font-mono font-bold text-[#241E17]">{evt.expectedAttendance || "8,500"}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#6B6252] font-medium">Resource Readiness</span>
                        <span className="font-mono font-bold text-[#2D5FD2]">{metrics.readinessPercent}%</span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-[#F7FAFF] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#4F7CFF] h-full rounded-full transition-all duration-300"
                          style={{ width: `${metrics.readinessPercent}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-center font-mono">
                        <div className="p-1.5 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF]">
                          <span className="text-[#8C8272] block text-[9px] uppercase">Fleet</span>
                          <span className="font-bold text-[#241E17]">{metrics.transCount} Lines</span>
                        </div>
                        <div className="p-1.5 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF]">
                          <span className="text-[#8C8272] block text-[9px] uppercase">Parking</span>
                          <span className="font-bold text-[#241E17]">{metrics.parkCount} Zones</span>
                        </div>
                        <div className="p-1.5 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF]">
                          <span className="text-[#8C8272] block text-[9px] uppercase">Facilities</span>
                          <span className="font-bold text-[#241E17]">{metrics.hospCount} Units</span>
                        </div>
                      </div>
                    </div>

                    {/* Manage Button */}
                    <button
                      type="button"
                      onClick={() => handleSelectEvent(evt.id)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
                    >
                      <span>Manage Resources</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </OrganizerLayout>
    );
  }

  // ==========================================
  // VIEW 2: SELECTED EVENT HOSPITALITY MANAGEMENT
  // ==========================================
  const eventBanner = getEventImage(selectedEvent);
  const transportList = (Object.values(liveState?.transportState || {}) as TransportOperationalState[]).filter((t) => ['shuttle','bus','private','taxi','other'].includes(String(t.type))); // organizer-managed fleet only
  const parkingList = Object.values(liveState?.parkingState || {}) as ParkingOperationalState[];
  const hospitalityList = Object.values(liveState?.hospitalityState || {}) as HospitalityOperationalState[];

  // Categorize hospitality facilities
  const accommodationList = hospitalityList.filter(
    (h) => h.category === "Accommodation" || (h as any).type?.toLowerCase().includes("hotel")
  );
  const foodList = hospitalityList.filter(
    (h) => h.category === "Food Zones" || h.category === "Restaurants"
  );
  const medicalList = hospitalityList.filter(
    (h) => h.category === "Medical Assistance" || h.category === "Help Desk"
  );
  const otherServicesList = hospitalityList.filter(
    (h) => h.category === "Rest Areas" || h.category === "Other Services"
  );

  const TABS_CONFIG = [
    { id: "overview", label: "Overview", icon: Layers, count: null },
    { id: "transport", label: "Organizer Fleet", icon: Bus, count: transportList.length },
    { id: "parking", label: "Parking", icon: Car, count: parkingList.length },
    { id: "accommodation", label: "Accommodation", icon: Hotel, count: accommodationList.length },
    { id: "food", label: "Food & Dining", icon: Utensils, count: foodList.length },
  ];

  return (
    <OrganizerLayout
      pageTitle="Hospitality & Resources"
      pageSubtitle={`Active Event: ${selectedEvent.name}`}
      pageBadge="Visitor Operations"
      activeEvent={selectedEvent}
      onSelectEventId={handleSelectEvent}
    >
      <div className="space-y-6 font-sans">
        {/* Top bar with back button & Event Summary Header */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleBackToEvents}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#382F27] text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Events</span>
            </button>

            {actionNotice && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-fade-in shadow-2xs">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{actionNotice}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pt-2 border-t border-[#F7FAFF]">
            <div className="flex items-center gap-4">
              <img
                src={eventBanner}
                alt={selectedEvent.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-[#C9D9F7] shrink-0 shadow-2xs"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold font-heading text-[#0B1120]">
                    {selectedEvent.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#F7FAFF] text-[#2D5FD2] border border-[#C9D9F7]">
                    {selectedEvent.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#F7FAFF] text-[#382F27]">
                    ID: {selectedEvent.id}
                  </span>
                </div>
                <p className="text-xs text-[#4A4236] flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#8C8272]" />
                    {selectedEvent.venue}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[#6B6252]">
                    <Clock className="w-3.5 h-3.5 text-[#8C8272]" />
                    {selectedEvent.date}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  setAddCategory(activeTab === "overview" ? "food" : activeTab);
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white font-bold text-xs flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Resource</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7] shadow-2xs overflow-x-auto">
          {TABS_CONFIG.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id as HospitalityTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#4F7CFF] text-white shadow-2xs"
                    : "text-[#4A4236] hover:bg-[#F7FAFF] hover:text-[#0B1120]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] font-mono rounded-md ${
                      isActive ? "bg-[#F0E9D6]/20 text-white" : "bg-[#F7FAFF] text-[#4A4236]"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================
            TAB 1: OVERVIEW
           ======================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => handleTabChange("transport")}
                className="p-4 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs hover:border-[#6EA8FF] transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between text-[#8C8272] mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase">Fleet</span>
                  <Bus className="w-4 h-4 text-[#4F7CFF]" />
                </div>
                <span className="text-xl font-bold font-mono text-[#0B1120] block">
                  {transportList.length}
                </span>
                <span className="text-[11px] text-[#6B6252] font-medium">Active routes</span>
              </div>

              <div
                onClick={() => handleTabChange("parking")}
                className="p-4 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs hover:border-[#6EA8FF] transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between text-[#8C8272] mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase">Parking</span>
                  <Car className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-xl font-bold font-mono text-[#0B1120] block">
                  {parkingList.length}
                </span>
                <span className="text-[11px] text-[#6B6252] font-medium">Bays & zones</span>
              </div>

              <div
                onClick={() => handleTabChange("accommodation")}
                className="p-4 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs hover:border-[#6EA8FF] transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between text-[#8C8272] mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase">Hotels</span>
                  <Hotel className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-xl font-bold font-mono text-[#0B1120] block">
                  {accommodationList.length}
                </span>
                <span className="text-[11px] text-[#6B6252] font-medium">Partner stays</span>
              </div>

              <div
                onClick={() => handleTabChange("food")}
                className="p-4 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs hover:border-[#6EA8FF] transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between text-[#8C8272] mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase">Food & Drink</span>
                  <Utensils className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-xl font-bold font-mono text-[#0B1120] block">
                  {foodList.length}
                </span>
                <span className="text-[11px] text-[#6B6252] font-medium">Concessions</span>
              </div>

            </div>

            {/* Summary Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Transport & Parking Snapshot */}
              <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold font-heading text-[#0B1120] flex items-center gap-2">
                    <Bus className="w-4 h-4 text-[#4F7CFF]" />
                    <span>Organizer Shuttle & Pickup Fleet</span>
                  </h3>
                  <button
                    onClick={() => handleTabChange("transport")}
                    className="text-xs text-[#4F7CFF] font-bold hover:underline"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {transportList.slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-2xl bg-[#F4F8FF] border border-[#F7FAFF] flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-[#0B1120] block">{t.name}</span>
                        <span className="text-[11px] text-[#6B6252]">{t.pickupDropLocation}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                          t.status === "NORMAL" || t.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* On-Site Visitor Services Snapshot */}
              <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold font-heading text-[#0B1120] flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-blue-600" />
                    <span>Food & Concessions</span>
                  </h3>
                  <button
                    onClick={() => handleTabChange("food")}
                    className="text-xs text-[#4F7CFF] font-bold hover:underline"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {foodList.slice(0, 3).map((h) => (
                    <div
                      key={h.id}
                      className="p-3 rounded-2xl bg-[#F4F8FF] border border-[#F7FAFF] flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-[#0B1120] block">{h.name}</span>
                        <span className="text-[11px] text-[#6B6252]">{h.location}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#F7FAFF] text-[#2D5FD2] border border-[#C9D9F7]">
                        {h.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: TRANSPORT
           ======================================================== */}
        {activeTab === "transport" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs">
              <div>
                <h3 className="text-base font-bold font-heading text-[#0B1120]">
                  Organizer Transport Fleet
                </h3>
                <p className="text-xs text-[#6B6252] mt-0.5">
                  Manage organizer shuttles, crew buses, private fleet and pickup/drop bays for {selectedEvent.name}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAddCategory("transport");
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white font-bold text-xs flex items-center gap-2 shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Organizer Vehicle</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transportList.map((t) => (
                <div
                  key={t.id}
                  className="p-5 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-[#F7FAFF] text-[#2D5FD2]">
                        <Bus className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#0B1120] font-heading">{t.name}</h4>
                        <span className="text-[11px] font-mono text-[#6B6252] uppercase">{t.type} fleet</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <select
                        value={t.status}
                        onChange={(e) =>
                          handleUpdateTransportStatus(
                            t.id,
                            e.target.value as TransportOperationalStatus
                          )
                        }
                        className="px-2.5 py-1 rounded-xl border border-[#C9D9F7] text-[11px] font-mono font-bold bg-[#F0E9D6] text-[#382F27] focus:ring-1 focus:ring-[#4F7CFF]"
                      >
                        <option value="NORMAL">NORMAL</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="ELEVATED">ELEVATED</option>
                        <option value="STANDBY">STANDBY</option>
                        <option value="DELAYED">DELAYED</option>
                        <option value="DISRUPTED">DISRUPTED</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-[#F7FAFF] font-mono">
                    <div>
                      <span className="text-[10px] text-[#8C8272] block uppercase">Pickup / Route</span>
                      <span className="text-[#241E17] font-medium text-[11px] font-sans">{t.pickupDropLocation}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8C8272] block uppercase">Operating Window</span>
                      <span className="text-[#241E17] font-medium text-[11px]">{t.operatingWindow}</span>
                    </div>
                  </div>

                  {t.notes && (
                    <p className="text-[11px] text-[#6B6252] bg-[#F4F8FF] p-2.5 rounded-xl border border-[#F7FAFF]">
                      {t.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: PARKING
           ======================================================== */}
        {activeTab === "parking" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs">
              <div>
                <h3 className="text-base font-bold font-heading text-[#0B1120]">
                  Parking Facilities & Live Bay Status
                </h3>
                <p className="text-xs text-[#6B6252] mt-0.5">
                  Control perimeter parking zones, total capacity, and occupancy telemetry.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAddCategory("parking");
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white font-bold text-xs flex items-center gap-2 shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Parking Zone</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parkingList.map((p) => {
                const occupancyRate = p.totalSpaces > 0 ? Math.round((p.occupiedSpaces / p.totalSpaces) * 100) : 0;
                return (
                  <div
                    key={p.id}
                    className="p-5 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                          <Car className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#0B1120] font-heading">{p.zoneName}</h4>
                          <span className="text-[11px] text-[#6B6252] font-sans">{p.distanceFromVenue}</span>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold ${
                          p.status === "AVAILABLE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : p.status === "FULL"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>

                    {/* Spaces Telemetry */}
                    <div className="grid grid-cols-3 gap-2 text-center font-mono">
                      <div className="p-2 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF]">
                        <span className="text-[9px] uppercase text-[#8C8272] block">Total</span>
                        <span className="font-bold text-[#0B1120] text-xs">{p.totalSpaces}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF]">
                        <span className="text-[9px] uppercase text-[#8C8272] block">Occupied</span>
                        <span className="font-bold text-blue-700 text-xs">{p.occupiedSpaces}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF]">
                        <span className="text-[9px] uppercase text-[#8C8272] block">Available</span>
                        <span className="font-bold text-emerald-700 text-xs">{p.availableSpaces}</span>
                      </div>
                    </div>

                    {/* Fill meter */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-[#6B6252] font-mono">
                        <span>Occupancy</span>
                        <span>{occupancyRate}%</span>
                      </div>
                      <div className="w-full bg-[#F7FAFF] rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            occupancyRate >= 90
                              ? "bg-rose-600"
                              : occupancyRate >= 65
                              ? "bg-blue-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${occupancyRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick occupancy adjust */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#F7FAFF] gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateParking(p.id, Math.max(0, p.occupiedSpaces - 50))
                        }
                        className="px-2.5 py-1 rounded-lg bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#382F27] text-xs font-mono font-bold"
                      >
                        -50 Bays
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateParking(p.id, Math.min(p.totalSpaces, p.occupiedSpaces + 50))
                        }
                        className="px-2.5 py-1 rounded-lg bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#382F27] text-xs font-mono font-bold"
                      >
                        +50 Bays
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateParking(
                            p.id,
                            p.totalSpaces,
                            p.status === "FULL" ? "AVAILABLE" : "FULL"
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-[#F7FAFF] text-[#2D5FD2] hover:bg-[#EDE3CB] text-xs font-mono font-bold border border-[#C9D9F7]"
                      >
                        {p.status === "FULL" ? "Open Lot" : "Mark Full"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: ACCOMMODATION
           ======================================================== */}
        {activeTab === "accommodation" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs">
              <div>
                <h3 className="text-base font-bold font-heading text-[#0B1120]">
                  Accommodation & Hotel Partnerships
                </h3>
                <p className="text-xs text-[#6B6252] mt-0.5">
                  Partner hotels, hostels, and short-stay providers connected to {selectedEvent.name}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAddCategory("accommodation");
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white font-bold text-xs flex items-center gap-2 shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Accommodation</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accommodationList.length > 0 ? (
                accommodationList.map((h) => (
                  <div
                    key={h.id}
                    className="p-5 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                          <Hotel className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#0B1120] font-heading">{h.name}</h4>
                          <span className="text-[11px] text-[#6B6252] font-sans">{h.location}</span>
                        </div>
                      </div>

                      <select
                        value={h.status}
                        onChange={(e) =>
                          handleUpdateHospitalityStatus(
                            h.id,
                            e.target.value as HospitalityOperationalStatus
                          )
                        }
                        className="px-2 py-1 rounded-xl border border-[#C9D9F7] text-[11px] font-mono font-bold bg-[#F0E9D6] text-[#382F27]"
                      >
                        <option value="Operational">Operational</option>
                        <option value="Available">Available</option>
                        <option value="High Demand">High Demand</option>
                        <option value="Limited">Limited</option>
                      </select>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#F4F8FF] border border-[#F7FAFF] text-xs space-y-1">
                      <span className="text-[#6B6252] text-[11px] block">{h.notes}</span>
                      <span className="font-mono text-[#382F27] text-[11px] block font-medium">
                        Capacity: {h.capacity} guests • Hours: {h.operatingHours}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-12 text-center rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7] shadow-2xs space-y-3">
                  <Hotel className="w-8 h-8 text-[#C9BBA0] mx-auto" />
                  <p className="text-xs text-[#6B6252] font-medium">
                    No hotel partners registered yet for this event. Click &ldquo;Add Accommodation&rdquo; above to link one.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: FOOD & DINING
           ======================================================== */}
        {activeTab === "food" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs">
              <div>
                <h3 className="text-base font-bold font-heading text-[#0B1120]">
                  Food & Beverage, Food Courts, Refreshments
                </h3>
                <p className="text-xs text-[#6B6252] mt-0.5">
                  Concourse concession zones, cafeteria stalls, and mobile ordering outlets.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAddCategory("food");
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white font-bold text-xs flex items-center gap-2 shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Food Zone</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {foodList.map((f) => (
                <div
                  key={f.id}
                  className="p-5 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                        <Utensils className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#0B1120] font-heading">{f.name}</h4>
                        <span className="text-[11px] text-[#6B6252] font-sans">{f.location}</span>
                      </div>
                    </div>

                    <select
                      value={f.status}
                      onChange={(e) =>
                        handleUpdateHospitalityStatus(
                          f.id,
                          e.target.value as HospitalityOperationalStatus
                        )
                      }
                      className="px-2 py-1 rounded-xl border border-[#C9D9F7] text-[11px] font-mono font-bold bg-[#F0E9D6] text-[#382F27]"
                    >
                      <option value="Operational">Operational</option>
                      <option value="Normal">Normal</option>
                      <option value="High Demand">High Demand</option>
                      <option value="Limited">Limited</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#F4F8FF] border border-[#F7FAFF] text-xs space-y-1 font-mono">
                    <span className="text-[#4A4236] font-sans text-[11px] block">{f.notes}</span>
                    <span className="text-[#6B6252] text-[10px] block">
                      Demand Level: {f.currentDemand} • Hours: {f.operatingHours}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: MEDICAL & ASSISTANCE
           ======================================================== */}
        {activeTab === "medical" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs">
              <div>
                <h3 className="text-base font-bold font-heading text-[#0B1120]">
                  Medical Desks, First Aid & Accessibility
                </h3>
                <p className="text-xs text-[#6B6252] mt-0.5">
                  Emergency stations, paramedics, ambulance bays, and accessibility assistance.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAddCategory("medical");
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white font-bold text-xs flex items-center gap-2 shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Medical Station</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medicalList.map((m) => (
                <div
                  key={m.id}
                  className="p-5 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
                        <HeartPulse className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#0B1120] font-heading">{m.name}</h4>
                        <span className="text-[11px] text-[#6B6252] font-sans">{m.location}</span>
                      </div>
                    </div>

                    <select
                      value={m.status}
                      onChange={(e) =>
                        handleUpdateHospitalityStatus(
                          m.id,
                          e.target.value as HospitalityOperationalStatus
                        )
                      }
                      className="px-2 py-1 rounded-xl border border-[#C9D9F7] text-[11px] font-mono font-bold bg-[#F0E9D6] text-[#382F27]"
                    >
                      <option value="Operational">Operational</option>
                      <option value="Standby">Standby</option>
                      <option value="High Demand">High Demand</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#F4F8FF] border border-[#F7FAFF] text-xs space-y-1">
                    <span className="text-[#4A4236] text-[11px] block">{m.notes}</span>
                    <span className="font-mono text-[#6B6252] text-[10px] block">
                      Category: {m.category} • Hours: {m.operatingHours}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 7: OTHER SERVICES
           ======================================================== */}
        {activeTab === "other" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs">
              <div>
                <h3 className="text-base font-bold font-heading text-[#0B1120]">
                  Visitor Information, Lost & Found, Water & Power
                </h3>
                <p className="text-xs text-[#6B6252] mt-0.5">
                  Rest areas, hydration kiosks, phone charging bays, and lost & found counters.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAddCategory("other");
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white font-bold text-xs flex items-center gap-2 shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Service Facility</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {otherServicesList.map((o) => (
                <div
                  key={o.id}
                  className="p-5 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#0B1120] font-heading">{o.name}</h4>
                        <span className="text-[11px] text-[#6B6252] font-sans">{o.location}</span>
                      </div>
                    </div>

                    <select
                      value={o.status}
                      onChange={(e) =>
                        handleUpdateHospitalityStatus(
                          o.id,
                          e.target.value as HospitalityOperationalStatus
                        )
                      }
                      className="px-2 py-1 rounded-xl border border-[#C9D9F7] text-[11px] font-mono font-bold bg-[#F0E9D6] text-[#382F27]"
                    >
                      <option value="Operational">Operational</option>
                      <option value="Available">Available</option>
                      <option value="High Demand">High Demand</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#F4F8FF] border border-[#F7FAFF] text-xs space-y-1">
                    <span className="text-[#4A4236] text-[11px] block">{o.notes}</span>
                    <span className="font-mono text-[#6B6252] text-[10px] block">
                      Operating Hours: {o.operatingHours}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal: Add New Resource */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1120]/60 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7] p-6 sm:p-7 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#F7FAFF]">
                <h3 className="text-base font-bold font-heading text-[#0B1120]">
                  Add {addCategory.toUpperCase()} Resource
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg text-[#8C8272] hover:text-[#382F27]"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddNewResource} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#382F27] mb-1">Resource Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Express Shuttle Line S4 / Food Court C / West First Aid"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9D9F7] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#382F27] mb-1">Location / Route *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Concourse West, Gate 3"
                      value={newItemLocation}
                      onChange={(e) => setNewItemLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9D9F7] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#382F27] mb-1">Capacity / Spaces</label>
                    <input
                      type="number"
                      placeholder="e.g. 250"
                      value={newItemCapacity}
                      onChange={(e) => setNewItemCapacity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9D9F7] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#382F27] mb-1">Operational Notes / Detail</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Staffed with paramedics; Continuous frequency; Mobile ordering active."
                    value={newItemDetail}
                    onChange={(e) => setNewItemDetail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9D9F7] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF]"
                  />
                </div>

                <div className="pt-3 border-t border-[#F7FAFF] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#382F27] font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white font-bold shadow-2xs"
                  >
                    Save Resource
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </OrganizerLayout>
  );
};
