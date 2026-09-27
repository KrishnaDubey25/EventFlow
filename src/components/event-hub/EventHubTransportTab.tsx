import React, { useState, useEffect } from "react";
import { Train, Bus, Car, Navigation, MapPin, ExternalLink, ArrowRight, Check } from "lucide-react";
import { AppEvent, EventTransport } from "../../types/event";
import { useAuth } from "../../context/AuthContext";
import { getAttendeeContext, saveAttendeeContext } from "../../services/attendeeIntelligenceService";

interface EventHubTransportTabProps {
  event: AppEvent;
}

export const EventHubTransportTab: React.FC<EventHubTransportTabProps> = ({ event }) => {
  const { user } = useAuth();
  const userId = user?.id || "guest";

  const [selectedTransport, setSelectedTransport] = useState<string>("");

  useEffect(() => {
    const ctx = getAttendeeContext(userId, event.id);
    if (ctx.selectedTransport) {
      setSelectedTransport(ctx.selectedTransport);
    }
  }, [userId, event.id]);

  const handleSelectTransport = (title: string, type: string) => {
    setSelectedTransport(title);
    const ctx = getAttendeeContext(userId, event.id);
    ctx.selectedTransport = title;
    // Also update travelMode if applicable
    if (type === "metro" || type === "train" || type === "bus" || type === "shuttle") {
      ctx.travelMode = "transit";
    } else if (type === "rideshare") {
      ctx.travelMode = "rideshare";
    }
    saveAttendeeContext(ctx);
  };

  const transportItems: EventTransport[] = event.transport && event.transport.length > 0
    ? event.transport
    : [
        { type: "metro", title: "Rapid Metro Connectivity", detail: "Take Metro Line to nearest station. Direct pedestrian skywalk leads straight to Gate 1.", frequency: "Every 4 minutes", badge: "Fastest Transit" },
        { type: "train", title: "Suburban Railway Network", detail: "Suburban railway stations within 10-15 mins walking distance.", frequency: "Regular intervals" },
        { type: "rideshare", title: "Cab & Rideshare Drop-off Bay", detail: "Designated app-cab drop-off and pickup bay stationed at North Portal.", badge: "Drop-off Bay" },
        { type: "shuttle", title: "Complimentary Venue Shuttle", detail: "Continuous electric shuttle buses loop between parking lots and entrance gates.", frequency: "Every 7 minutes" },
      ];

  const getIcon = (type: string) => {
    switch (type) {
      case "metro":
      case "train":
        return <Train className="w-5 h-5 text-[#4F7CFF]" />;
      case "bus":
      case "shuttle":
        return <Bus className="w-5 h-5 text-emerald-600" />;
      case "rideshare":
      default:
        return <Car className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto font-sans">
      {/* Overview Banner */}
      <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-2">
        <h3 className="text-base font-bold text-[#0B1120] font-heading">
          Getting to {event.venue}
        </h3>
        <p className="text-xs text-[#6B6252] leading-relaxed">
          Public transit and metro are heavily recommended to avoid stadium/venue road congestions on event days. Select your travel mode to receive live route updates.
        </p>
      </div>

      {/* Transport Options Grid */}
      <div className="space-y-4">
        {transportItems.map((item, idx) => {
          const isSelected = selectedTransport === item.title;

          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-[#F0E9D6] border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isSelected
                  ? "border-[#4F7CFF] ring-2 ring-[#4F7CFF]/20 shadow-md"
                  : "border-[#C9D9F7]/90 shadow-2xs hover:border-[#C9D9F7]"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF] flex items-center justify-center shrink-0">
                  {getIcon(item.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#0B1120] font-heading">
                      {item.title}
                    </h4>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F7FAFF] text-[#2D5FD2] border border-[#C9D9F7]">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#4A4236] leading-relaxed max-w-xl">
                    {item.detail}
                  </p>
                  {item.frequency && (
                    <span className="text-[11px] font-mono text-[#8C8272] block pt-0.5">
                      Frequency: {item.frequency}
                    </span>
                  )}
                </div>
              </div>

              <div className="self-stretch sm:self-auto shrink-0 pt-2 sm:pt-0">
                <button
                  onClick={() => handleSelectTransport(item.title, item.type)}
                  className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-[#F7FAFF] text-[#2D5FD2] border border-[#C9D9F7]"
                      : "bg-[#F7FAFF] hover:bg-[#F7FAFF] text-[#382F27] hover:text-[#2D5FD2]"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#4F7CFF]" />
                      <span>Selected Transport</span>
                    </>
                  ) : (
                    <span>Select Travel Mode</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Walking Directions Note */}
      <div className="p-6 rounded-3xl bg-[#F7FAFF]/60 border border-[#EDE3CB] space-y-2 text-xs text-[#0B1120]">
        <div className="flex items-center gap-2 font-bold text-[#0B1120] font-heading">
          <Navigation className="w-4 h-4 text-[#4F7CFF]" />
          <span>Pedestrian & Concourse Ingress</span>
        </div>
        <p className="text-[#6b5024] leading-relaxed">
          Follow color-coded pavement markings from the transit hubs. Dedicated pedestrian-only lanes ensure smooth walking ingress with zero vehicle intersection.
        </p>
      </div>
    </div>
  );
};
