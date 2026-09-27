import React, { useState, useEffect } from "react";
import {
  CalendarCheck,
  Building,
  BedDouble,
  Users,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  LogIn,
  LogOut,
  Sparkles,
  Phone,
  Mail,
  Filter,
  DollarSign,
  AlertCircle,
  Eye,
  Check,
} from "lucide-react";
import { OperatorLayout } from "../../components/operator/OperatorLayout";
import { useAuth } from "../../context/AuthContext";
import { OperatorUser } from "../../types/auth";
import { getOperatorResources } from "../../services/operatorResourceService";
import { OperatorResourceRecord } from "../../types/operator";

interface GuestBooking {
  id: string;
  bookingRef: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  propertyId: string;
  propertyName: string;
  roomType: string;
  roomNumber?: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  totalAmount: number;
  status: "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED" | "NO_SHOW";
  notes?: string;
  specialRequests?: string;
  paymentStatus: "PAID" | "PENDING" | "PAY_AT_CHECKIN";
}

const STORAGE_KEY = "eventflow_accommodation_bookings";

function getStoredBookings(): GuestBooking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  const initialBookings: GuestBooking[] = [
    {
      id: "bk-acc-001",
      bookingRef: "EF-ACC-9821",
      guestName: "Rohan Varma",
      guestEmail: "rohan.varma@example.com",
      guestPhone: "+91 98201 12345",
      propertyId: "res-accom-hotel-grand",
      propertyName: "Grand Concourse Regency & Suites",
      roomType: "Executive Club Suite",
      roomNumber: "Ste 402",
      checkInDate: "2026-10-24",
      checkOutDate: "2026-10-26",
      nights: 2,
      totalAmount: 17000,
      status: "CHECKED_IN",
      paymentStatus: "PAID",
      specialRequests: "High floor, quiet room away from elevators.",
    },
    {
      id: "bk-acc-002",
      bookingRef: "EF-ACC-9822",
      guestName: "Meera Subramanian",
      guestEmail: "meera.subramanian@techcorp.io",
      guestPhone: "+91 99304 88721",
      propertyId: "res-accom-hotel-grand",
      propertyName: "Grand Concourse Regency & Suites",
      roomType: "Deluxe King Room",
      roomNumber: "Rm 218",
      checkInDate: "2026-10-24",
      checkOutDate: "2026-10-25",
      nights: 1,
      totalAmount: 4800,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      specialRequests: "Early check-in around 11:30 AM requested.",
    },
    {
      id: "bk-acc-003",
      bookingRef: "EF-ACC-9823",
      guestName: "Kabir Sengupta",
      guestEmail: "kabir.sen@creatives.in",
      guestPhone: "+91 97112 33445",
      propertyId: "res-accom-hotel-coastal",
      propertyName: "Marine Pearl Boutique Hotel",
      roomType: "Standard Queen Room",
      roomNumber: "Rm 105",
      checkInDate: "2026-10-24",
      checkOutDate: "2026-10-27",
      nights: 3,
      totalAmount: 9600,
      status: "CONFIRMED",
      paymentStatus: "PAY_AT_CHECKIN",
      specialRequests: "Late arrival after 8:00 PM due to flight.",
    },
    {
      id: "bk-acc-004",
      bookingRef: "EF-ACC-9824",
      guestName: "Pooja Malhotra",
      guestEmail: "pooja.malhotra@eventpass.net",
      guestPhone: "+91 98450 77123",
      propertyId: "res-accom-hotel-grand",
      propertyName: "Grand Concourse Regency & Suites",
      roomType: "Executive Club Suite",
      roomNumber: "Ste 408",
      checkInDate: "2026-10-23",
      checkOutDate: "2026-10-25",
      nights: 2,
      totalAmount: 17000,
      status: "CHECKED_OUT",
      paymentStatus: "PAID",
      notes: "Checked out smoothly. Left positive review.",
    },
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBookings));
  return initialBookings;
}

