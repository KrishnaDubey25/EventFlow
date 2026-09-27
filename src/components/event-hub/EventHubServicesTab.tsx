import React, { useState, useEffect } from "react";
import {
  Utensils,
  Droplets,
  HeartPulse,
  HelpCircle,
  ShoppingBag,
  Sparkles,
  MapPin,
  Check,
} from "lucide-react";
import { AppEvent, EventHospitality } from "../../types/event";
import { useAuth } from "../../context/AuthContext";
import { getAttendeeContext, saveAttendeeContext } from "../../services/attendeeIntelligenceService";

interface EventHubServicesTabProps {
  event: AppEvent;
}

export const EventHubServicesTab: React.FC<EventHubServicesTabProps> = ({ event }) => {
  const { user } = useAuth();
  const userId = user?.id || "guest";

  const [selectedHosp, setSelectedHosp] = useState<string>("");

  useEffect(() => {
    const ctx = getAttendeeContext(userId, event.id);
    if (ctx.selectedHospitality) {
      setSelectedHosp(ctx.selectedHospitality);
    }
  }, [userId, event.id]);

  const handleSelectHospitality = (title: string) => {
    setSelectedHosp(title);
    const ctx = getAttendeeContext(userId, event.id);
    ctx.selectedHospitality = title;
    saveAttendeeContext(ctx);
  };

  const hospitalityItems: EventHospitality[] = event.hospitality || [];

  const getIcon = (type: string) => {
    switch (type) {
      case "f&b":
        return <Utensils className="w-5 h-5 text-blue-600" />;
      case "hydration":
        return <Droplets className="w-5 h-5 text-[#4F7CFF]" />;
      case "medical":
        return <HeartPulse className="w-5 h-5 text-rose-600" />;
      case "merchandise":
        return <ShoppingBag className="w-5 h-5 text-indigo-600" />;
      case "lounge":
      default:
        return <HelpCircle className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto font-sans">
      {/* Services Header */}
      <div className="p-6 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-2">
        <h3 className="text-base font-bold text-[#0B1120] font-heading">
          Venue Services & Amenities
        </h3>
        <p className="text-xs text-[#6B6252] leading-relaxed">
          Comprehensive hospitality, medical care, and food facilities throughout {event.venue}. Published service details appear here. Select a pavilion to keep it in your event plan; availability needs a current staff update.
        </p>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {hospitalityItems.length===0 && <p className="p-5 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7] text-xs text-[#4A4236]">The organizer has not listed food, medical or help facilities for this event yet.</p>}
        {hospitalityItems.map((item, idx) => {
          const isSelected = selectedHosp === item.title;

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
                  <h4 className="text-sm font-bold text-[#0B1120] font-heading">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-[#4F7CFF] font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{item.location}</span>
                  </div>
                  {item.details && (
                    <p className="text-xs text-[#4A4236] leading-relaxed max-w-xl pt-0.5">
                      {item.details}
                    </p>
                  )}
                </div>
              </div>

              <div className="self-stretch sm:self-auto shrink-0 pt-2 sm:pt-0">
                <button
                  onClick={() => handleSelectHospitality(item.title)}
                  className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-[#F7FAFF] text-[#2D5FD2] border border-[#C9D9F7]"
                      : "bg-[#F7FAFF] hover:bg-[#F7FAFF] text-[#382F27] hover:text-[#2D5FD2]"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#4F7CFF]" />
                      <span>Selected Hospitality</span>
                    </>
                  ) : (
                    <span>Select Service</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Restroom & Hygiene Notice */}
      <div className="p-6 rounded-3xl bg-[#F4F8FF] border border-[#C9D9F7]/80 space-y-2 text-xs text-[#4A4236] leading-relaxed">
        <div className="font-bold text-[#0B1120] font-heading">
          Restroom Facilities & Child Care
        </div>
        <p>
          Restrooms (male, female, gender-neutral, and wheelchair accessible) are stationed every 60 meters along the main perimeter concourse. Dedicated infant care & baby feeding stations are situated at Level 1 Guest Care.
        </p>
      </div>
    </div>
  );
};
