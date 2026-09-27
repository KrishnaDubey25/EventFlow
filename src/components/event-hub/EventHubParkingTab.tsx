import React, { useState, useEffect } from "react";
import { Car, MapPin, CheckCircle2, AlertCircle, Clock, ShieldCheck, Check } from "lucide-react";
import { AppEvent, EventParking } from "../../types/event";
import { useAuth } from "../../context/AuthContext";
import { getAttendeeContext, saveAttendeeContext } from "../../services/attendeeIntelligenceService";

interface EventHubParkingTabProps {
  event: AppEvent;
}

export const EventHubParkingTab: React.FC<EventHubParkingTabProps> = ({ event }) => {
  const { user } = useAuth();
  const userId = user?.id || "guest";

  const [selectedParking, setSelectedParking] = useState<string>("");

  useEffect(() => {
    const ctx = getAttendeeContext(userId, event.id);
    if (ctx.selectedParking) {
      setSelectedParking(ctx.selectedParking);
    }
  }, [userId, event.id]);

  const handleSelectParking = (lotId: string) => {
    setSelectedParking(lotId);
    const ctx = getAttendeeContext(userId, event.id);
    ctx.selectedParking = lotId;
    saveAttendeeContext(ctx);
  };

  const parkingLots: EventParking[] = event.parking && event.parking.length > 0
    ? event.parking
    : [
        { id: "P1", name: "Lot P1 — North Stadium Deck", capacity: "1,200", fee: "₹150", status: "available", shuttleAvailable: true },
        { id: "P2", name: "Lot P2 — South Multi-level Concourse", capacity: "800", fee: "₹150", status: "filling_fast", shuttleAvailable: true },
        { id: "P3", name: "Lot P3 — East VIP & Accessibility Ground", capacity: "400", fee: "Complimentary with VIP", status: "available", shuttleAvailable: false },
      ];

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "available":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Spaces Available</span>;
      case "filling_fast":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Filling Fast</span>;
      case "full":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">Sold Out</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F7FAFF] text-[#382F27]">Open</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto font-sans">
      {/* Parking Overview */}
      <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-2">
        <h3 className="text-base font-bold text-[#0B1120] font-heading">
          Official Venue Parking Lots
        </h3>
        <p className="text-xs text-[#6B6252] leading-relaxed">
          Pre-allocated and drive-up spaces around {event.venue}. Select your preferred parking lot to receive personalized live arrival and diversion alerts.
        </p>
      </div>

      {/* Parking Lots List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {parkingLots.map((lot) => {
          const isSelected = selectedParking === lot.id || selectedParking === lot.name;

          return (
            <div
              key={lot.id}
              className={`p-5 rounded-2xl bg-[#F0E9D6] border transition-all space-y-3 ${
                isSelected
                  ? "border-[#4F7CFF] ring-2 ring-[#4F7CFF]/20 shadow-md"
                  : "border-[#C9D9F7]/90 shadow-2xs hover:border-[#C9D9F7]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isSelected ? "bg-[#4F7CFF] text-white" : "bg-[#F7FAFF] text-[#241E17]"
                    }`}
                  >
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0B1120] font-heading">
                      {lot.name}
                    </h4>
                    <span className="text-[10px] text-[#8C8272] font-mono">Lot ID: {lot.id}</span>
                  </div>
                </div>

                {getStatusBadge(lot.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#F7FAFF]">
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#8C8272] block">FEE</span>
                  <span className="font-bold text-[#241E17]">{lot.fee || "₹100"}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#8C8272] block">SHUTTLE</span>
                  <span className="font-semibold text-[#382F27]">
                    {lot.shuttleAvailable ? "✓ Direct Shuttle" : "Walking distance"}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleSelectParking(lot.id)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-[#F7FAFF] text-[#2D5FD2] border border-[#C9D9F7]"
                      : "bg-[#F7FAFF] hover:bg-[#F7FAFF] text-[#382F27] hover:text-[#2D5FD2]"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#4F7CFF]" />
                      <span>Selected Parking Option</span>
                    </>
                  ) : (
                    <span>Select as My Parking</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Parking Guidelines */}
      <div className="p-6 rounded-3xl bg-[#F4F8FF] border border-[#C9D9F7]/80 space-y-2 text-xs text-[#4A4236] leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-[#0B1120] font-heading">
          <ShieldCheck className="w-4 h-4 text-[#4F7CFF]" />
          <span>Vehicle Security & Traffic Regulations</span>
        </div>
        <p>
          Security scanning checkpoints are placed at all lot entrances. Fastag and digital UPI payments accepted at boom gates. Do not leave valuables inside unattended vehicles.
        </p>
      </div>
    </div>
  );
};
