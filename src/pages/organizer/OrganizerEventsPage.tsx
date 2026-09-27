import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Calendar,
  MapPin,
  Users,
  Ticket,
  Activity,
  Sliders,
  ExternalLink,
  X,
  Check,
  Building,
  Clock,
  Sparkles,
  Layers,
  DoorOpen,
  Eye,
  EyeOff,
  ShoppingBag,
  Coffee,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { OrganizerLayout } from "../../components/organizer/OrganizerLayout";
import {
  getOrganizerEvents,
  saveStoredEvent,
  publishEvent,
  unpublishEvent,
  deleteStoredEvent,
} from "../../services/eventStorageService";
import {
  getEventLiveState,
  computeEventReadiness,
} from "../../services/operationalStateService";
import { getAllBookings } from "../../services/bookingService";
import { Booking } from "../../types/booking";
import { AppEvent, EventCategory, EventVisibility } from "../../types/event";
import { useEventSelection } from "../../context/EventContext";
import { getEventImage, resolveEventBanner } from "../../utils/eventImageResolver";

export const OrganizerEventsPage: React.FC = () => {
  const { user } = useAuth();
  const { refreshEvents } = useEventSelection();
  const navigate = useNavigate();

  const [events, setEvents] = useState<AppEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Deletion Modal State
  const [eventToDelete, setEventToDelete] = useState<AppEvent | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Bookings View Modal State
  const [viewingBookingsEvent, setViewingBookingsEvent] = useState<AppEvent | null>(null);


  // Form State for Event Creation
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<
    "Sports" | "Concerts" | "Conferences" | "Festivals" | "Large Gatherings"
  >("Conferences");
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState("November 20, 2026");
  const [formStartTime, setFormStartTime] = useState("09:00");
  const [formEndTime, setFormEndTime] = useState("18:00");
  const [formVenue, setFormVenue] = useState("Jio World Convention Centre");
  const [formLocation, setFormLocation] = useState("Bandra Kurla Complex (BKC), Mumbai, India");
  const [formDistrict, setFormDistrict] = useState("BKC Mumbai");
  const [formStateVal, setFormStateVal] = useState("Maharashtra");
  const [formCapacity, setFormCapacity] = useState("8500");
  const [formExpectedAttendance, setFormExpectedAttendance] = useState("8000");
  const [formImage, setFormImage] = useState("");
  const [formVisibility, setFormVisibility] = useState<EventVisibility>("PUBLISHED");

  // Sub-items for creation
  const [formGatesText, setFormGatesText] = useState(
    "Gate 1 (Main Ingress), Gate 2 (VIP & Delegates), Gate 3 (Turnstile Concourse)"
  );
  const [formZonesText, setFormZonesText] = useState(
    "Grand Hall A, Exhibition Pavilions, Delegate Lounge"
  );
  const [formScheduleText, setFormScheduleText] = useState(
    "09:00 - Turnstiles Open\n10:00 - Keynote Address\n13:00 - Networking Lunch\n17:30 - Closing Session"
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadEvents = () => {
    if (user?.id) {
      const orgEvents = getOrganizerEvents(user.id);
      setEvents(orgEvents);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [user?.id]);

  const allBookings = getAllBookings();

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || evt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTogglePublish = (evt: AppEvent) => {
    const currentVis = evt.visibility || "PUBLISHED";
    const nextVis: EventVisibility = currentVis === "PUBLISHED" ? "UNPUBLISHED" : "PUBLISHED";

    if (nextVis === "PUBLISHED") {
      publishEvent(evt.id);
      showToast("Event published successfully.");
    } else {
      unpublishEvent(evt.id);
      showToast("Event unpublished. Hidden from attendee discovery.");
    }
    loadEvents();
    refreshEvents();
  };

  const handleConfirmDeleteEvent = () => {
    if (!eventToDelete) return;
    const eventName = eventToDelete.name;

    // Perform cascading deletion
    deleteStoredEvent(eventToDelete.id);

    // Refresh state
    loadEvents();
    refreshEvents();

    setIsDeleteDialogOpen(false);
    setEventToDelete(null);

    showToast(`Event "${eventName}" has been permanently removed across Attendee, Hospitality, and Operator modules.`);
  };

  const handleCreateEvent = (publishStatus: EventVisibility) => {
    if (!formName.trim() || !user?.id) return;

    // Build Gates
    const gatesList = formGatesText
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean)
      .map((gName, idx) => ({
        id: `gate-${idx + 1}-${Date.now().toString(36)}`,
        name: gName,
        assignedZones: ["Main Concourse"],
        status: "optimal" as const,
        avgWaitMins: 0,
      }));

    // Build Zones
    const zonesList = formZonesText
      .split(",")
      .map((z) => z.trim())
      .filter(Boolean)
      .map((zName) => ({
        id: `zone-${Date.now().toString(36)}`,
        name: zName,
        capacity: Math.round(parseInt(formCapacity.replace(/,/g, "") || "5000", 10) / 3),
      }));

    // Build Schedule
    const scheduleList = formScheduleText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("-");
        const time = parts[0]?.trim() || "09:00 IST";
        const activity = parts.slice(1).join("-").trim() || line;
        return {
          time,
          activity,
        };
      });

    const eventId = `${formName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}-${Date.now().toString(36).substring(0, 4)}`;

    // Resolve Contextual Image dynamically
    const resolvedImage = resolveEventBanner(
      formCategory,
      formName,
      formVenue,
      formImage
    );

    const newEvent: AppEvent & { organizerId: string; visibility: EventVisibility } = {
      id: eventId,
      organizerId: user.id,
      visibility: publishStatus,
      name: formName.trim(),
      category: formCategory,
      description: formDescription.trim() || `Official ${formCategory} organized by ${user.name}.`,
      date: formDate.trim(),
      time: `${formStartTime} - ${formEndTime} IST`,
      venue: formVenue.trim(),
      location: formLocation.trim(),
      district: formDistrict.trim(),
      state: formStateVal.trim(),
      country: "India",
      latitude: 19.0607,
      longitude: 72.8656,
      capacity: formCapacity.trim(),
      expectedAttendance: formExpectedAttendance.trim(),
      image: resolvedImage,
      statusBadge: publishStatus === "PUBLISHED" ? "Upcoming" : "Draft",
      accentColor: "blue",
      gates:
        gatesList.length > 0
          ? gatesList
          : [
              { id: "gate-1", name: "Gate 1 (Main Entrance)", status: "optimal", assignedZones: ["Main Hall"] },
              { id: "gate-2", name: "Gate 2 (Fast Track)", status: "optimal", assignedZones: ["VIP Pavilion"] },
            ],
      zones:
        zonesList.length > 0
          ? zonesList
          : [
              { id: "zone-1", name: "General Concourse", capacity: "5,000" },
              { id: "zone-2", name: "Executive Suite", capacity: "1,500" },
            ],
      transport: [
        {
          type: "metro",
          title: "Metro Line Access",
          detail: "Nearest Metro station 350m via covered pedestrian concourse.",
          frequency: "Every 4 mins",
        },
        {
          type: "shuttle",
          title: "Dedicated Event Shuttles",
          detail: "Pick-up and drop bays at East Parking terminal.",
          frequency: "Every 10 mins",
        },
      ],
      parking: [
        {
          id: `park-${Date.now()}-1`,
          name: "Main Deck Parking Zone A",
          capacity: "1,200",
          status: "available",
          fee: "₹200",
        },
        {
          id: `park-${Date.now()}-2`,
          name: "West Multi-Level Parking",
          capacity: "800",
          status: "available",
          fee: "₹250",
        },
      ],
      hospitality: [
        {
          type: "f&b",
          title: "Gourmet Catering & Dining Court",
          location: "Ground Level Concourse",
          details: "Multi-cuisine food vendors and beverage stations.",
        },
        {
          type: "medical",
          title: "Emergency First Aid & Trauma Response",
          location: "Gate 2 Medical Hub",
          details: "Certified paramedics and emergency response unit.",
        },
      ],
      schedule:
        scheduleList.length > 0
          ? scheduleList
          : [
              { time: `${formStartTime} IST`, activity: "Ingress & Turnstiles Open" },
              { time: "10:30 IST", activity: "Official Program Commences" },
              { time: `${formEndTime} IST`, activity: "Event Closes & Egress" },
            ],
      organizerInfo: {
        name: (user as any).organization || user.name,
        verified: true,
        supportContact: user.mobile || "+91 98200 12345",
      },
    };

    saveStoredEvent(newEvent, user.id);
    refreshEvents();
    loadEvents();
    setIsCreateModalOpen(false);

    if (publishStatus === "PUBLISHED") {
      showToast("Event published successfully.");
    } else {
      showToast("Event saved as draft.");
    }

    // Reset form
    setFormName("");
    setFormDescription("");
    setFormImage("");
  };

  const getEventBookings = (eventId: string): Booking[] => {
    return allBookings.filter((b) => b.eventId === eventId);
  };

  return (
    <OrganizerLayout
      pageTitle="Event Management"
      pageSubtitle="Configure, publish, and manage all events under your organization."
      pageBadge="Canonical Event Registry"
    >
      <div className="space-y-6 font-sans">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#0B1120] text-white shadow-xl border border-[#382F27] animate-fade-in text-xs font-bold font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Control Bar */}
        <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#8C8272] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search events by name, venue, city..."
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-[#C9D9F7] bg-[#F4F8FF]/50 text-xs font-medium text-[#0B1120] focus:outline-none focus:ring-1 focus:ring-[#4F7CFF] focus:bg-[#F0E9D6]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {["All", "Sports", "Concerts", "Conferences", "Festivals", "Large Gatherings"].map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-[#4F7CFF] text-white shadow-2xs"
                        : "bg-[#F7FAFF] text-[#4A4236] hover:bg-[#C9D9F7]"
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const liveState = getEventLiveState(evt.id, evt);
            const readiness = computeEventReadiness(evt, liveState);
            const eventBookings = getEventBookings(evt.id);
            const totalSold = eventBookings.reduce((sum, b) => sum + (b.quantity || 1), 0);
            const eventBanner = getEventImage(evt);
            const isPublished = !evt.visibility || evt.visibility === "PUBLISHED";
            const isDraft = evt.visibility === "DRAFT";

            return (
              <div
                key={evt.id}
                className="rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs overflow-hidden flex flex-col hover:border-[#6EA8FF] transition-all hover:shadow-xs group"
              >
                {/* Event Image Banner */}
                <div className="relative h-44 w-full bg-[#0B1120] overflow-hidden">
                  <img
                    src={eventBanner}
                    alt={evt.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/85 via-[#0B1120]/30 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase bg-[#0B1120]/90 text-white backdrop-blur-md border border-white/10">
                      {evt.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase ${
                        isPublished
                          ? "bg-emerald-500 text-white"
                          : isDraft
                          ? "bg-blue-500 text-white"
                          : "bg-[#4A4236] text-white"
                      }`}
                    >
                      {evt.visibility || "PUBLISHED"}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePublish(evt);
                      }}
                      title={isPublished ? "Unpublish Event" : "Publish Event"}
                      className={`p-2 rounded-xl backdrop-blur-md border text-xs font-bold transition-colors cursor-pointer ${
                        isPublished
                          ? "bg-[#0B1120]/80 hover:bg-[#241E17] text-white border-white/20"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400"
                      }`}
                    >
                      {isPublished ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEventToDelete(evt);
                        setIsDeleteDialogOpen(true);
                      }}
                      title="Remove / Delete Event Permanently"
                      className="p-2 rounded-xl backdrop-blur-md border text-xs font-bold transition-colors cursor-pointer bg-[#0B1120]/80 hover:bg-rose-600 text-white hover:text-white border-white/20 hover:border-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="font-mono text-[#C9D9F7] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#4F7CFF]" />
                      {evt.date}
                    </span>
                    <span className="font-mono font-bold bg-[#4F7CFF]/90 px-2 py-0.5 rounded-md">
                      {readiness.overallPercent}% Ready
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-heading font-bold text-base text-[#0B1120] group-hover:text-[#4F7CFF] transition-colors line-clamp-1">
                      {evt.name}
                    </h3>
                    <p className="text-xs text-[#6B6252] flex items-center gap-1 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-[#8C8272] shrink-0" />
                      <span>{evt.venue}</span>
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F7FAFF] text-xs font-mono">
                    <div className="p-2.5 rounded-2xl bg-[#F4F8FF] border border-[#F7FAFF]">
                      <span className="text-[10px] text-[#8C8272] block uppercase">Capacity</span>
                      <span className="font-bold text-[#0B1120]">{evt.capacity}</span>
                    </div>
                    <div
                      onClick={() => setViewingBookingsEvent(evt)}
                      className="p-2.5 rounded-2xl bg-[#F7FAFF]/60 border border-[#EDE3CB] hover:bg-[#EDE3CB]/60 transition-colors cursor-pointer"
                    >
                      <span className="text-[10px] text-[#4F7CFF] block uppercase font-bold flex items-center justify-between">
                        <span>Bookings</span>
                        <Ticket className="w-3 h-3 text-[#4F7CFF]" />
                      </span>
                      <span className="font-bold text-[#0B1120]">{totalSold} Sold</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      to={`/operations/events/${evt.id}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#241E17] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Configure</span>
                    </Link>

                    <Link
                      to={`/operations/hospitality?eventId=${evt.id}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Coffee className="w-3.5 h-3.5" />
                      <span>Hospitality</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setEventToDelete(evt);
                        setIsDeleteDialogOpen(true);
                      }}
                      title="Delete Event"
                      className="p-2 rounded-xl bg-[#F7FAFF] hover:bg-rose-50 text-[#6B6252] hover:text-rose-600 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ========================================================
            MODAL: CREATE NEW EVENT (WITH DRAFT / PUBLISH ACTIONS)
           ======================================================== */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1120]/60 backdrop-blur-xs">
            <div className="w-full max-w-2xl max-h-[90vh] rounded-3xl bg-[#F0E9D6] border border-[#C9A15C]/25 p-6 sm:p-8 shadow-[0_28px_80px_rgba(3,12,30,0.35)] flex flex-col space-y-5 overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-[#F7FAFF]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#F7FAFF] text-[#2D5FD2]">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold font-heading text-[#0B1120]">
                    Create New Mega-Event
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 rounded-xl text-[#8C8272] hover:text-[#382F27] hover:bg-[#F7FAFF]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs font-sans">
                <div>
                  <label className="block font-bold text-[#382F27] mb-1">Event Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. World Cricket Final 2026 / Global AI Summit"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#B8C9E6] bg-[#FFFDF8] text-[#0B1120] placeholder:text-[#7B746A] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#382F27] mb-1">Category *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#B8C9E6] bg-[#FFFDF8] text-[#0B1120] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF]"
                    >
                      <option value="Conferences">Conferences</option>
                      <option value="Sports">Sports</option>
                      <option value="Concerts">Concerts</option>
                      <option value="Festivals">Festivals</option>
                      <option value="Large Gatherings">Large Gatherings</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#382F27] mb-1">Date *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. November 20, 2026"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#B8C9E6] bg-[#FFFDF8] text-[#0B1120] placeholder:text-[#7B746A] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#382F27] mb-1">Venue Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jio World Convention Centre"
                      value={formVenue}
                      onChange={(e) => setFormVenue(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#B8C9E6] bg-[#FFFDF8] text-[#0B1120] placeholder:text-[#7B746A] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#382F27] mb-1">Location / City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BKC, Mumbai, India"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#B8C9E6] bg-[#FFFDF8] text-[#0B1120] placeholder:text-[#7B746A] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#382F27] mb-1">Total Capacity *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 15,000"
                      value={formCapacity}
                      onChange={(e) => setFormCapacity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#B8C9E6] bg-[#FFFDF8] text-[#0B1120] placeholder:text-[#7B746A] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#382F27] mb-1">Expected Attendance</label>
                    <input
                      type="text"
                      placeholder="e.g. 14,000"
                      value={formExpectedAttendance}
                      onChange={(e) => setFormExpectedAttendance(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#B8C9E6] bg-[#FFFDF8] text-[#0B1120] placeholder:text-[#7B746A] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#382F27] mb-1">
                    Custom Banner Image URL (Optional — Auto-Resolved If Empty)
                  </label>
                  <input
                    type="url"
                    placeholder="Leave empty for smart context-aware photography resolution"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#B8C9E6] bg-[#FFFDF8] text-[#0B1120] placeholder:text-[#7B746A] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF]"
                  />
                  <p className="text-[11px] text-[#5F594F] mt-1.5 leading-relaxed">
                    EventFlow uses intelligent image resolution to match sports, tech summit, or concert visuals automatically.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-[#382F27] mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Key highlights and scope of the event..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#B8C9E6] bg-[#FFFDF8] text-[#0B1120] placeholder:text-[#7B746A] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF]"
                  />
                </div>
              </div>

              {/* Actions: Save Draft vs Publish */}
              <div className="pt-4 border-t border-[#F7FAFF] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#382F27] text-xs font-bold"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCreateEvent("DRAFT")}
                    className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold"
                  >
                    Save as Draft
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCreateEvent("PUBLISHED")}
                    className="px-5 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white text-xs font-bold shadow-2xs"
                  >
                    Publish Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL: EVENT BOOKINGS & ATTENDEES VIEW
           ======================================================== */}
        {viewingBookingsEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1120]/60 backdrop-blur-xs">
            <div className="w-full max-w-3xl max-h-[90vh] rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7] p-6 sm:p-8 shadow-2xl flex flex-col space-y-5 overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-[#F7FAFF]">
                <div>
                  <h3 className="text-base font-bold font-heading text-[#0B1120] flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-[#4F7CFF]" />
                    <span>Bookings & Attendee Passports</span>
                  </h3>
                  <p className="text-xs text-[#6B6252] mt-0.5">
                    {viewingBookingsEvent.name} • {viewingBookingsEvent.venue}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingBookingsEvent(null)}
                  className="p-1.5 rounded-xl text-[#8C8272] hover:text-[#382F27] hover:bg-[#F7FAFF]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Bookings List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {getEventBookings(viewingBookingsEvent.id).length > 0 ? (
                  getEventBookings(viewingBookingsEvent.id).map((b) => (
                    <div
                      key={b.bookingId}
                      className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0B1120] font-sans text-xs">
                            {b.attendeeName}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                            {b.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#6B6252] block font-sans">
                          {b.attendeeEmail} • {b.ticketType} ({b.quantity} pass)
                        </span>
                        <span className="text-[10px] text-[#8C8272] block">
                          Assigned Gate: {b.assignedGate} • Section: {b.section}
                        </span>
                      </div>

                      <div className="text-right sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#C9D9F7]">
                        <span className="font-bold text-[#0B1120] text-xs block">
                          ₹{b.totalPrice.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-[#8C8272] block">ID: {b.bookingId}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7] space-y-2">
                    <Ticket className="w-8 h-8 text-[#C9BBA0] mx-auto" />
                    <p className="text-[#6B6252] font-medium">
                      No attendee bookings recorded yet for this event ID ({viewingBookingsEvent.id}).
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#F7FAFF] flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setViewingBookingsEvent(null)}
                  className="px-5 py-2 rounded-xl bg-[#0B1120] hover:bg-[#241E17] text-white font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL: CASCADING DELETE CONFIRMATION
           ======================================================== */}
        {isDeleteDialogOpen && eventToDelete && (
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
                    This action will permanently delete <span className="font-bold text-[#0B1120]">"{eventToDelete.name}"</span> and cascade changes across the entire system.
                  </p>
                </div>
              </div>

              {/* Impact Breakdown */}
              <div className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/90 space-y-2.5 text-xs text-[#4A4236]">
                <span className="font-bold text-[#241E17] block text-[11px] uppercase tracking-wider">
                  Cascading Deletion Impact:
                </span>
                <ul className="space-y-1.5 text-[11px] list-disc list-inside text-[#4A4236]">
                  <li>
                    <strong className="text-[#241E17]">Attendee Discovery:</strong> Event is removed from home feeds, search results, and booking flows.
                  </li>
                  <li>
                    <strong className="text-[#241E17]">Attendee Wallets:</strong> Associated bookings and digital passes are purged.
                  </li>
                  <li>
                    <strong className="text-[#241E17]">Hospitality & Resources:</strong> Medical posts, food zones, shuttle lines, and parking configurations are wiped.
                  </li>
                  <li>
                    <strong className="text-[#241E17]">Field Stations:</strong> Turnstile gates, scanner terminals, and crowd telemetry are decommissioned.
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteDialogOpen(false);
                    setEventToDelete(null);
                  }}
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
                  <span>Permanently Delete Event</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </OrganizerLayout>
  );
};
