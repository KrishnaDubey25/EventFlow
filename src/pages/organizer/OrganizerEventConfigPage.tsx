import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Sliders,
  Activity,
  ArrowLeft,
  Save,
  Check,
  Plus,
  Trash2,
  Building,
  DoorOpen,
  Layers,
  Calendar,
  Bus,
  Car,
  Coffee,
  Ticket,
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
  Info,
  Eye,
  EyeOff,
  CheckCircle2,
  Users,
  ShieldCheck,
  DollarSign,
  Search,
  AlertTriangle,
  Map,
  CloudRain,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { OrganizerLayout } from "../../components/organizer/OrganizerLayout";
import {
  getStoredEventById,
  saveStoredEvent,
  publishEvent,
  unpublishEvent,
  deleteStoredEvent,
} from "../../services/eventStorageService";

import {
  getEventLiveState,
  saveEventLiveState,
  recordOperationalAction,
} from "../../services/operationalStateService";
import { getAllBookings } from "../../services/bookingService";
import { Booking } from "../../types/booking";
import { AppEvent, EventVisibility } from "../../types/event";
import {
  EventOperationalLiveState,
  GateOperationalState,
  ParkingOperationalState,
} from "../../types/operational";
import { useEventSelection } from "../../context/EventContext";
import { getEventImage, resolveEventBanner } from "../../utils/eventImageResolver";

type ConfigTab =
  | "general"
  | "venue"
  | "gates"
  | "zones"
  | "tickets"
  | "bookings"
  | "schedule"
  | "hospitality";