export const OperatorBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const operatorUser = user as OperatorUser | null;
  const operatorId = user?.id || "";

  const [bookings, setBookings] = useState<GuestBooking[]>(getStoredBookings());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedProperty, setSelectedProperty] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [propId, setPropId] = useState("");
  const [roomType, setRoomType] = useState("Deluxe King Room");
  const [roomNumber, setRoomNumber] = useState("");
  const [checkInDate, setCheckInDate] = useState("2026-10-24");
  const [checkOutDate, setCheckOutDate] = useState("2026-10-26");
  const [totalAmount, setTotalAmount] = useState(5500);
  const [specialRequests, setSpecialRequests] = useState("");

  const properties = getOperatorResources(operatorId, "Accommodation");

  useEffect(() => {
    if (properties.length > 0 && !propId) {
      setPropId(properties[0].id);
    }
  }, [properties, propId]);

  const saveBookings = (newBookings: GuestBooking[]) => {
    setBookings(newBookings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookings));
  };

  const updateBookingStatus = (id: string, newStatus: GuestBooking["status"]) => {
    const updated = bookings.map((b) => (b.id === id ? { ...b, status: newStatus } : b));
    saveBookings(updated);
  };

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    const chosenProp = properties.find((p) => p.id === propId);
    const newBooking: GuestBooking = {
      id: `bk-acc-${Date.now()}`,
      bookingRef: `EF-ACC-${Math.floor(1000 + Math.random() * 9000)}`,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim() || `${guestName.toLowerCase().replace(/\s+/g, ".")}@guest.com`,
      guestPhone: guestPhone.trim() || "+91 98000 00000",
      propertyId: propId || "res-accom-hotel-grand",
      propertyName: chosenProp ? chosenProp.name : "Grand Concourse Regency & Suites",
      roomType,
      roomNumber: roomNumber.trim() || "Unassigned",
      checkInDate,
      checkOutDate,
      nights: 2,
      totalAmount: Number(totalAmount) || 5000,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      specialRequests: specialRequests.trim() || undefined,
    };

    saveBookings([newBooking, ...bookings]);
    setIsModalOpen(false);
    // Reset form
    setGuestName("");
    setGuestEmail("");
    setGuestPhone("");
    setRoomNumber("");
    setSpecialRequests("");
  };

  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      b.guestName.toLowerCase().includes(q) ||
      b.bookingRef.toLowerCase().includes(q) ||
      b.guestEmail.toLowerCase().includes(q) ||
      b.propertyName.toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
    const matchProperty = selectedProperty === "ALL" || b.propertyId === selectedProperty;
    return matchSearch && matchStatus && matchProperty;
  });

  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length;
  const checkedInCount = bookings.filter((b) => b.status === "CHECKED_IN").length;
  const checkedOutCount = bookings.filter((b) => b.status === "CHECKED_OUT").length;

  return (
    <OperatorLayout
      title="Guest Bookings & Reservations"
      subtitle="Track attendee hotel reservations, manage check-in arrivals, and allocate rooms in real-time."
    >
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Total Bookings</span>
            <div className="p-2 rounded-xl bg-[#F7FAFF] text-[#4F7CFF]">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0B1120] mt-2 font-heading">{bookings.length}</p>
          <p className="text-xs text-[#6B6252] mt-0.5">Across all registered properties</p>
        </div>

        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Arriving / Confirmed</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-2 font-heading">{confirmedCount}</p>
          <p className="text-xs text-[#6B6252] mt-0.5">Awaiting check-in arrival</p>
        </div>

        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">In-House Guests</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <LogIn className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2 font-heading">{checkedInCount}</p>
          <p className="text-xs text-[#6B6252] mt-0.5">Currently checked in</p>
        </div>

        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Completed Stays</span>
            <div className="p-2 rounded-xl bg-[#F4F8FF] text-[#4A4236]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#382F27] mt-2 font-heading">{checkedOutCount}</p>
          <p className="text-xs text-[#6B6252] mt-0.5">Checked out successfully</p>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7]/80 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#8C8272] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guest, ref, or property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs font-medium text-[#382F27] focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="CHECKED_OUT">Checked Out</option>
            </select>

            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs font-medium text-[#382F27] focus:outline-none"
            >
              <option value="ALL">All Properties</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Reservation / Walk-in</span>
        </button>
      </div>

      {/* Bookings List Table */}
      <div className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7]/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F8FF]/70 border-b border-[#C9D9F7] text-[11px] font-bold uppercase tracking-wider text-[#6B6252]">
                <th className="py-3.5 px-4">Booking Ref</th>
                <th className="py-3.5 px-4">Guest Details</th>
                <th className="py-3.5 px-4">Property & Room</th>
                <th className="py-3.5 px-4">Dates & Nights</th>
                <th className="py-3.5 px-4">Total & Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F7FAFF] text-xs">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8C8272]">
                    <BedDouble className="w-8 h-8 mx-auto mb-2 text-[#C9BBA0]" />
                    <p className="font-semibold text-[#4A4236]">No bookings match the search criteria.</p>
                    <p className="text-[11px] mt-0.5">Try resetting the filter or add a walk-in guest reservation.</p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#F4F8FF]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#2D5FD2]">{b.bookingRef}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#0B1120]">{b.guestName}</p>
                      <p className="text-[11px] text-[#6B6252]">{b.guestEmail}</p>
                      <p className="text-[10px] text-[#8C8272]">{b.guestPhone}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#241E17]">{b.propertyName}</p>
                      <p className="text-[11px] text-[#6B6252]">
                        {b.roomType} • <span className="font-bold text-[#382F27]">{b.roomNumber || "Unassigned"}</span>
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-[#241E17]">
                        {b.checkInDate} → {b.checkOutDate}
                      </p>
                      <span className="text-[10px] text-[#6B6252] font-medium">{b.nights} night(s)</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#0B1120]">₹{b.totalAmount.toLocaleString()}</p>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          b.paymentStatus === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          b.status === "CHECKED_IN"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : b.status === "CONFIRMED"
                            ? "bg-[#F7FAFF] text-[#2D5FD2] border border-[#C9D9F7]"
                            : b.status === "CHECKED_OUT"
                            ? "bg-[#F7FAFF] text-[#382F27] border border-[#C9D9F7]"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {b.status === "CHECKED_IN" && <Check className="w-3 h-3" />}
                        {b.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status === "CONFIRMED" && (
                          <button
                            onClick={() => updateBookingStatus(b.id, "CHECKED_IN")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <LogIn className="w-3 h-3" />
                            <span>Check In</span>
                          </button>
                        )}
                        {b.status === "CHECKED_IN" && (
                          <button
                            onClick={() => updateBookingStatus(b.id, "CHECKED_OUT")}
                            className="px-2.5 py-1 rounded-lg bg-[#241E17] hover:bg-[#0B1120] text-white font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Check Out</span>
                          </button>
                        )}
                        {b.status === "CONFIRMED" && (
                          <button
                            onClick={() => updateBookingStatus(b.id, "CANCELLED")}
                            className="p-1 rounded-lg text-[#8C8272] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Cancel Reservation"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Reservation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F0E9D6] rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#C9D9F7] animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F7FAFF]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#F7FAFF] text-[#4F7CFF]">
                  <BedDouble className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0B1120] font-heading">New Guest Reservation</h3>
                  <p className="text-xs text-[#6B6252]">Record a walk-in attendee or phone booking</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#8C8272] hover:text-[#4A4236] hover:bg-[#F7FAFF]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#382F27] mb-1">Guest Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#382F27] mb-1">Guest Email</label>
                  <input
                    type="email"
                    placeholder="vikram@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#382F27] mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98000 12345"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#382F27] mb-1">Target Property</label>
                  <select
                    value={propId}
                    onChange={(e) => setPropId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none"
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#382F27] mb-1">Room Type</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none"
                  >
                    <option value="Deluxe King Room">Deluxe King Room</option>
                    <option value="Executive Club Suite">Executive Club Suite</option>
                    <option value="Twin Sharing Deluxe">Twin Sharing Deluxe</option>
                    <option value="Standard Queen Room">Standard Queen Room</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#382F27] mb-1">Room Assignment</label>
                  <input
                    type="text"
                    placeholder="e.g. Rm 304 or Ste 501"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#382F27] mb-1">Total Rate (₹)</label>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#382F27] mb-1">Special Notes / Requests</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Late check-in, extra keycard requested..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-xl text-xs text-[#0B1120] focus:outline-none"
                />
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
                  className="px-4 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Confirm & Save Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </OperatorLayout>
  );
};
