import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Ticket as TicketIcon,
  ShieldCheck,
  User as UserIcon,
  Mail,
  Phone,
  DoorOpen,
  Sparkles,
  AlertCircle,
  Armchair,
  Layers,
  ChevronRight,
  Info,
  CreditCard,
  Wallet,
  Smartphone,
  Building2,
  QrCode,
  Check,
  Lock,
} from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import { useEventSelection } from "../context/EventContext";
import { useTicket } from "../context/TicketContext";
import {
  getTicketTypesForEvent,
  getBookedSeatsForEvent,
  createBooking,
} from "../services/bookingService";
import { TicketTypeInfo, Booking, EventFlowTicket } from "../types/booking";
import { SeatSelectionMap } from "../components/booking/SeatSelectionMap";
import { EventFlowDigitalTicket } from "../components/ticket/EventFlowDigitalTicket";

export const BookingPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getEventById, selectEvent } = useEventSelection();
  const { refreshTickets } = useTicket();

  const event = eventId ? getEventById(eventId) : undefined;

  // Step state: 1 to 5 (or 6 for confirmed state)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Ticket Type
  const [ticketTypes, setTicketTypes] = useState<TicketTypeInfo[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string>("ga");

  // Step 2: Quantity
  const [quantity, setQuantity] = useState<number>(1);

  // Step 3: Seats
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Step 4: Attendee details (strictly auto-populated with currently logged-in user)
  const [attendeeName, setAttendeeName] = useState<string>("");
  const [attendeeEmail, setAttendeeEmail] = useState<string>("");
  const [attendeeMobile, setAttendeeMobile] = useState<string>("");

  // Step 5: Payment Method selection & specific payment fields
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking" | "wallet">("card");

  // Card payment fields
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardHolder, setCardHolder] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCvv, setCardCvv] = useState<string>("");

  // UPI payment field
  const [upiId, setUpiId] = useState<string>("");

  // Net Banking payment field
  const [selectedBank, setSelectedBank] = useState<string>("HDFC Bank");

  // Wallet payment field
  const [selectedWallet, setSelectedWallet] = useState<string>("PhonePe");

  // Payment execution state: idle -> processing -> success
  const [paymentState, setPaymentState] = useState<"idle" | "processing" | "success">("idle");
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Step 6: Submission & Result
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [generatedTickets, setGeneratedTickets] = useState<EventFlowTicket[]>([]);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Double-click protection ref
  const hasSubmittedRef = useRef<boolean>(false);

  // Force scroll to top on step progression
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    document.body.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [currentStep]);

  // Load ticket types and inventory dynamically
  useEffect(() => {
    if (event) {
      const types = getTicketTypesForEvent(event);
      setTicketTypes(types);
      const booked = getBookedSeatsForEvent(event.id);
      setBookedSeats(booked);
      selectEvent(event);
    }
  }, [event]);

  // Sync attendee details with currently logged in user
  useEffect(() => {
    if (user) {
      const name = user.fullName || user.name || "";
      setAttendeeName(name);
      setAttendeeEmail(user.email || "");
      setAttendeeMobile(user.mobile || "");
      setCardHolder((prev) => (prev ? prev : name));
    }
  }, [user]);

  if (!event) {
    return (
      <AppLayout pageTitle="Event Not Found">
        <div className="py-16 text-center space-y-4 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-[#0B1120] font-heading">Event Not Found</h2>
          <p className="text-sm text-[#6B6252]">The event could not be found for booking.</p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#4F7CFF] hover:bg-[#2D5FD2] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Discover Events</span>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const selectedTier = ticketTypes.find((t) => t.id === selectedTypeId) || ticketTypes[0];
  const unitPrice = selectedTier?.price || 999;
  const ticketSubtotal = unitPrice * quantity;
  const convenienceFee = 50;
  const gstAmount = 9; // 18% GST on convenience fee
  const platformFee = convenienceFee + gstAmount;
  const totalPrice = ticketSubtotal + platformFee;

  const handleToggleSeat = (seatId: string) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((s) => s !== seatId);
      }
      if (prev.length >= quantity) {
        // Replace oldest or shift
        return [...prev.slice(1), seatId];
      }
      return [...prev, seatId];
    });
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!selectedTier || selectedTier.availableQuantity <= 0) {
        setSubmissionError("This ticket tier is currently sold out. Please select another tier.");
        return;
      }
      setSubmissionError(null);
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      // Validate quantity
      if (quantity > selectedTier.availableQuantity) {
        setSubmissionError(`Only ${selectedTier.availableQuantity} tickets available in this tier.`);
        return;
      }
      setSubmissionError(null);
      // Auto-assign or reset seats if needed
      if (selectedTier.id === "ga") {
        setSelectedSeats([]);
      } else if (selectedSeats.length !== quantity) {
        // Auto-suggest available seats
        const availableRowSeats: string[] = [];
        const rows = selectedTier.id === "vip" ? ["A", "B", "C"] : ["A", "B", "C", "D", "E"];
        const seatsPerRow = selectedTier.id === "vip" ? 8 : 10;
        for (const r of rows) {
          for (let s = 1; s <= seatsPerRow; s++) {
            const sid = `Row ${r} - Seat ${s}`;
            if (!bookedSeats.includes(sid)) {
              availableRowSeats.push(sid);
            }
          }
        }
        setSelectedSeats(availableRowSeats.slice(0, quantity));
      }
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      if (selectedTier.id !== "ga" && selectedSeats.length < quantity) {
        setSubmissionError(`Please select ${quantity} seats to proceed.`);
        return;
      }
      setSubmissionError(null);
      setCurrentStep(4);
      return;
    }

    if (currentStep === 4) {
      if (!attendeeName.trim() || !attendeeEmail.trim()) {
        setSubmissionError("Please verify attendee name and email.");
        return;
      }
      setSubmissionError(null);
      setCurrentStep(5);
      return;
    }
  };

  const handlePrevStep = () => {
    setSubmissionError(null);
    setPaymentError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSelectPaymentMethod = (method: "card" | "upi" | "netbanking" | "wallet") => {
    setPaymentMethod(method);
    setPaymentError(null);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
    if (paymentError) setPaymentError(null);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardExpiry(raw);
    if (paymentError) setPaymentError(null);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCardCvv(raw);
    if (paymentError) setPaymentError(null);
  };

  // Step 5: Confirm Booking with strict double-click protection, validation & payment state
  const handleConfirmBooking = async () => {
    if (isSubmitting || hasSubmittedRef.current) {
      return; // Prevent duplicate submission
    }

    if (!user) {
      setSubmissionError("You must be logged in to confirm a booking.");
      return;
    }

    setPaymentError(null);
    setSubmissionError(null);

    // Validate payment details
    if (paymentMethod === "card") {
      const cleanNum = cardNumber.replace(/\D/g, "");
      if (cleanNum.length < 15 || cleanNum.length > 16) {
        setPaymentError("Please enter a valid 16-digit card number.");
        return;
      }
      if (!cardHolder.trim() || cardHolder.trim().length < 2) {
        setPaymentError("Please enter the cardholder name.");
        return;
      }
      const expiryClean = cardExpiry.trim();
      const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
      if (!expiryRegex.test(expiryClean)) {
        setPaymentError("Please enter a valid expiry date (MM/YY).");
        return;
      }
      const cleanCvv = cardCvv.trim();
      if (!/^[0-9]{3,4}$/.test(cleanCvv)) {
        setPaymentError("Please enter a valid 3 or 4 digit CVV.");
        return;
      }
    } else if (paymentMethod === "upi") {
      const cleanUpi = upiId.trim();
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/;
      if (!cleanUpi || !upiRegex.test(cleanUpi)) {
        setPaymentError("Please enter a valid UPI ID (e.g. name@upi).");
        return;
      }
    } else if (paymentMethod === "netbanking") {
      if (!selectedBank) {
        setPaymentError("Please select a bank for Net Banking.");
        return;
      }
    } else if (paymentMethod === "wallet") {
      if (!selectedWallet) {
        setPaymentError("Please select a wallet to proceed.");
        return;
      }
    }

    setIsSubmitting(true);
    hasSubmittedRef.current = true;
    setPaymentState("processing");

    try {
      // Step: Processing delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Step: Payment Successful
      setPaymentState("success");
      await new Promise((resolve) => setTimeout(resolve, 500));

      const seatsToAssign =
        selectedTier.id === "ga"
          ? Array.from({ length: quantity }, (_, idx) => `GA Stand — Zone ${idx + 1}`)
          : selectedSeats;

      const assignedGate =
        selectedTier.allowedGates && selectedTier.allowedGates.length > 0
          ? selectedTier.allowedGates[0]
          : "Gate 1";

      const safePaymentMethod =
        paymentMethod === "card"
          ? "Card"
          : paymentMethod === "upi"
          ? "UPI"
          : paymentMethod === "netbanking"
          ? `Net Banking (${selectedBank})`
          : `Wallet (${selectedWallet})`;

      const safeTxnId = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const paymentTimestamp = new Date().toISOString();

      const result = createBooking({
        userId: user.id,
        eventId: event.id,
        eventName: event.name,
        venue: event.venue,
        eventDate: event.date,
        eventTime: event.time,
        attendeeName: attendeeName.trim(),
        attendeeEmail: attendeeEmail.trim().toLowerCase(),
        attendeeMobile: attendeeMobile.trim(),
        ticketTypeId: selectedTier.id,
        ticketTypeName: selectedTier.name,
        quantity,
        unitPrice,
        platformFee,
        section: selectedTier.section,
        seats: seatsToAssign,
        assignedGate,
        entryWindow: selectedTier.entryWindow,
        paymentMethod: safePaymentMethod,
        paymentStatus: "PAID",
        transactionId: safeTxnId,
        paymentTimestamp,
      });

      setConfirmedBooking(result.booking);
      setGeneratedTickets(result.tickets);
      refreshTickets();
      setCurrentStep(6); // Success state
    } catch (err) {
      console.error("Booking creation failed:", err);
      setSubmissionError("An error occurred while confirming your booking. Please try again.");
      hasSubmittedRef.current = false;
      setPaymentState("idle");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout pageTitle={`Book Tickets — ${event.name}`} pageBadge="Ticket Booking">
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <Link
            to={`/events/${event.id}`}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#4A4236] hover:text-[#0B1120] transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#8C8272] group-hover:-translate-x-1 transition-transform" />
            <span>Back to Event Details</span>
          </Link>

          <span className="text-xs font-mono font-bold text-[#8C8272]">
            {currentStep <= 5 ? `Step ${currentStep} of 5` : "Booking Confirmed"}
          </span>
        </div>

        {/* Stepper Header (Only shown during steps 1-5) */}
        {currentStep <= 5 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7] shadow-xs">
            <div className="flex items-center justify-between relative">
              {[
                { step: 1, label: "Ticket Type" },
                { step: 2, label: "Quantity" },
                { step: 3, label: "Seat & Gate" },
                { step: 4, label: "Attendee" },
                { step: 5, label: "Summary" },
              ].map(({ step, label }) => {
                const isActive = currentStep === step;
                const isPassed = currentStep > step;

                return (
                  <div key={step} className="flex-1 flex flex-col items-center text-center relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full text-xs font-bold font-mono flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-[#4F7CFF] text-white ring-4 ring-[#EDE3CB]"
                          : isPassed
                          ? "bg-emerald-600 text-white"
                          : "bg-[#F7FAFF] text-[#8C8272] border border-[#C9D9F7]"
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : step}
                    </div>
                    <span
                      className={`text-[11px] font-semibold mt-1.5 hidden sm:block ${
                        isActive ? "text-[#2D5FD2]" : isPassed ? "text-[#382F27]" : "text-[#8C8272]"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Error notification banner */}
        {submissionError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{submissionError}</span>
          </div>
        )}

        {/* ================= STEP 1: SELECT TICKET TYPE ================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0B1120] font-heading">
                Step 1: Select Ticket Type
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6252] mt-1">
                Choose your preferred tier for {event.name}. Real-time inventory is dynamically calculated.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {ticketTypes.map((tier) => {
                const isSelected = selectedTypeId === tier.id;
                const isSoldOut = tier.availableQuantity <= 0;

                return (
                  <div
                    key={tier.id}
                    onClick={() => {
                      if (!isSoldOut) {
                        setSelectedTypeId(tier.id);
                        setSubmissionError(null);
                      }
                    }}
                    className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                      isSelected
                        ? "bg-[#F7FAFF]/60 border-[#4F7CFF] ring-2 ring-[#4F7CFF]/30 shadow-md"
                        : isSoldOut
                        ? "bg-[#F4F8FF] border-[#C9D9F7] opacity-60 cursor-not-allowed"
                        : "bg-[#F0E9D6] border-[#C9D9F7] hover:border-[#C9BBA0] hover:shadow-xs"
                    }`}
                  >
                    {tier.id === "vip" && (
                      <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white shadow-2xs">
                        VIP Experience
                      </span>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-[#0B1120] font-heading">
                          {tier.name}
                        </h3>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#4F7CFF] text-white flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-[#0B1120]">
                          ₹{tier.price.toLocaleString("en-IN")}
                        </div>
                        <div
                          className={`text-xs font-semibold font-mono ${
                            isSoldOut
                              ? "text-rose-600"
                              : tier.availableQuantity < 50
                              ? "text-blue-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {isSoldOut
                            ? "Sold Out"
                            : `${tier.availableQuantity.toLocaleString()} available`}
                        </div>
                      </div>

                      <p className="text-xs text-[#4A4236] leading-relaxed">
                        {tier.description}
                      </p>

                      <div className="pt-3 border-t border-[#F7FAFF] space-y-1.5 text-xs text-[#6B6252]">
                        <div>
                          <strong className="text-[#382F27]">Section:</strong> {tier.section}
                        </div>
                        <div>
                          <strong className="text-[#382F27]">Entry Gate:</strong>{" "}
                          {tier.allowedGates.join(", ")}
                        </div>
                        <div>
                          <strong className="text-[#382F27]">Window:</strong> {tier.entryWindow}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isSoldOut}
                      className={`w-full mt-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-[#4F7CFF] text-white shadow-xs"
                          : isSoldOut
                          ? "bg-[#C9D9F7] text-[#8C8272] cursor-not-allowed"
                          : "bg-[#F7FAFF] text-[#382F27] hover:bg-[#C9D9F7]"
                      }`}
                    >
                      {isSelected ? "Selected Tier ✓" : isSoldOut ? "Sold Out" : "Select Tier"}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleNextStep}
                className="px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-[#4F7CFF] hover:bg-[#2D5FD2] transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Continue to Quantity</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: SELECT QUANTITY ================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0B1120] font-heading">
                Step 2: Select Quantity
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6252] mt-1">
                Selected tier: <strong className="text-[#4F7CFF] font-semibold">{selectedTier?.name}</strong> (₹{selectedTier?.price} each)
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7] shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <div className="text-base font-bold text-[#0B1120]">
                    Number of Attendees
                  </div>
                  <div className="text-xs text-[#6B6252] mt-0.5">
                    Maximum 6 tickets per transaction. Available: {selectedTier?.availableQuantity}
                  </div>
                </div>

                {/* Stepper Counter */}
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5, 6].map((num) => {
                    const isExceeding = num > (selectedTier?.availableQuantity || 0);

                    return (
                      <button
                        key={num}
                        type="button"
                        disabled={isExceeding}
                        onClick={() => setQuantity(num)}
                        className={`w-11 h-11 rounded-xl text-sm font-bold font-mono transition-all ${
                          quantity === num
                            ? "bg-[#4F7CFF] text-white shadow-xs scale-105"
                            : isExceeding
                            ? "bg-[#F7FAFF] text-[#C9BBA0] border border-[#C9D9F7] cursor-not-allowed"
                            : "bg-[#F0E9D6] text-[#382F27] border border-[#C9BBA0] hover:border-[#4F7CFF] hover:bg-[#F7FAFF]/50 cursor-pointer"
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subtotal Preview */}
              <div className="p-4 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7]/80 flex items-center justify-between text-sm">
                <span className="text-[#4A4236]">
                  {quantity} × ₹{selectedTier?.price.toLocaleString("en-IN")}
                </span>
                <span className="font-bold font-mono text-[#0B1120] text-base">
                  ₹{(unitPrice * quantity).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-[#382F27] bg-[#F0E9D6] hover:bg-[#F4F8FF] border border-[#C9D9F7] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-[#4F7CFF] hover:bg-[#2D5FD2] transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Continue to Seat & Section</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: SEAT / SECTION SELECTION ================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0B1120] font-heading">
                Step 3: Section & Seat Selection
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6252] mt-1">
                {selectedTier.id === "ga"
                  ? "General Admission unreserved entry — section and gate assignment."
                  : "Interactive stadium map: select available seats for your booking."}
              </p>
            </div>

            {selectedTier.id === "ga" ? (
              <div className="p-6 sm:p-8 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7] shadow-xs space-y-6">
                <div className="p-4 rounded-xl bg-[#F7FAFF]/70 border border-[#C9D9F7] text-[#0B1120] text-xs sm:text-sm flex items-start gap-3">
                  <Info className="w-4 h-4 text-[#4F7CFF] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Open Seating / Standing Zone</span>
                    <span>
                      General admission tickets do not require individual numbered seat reservations. You will have full access to the designated {selectedTier.section}.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7] space-y-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C8272] font-bold">
                      Designated Zone
                    </div>
                    <div className="text-base font-bold text-[#0B1120]">
                      {selectedTier.section}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold flex items-center gap-1">
                      <DoorOpen className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Assigned Turnstile Gate</span>
                    </div>
                    <div className="text-base font-bold text-emerald-900">
                      {selectedTier.allowedGates[0] || "Gate 4 & 5"}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <SeatSelectionMap
                ticketTypeId={selectedTier.id}
                sectionName={selectedTier.section}
                quantity={quantity}
                selectedSeats={selectedSeats}
                bookedSeats={bookedSeats}
                onToggleSeat={handleToggleSeat}
              />
            )}

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-[#382F27] bg-[#F0E9D6] hover:bg-[#F4F8FF] border border-[#C9D9F7] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-[#4F7CFF] hover:bg-[#2D5FD2] transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Continue to Attendee Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: ATTENDEE DETAILS ================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0B1120] font-heading">
                Step 4: Attendee Details
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6252] mt-1">
                Your authenticated profile details are automatically applied to this EventFlow pass.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7] shadow-xs space-y-6">
              <div className="p-4 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7]/80 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs"
                  style={{ backgroundColor: user?.avatarColor || "#4F7CFF" }}
                >
                  {user?.initials || "EF"}
                </div>
                <div>
                  <div className="text-xs text-[#6B6252]">Logged In Account Profile</div>
                  <div className="text-sm font-bold text-[#0B1120]">
                    {user?.fullName || user?.name} ({user?.email})
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#382F27] uppercase tracking-wider font-mono">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#8C8272] absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={attendeeName}
                      onChange={(e) => setAttendeeName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#C9BBA0] text-sm focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF] bg-[#F0E9D6]"
                      placeholder="Attendee Name"
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#382F27] uppercase tracking-wider font-mono">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8C8272] absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={attendeeEmail}
                      onChange={(e) => setAttendeeEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#C9BBA0] text-sm focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF] bg-[#F0E9D6]"
                      placeholder="attendee@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#382F27] uppercase tracking-wider font-mono">
                    Mobile Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#8C8272] absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      value={attendeeMobile}
                      onChange={(e) => setAttendeeMobile(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#C9BBA0] text-sm focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF] bg-[#F0E9D6]"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#382F27] uppercase tracking-wider font-mono">
                    City
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#8C8272] absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      disabled
                      value={user && "city" in user ? (user as any).city : "Attendee City"}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#C9D9F7] text-sm bg-[#F4F8FF] text-[#6B6252] cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-[#382F27] bg-[#F0E9D6] hover:bg-[#F4F8FF] border border-[#C9D9F7] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-[#4F7CFF] hover:bg-[#2D5FD2] transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Continue to Summary</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: SIMULATED PAYMENT & CONFIRMATION ================= */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0B1120] font-heading">
                Step 5: Review & Confirm Booking
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6252] mt-1">
                Select your payment method and review your event credential parameters before final issuance.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7] shadow-xs space-y-6">
              {/* Event Header */}
              <div className="pb-4 border-b border-[#F7FAFF] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-[#0B1120] font-heading">
                    {event.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B6252] mt-1">
                    <span>{event.venue}</span>
                    <span>•</span>
                    <span>{event.date}</span>
                    <span>•</span>
                    <span>{event.time}</span>
                  </div>
                </div>

                <div className="px-3 py-1 rounded-full text-xs font-bold bg-[#F7FAFF] text-[#2D5FD2] border border-[#C9D9F7]">
                  {selectedTier.name}
                </div>
              </div>

              {/* Credential Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="space-y-0.5">
                  <div className="text-[#8C8272] uppercase font-mono font-bold">Attendee</div>
                  <div className="text-[#0B1120] font-bold">{attendeeName}</div>
                  <div className="text-[#6B6252] text-[11px] truncate">{attendeeEmail}</div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-[#8C8272] uppercase font-mono font-bold">Quantity & Tier</div>
                  <div className="text-[#0B1120] font-bold">{quantity} Ticket{quantity > 1 ? "s" : ""}</div>
                  <div className="text-[#6B6252] text-[11px]">{selectedTier.name}</div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-[#8C8272] uppercase font-mono font-bold">Section / Gate</div>
                  <div className="text-[#0B1120] font-bold">{selectedTier.section}</div>
                  <div className="text-emerald-700 font-semibold text-[11px]">
                    {selectedTier.allowedGates[0]}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-[#8C8272] uppercase font-mono font-bold">Seating</div>
                  <div className="text-[#0B1120] font-bold">
                    {selectedTier.id === "ga"
                      ? "General Admission"
                      : selectedSeats.join(", ")}
                  </div>
                  <div className="text-[#6B6252] text-[11px]">Window: {selectedTier.entryWindow}</div>
                </div>
              </div>

              {/* Payment Method Selector & Specific Fields */}
              <div className="pt-4 border-t border-[#F7FAFF] space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6B6252] font-mono">
                    Select Payment Method
                  </label>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Secure Encrypted Checkout</span>
                  </span>
                </div>

                {/* 4 Payment Options */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Card */}
                  <button
                    type="button"
                    onClick={() => handleSelectPaymentMethod("card")}
                    className={`p-3.5 rounded-xl border transition-all text-left space-y-1.5 cursor-pointer ${
                      paymentMethod === "card"
                        ? "border-[#4F7CFF] bg-[#F7FAFF]/50 shadow-xs ring-1 ring-[#4F7CFF]/20"
                        : "border-[#C9D9F7] bg-[#F0E9D6] hover:border-[#C9BBA0]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      {paymentMethod === "card" && (
                        <div className="w-4 h-4 rounded-full bg-[#4F7CFF] text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0B1120]">Card</div>
                      <div className="text-[11px] text-[#6B6252]">Credit / Debit</div>
                    </div>
                  </button>

                  {/* UPI */}
                  <button
                    type="button"
                    onClick={() => handleSelectPaymentMethod("upi")}
                    className={`p-3.5 rounded-xl border transition-all text-left space-y-1.5 cursor-pointer ${
                      paymentMethod === "upi"
                        ? "border-[#4F7CFF] bg-[#F7FAFF]/50 shadow-xs ring-1 ring-[#4F7CFF]/20"
                        : "border-[#C9D9F7] bg-[#F0E9D6] hover:border-[#C9BBA0]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-[#EDE3CB] text-[#4F7CFF] flex items-center justify-center">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      {paymentMethod === "upi" && (
                        <div className="w-4 h-4 rounded-full bg-[#4F7CFF] text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0B1120]">UPI</div>
                      <div className="text-[11px] text-[#6B6252]">Instant UPI ID</div>
                    </div>
                  </button>

                  {/* Net Banking */}
                  <button
                    type="button"
                    onClick={() => handleSelectPaymentMethod("netbanking")}
                    className={`p-3.5 rounded-xl border transition-all text-left space-y-1.5 cursor-pointer ${
                      paymentMethod === "netbanking"
                        ? "border-[#4F7CFF] bg-[#F7FAFF]/50 shadow-xs ring-1 ring-[#4F7CFF]/20"
                        : "border-[#C9D9F7] bg-[#F0E9D6] hover:border-[#C9BBA0]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Building2 className="w-4 h-4" />
                      </div>
                      {paymentMethod === "netbanking" && (
                        <div className="w-4 h-4 rounded-full bg-[#4F7CFF] text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0B1120]">Net Banking</div>
                      <div className="text-[11px] text-[#6B6252]">Major Indian Banks</div>
                    </div>
                  </button>

                  {/* Wallet */}
                  <button
                    type="button"
                    onClick={() => handleSelectPaymentMethod("wallet")}
                    className={`p-3.5 rounded-xl border transition-all text-left space-y-1.5 cursor-pointer ${
                      paymentMethod === "wallet"
                        ? "border-[#4F7CFF] bg-[#F7FAFF]/50 shadow-xs ring-1 ring-[#4F7CFF]/20"
                        : "border-[#C9D9F7] bg-[#F0E9D6] hover:border-[#C9BBA0]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                        <Wallet className="w-4 h-4" />
                      </div>
                      {paymentMethod === "wallet" && (
                        <div className="w-4 h-4 rounded-full bg-[#4F7CFF] text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0B1120]">Wallet</div>
                      <div className="text-[11px] text-[#6B6252]">PhonePe, Paytm, etc.</div>
                    </div>
                  </button>
                </div>

                {/* Specific Fields Form per selected Payment Method */}
                <div className="p-4 sm:p-5 bg-[#F4F8FF]/90 rounded-2xl border border-[#C9D9F7] space-y-4">
                  {/* A. CARD FORM */}
                  {paymentMethod === "card" && (
                    <div className="space-y-3.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#382F27] font-mono flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-[#4F7CFF]" />
                          <span>Card Information</span>
                        </span>
                        <span className="text-[11px] text-[#6B6252]">Visa, Mastercard, RuPay</span>
                      </div>

                      <div className="space-y-3">
                        {/* Card Number */}
                        <div>
                          <label className="block text-xs font-semibold text-[#382F27] mb-1">
                            Card Number
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id="payment-card-number"
                              value={cardNumber}
                              onChange={handleCardNumberChange}
                              placeholder="4532 •••• •••• 8921"
                              maxLength={19}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9BBA0] bg-[#F0E9D6] text-[#0B1120] text-sm font-mono tracking-wider focus:outline-hidden focus:ring-2 focus:ring-[#4F7CFF] focus:border-[#4F7CFF] placeholder:text-[#8C8272]"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8272] pointer-events-none">
                              <CreditCard className="w-4 h-4" />
                            </div>
                          </div>
                        </div>

                        {/* Cardholder Name */}
                        <div>
                          <label className="block text-xs font-semibold text-[#382F27] mb-1">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            id="payment-card-holder"
                            value={cardHolder}
                            onChange={(e) => {
                              setCardHolder(e.target.value);
                              if (paymentError) setPaymentError(null);
                            }}
                            placeholder="Aarav Sharma"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9BBA0] bg-[#F0E9D6] text-[#0B1120] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#4F7CFF] focus:border-[#4F7CFF] placeholder:text-[#8C8272]"
                          />
                        </div>

                        {/* Expiry Date & CVV */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-[#382F27] mb-1">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              id="payment-card-expiry"
                              value={cardExpiry}
                              onChange={handleExpiryChange}
                              placeholder="MM/YY"
                              maxLength={5}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9BBA0] bg-[#F0E9D6] text-[#0B1120] text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-[#4F7CFF] focus:border-[#4F7CFF] placeholder:text-[#8C8272]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#382F27] mb-1 flex items-center justify-between">
                              <span>CVV</span>
                              <span className="text-[10px] text-[#8C8272] font-normal">3 or 4 digits</span>
                            </label>
                            <div className="relative">
                              <input
                                type="password"
                                id="payment-card-cvv"
                                value={cardCvv}
                                onChange={handleCvvChange}
                                placeholder="•••"
                                maxLength={4}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9BBA0] bg-[#F0E9D6] text-[#0B1120] text-sm font-mono tracking-widest focus:outline-hidden focus:ring-2 focus:ring-[#4F7CFF] focus:border-[#4F7CFF] placeholder:text-[#8C8272]"
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8272] pointer-events-none">
                                <Lock className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-[#6B6252] pt-1">
                        <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>CVV and card numbers are never stored in your account or local storage.</span>
                      </div>
                    </div>
                  )}

                  {/* B. UPI FORM */}
                  {paymentMethod === "upi" && (
                    <div className="space-y-3.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#382F27] font-mono flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-[#4F7CFF]" />
                          <span>Enter UPI ID</span>
                        </span>
                        <span className="text-[11px] text-[#6B6252]">Google Pay, PhonePe, Paytm, BHIM</span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#382F27] mb-1">
                          UPI ID
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="payment-upi-id"
                            value={upiId}
                            onChange={(e) => {
                              setUpiId(e.target.value);
                              if (paymentError) setPaymentError(null);
                            }}
                            placeholder="name@upi"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9BBA0] bg-[#F0E9D6] text-[#0B1120] text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-[#4F7CFF] focus:border-[#4F7CFF] placeholder:text-[#8C8272]"
                          />
                        </div>
                      </div>

                      {/* Quick handle pills */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] text-[#6B6252]">Popular UPI handles:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {["@okhdfcbank", "@okaxis", "@paytm", "@ybl", "@upi"].map((handle) => (
                            <button
                              type="button"
                              key={handle}
                              onClick={() => {
                                const prefix = upiId.includes("@") ? upiId.split("@")[0] : upiId;
                                const userPrefix = prefix || (attendeeEmail ? attendeeEmail.split("@")[0] : "user");
                                setUpiId(`${userPrefix}${handle}`);
                                if (paymentError) setPaymentError(null);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#F0E9D6] border border-[#C9D9F7] text-[#382F27] text-xs font-mono hover:bg-[#F7FAFF] hover:border-[#C9BBA0] transition-colors cursor-pointer"
                            >
                              {handle}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-[#6B6252] pt-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>A secure payment collect request will be sent to your UPI app.</span>
                      </div>
                    </div>
                  )}

                  {/* C. NET BANKING FORM */}
                  {paymentMethod === "netbanking" && (
                    <div className="space-y-3.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#382F27] font-mono flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Select Bank</span>
                        </span>
                        <span className="text-[11px] text-[#6B6252]">Core Banking Gateway</span>
                      </div>

                      {/* Bank Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          "HDFC Bank",
                          "ICICI Bank",
                          "State Bank of India",
                          "Axis Bank",
                          "Kotak Mahindra Bank",
                        ].map((bank) => (
                          <button
                            type="button"
                            key={bank}
                            onClick={() => {
                              setSelectedBank(bank);
                              if (paymentError) setPaymentError(null);
                            }}
                            className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                              selectedBank === bank
                                ? "border-indigo-600 bg-indigo-50/60 shadow-xs ring-1 ring-indigo-500/20"
                                : "border-[#C9D9F7] bg-[#F0E9D6] hover:border-[#C9BBA0]"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Building2 className={`w-4 h-4 ${selectedBank === bank ? "text-indigo-600" : "text-[#8C8272]"}`} />
                              <span className="text-xs font-bold text-[#0B1120]">{bank}</span>
                            </div>
                            {selectedBank === bank && (
                              <Check className="w-3.5 h-3.5 text-indigo-600" />
                            )}
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#382F27] mb-1">
                          Or Select Bank from Dropdown
                        </label>
                        <select
                          id="payment-bank-select"
                          value={selectedBank}
                          onChange={(e) => {
                            setSelectedBank(e.target.value);
                            if (paymentError) setPaymentError(null);
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9BBA0] bg-[#F0E9D6] text-[#0B1120] text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="HDFC Bank">HDFC Bank</option>
                          <option value="ICICI Bank">ICICI Bank</option>
                          <option value="State Bank of India">State Bank of India</option>
                          <option value="Axis Bank">Axis Bank</option>
                          <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-[#6B6252] pt-1">
                        <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>You will authenticate on your bank portal. No banking password or PIN is requested here.</span>
                      </div>
                    </div>
                  )}

                  {/* D. WALLET FORM */}
                  {paymentMethod === "wallet" && (
                    <div className="space-y-3.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#382F27] font-mono flex items-center gap-1.5">
                          <Wallet className="w-3.5 h-3.5 text-purple-600" />
                          <span>Select Wallet</span>
                        </span>
                        <span className="text-[11px] text-[#6B6252]">1-Tap Instant Checkout</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { id: "PhonePe", name: "PhonePe", desc: "UPI & Linked Wallet" },
                          { id: "Paytm", name: "Paytm", desc: "Paytm Wallet / Postpaid" },
                          { id: "Amazon Pay", name: "Amazon Pay", desc: "Amazon Balance & UPI" },
                        ].map((wallet) => (
                          <button
                            type="button"
                            key={wallet.id}
                            onClick={() => {
                              setSelectedWallet(wallet.id);
                              if (paymentError) setPaymentError(null);
                            }}
                            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer space-y-1.5 ${
                              selectedWallet === wallet.id
                                ? "border-purple-600 bg-purple-50/60 shadow-xs ring-1 ring-purple-500/20"
                                : "border-[#C9D9F7] bg-[#F0E9D6] hover:border-[#C9BBA0]"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                                <Wallet className="w-3.5 h-3.5" />
                              </div>
                              {selectedWallet === wallet.id && (
                                <div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[#0B1120]">{wallet.name}</div>
                              <div className="text-[11px] text-[#6B6252]">{wallet.desc}</div>
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-[#6B6252] pt-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Selected wallet will be debited for this booking. Sensitive wallet credentials are never stored.</span>
                      </div>
                    </div>
                  )}

                  {/* Payment Validation Error Alert */}
                  {paymentError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{paymentError}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Convenience fee / GST breakdown */}
              <div className="pt-4 border-t border-[#F7FAFF] space-y-2 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-[#4A4236]">
                  <span>
                    Ticket Price ({quantity} × ₹{unitPrice.toLocaleString("en-IN")})
                  </span>
                  <span className="font-mono">
                    ₹{ticketSubtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#4A4236]">
                  <span>Convenience Fee</span>
                  <span className="font-mono">₹{convenienceFee}</span>
                </div>
                <div className="flex items-center justify-between text-[#4A4236]">
                  <span>GST on Convenience Fee (18%)</span>
                  <span className="font-mono">₹{gstAmount}</span>
                </div>
                <div className="pt-2 border-t border-[#C9D9F7] flex items-center justify-between text-base font-bold text-[#0B1120]">
                  <span>Total Amount</span>
                  <span className="font-mono text-xl text-[#4F7CFF]">
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Security notice */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Immediate digital ticket generation with encrypted QR verification token.
                </span>
              </div>
            </div>

            {/* Confirmation Action Bar */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handlePrevStep}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-[#382F27] bg-[#F0E9D6] hover:bg-[#F4F8FF] border border-[#C9D9F7] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                id="confirm-booking-btn"
                disabled={isSubmitting}
                onClick={handleConfirmBooking}
                className={`px-10 py-4 rounded-xl text-base font-bold text-white transition-all shadow-md flex items-center gap-2.5 cursor-pointer active:scale-[0.98] ${
                  isSubmitting
                    ? paymentState === "success"
                      ? "bg-emerald-700"
                      : "bg-[#4F7CFF]"
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                }`}
              >
                {paymentState === "processing" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : paymentState === "success" ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    <span>Payment Successful!</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    <span>Confirm Booking & Pay ₹{totalPrice.toLocaleString("en-IN")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 6: BOOKING CONFIRMED & SUCCESS SCREEN ================= */}
        {currentStep === 6 && confirmedBooking && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Dedicated Success Screen Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7] shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#F7FAFF] pb-5">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>BOOKING CONFIRMED</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1120] font-heading">
                    Booking Confirmed!
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6B6252]">
                    Your official admission credential has been generated and securely saved.
                  </p>
                </div>

                {/* Primary Action Buttons: Go to My Event & View Ticket */}
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    id="go-to-my-event-btn"
                    to="/my-event"
                    className="px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white transition-all shadow-md shadow-[#4F7CFF]/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Go to My Event</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    id="view-ticket-btn"
                    to="/ticket"
                    className="px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-[#0B1120] hover:bg-[#241E17] text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <TicketIcon className="w-4 h-4 text-emerald-400" />
                    <span>View Ticket</span>
                  </Link>
                </div>
              </div>

              {/* Event Details & Turnstile Specs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/80 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#8C8272] font-mono">
                      Event Details
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[#0B1120]">{confirmedBooking.eventName}</div>
                      <div className="text-xs text-[#4A4236] mt-1 flex flex-wrap gap-x-3 gap-y-1">
                        <span>📅 {confirmedBooking.eventDate}</span>
                        <span>⏰ {confirmedBooking.eventTime}</span>
                        <span>📍 {confirmedBooking.venue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7]/70 space-y-0.5">
                      <div className="text-[#8C8272] uppercase font-mono font-bold text-[10px]">Attendee Name</div>
                      <div className="font-bold text-[#0B1120] truncate">{confirmedBooking.attendeeName}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/70 space-y-0.5">
                      <div className="text-emerald-700 uppercase font-mono font-bold text-[10px]">Gate Number</div>
                      <div className="font-bold text-emerald-900">{confirmedBooking.assignedGate}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F7FAFF] border border-[#C9D9F7]/70 space-y-0.5">
                      <div className="text-[#2D5FD2] uppercase font-mono font-bold text-[10px]">Entry Window</div>
                      <div className="font-bold text-[#0B1120] truncate">{confirmedBooking.entryWindow}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7]/70 space-y-0.5">
                      <div className="text-[#8C8272] uppercase font-mono font-bold text-[10px]">Ticket ID</div>
                      <div className="font-bold font-mono text-[#0B1120] text-[11px] truncate">
                        {generatedTickets[0]?.ticketId || confirmedBooking.bookingId}
                      </div>
                    </div>
                  </div>

                  {/* Payment Verification Metadata */}
                  <div className="p-3.5 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7]/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-[#6B6252]">Payment Method: </span>
                        <strong className="text-[#0B1120] capitalize">
                          {confirmedBooking.paymentMethod || paymentMethod}
                        </strong>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 text-[#4A4236]">
                      {confirmedBooking.transactionId && (
                        <div>
                          <span className="text-[#8C8272] font-mono text-[11px]">Txn ID: </span>
                          <span className="font-mono text-[#241E17] text-[11px] font-semibold">{confirmedBooking.transactionId}</span>
                        </div>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {confirmedBooking.paymentStatus === "PAID" ? "PAID" : "VERIFIED"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* QR Code Preview */}
                <div className="p-5 rounded-2xl bg-[#0B1120] text-white flex flex-col items-center justify-center text-center space-y-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#8C8272]">
                    Encrypted QR Preview
                  </div>
                  <div className="p-3 bg-[#F0E9D6] rounded-xl shadow-inner">
                    <svg className="w-24 h-24 text-[#0B1120]" viewBox="0 0 100 100" fill="currentColor">
                      <rect x="0" y="0" width="28" height="28" />
                      <rect x="4" y="4" width="20" height="20" fill="white" />
                      <rect x="8" y="8" width="12" height="12" />
                      <rect x="72" y="0" width="28" height="28" />
                      <rect x="76" y="4" width="20" height="20" fill="white" />
                      <rect x="80" y="8" width="12" height="12" />
                      <rect x="0" y="72" width="28" height="28" />
                      <rect x="4" y="76" width="20" height="20" fill="white" />
                      <rect x="8" y="80" width="12" height="12" />
                      <rect x="36" y="8" width="8" height="8" />
                      <rect x="52" y="8" width="12" height="8" />
                      <rect x="36" y="24" width="16" height="8" />
                      <rect x="8" y="36" width="12" height="8" />
                      <rect x="8" y="52" width="8" height="12" />
                      <rect x="36" y="36" width="28" height="28" />
                      <rect x="40" y="40" width="20" height="20" fill="white" />
                      <rect x="44" y="44" width="12" height="12" />
                      <rect x="72" y="36" width="8" height="16" />
                      <rect x="88" y="36" width="12" height="8" />
                      <rect x="72" y="60" width="16" height="8" />
                      <rect x="36" y="72" width="8" height="20" />
                      <rect x="52" y="72" width="28" height="8" />
                      <rect x="52" y="88" width="16" height="12" />
                      <rect x="76" y="84" width="24" height="8" />
                    </svg>
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-mono text-xs text-emerald-400 font-bold">
                      {generatedTickets[0]?.ticketId || confirmedBooking.bookingId}
                    </div>
                    <div className="text-[10px] text-[#8C8272]">
                      Scan at {confirmedBooking.assignedGate}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Issued EventFlow Digital Tickets */}
            <div className="space-y-6">
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-bold text-[#0B1120] font-heading">
                  Your Digital EventFlow Pass{generatedTickets.length > 1 ? "es" : ""}
                </h3>
                <p className="text-xs text-[#6B6252]">
                  Ready for direct turnstile presentation at {confirmedBooking.venue}.
                </p>
              </div>

              {generatedTickets.map((t) => (
                <EventFlowDigitalTicket key={t.ticketId} ticket={t} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