export const OrganizerEventConfigPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const { refreshEvents } = useEventSelection();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ConfigTab>("general");
  const [event, setEvent] = useState<AppEvent | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Form states initialized from event
  const [name, setName] = useState("");
  const [category, setCategory] = useState<any>("Conferences");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [location, setLocation] = useState("");
  const [district, setDistrict] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [capacity, setCapacity] = useState("");
  const [expectedAttendance, setExpectedAttendance] = useState("");
  const [image, setImage] = useState("");
  const [visibility, setVisibility] = useState<EventVisibility>("PUBLISHED");
  const [reception, setReception] = useState("");
  const [medicalHours, setMedicalHours] = useState("");
  const [helpPoint, setHelpPoint] = useState("");
  const [benefitLines, setBenefitLines] = useState("");

  // Sub-arrays
  const [gates, setGates] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [transport, setTransport] = useState<any[]>([]);
  const [parking, setParking] = useState<any[]>([]);
  const [hospitality, setHospitality] = useState<any[]>([]);

  // Bookings state
  const [bookingsSearch, setBookingsSearch] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (eventId) {
      const evt = getStoredEventById(eventId);
      if (evt) {
        setEvent(evt);
        setName(evt.name || "");
        setCategory(evt.category || "Conferences");
        setDescription(evt.description || "");
        setDate(evt.date || "");
        setTime(evt.time || "");
        setVenue(evt.venue || "");
        setLocation(evt.location || "");
        setDistrict(evt.district || "");
        setStateVal(evt.state || "");
        setCapacity(String(evt.capacity || ""));
        setExpectedAttendance(String(evt.expectedAttendance || ""));
        setImage(evt.image || "");
        setVisibility(evt.visibility || "PUBLISHED");
        setReception(evt.eventGuide?.reception || "");
        setMedicalHours(evt.eventGuide?.medicalHours || "");
        setHelpPoint(evt.eventGuide?.helpPoint || "");
        setBenefitLines(Object.entries(evt.admissionBenefits || {}).map(([name,benefit])=>`${name} | ${benefit}`).join('\n'));

        setGates(evt.gates || []);
        setZones(evt.zones || []);
        setSchedule(evt.schedule || []);
        setTransport(evt.transport || []);
        setParking(evt.parking || []);
        setHospitality(evt.hospitality || []);
      }
    }
  }, [eventId]);

  const handleTogglePublish = () => {
    if (!event) return;
    const nextVis: EventVisibility = visibility === "PUBLISHED" ? "UNPUBLISHED" : "PUBLISHED";
    if (nextVis === "PUBLISHED") {
      publishEvent(event.id);
      setVisibility("PUBLISHED");
      showToast("Event published successfully. Visible to attendees.");
    } else {
      unpublishEvent(event.id);
      setVisibility("UNPUBLISHED");
      showToast("Event unpublished. Hidden from attendee discovery.");
    }
    refreshEvents();
  };

  const handleSave = (forcedVisibility?: EventVisibility) => {
    if (!event || !user?.id) return;

    const targetVisibility = forcedVisibility || visibility;

    const resolvedImage = resolveEventBanner(category, name, venue, image);

    const updated: AppEvent & { organizerId: string; visibility: EventVisibility } = {
      ...event,
      organizerId: event.organizerId || user.id,
      visibility: targetVisibility,
      name: name.trim(),
      category,
      description: description.trim(),
      date: date.trim(),
      time: time.trim(),
      venue: venue.trim(),
      location: location.trim(),
      district: district.trim(),
      state: stateVal.trim(),
      capacity: String(capacity).trim(),
      expectedAttendance: String(expectedAttendance).trim(),
      image: resolvedImage,
      gates,
      zones,
      schedule,
      transport,
      parking,
      hospitality,
      eventGuide: { reception:reception.trim().slice(0,200), medicalHours:medicalHours.trim().slice(0,120), helpPoint:helpPoint.trim().slice(0,120) },
      admissionBenefits: Object.fromEntries(benefitLines.split('\n').map(line=>line.split('|').map(v=>v.trim())).filter(parts=>parts.length===2 && parts[0] && parts[1]).map(([name,benefit])=>[name.slice(0,100),benefit.slice(0,240)])),
    };

    saveStoredEvent(updated, user.id);

    // Sync gates & parking to operational state
    const liveState = getEventLiveState(event.id, updated);
    if (liveState) {
      const parsedCapacity = parseInt(String(capacity).replace(/,/g, "") || "10000", 10);
      const parsedExpected = parseInt(String(expectedAttendance).replace(/,/g, "") || "8000", 10);

      // Merge gates
      const updatedGateStates: Record<string, GateOperationalState> = { ...liveState.gateStates };
      gates.forEach((g, idx) => {
        const id = g.id || `gate-${idx + 1}`;
        const existing = updatedGateStates[id];
        updatedGateStates[id] = {
          id,
          name: g.name,
          status: existing?.status || "NORMAL",
          capacity: existing?.capacity || 150,
          currentCount: existing?.currentCount || 0,
          entryRate: existing?.entryRate || 0,
          assignedSections: g.assignedZones || ["General"],
          allowedTicketGroups: existing?.allowedTicketGroups || ["ga"],
          alternateGateIds: existing?.alternateGateIds || [],
          additionalLanes: existing?.additionalLanes || 0,
          scanningCapacityMultiplier: existing?.scanningCapacityMultiplier || 1.0,
          operationalNote: existing?.operationalNote || "Configured turnstiles active.",
          lastUpdated: new Date().toISOString(),
        };
      });

      // Merge parking
      const updatedParkingState: Record<string, ParkingOperationalState> = { ...liveState.parkingState };
      parking.forEach((p, idx) => {
        const id = p.id || `park-${idx + 1}`;
        const existing = updatedParkingState[id];
        const total = parseInt(String(p.capacity).replace(/,/g, "") || "500", 10);
        updatedParkingState[id] = {
          id,
          zoneName: p.name,
          totalSpaces: total,
          occupiedSpaces: existing?.occupiedSpaces || Math.round(total * 0.4),
          availableSpaces: existing?.availableSpaces || total - Math.round(total * 0.4),
          status: existing?.status || "AVAILABLE",
          distanceFromVenue: p.distance || "400m (5 min walk)",
          entryRoute: "Direct approach",
          shuttleAvailable: true,
          fee: p.fee || "₹200",
        };
      });

      const updatedLiveState: EventOperationalLiveState = {
        ...liveState,
        crowdState: {
          ...liveState.crowdState,
          venueCapacity: parsedCapacity,
          totalExpected: parsedExpected,
          occupancyPercent:
            parsedCapacity > 0
              ? Math.round((liveState.crowdState.currentAttendance / parsedCapacity) * 100)
              : 0,
        },
        gateStates: updatedGateStates,
        parkingState: updatedParkingState,
      };

      saveEventLiveState(updatedLiveState);
      recordOperationalAction(event.id, {
        action: `Saved configuration parameters for ${name}`,
        resource: "Event Configuration",
        user: user.name,
        details: `Updated ${gates.length} gates, ${zones.length} zones, and ${parking.length} parking facilities.`,
      });
    }

    refreshEvents();
    setEvent(updated);
    setVisibility(targetVisibility);
    setSaveSuccess(true);
    showToast(
      targetVisibility === "PUBLISHED"
        ? "Event published successfully."
        : "Event configuration saved as draft."
    );
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleConfirmDeleteEvent = () => {
    if (!event) return;
    const eventName = event.name;

    // Perform cascading deletion across events, live state, hospitality, parking, gates, bookings, and tickets
    deleteStoredEvent(event.id);

    // Refresh context
    refreshEvents();

    setIsDeleteDialogOpen(false);

    // Navigate back to the events list with notification
    navigate("/operations/events", {
      replace: true,
      state: { deletedMessage: `Event "${eventName}" has been permanently deleted.` },
    });
  };

  if (!event) {
    return (
      <OrganizerLayout pageTitle="Event Configuration">
        <div className="p-12 text-center bg-[#F0E9D6] rounded-3xl border border-[#C9D9F7] shadow-2xs font-sans">
          <p className="text-sm text-[#6B6252]">Event not found or loading...</p>
          <Link
            to="/operations/events"
            className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#4F7CFF] hover:underline"
          >
            ← Back to Events List
          </Link>
        </div>
      </OrganizerLayout>
    );
  }

  // Client-side ownership enforcement
  const isOwner = !event.organizerId || event.organizerId === user?.id || user?.id === "usr_demo_organizer";
  if (!isOwner) {
    return (
      <OrganizerLayout pageTitle="Event Configuration">
        <div className="p-12 text-center bg-[#F0E9D6] rounded-3xl border border-rose-200 shadow-2xs font-sans">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#0B1120] mb-2">Access Restricted</h3>
          <p className="text-sm text-[#4A4236] max-w-md mx-auto mb-6">
            You do not have administrative authorization to configure this event. This event belongs to another organizer account.
          </p>
          <Link
            to="/operations/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B1120] text-white text-xs font-bold hover:bg-[#241E17] transition"
          >
            ← Return to My Events
          </Link>
        </div>
      </OrganizerLayout>
    );
  }

  // Calculate Bookings Data for this specific event
  const allBookings = getAllBookings();
  const eventBookings = allBookings.filter((b) => b.eventId === event.id);
  const totalSold = eventBookings.reduce((sum, b) => sum + (b.quantity || 1), 0);
  const totalCapacityNum = parseInt(String(event.capacity).replace(/,/g, "") || "10000", 10);
  const ticketsRemaining = Math.max(0, totalCapacityNum - totalSold);
  const totalRevenue = eventBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const filteredBookings = eventBookings.filter(
    (b) =>
      b.attendeeName.toLowerCase().includes(bookingsSearch.toLowerCase()) ||
      b.attendeeEmail.toLowerCase().includes(bookingsSearch.toLowerCase()) ||
      b.ticketType.toLowerCase().includes(bookingsSearch.toLowerCase()) ||
      b.bookingId.toLowerCase().includes(bookingsSearch.toLowerCase())
  );

  const eventBanner = getEventImage(event);

  const TABS_CONFIG = [
    { id: "general", label: "General Info", icon: Building },
    { id: "venue", label: "Venue & Geo", icon: MapPin },
    { id: "gates", label: "Gates & Ingress", icon: DoorOpen },
    { id: "zones", label: "Zones & Concourse", icon: Layers },
    { id: "tickets", label: "Ticketing & Tiers", icon: Ticket },
    { id: "bookings", label: `Bookings (${totalSold})`, icon: DollarSign },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "hospitality", label: "Hospitality & Resources", icon: Coffee },
  ];

  return (
    <OrganizerLayout
      pageTitle="Event Configuration"
      pageSubtitle={`Configuring ${event.name}`}
      pageBadge="Master Event Model"
      activeEvent={event}
    >
      <div className="space-y-6 font-sans">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#0B1120] text-white shadow-xl border border-[#382F27] animate-fade-in text-xs font-bold font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header Card */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Link
              to="/operations/events"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#382F27] text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Events</span>
            </Link>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase ${
                  visibility === "PUBLISHED"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                {visibility}
              </span>

              <button
                type="button"
                onClick={handleTogglePublish}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  visibility === "PUBLISHED"
                    ? "bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#382F27]"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {visibility === "PUBLISHED" ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Unpublish</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Publish Event</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pt-3 border-t border-[#F7FAFF]">
            <div className="flex items-center gap-4">
              <img
                src={eventBanner}
                alt={name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-[#C9D9F7] shrink-0 shadow-2xs"
              />
              <div>
                <h1 className="text-xl font-bold font-heading text-[#0B1120]">{name}</h1>
                <p className="text-xs text-[#6B6252] flex items-center gap-2 mt-1">
                  <span>ID: {event.id}</span>
                  <span>•</span>
                  <span>{venue}</span>
                  <span>•</span>
                  <span>{date}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
              <Link
                to={`/operations/events/${event.id}/3d-venue`}
                className="px-4 py-2.5 rounded-2xl bg-[#6D4AFF] hover:bg-[#5B3BE8] text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
              >
                <Map className="w-4 h-4" />
                <span>Indoor Floor Map</span>
              </Link>
              <Link
                to={`/operations/events/${event.id}/live`}
                className="px-4 py-2.5 rounded-2xl bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#241E17] text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Live Command</span>
              </Link>
              <Link
                to={`/operations/events/${event.id}/weather-twin`}
                className="px-4 py-2.5 rounded-2xl bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#241E17] text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <CloudRain className="w-4 h-4 text-[#4F7CFF]" />
                <span>Weather</span>
              </Link>

              <button
                type="button"
                onClick={() => handleSave("DRAFT")}
                className="px-4 py-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Save Draft
              </button>

              <button
                type="button"
                onClick={() => handleSave("PUBLISHED")}
                className="px-5 py-2.5 rounded-2xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saveSuccess ? "Saved!" : "Save & Publish"}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDeleteDialogOpen(true)}
                title="Delete Event Permanently"
                className="p-2.5 rounded-2xl bg-[#F7FAFF] hover:bg-rose-50 text-[#6B6252] hover:text-rose-600 border border-transparent hover:border-rose-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7] shadow-2xs overflow-x-auto">
          {TABS_CONFIG.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as ConfigTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#4F7CFF] text-white shadow-2xs"
                    : "text-[#4A4236] hover:bg-[#F7FAFF] hover:text-[#0B1120]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================
            TAB 1: GENERAL INFO
           ======================================================== */}
        {activeTab === "general" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-6">
            <h3 className="text-base font-bold font-heading text-[#0B1120]">
              General Event Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#382F27] mb-1">Event Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9D9F7] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#382F27] mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9D9F7] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF] bg-[#F0E9D6]"
                >
                  <option value="Conferences">Conferences</option>
                  <option value="Sports">Sports</option>
                  <option value="Concerts">Concerts</option>
                  <option value="Festivals">Festivals</option>
                  <option value="Large Gatherings">Large Gatherings</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#382F27] mb-1">Date</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9D9F7] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#382F27] mb-1">Time Window</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9D9F7] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-[#382F27] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9D9F7] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-[#382F27] mb-1">
                  Event Banner Image URL (Auto-Resolved If Empty)
                </label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9D9F7] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF]"
                />
              </div>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-[#fafaff] p-5 space-y-4 text-xs">
              <div><h4 className="font-bold text-[#0B1120]">Attendee event plan</h4><p className="text-[#4A4236] mt-1">Publish only confirmed locations, hours and ticket inclusions. These appear in Discover and the booked event view.</p></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="font-semibold text-[#382F27]">Reception / welcome<input value={reception} onChange={e=>setReception(e.target.value)} maxLength={200} placeholder="08:30 · Welcome desk, Hall A" className="block w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#C9D9F7] bg-[#F0E9D6]"/></label>
                <label className="font-semibold text-[#382F27]">Medical service hours<input value={medicalHours} onChange={e=>setMedicalHours(e.target.value)} maxLength={120} placeholder="During event programme" className="block w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#C9D9F7] bg-[#F0E9D6]"/></label>
                <label className="font-semibold text-[#382F27] sm:col-span-2">Help desk / location<input value={helpPoint} onChange={e=>setHelpPoint(e.target.value)} maxLength={120} placeholder="Near Gate 1" className="block w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#C9D9F7] bg-[#F0E9D6]"/></label>
              </div>
              <label className="block font-semibold text-[#382F27]">Inclusions by exact ticket type · one per line<textarea rows={3} value={benefitLines} onChange={e=>setBenefitLines(e.target.value)} placeholder="Delegate Pass | Breakfast included&#10;Standard Pass | Coffee only" className="block w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#C9D9F7] bg-[#F0E9D6]"/></label>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: VENUE & GEO
           ======================================================== */}
        {activeTab === "venue" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-6">
            <h3 className="text-base font-bold font-heading text-[#0B1120]">
              Venue Location & Geo Coordinates
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#382F27] mb-1">Venue Name</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9D9F7] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#382F27] mb-1">Location / Address</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9D9F7] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#382F27] mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9D9F7] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#382F27] mb-1">State / Province</label>
                <input
                  type="text"
                  value={stateVal}
                  onChange={(e) => setStateVal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9D9F7] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: GATES & INGRESS
           ======================================================== */}
        {activeTab === "gates" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-heading text-[#0B1120]">
                Turnstiles & Ingress Gates
              </h3>
              <button
                type="button"
                onClick={() =>
                  setGates([
                    ...gates,
                    {
                      id: `gate-${gates.length + 1}-${Date.now().toString(36)}`,
                      name: `Gate ${gates.length + 1}`,
                      status: "optimal",
                      assignedZones: ["Main Concourse"],
                    },
                  ])
                }
                className="px-3.5 py-1.5 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Gate</span>
              </button>
            </div>

            <div className="space-y-3">
              {gates.map((g, idx) => (
                <div
                  key={g.id || idx}
                  className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <DoorOpen className="w-5 h-5 text-[#4F7CFF]" />
                    <div>
                      <input
                        type="text"
                        value={g.name}
                        onChange={(e) => {
                          const copy = [...gates];
                          copy[idx].name = e.target.value;
                          setGates(copy);
                        }}
                        className="font-bold text-[#0B1120] bg-transparent border-b border-transparent hover:border-[#C9BBA0] focus:border-[#4F7CFF] focus:outline-none text-xs"
                      />
                      <span className="text-[10px] text-[#8C8272] block font-mono">ID: {g.id}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setGates(gates.filter((_, i) => i !== idx))}
                    className="p-1.5 rounded-lg text-[#8C8272] hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: ZONES
           ======================================================== */}
        {activeTab === "zones" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-heading text-[#0B1120]">
                Venue Zones & Concourses
              </h3>
              <button
                type="button"
                onClick={() =>
                  setZones([
                    ...zones,
                    {
                      id: `zone-${zones.length + 1}-${Date.now().toString(36)}`,
                      name: `Zone ${zones.length + 1}`,
                      capacity: "1,500",
                    },
                  ])
                }
                className="px-3.5 py-1.5 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Zone</span>
              </button>
            </div>

            <div className="space-y-3">
              {zones.map((z, idx) => (
                <div
                  key={z.id || idx}
                  className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5 text-purple-600" />
                    <div>
                      <input
                        type="text"
                        value={z.name}
                        onChange={(e) => {
                          const copy = [...zones];
                          copy[idx].name = e.target.value;
                          setZones(copy);
                        }}
                        className="font-bold text-[#0B1120] bg-transparent border-b border-transparent hover:border-[#C9BBA0] focus:border-[#4F7CFF] focus:outline-none text-xs"
                      />
                      <span className="text-[10px] text-[#8C8272] block font-mono">
                        Capacity: {z.capacity}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setZones(zones.filter((_, i) => i !== idx))}
                    className="p-1.5 rounded-lg text-[#8C8272] hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: TICKETS
           ======================================================== */}
        {activeTab === "tickets" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-6">
            <h3 className="text-base font-bold font-heading text-[#0B1120]">
              Capacity & Ticketing Configuration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#382F27] mb-1">Total Venue Capacity</label>
                <input
                  type="text"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9D9F7] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#382F27] mb-1">Expected Attendance</label>
                <input
                  type="text"
                  value={expectedAttendance}
                  onChange={(e) => setExpectedAttendance(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9D9F7] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: BOOKINGS & ATTENDEES (REQUIREMENTS 10 & 11)
           ======================================================== */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            {/* Sales Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs">
                <span className="text-[10px] font-mono font-bold uppercase text-[#8C8272] block mb-1">
                  Tickets Sold
                </span>
                <span className="text-2xl font-bold font-mono text-[#0B1120] block">
                  {totalSold}
                </span>
                <span className="text-xs text-[#6B6252]">Across {eventBookings.length} orders</span>
              </div>

              <div className="p-5 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs">
                <span className="text-[10px] font-mono font-bold uppercase text-[#8C8272] block mb-1">
                  Tickets Remaining
                </span>
                <span className="text-2xl font-bold font-mono text-emerald-700 block">
                  {ticketsRemaining.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-[#6B6252]">From {event.capacity} total capacity</span>
              </div>

              <div className="p-5 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs">
                <span className="text-[10px] font-mono font-bold uppercase text-[#8C8272] block mb-1">
                  Gross Revenue
                </span>
                <span className="text-2xl font-bold font-mono text-[#2D5FD2] block">
                  ₹{totalRevenue.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-[#6B6252]">Direct booking receipts</span>
              </div>

              <div className="p-5 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs">
                <span className="text-[10px] font-mono font-bold uppercase text-[#8C8272] block mb-1">
                  Expected Turnout
                </span>
                <span className="text-2xl font-bold font-mono text-purple-700 block">
                  {event.expectedAttendance || "8,000"}
                </span>
                <span className="text-xs text-[#6B6252]">Target operational wave</span>
              </div>
            </div>

            {/* Bookings Table / List */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold font-heading text-[#0B1120]">
                    Attendee Bookings for {event.name}
                  </h3>
                  <p className="text-xs text-[#6B6252] mt-0.5">
                    Live tickets linked to eventId &ldquo;{event.id}&rdquo;.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-[#8C8272] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={bookingsSearch}
                    onChange={(e) => setBookingsSearch(e.target.value)}
                    placeholder="Search attendee, email, pass..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#C9D9F7] text-xs focus:outline-none focus:ring-1 focus:ring-[#4F7CFF]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                {filteredBookings.length > 0 ? (
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-[#C9D9F7]/80 text-[#8C8272] font-mono uppercase text-[10px]">
                        <th className="py-2.5 px-3">Attendee</th>
                        <th className="py-2.5 px-3">Ticket Type</th>
                        <th className="py-2.5 px-3">Gate / Section</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F7FAFF] font-mono">
                      {filteredBookings.map((b) => (
                        <tr key={b.bookingId} className="hover:bg-[#F4F8FF]/80">
                          <td className="py-3 px-3">
                            <span className="font-bold text-[#0B1120] font-sans block">
                              {b.attendeeName}
                            </span>
                            <span className="text-[11px] text-[#6B6252] font-sans">
                              {b.attendeeEmail}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-[#241E17] block">{b.ticketType}</span>
                            <span className="text-[10px] text-[#8C8272]">Qty: {b.quantity}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-[#382F27] block">{b.assignedGate}</span>
                            <span className="text-[10px] text-[#8C8272]">{b.section}</span>
                          </td>
                          <td className="py-3 px-3 font-bold text-[#0B1120]">
                            ₹{b.totalPrice.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-12 text-center rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7] space-y-2">
                    <Ticket className="w-8 h-8 text-[#C9BBA0] mx-auto" />
                    <p className="text-[#6B6252] font-medium text-xs">
                      No matching attendee bookings found for this event.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 7: SCHEDULE
           ======================================================== */}
        {activeTab === "schedule" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-heading text-[#0B1120]">
                Official Event Schedule
              </h3>
              <button
                type="button"
                onClick={() =>
                  setSchedule([
                    ...schedule,
                    { time: "12:00 IST", activity: "Special Keynote / Event Milestone" },
                  ])
                }
                className="px-3.5 py-1.5 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Schedule Item</span>
              </button>
            </div>


            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-[#C9D9F7] bg-[#F7FAFF] p-4">
                <span className="text-[10px] font-black uppercase tracking-[.12em] text-[#6B6252]">Entry dependency</span>
                <b className="mt-1 block text-sm text-[#0B1120]">{gates.length} gates → {zones.length} zones</b>
              </div>
              <div className="rounded-2xl border border-[#C9D9F7] bg-[#F7FAFF] p-4">
                <span className="text-[10px] font-black uppercase tracking-[.12em] text-[#6B6252]">Mobility dependency</span>
                <b className="mt-1 block text-sm text-[#0B1120]">{transport.length} transit · {parking.length} parking</b>
              </div>
              <div className="rounded-2xl border border-[#C9D9F7] bg-[#F7FAFF] p-4">
                <span className="text-[10px] font-black uppercase tracking-[.12em] text-[#6B6252]">Visitor dependency</span>
                <b className="mt-1 block text-sm text-[#0B1120]">{hospitality.length} hospitality resources</b>
              </div>
            </div>

            <div className="space-y-3">
              {schedule.map((s, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="text"
                      value={s.time}
                      onChange={(e) => {
                        const copy = [...schedule];
                        copy[idx].time = e.target.value;
                        setSchedule(copy);
                      }}
                      className="w-24 font-mono font-bold text-[#2D5FD2] bg-[#F0E9D6] px-2 py-1 rounded-lg border border-[#C9D9F7]"
                    />
                    <input
                      type="text"
                      value={s.activity}
                      onChange={(e) => {
                        const copy = [...schedule];
                        copy[idx].activity = e.target.value;
                        setSchedule(copy);
                      }}
                      className="flex-1 font-bold text-[#0B1120] bg-transparent border-b border-transparent hover:border-[#C9BBA0] focus:border-[#4F7CFF] focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setSchedule(schedule.filter((_, i) => i !== idx))}
                    className="p-1.5 rounded-lg text-[#8C8272] hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 8: HOSPITALITY LINK
           ======================================================== */}
        {activeTab === "hospitality" && (
          <div className="p-8 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs text-center space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#F7FAFF] text-[#2D5FD2] w-fit mx-auto">
              <Coffee className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-lg font-bold font-heading text-[#0B1120]">
                Unified Hospitality & Visitor Resources
              </h3>
              <p className="text-xs text-[#6B6252] leading-relaxed">
                Transport routes, parking bays, partner lodging, food courts, medical desks, and attendee services are now unified under the Hospitality module.
              </p>
            </div>

            <Link
              to={`/operations/hospitality?eventId=${event.id}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white font-bold text-xs shadow-2xs"
            >
              <span>Open Hospitality & Resources for {event.name} →</span>
            </Link>
          </div>
        )}

        {/* ========================================================
            DANGER ZONE: PERMANENT EVENT DELETION
           ======================================================== */}
        <div className="p-6 sm:p-7 rounded-3xl bg-rose-50/40 border border-rose-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-700 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-heading text-rose-900">
                  Danger Zone — Decommission & Delete Event
                </h3>
                <p className="text-xs text-rose-700/80 mt-0.5 max-w-xl leading-relaxed">
                  Permanently wipe this event registry. Once deleted, this event will be immediately purged from Attendee Discovery, ticket wallets, hospitality facilities, gate scanners, and command telemetry.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shrink-0 transition-colors shadow-2xs cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Event Permanently</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            MODAL: DELETE CONFIRMATION
           ======================================================== */}
        {isDeleteDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1120]/70 backdrop-blur-xs animate-fade-in">
            <div className="w-full max-w-lg rounded-3xl bg-[#F0E9D6] border border-rose-100 p-6 sm:p-7 shadow-2xl space-y-5">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 shrink-0 border border-rose-100">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold font-heading text-[#0B1120]">
                    Delete Event Permanently?
                  </h3>
                  <p className="text-xs text-[#6B6252]">
                    Are you sure you want to delete <span className="font-bold text-[#0B1120]">"{event.name}"</span>? This action cannot be undone.
                  </p>
                </div>
              </div>

              {/* Impact Breakdown */}
              <div className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/90 space-y-2.5 text-xs text-[#4A4236]">
                <span className="font-bold text-[#241E17] block text-[11px] uppercase tracking-wider">
                  Cascading Cleanup Scope:
                </span>
                <ul className="space-y-1.5 text-[11px] list-disc list-inside text-[#4A4236]">
                  <li>
                    <strong className="text-[#241E17]">Attendee Discovery:</strong> Event will disappear from the homepage, explore tab, and search filters.
                  </li>
                  <li>
                    <strong className="text-[#241E17]">Passes & Wallet:</strong> Any registered passes, tickets, and bookings are completely purged.
                  </li>
                  <li>
                    <strong className="text-[#241E17]">Hospitality State:</strong> First aid posts, food zones, rest bays, and transit shuttles are deleted.
                  </li>
                  <li>
                    <strong className="text-[#241E17]">Operator Radar:</strong> Live gates, ticket scanner terminals, and crowd telemetry are decommissioned.
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#382F27] font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteEvent}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Yes, Delete Event</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </OrganizerLayout>
  );
};
