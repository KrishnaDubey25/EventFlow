import React from "react";
import { Check, Shield, Armchair, Info } from "lucide-react";

interface SeatSelectionMapProps {
  ticketTypeId: string;
  sectionName: string;
  quantity: number;
  selectedSeats: string[];
  bookedSeats: string[];
  onToggleSeat: (seatId: string) => void;
}

export const SeatSelectionMap: React.FC<SeatSelectionMapProps> = ({
  ticketTypeId,
  sectionName,
  quantity,
  selectedSeats,
  bookedSeats,
  onToggleSeat,
}) => {
  // Define rows and columns according to tier
  const rows = ticketTypeId === "vip" ? ["A", "B", "C"] : ["A", "B", "C", "D", "E"];
  const seatsPerRow = ticketTypeId === "vip" ? 8 : 10;

  return (
    <div className="space-y-6 p-6 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-[#0B1120] font-heading">
            {sectionName} — Interactive Seat Selection
          </h4>
          <p className="text-xs text-[#6B6252]">
            Select <strong className="text-[#4F7CFF] font-semibold">{quantity}</strong> {quantity === 1 ? "seat" : "seats"} for your party ({selectedSeats.length} of {quantity} selected)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-md bg-[#F0E9D6] border border-[#C9BBA0]" />
            <span className="text-[#4A4236]">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-md bg-[#4F7CFF] border border-[#2D5FD2] flex items-center justify-center text-white">
              <Check className="w-2.5 h-2.5" />
            </div>
            <span className="text-[#2D5FD2] font-medium">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-md bg-[#C9D9F7] border border-[#C9BBA0] text-[#8C8272] flex items-center justify-center text-[10px]">
              ✕
            </div>
            <span className="text-[#8C8272]">Booked</span>
          </div>
        </div>
      </div>

      {/* Stage Orientation Bar */}
      <div className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-[#0B1120]/10 via-[#0B1120]/20 to-[#0B1120]/10 border border-[#0B1120]/15 text-center text-xs font-mono font-bold uppercase tracking-widest text-[#382F27]">
        ── STAGE / FIELD ORIENTATION ──
      </div>

      {/* Seat Grid */}
      <div className="overflow-x-auto py-2">
        <div className="min-w-[420px] space-y-3 mx-auto flex flex-col items-center">
          {rows.map((row) => (
            <div key={row} className="flex items-center gap-2">
              <span className="w-6 text-xs font-mono font-bold text-[#8C8272] text-center">
                {row}
              </span>

              <div className="flex items-center gap-1.5 sm:gap-2">
                {Array.from({ length: seatsPerRow }, (_, i) => {
                  const seatNumber = i + 1;
                  const seatIdentifier = `Row ${row} - Seat ${seatNumber}`;
                  const isBooked = bookedSeats.includes(seatIdentifier);
                  const isSelected = selectedSeats.includes(seatIdentifier);

                  return (
                    <button
                      key={seatIdentifier}
                      type="button"
                      disabled={isBooked}
                      onClick={() => onToggleSeat(seatIdentifier)}
                      title={
                        isBooked
                          ? `${seatIdentifier} (Already Booked)`
                          : isSelected
                          ? `${seatIdentifier} (Selected)`
                          : `Select ${seatIdentifier}`
                      }
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-[11px] font-mono font-bold flex flex-col items-center justify-center transition-all ${
                        isBooked
                          ? "bg-[#C9D9F7]/90 text-[#8C8272] cursor-not-allowed border border-[#C9BBA0] opacity-60"
                          : isSelected
                          ? "bg-[#4F7CFF] text-white shadow-sm ring-2 ring-[#4F7CFF]/40 cursor-pointer scale-105"
                          : "bg-[#F0E9D6] text-[#382F27] border border-[#C9BBA0] hover:border-[#4F7CFF] hover:bg-[#F7FAFF]/50 cursor-pointer"
                      }`}
                    >
                      {isBooked ? (
                        <span>✕</span>
                      ) : isSelected ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <span>{seatNumber}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <span className="w-6 text-xs font-mono font-bold text-[#8C8272] text-center">
                {row}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Seats summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#C9D9F7] text-xs">
        <div className="text-[#4A4236] flex items-center gap-1.5">
          <Armchair className="w-4 h-4 text-[#4F7CFF]" />
          <span>
            {selectedSeats.length > 0
              ? `Your seats: ${selectedSeats.join(", ")}`
              : "Click available seats above to select."}
          </span>
        </div>
        {selectedSeats.length < quantity && (
          <span className="text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 font-medium">
            Please pick {quantity - selectedSeats.length} more {quantity - selectedSeats.length === 1 ? "seat" : "seats"}
          </span>
        )}
      </div>
    </div>
  );
};
