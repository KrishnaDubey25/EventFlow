import React, { useState, useEffect } from "react";
import {
  Layers,
  Truck,
  Car,
  UtensilsCrossed,
  HeartPulse,
  Wrench,
  HelpCircle,
  Building,
  BedDouble,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  MapPin,
  Sparkles,
  DollarSign,
  Phone,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { OperatorLayout } from "../../components/operator/OperatorLayout";
import { useAuth } from "../../context/AuthContext";
import { OperatorUser, normalizeOperatorType } from "../../types/auth";
import {
  getOperatorResources,
  addOperatorResource,
  updateOperatorResource,
  deleteOperatorResource,
} from "../../services/operatorResourceService";
import { OperatorResourceRecord } from "../../types/operator";

export const OperatorResourcesPage: React.FC = () => {
  const { user } = useAuth();
  const operatorUser = user as OperatorUser | null;
  const operatorId = user?.id || "";
  const operatorType = normalizeOperatorType(operatorUser?.operatorType);

  const [resources, setResources] = useState<OperatorResourceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<OperatorResourceRecord | null>(null);

  // Universal Form Fields
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState(50);
  const [occupiedCapacity, setOccupiedCapacity] = useState(0);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "STANDBY" | "MAINTENANCE">("ACTIVE");

  // Accommodation Specific
  const [roomTypes, setRoomTypes] = useState("Deluxe King, Executive Suite");
  const [pricePerNight, setPricePerNight] = useState("₹4,500");
  const [amenities, setAmenities] = useState("WiFi, Buffet Breakfast, AC");
  const [distanceToVenue, setDistanceToVenue] = useState("1.2 km from BKC Gate 2");

  // Transport Specific
  const [routeName, setRouteName] = useState("Feeder Line 1");
  const [vehicleType, setVehicleType] = useState("Electric AC Coach");
  const [plateNumber, setPlateNumber] = useState("MH-02-EF-8812");
  const [driverName, setDriverName] = useState("Sunil R.");
  const [driverPhone, setDriverPhone] = useState("+91 98200 44321");
  const [tripStatus, setTripStatus] = useState<any>("On Route");

  // Parking Specific
  const [facilityType, setFacilityType] = useState("Covered Multi-Level");
  const [entryGate, setEntryGate] = useState("Gate 4");
  const [hourlyFee, setHourlyFee] = useState("₹150/hr");

  // Food Specific
  const [stallName, setStallName] = useState("Artisan Roast Cafe");
  const [foodType, setFoodType] = useState("Specialty Coffee & Pastries");
  const [operatingHours, setOperatingHours] = useState("08:00 AM - 10:00 PM");
  const [waitTimeMinutes, setWaitTimeMinutes] = useState(5);
  const [rushStatus, setRushStatus] = useState<string>("Normal");

  // Medical Specific
  const [stationName, setStationName] = useState("First Aid Post Alpha");
  const [staffOnDuty, setStaffOnDuty] = useState("2 Doctors, 3 Paramedics");
  const [ambulanceStandby, setAmbulanceStandby] = useState(true);
  const [emergencyPhone, setEmergencyPhone] = useState("+91 98200 11999");

  // Venue Services Specific
  const [serviceCategory, setServiceCategory] = useState("Electrical & Sound");
  const [assignedArea, setAssignedArea] = useState("Main Stage & Rigging");
  const [teamSize, setTeamSize] = useState(6);
  const [equipmentStatus, setEquipmentStatus] = useState("Operational");
  const [currentTask, setCurrentTask] = useState("Primary line monitor");

  // Other Services Specific
  const [customType, setCustomType] = useState("VIP Guest Liaison");
  const [contactPerson, setContactPerson] = useState("Anita S.");

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

  const openAddModal = () => {
    setEditingResource(null);
    setName("");
    setLocation("");
    setCapacity(50);
    setOccupiedCapacity(0);
    setNotes("");
    setStatus("ACTIVE");

    // Defaults based on type
    if (operatorType === "Accommodation") {
      setName("Regal Horizon Suites");
      setLocation("0.8 km from West Entrance");
      setCapacity(80);
      setPricePerNight("₹5,200");
    } else if (operatorType === "Transport") {
      setName("Shuttle Coach 09");
      setLocation("Metro Stn - Gate 1 Line");
      setCapacity(45);
      setPlateNumber("MH-01-EF-9911");
    } else if (operatorType === "Parking") {
      setName("Parking Lot P3 (North)");
      setLocation("North Perimeter Road");
      setCapacity(300);
      setEntryGate("Gate 2");
    } else if (operatorType === "Food & Dining") {
      setName("Chai & Coastal Bites");
      setLocation("Food Court Bay C");
      setCapacity(120);
      setFoodType("Street Snacks & Refreshments");
    } else if (operatorType === "Medical & Assistance") {
      setName("Medical Point Gamma");
      setLocation("South Concourse Level 1");
      setCapacity(6);
      setStaffOnDuty("1 Doctor, 2 Paramedics");
    } else if (operatorType === "Venue Services") {
      setName("HVAC & Stage Rigging Unit 3");
      setLocation("Zone B Mechanical Room");
      setCapacity(8);
      setServiceCategory("HVAC & Atmosphere");
    } else {
      setName("Guest Information & Help Kiosk 2");
      setLocation("Main Concourse Fountain");
      setCapacity(25);
    }

    setIsModalOpen(true);
  };

  const openEditModal = (res: OperatorResourceRecord) => {
    setEditingResource(res);
    setName(res.name);
    setLocation(res.location || "");
    setCapacity(res.capacity);
    setOccupiedCapacity(res.occupiedCapacity || 0);
    setNotes(res.notes || "");
    setStatus(res.status);

    if (res.accommodation) {
      setRoomTypes(res.accommodation.roomTypes?.join(", ") || "");
      setPricePerNight(res.accommodation.pricePerNight || "");
      setAmenities(res.accommodation.amenities?.join(", ") || "");
      setDistanceToVenue(res.accommodation.distanceToVenue || "");
    }
    if (res.transport) {
      setRouteName(res.transport.routeName || "");
      setVehicleType(res.transport.vehicleType || "");
      setPlateNumber(res.transport.plateNumber || res.transport.registrationNumber || "");
      setDriverName(res.transport.driverName || "");
      setDriverPhone(res.transport.driverPhone || res.transport.driverContact || "");
      setTripStatus((res.transport.tripStatus as any) || "On Route");
    }
    if (res.parking) {
      setFacilityType(res.parking.facilityType || res.parking.parkingType || "");
      setEntryGate(res.parking.entryGate || "Gate 4");
      setHourlyFee(res.parking.hourlyFee || res.parking.hourlyRate || "");
    }
    if (res.food) {
      setStallName(res.food.stallName || res.food.outletName || "");
      setFoodType(res.food.foodType || res.food.cuisine || "");
      setOperatingHours(res.food.operatingHours || "08:00 AM - 10:00 PM");
      setWaitTimeMinutes(res.food.waitTimeMinutes ?? res.food.averageWaitMinutes ?? 5);
      setRushStatus(res.food.rushStatus || res.food.serviceStatus || "Normal");
    }
    if (res.medical) {
      setStationName(res.medical.stationName || res.medical.pointName || "");
      setStaffOnDuty(res.medical.staffOnDuty || `${res.medical.doctorsOnDuty || 1} Doctors, ${res.medical.paramedicsOnDuty || 2} EMTs`);
      setAmbulanceStandby(Boolean(res.medical.ambulanceStandby ?? (res.medical.ambulancesStationed && res.medical.ambulancesStationed > 0)));
      setEmergencyPhone(res.medical.emergencyContact || res.medical.emergencyHotline || "+91 98200 11999");
    }
    const vs = res.venueServices || (res as any).venueService;
    if (vs) {
      setServiceCategory(vs.serviceCategory || "General Maintenance");
      setAssignedArea(vs.assignedArea || "Main Event Ground");
      setTeamSize(vs.teamSize || vs.staffOnDuty || 4);
      setEquipmentStatus(vs.equipmentStatus || vs.operationalStatus || "Operational");
      setCurrentTask(vs.currentTask || "Area readiness check");
    }
    const os = res.otherServices || (res as any).otherService;
    if (os) {
      setCustomType(os.type || os.serviceCategory || "Specialized Concierge");
      setContactPerson(os.contactPerson || "Lead Coordinator");
    }

    setIsModalOpen(true);
  };

  const handleSaveResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const available = Math.max(0, capacity - occupiedCapacity);

    // Build sub-object based on operatorType
    const payload: Partial<OperatorResourceRecord> = {
      name: name.trim(),
      operatorType,
      location: location.trim(),
      capacity: Number(capacity) || 1,
      occupiedCapacity: Number(occupiedCapacity) || 0,
      availableCapacity: available,
      status,
      notes: notes.trim(),
    };

    if (operatorType === "Accommodation") {
      payload.accommodation = {
        propertyName: name.trim(),
        roomTypes: roomTypes.split(",").map((s) => s.trim()).filter(Boolean),
        totalRooms: Number(capacity) || 1,
        availableRooms: available,
        pricePerNight,
        amenities: amenities.split(",").map((s) => s.trim()).filter(Boolean),
        distanceToVenue,
      };
    } else if (operatorType === "Transport") {
      payload.transport = {
        routeName,
        vehicleType,
        plateNumber,
        registrationNumber: plateNumber,
        seatCapacity: Number(capacity) || 1,
        totalSeats: Number(capacity) || 1,
        currentLoad: Number(occupiedCapacity) || 0,
        availableSeats: available,
        driverName,
        driverPhone,
        driverContact: driverPhone,
        tripStatus,
      };
    } else if (operatorType === "Parking") {
      payload.parking = {
        facilityName: name.trim(),
        facilityType,
        totalSlots: Number(capacity) || 1,
        occupiedSlots: Number(occupiedCapacity) || 0,
        availableSlots: available,
        supportedVehicles: ["Four Wheelers", "Two Wheelers"],
        entryGate,
        hourlyFee,
        hourlyRate: hourlyFee,
      };
    } else if (operatorType === "Food & Dining") {
      payload.food = {
        stallName: name.trim(),
        outletName: name.trim(),
        foodType,
        cuisine: foodType,
        locationInVenue: location.trim(),
        operatingHours,
        waitTimeMinutes: Number(waitTimeMinutes) || 5,
        averageWaitMinutes: Number(waitTimeMinutes) || 5,
        menuStatus: "Available",
        rushStatus,
      };
    } else if (operatorType === "Medical & Assistance") {
      payload.medical = {
        stationName: name.trim(),
        pointName: name.trim(),
        location: location.trim(),
        staffOnDuty,
        availableBeds: available,
        ambulanceStandby,
        emergencyContact: emergencyPhone,
        emergencyHotline: emergencyPhone,
      };
    } else if (operatorType === "Venue Services") {
      payload.venueServices = {
        serviceName: name.trim(),
        serviceCategory,
        assignedArea: location.trim() || assignedArea,
        teamSize: Number(teamSize) || 4,
        staffOnDuty: Number(teamSize) || 4,
        equipmentStatus,
        currentTask,
      };
    } else {
      payload.otherServices = {
        serviceName: name.trim(),
        type: customType,
        serviceCategory: customType,
        description: notes.trim() || "Event custom support service",
        unitsAvailable: available,
        contactPerson,
      };
    }

    if (editingResource) {
      updateOperatorResource(operatorId, editingResource.id, payload);
      setFeedback(`Updated resource "${name}" successfully.`);
    } else {
      addOperatorResource(operatorId, { ...payload, name: name.trim(), operatorType });
      setFeedback(`Added new ${operatorType} resource "${name}".`);
    }

    setIsModalOpen(false);
    setTimeout(() => setFeedback(null), 3000);
    loadResources();
  };

  const handleDelete = (id: string, resName: string) => {
    if (confirm(`Are you sure you want to remove "${resName}"?`)) {
      deleteOperatorResource(operatorId, id);
      setFeedback(`Removed resource "${resName}".`);
      setTimeout(() => setFeedback(null), 3000);
      loadResources();
    }
  };

  const handleQuickToggleStatus = (res: OperatorResourceRecord) => {
    const nextStatus = res.status === "ACTIVE" ? "MAINTENANCE" : res.status === "MAINTENANCE" ? "INACTIVE" : "ACTIVE";
    updateOperatorResource(operatorId, res.id, { status: nextStatus });
    setFeedback(`Status for "${res.name}" changed to ${nextStatus}.`);
    setTimeout(() => setFeedback(null), 2500);
    loadResources();
  };

  // Type Metadata
  const getTypeMeta = () => {
    switch (operatorType) {
      case "Accommodation":
        return {
          title: "My Properties & Accommodations",
          subtitle: "Manage hotel rooms, luxury suites, room types, rates, and guest capacity.",
          entityName: "Property",
          icon: BedDouble,
          unit: "Rooms",
        };
      case "Transport":
        return {
          title: "Fleet & Vehicle Fleet Management",
          subtitle: "Manage shuttle buses, vehicles, route assignments, driver contacts, and trip statuses.",
          entityName: "Vehicle",
          icon: Truck,
          unit: "Seats",
        };
      case "Parking":
        return {
          title: "Parking Facilities & Lots",
          subtitle: "Configure parking lots, designated bays, entry gates, and slot allocations.",
          entityName: "Parking Facility",
          icon: Car,
          unit: "Slots",
        };
      case "Food & Dining":
        return {
          title: "Dining Outlets & Food Stalls",
          subtitle: "Manage kitchens, catering stalls, wait times, menus, and rush statuses.",
          entityName: "Outlet",
          icon: UtensilsCrossed,
          unit: "Covers",
        };
      case "Medical & Assistance":
        return {
          title: "Medical Points & Stations",
          subtitle: "Manage emergency stations, on-duty clinical staff, ambulances, and clinic beds.",
          entityName: "Medical Station",
          icon: HeartPulse,
          unit: "Beds",
        };
      case "Venue Services":
        return {
          title: "Assigned Venue Services & Units",
          subtitle: "Manage facility crews, technical rigging, electrical power, and maintenance teams.",
          entityName: "Service Unit",
          icon: Wrench,
          unit: "Crew",
        };
      default:
        return {
          title: "My Resources & Specialized Units",
          subtitle: "Manage operational items, service allocations, inventory, and point-of-contacts.",
          entityName: "Resource",
          icon: HelpCircle,
          unit: "Units",
        };
    }
  };

  const meta = getTypeMeta();
  const Icon = meta.icon;

  const filtered = resources.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      r.name.toLowerCase().includes(q) ||
      (r.location && r.location.toLowerCase().includes(q)) ||
      (r.notes && r.notes.toLowerCase().includes(q));
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <OperatorLayout title={meta.title} subtitle={meta.subtitle}>
      {/* Top Action & Search Bar */}
      <div className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7]/80 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 text-[#8C8272] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${meta.entityName.toLowerCase()}s by name, sector...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs font-medium text-[#382F27] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active / Available</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New {meta.entityName}</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-600">✕</button>
        </div>
      )}

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((res) => {
          const occPct = res.capacity > 0 ? Math.round(((res.occupiedCapacity || 0) / res.capacity) * 100) : 0;
          const isOnline = res.status === "ACTIVE";

          return (
            <div
              key={res.id}
              className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7]/80 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#F7FAFF] text-[#4F7CFF]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#0B1120] font-heading line-clamp-1">{res.name}</h3>
                      <p className="text-xs text-[#6B6252] line-clamp-1">
                        {res.location || "Assigned Event Sector"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleQuickToggleStatus(res)}
                    className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                      res.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        : res.status === "MAINTENANCE"
                        ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                        : "bg-[#F7FAFF] text-[#4A4236] border border-[#C9D9F7] hover:bg-[#C9D9F7]"
                    }`}
                    title="Click to cycle operational state"
                  >
                    {res.status}
                  </button>
                </div>

                {/* Type-Specific Details Box */}
                <div className="mt-3 p-3 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7]/60 text-xs space-y-1.5">
                  {operatorType === "Accommodation" && res.accommodation && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-[#6B6252]">Rate / Night:</span>
                        <span className="font-bold text-[#2D5FD2]">{res.accommodation.pricePerNight}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B6252]">Distance:</span>
                        <span className="text-[#382F27] font-medium">{res.accommodation.distanceToVenue}</span>
                      </div>
                      {res.accommodation.roomTypes && (
                        <div className="text-[11px] text-[#6B6252] pt-1 border-t border-[#C9D9F7]/60">
                          {res.accommodation.roomTypes.join(" • ")}
                        </div>
                      )}
                    </>
                  )}

                  {operatorType === "Transport" && res.transport && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-[#6B6252]">Vehicle & Plate:</span>
                        <span className="font-mono font-bold text-[#241E17]">{res.transport.plateNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B6252]">Route Name:</span>
                        <span className="font-semibold text-[#382F27]">{res.transport.routeName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B6252]">Trip Status:</span>
                        <span className="font-bold text-indigo-700">{res.transport.tripStatus}</span>
                      </div>
                    </>
                  )}

                  {operatorType === "Parking" && res.parking && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-[#6B6252]">Entry Gate:</span>
                        <span className="font-bold text-[#241E17]">{res.parking.entryGate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B6252]">Hourly Rate:</span>
                        <span className="font-semibold text-[#2D5FD2]">{res.parking.hourlyFee}</span>
                      </div>
                    </>
                  )}

                  {operatorType === "Food & Dining" && res.food && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-[#6B6252]">Cuisine:</span>
                        <span className="font-bold text-[#241E17]">{res.food.foodType || res.food.cuisine || "Multi-cuisine"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B6252]">Wait Time:</span>
                        <span className="font-bold text-blue-700">{res.food.waitTimeMinutes ?? res.food.averageWaitMinutes ?? 5} mins</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B6252]">Rush Status:</span>
                        <span className="font-semibold text-indigo-700">{res.food.rushStatus || res.food.serviceStatus || "Normal"}</span>
                      </div>
                    </>
                  )}

                  {operatorType === "Medical & Assistance" && res.medical && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-[#6B6252]">Staff On Duty:</span>
                        <span className="font-bold text-[#241E17]">
                          {res.medical.staffOnDuty || `${res.medical.doctorsOnDuty || 1} Doctors, ${res.medical.paramedicsOnDuty || 2} EMTs`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B6252]">Ambulance:</span>
                        <span className="font-semibold text-rose-700">
                          {res.medical.ambulanceStandby ? "Standby Ready" : "On Call"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B6252]">Emergency Phone:</span>
                        <span className="font-mono text-[#382F27]">
                          {res.medical.emergencyContact || res.medical.emergencyHotline || "+91 98200 11999"}
                        </span>
                      </div>
                    </>
                  )}

                  {operatorType === "Venue Services" && (res.venueServices || (res as any).venueService) && (
                    <>
                      {(() => {
                        const vs = res.venueServices || (res as any).venueService;
                        return (
                          <>
                            <div className="flex justify-between">
                              <span className="text-[#6B6252]">Category:</span>
                              <span className="font-bold text-[#241E17]">{vs.serviceCategory}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#6B6252]">Team Size:</span>
                              <span className="font-semibold text-[#382F27]">{vs.teamSize || vs.staffOnDuty || 4} crew</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#6B6252]">Equipment:</span>
                              <span className="font-bold text-emerald-700">{vs.equipmentStatus || vs.operationalStatus || "Operational"}</span>
                            </div>
                          </>
                        );
                      })()}
                    </>
                  )}

                  {operatorType === "Other Services" && (res.otherServices || (res as any).otherService) && (
                    <>
                      {(() => {
                        const os = res.otherServices || (res as any).otherService;
                        return (
                          <>
                            <div className="flex justify-between">
                              <span className="text-[#6B6252]">Type:</span>
                              <span className="font-bold text-[#241E17]">{os.type || os.serviceCategory || "Specialized Service"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#6B6252]">Contact:</span>
                              <span className="font-semibold text-[#382F27]">{os.contactPerson || "Lead Coordinator"}</span>
                            </div>
                          </>
                        );
                      })()}
                    </>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#6B6252]">Utilization</span>
                    <span className="font-bold text-[#241E17]">
                      {res.occupiedCapacity || 0} / {res.capacity} {meta.unit} ({occPct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#F7FAFF] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        occPct >= 90 ? "bg-rose-500" : occPct >= 75 ? "bg-blue-500" : "bg-[#4F7CFF]"
                      }`}
                      style={{ width: `${Math.min(100, occPct)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="pt-3 border-t border-[#F7FAFF] flex items-center justify-between">
                <span className="text-xs text-[#6B6252]">
                  <strong className="text-emerald-700 font-bold">{res.availableCapacity}</strong> {meta.unit.toLowerCase()} free
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(res)}
                    className="p-1.5 rounded-lg text-[#6B6252] hover:text-[#4F7CFF] hover:bg-[#F7FAFF] transition-colors cursor-pointer"
                    title="Edit resource"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(res.id, res.name)}
                    className="p-1.5 rounded-lg text-[#8C8272] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete resource"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Resource Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F0E9D6] rounded-2xl max-w-xl w-full p-6 shadow-xl border border-[#C9D9F7] animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F7FAFF]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#F7FAFF] text-[#4F7CFF]">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0B1120] font-heading">
                    {editingResource ? `Edit ${meta.entityName}` : `Add New ${meta.entityName}`}
                  </h3>
                  <p className="text-xs text-[#6B6252]">Tailored fields for {operatorType} operations</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#8C8272] hover:text-[#4A4236] hover:bg-[#F7FAFF]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveResource} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#382F27] mb-1">{meta.entityName} Name *</label>
                  <input
                    type="text"
                    required
                    placeholder={`e.g. ${meta.entityName} Alpha`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#382F27] mb-1">Assigned Location</label>
                  <input
                    type="text"
                    placeholder="e.g. West Concourse Gate 2"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#382F27] mb-1">Operational Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE (Operational)</option>
                    <option value="MAINTENANCE">MAINTENANCE (Servicing)</option>
                    <option value="INACTIVE">INACTIVE (Offline)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#382F27] mb-1">Total {meta.unit} Capacity *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#382F27] mb-1">Currently Occupied {meta.unit}</label>
                  <input
                    type="number"
                    min={0}
                    max={capacity}
                    value={occupiedCapacity}
                    onChange={(e) => setOccupiedCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none"
                  />
                </div>
              </div>

              {/* Type-Specific Fields Section */}
              <div className="p-3.5 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7]/70 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#2D5FD2]">
                  {operatorType} Specialized Attributes
                </span>

                {operatorType === "Accommodation" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#382F27] mb-1">Room Types</label>
                      <input
                        type="text"
                        placeholder="Deluxe King, Executive Suite"
                        value={roomTypes}
                        onChange={(e) => setRoomTypes(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#F0E9D6] border border-[#C9D9F7] rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#382F27] mb-1">Price / Night</label>
                      <input
                        type="text"
                        placeholder="₹4,800"
                        value={pricePerNight}
                        onChange={(e) => setPricePerNight(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#F0E9D6] border border-[#C9D9F7] rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#382F27] mb-1">Amenities</label>
                      <input
                        type="text"
                        placeholder="WiFi, Pool, Breakfast"
                        value={amenities}
                        onChange={(e) => setAmenities(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#F0E9D6] border border-[#C9D9F7] rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#382F27] mb-1">Distance to Venue</label>
                      <input
                        type="text"
                        placeholder="1.2 km from BKC"
                        value={distanceToVenue}
                        onChange={(e) => setDistanceToVenue(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#F0E9D6] border border-[#C9D9F7] rounded-lg text-xs"
                      />
                    </div>
                  </div>
                )}

                {operatorType === "Transport" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#382F27] mb-1">Route Name</label>
                      <input
                        type="text"
                        placeholder="Feeder Route 1"
                        value={routeName}
                        onChange={(e) => setRouteName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#F0E9D6] border border-[#C9D9F7] rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#382F27] mb-1">Vehicle Type</label>
                      <input
                        type="text"
                        placeholder="Electric AC Shuttle"
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#F0E9D6] border border-[#C9D9F7] rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#382F27] mb-1">Number Plate</label>
                      <input
                        type="text"
                        placeholder="MH-01-EF-8812"
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#F0E9D6] border border-[#C9D9F7] rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#382F27] mb-1">Driver Name & Phone</label>
                      <input
                        type="text"
                        placeholder="Sunil (+91 98200 44321)"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#F0E9D6] border border-[#C9D9F7] rounded-lg text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-[#382F27] mb-1">Live Status</label>
                      <select
                        value={tripStatus}
                        onChange={(e) => setTripStatus(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 bg-[#F0E9D6] border border-[#C9D9F7] rounded-lg text-xs"
                      >
                        <option value="On Route">On Route</option>
                        <option value="Delayed">Delayed</option>
                        <option value="Standby">Standby</option>
                        <option value="Out of Service">Out of Service</option>
                      </select>
                    </div>
                  </div>
                )}

                {operatorType === "Parking" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#382F27] mb-1">Facility Type</label>
                      <input
                        type="text"
                        placeholder="Multi-Level / Open Ground"
                        value={facilityType}
                        onChange={(e) => setFacilityType(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#F0E9D6] border border-[#C9D9F7] rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#382F27] mb-1">Entry Gate</label>
                      <input
                        type="text"
                        placeholder="Gate 4"
                        value={entryGate}
                        onChange={(e) => setEntryGate(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#F0E9D6] border border-[#C9D9F7] rounded-lg text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-[#382F27] mb-1">Hourly / Daily Fee</label>
                      <input
                        type="text"
                        placeholder="₹250 / Day"
                        value={hourlyFee}
                        onChange={(e) => setHourlyFee(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#F0E9D6] border border-[#C9D9F7] rounded-lg text-xs"
                      />
                    </div>
                  </div>
                )}

                {operatorType === "Food & Dining" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#382F27] mb-1">Cuisine / Food Type</label>
                      <input
                        type="text"
                        placeholder="South Indian / Continental"
                        value={foodType}
                        onChange={(e) => setFoodType(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#F0E9D6] border border-[#C9D9F7] rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#382F27] mb-1">Wait Time (Minutes)</label>
                      <input
                        type="number"
                        value={waitTimeMinutes}
                        onChange={(e) => setWaitTimeMinutes(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-[#F0E9D6] border border-[#C9D9F7] rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#382F27] mb-1">Operating Hours</label>
                      <input
                        type="text"
                        placeholder="08:00 AM - 10:00 PM"
                        value={operatingHours}
                        onChange={(e) => setOperatingHours(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#F0E9D6] border border-[#C9D9F7] rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#382F27] mb-1">Rush Status</label>
                      <select
                        value={rushStatus}
                        onChange={(e) => setRushStatus(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 bg-[#F0E9D6] border border-[#C9D9F7] rounded-lg text-xs"
                      >
                        <option value="Normal">Normal</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Peak Rush">Peak Rush</option>
                      </select>
                    </div>
                  </div>
                )}

                {operatorType === "Medical & Assistance" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#382F27] mb-1">Staff On Duty</label>
                      <input
                        type="text"
                        placeholder="2 Doctors, 3 Paramedics"
                        value={staffOnDuty}
                        onChange={(e) => setStaffOnDuty(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#F0E9D6] border border-[#C9D9F7] rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#382F27] mb-1">Emergency Phone</label>
                      <input
                        type="text"
                        placeholder="+91 98200 11999"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#F0E9D6] border border-[#C9D9F7] rounded-lg text-xs"
                      />
                    </div>
                    <div className="col-span-2 flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="ambCheck"
                        checked={ambulanceStandby}
                        onChange={(e) => setAmbulanceStandby(e.target.checked)}
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                      <label htmlFor="ambCheck" className="text-xs text-[#382F27] font-medium">
                        Ambulance vehicle permanently on standby at this post
                      </label>
                    </div>
                  </div>
                )}

                {operatorType === "Venue Services" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#382F27] mb-1">Service Category</label>
                      <input
                        type="text"
                        placeholder="Electrical, Rigging, Sanitation"
                        value={serviceCategory}
                        onChange={(e) => setServiceCategory(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#F0E9D6] border border-[#C9D9F7] rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#382F27] mb-1">Team Size</label>
                      <input
                        type="number"
                        value={teamSize}
                        onChange={(e) => setTeamSize(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-[#F0E9D6] border border-[#C9D9F7] rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#382F27] mb-1">Equipment Status</label>
                      <input
                        type="text"
                        placeholder="Operational / Calibrated"
                        value={equipmentStatus}
                        onChange={(e) => setEquipmentStatus(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#F0E9D6] border border-[#C9D9F7] rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#382F27] mb-1">Current Task</label>
                      <input
                        type="text"
                        placeholder="Stage power inspection"
                        value={currentTask}
                        onChange={(e) => setCurrentTask(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#F0E9D6] border border-[#C9D9F7] rounded-lg text-xs"
                      />
                    </div>
                  </div>
                )}

                {operatorType === "Other Services" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#382F27] mb-1">Service Type</label>
                      <input
                        type="text"
                        placeholder="VIP Concierge, Signage, Locker"
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#F0E9D6] border border-[#C9D9F7] rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#382F27] mb-1">Contact Person</label>
                      <input
                        type="text"
                        placeholder="Manager Name"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#F0E9D6] border border-[#C9D9F7] rounded-lg text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#382F27] mb-1">Operational Notes</label>
                <textarea
                  rows={2}
                  placeholder="Additional specifications or shift handover instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F7FAFF]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#4A4236] hover:bg-[#F7FAFF] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingResource ? "Save Changes" : `Create ${meta.entityName}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </OperatorLayout>
  );
};
