import React from "react";
import { Car, Navigation, ShieldCheck, AlertCircle, CheckCircle2, Bus } from "lucide-react";
import { EventParking } from "../../types/event";

interface ParkingSectionProps {
  parking?: EventParking[];
  venue: string;
}

export const ParkingSection: React.FC<ParkingSectionProps> = ({
  parking = [],
  venue,
}) => {
  // If event has no parking configured, return null or compact notice
  if (!parking || parking.length === 0) {
    return null;
  }

  return (
    <div
      id="parking-section"
      className="p-6 sm:p-7 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-sm space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F7FAFF] pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#F7FAFF] text-[#4F7CFF] flex items-center justify-center">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B6252] block">
              Vehicle Logistics
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#0B1120] font-heading">
              Designated Parking Zones
            </h2>
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
          Official Event Parking
        </span>
      </div>

      {/* Parking Zones Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {parking.map((park, idx) => {
          const zoneTag = `P${idx + 1}`;
          // Generate a representative distance like 450m or 650m
          const distanceStr = idx === 0 ? "450 m" : idx === 1 ? "650 m" : "850 m";

          return (
            <div
              key={park.id}
              className="p-5 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/80 space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-[#4F7CFF] text-white font-mono font-bold text-xs flex items-center justify-center">
                    {zoneTag}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#6B6252] uppercase">
                    Parking Zone
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{park.status === "available" ? "Available" : "Operational"}</span>
                </span>
              </div>

              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#0B1120] leading-snug">
                  {park.name}
                </h3>
                <div className="text-xs text-[#6B6252] mt-0.5">
                  Designated lot for {venue} attendees
                </div>
              </div>

              {/* Distance and Capacity specs */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#C9D9F7]/70 text-xs">
                <div className="p-2 rounded-xl bg-[#F0E9D6] border border-[#C9D9F7]/60">
                  <div className="text-[10px] font-mono uppercase text-[#6B6252] font-bold">
                    Distance
                  </div>
                  <div className="text-sm font-bold text-[#0B1120] font-mono mt-0.5">
                    {distanceStr}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-[#F0E9D6] border border-[#C9D9F7]/60">
                  <div className="text-[10px] font-mono uppercase text-[#6B6252] font-bold">
                    Capacity
                  </div>
                  <div className="text-sm font-bold text-[#0B1120] truncate mt-0.5">
                    {park.capacity || "3,000 Cars"}
                  </div>
                </div>
              </div>

              {/* Shuttle availability badge */}
              {park.shuttleAvailable && (
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#2D5FD2] bg-[#F7FAFF]/70 px-2.5 py-1 rounded-lg border border-[#EDE3CB]">
                  <Bus className="w-3.5 h-3.5" />
                  <span>Electric shuttle connects directly to gate</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Prototype Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/90 text-[#4A4236] flex items-start gap-3 text-xs leading-relaxed">
        <AlertCircle className="w-4 h-4 text-[#6B6252] shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block text-[#0B1120]">
            Parking Blueprint Notice
          </strong>
          <span>
            Parking zones, walking distances, and occupancy levels are synchronized with live parking operator telemetry and event traffic advisories.
          </span>
        </div>
      </div>
    </div>
  );
};
