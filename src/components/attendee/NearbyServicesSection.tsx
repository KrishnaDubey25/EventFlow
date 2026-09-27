import React from "react";
import {
  Utensils,
  Coffee,
  HeartPulse,
  HelpCircle,
  Building2,
  MapPin,
  Compass,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { EventHospitality } from "../../types/event";

interface NearbyServicesSectionProps {
  hospitality?: EventHospitality[];
  venue: string;
  district?: string;
}

export const NearbyServicesSection: React.FC<NearbyServicesSectionProps> = ({
  hospitality = [],
  venue,
  district,
}) => {
  const fbItem = hospitality.find((h) => h.type === "f&b");
  const hydrationItem = hospitality.find((h) => h.type === "hydration");

  const services = [
    {
      id: "food-zones",
      category: "Food Zones & Dining",
      icon: Utensils,
      title: fbItem?.title || "Concourse Food Boulevards & Stalls",
      location: fbItem?.location || "Concourses Level 1 & 3",
      detail:
        fbItem?.details ||
        "Gourmet street food, snacks, artisan coffee, and quick-service meals.",
      badge: "Multi-Cuisine",
    },
    {
      id: "hydration-rest",
      category: "Hydration & Rest Areas",
      icon: Coffee,
      title: hydrationItem?.title || "Complimentary Hydration Hubs",
      location: hydrationItem?.location || "All Gate concourses every 50m",
      detail:
        hydrationItem?.details ||
        "Free purified chilled drinking water refill stations and shaded rest areas.",
      badge: "Free Access",
    },
    {
      id: "medical-aid",
      category: "Medical Assistance",
      icon: HeartPulse,
      title: "On-Site Emergency First Aid & Triage",
      location: "Near Gates 1 & 3, Concourse Level 1",
      detail:
        "Fully equipped paramedical triage stations, certified emergency personnel, and on-standby ambulances.",
      badge: "Emergency Aid",
    },
    {
      id: "help-desk",
      category: "Help Desk & Cloakroom",
      icon: HelpCircle,
      title: "Attendee Information & Lost Property",
      location: "Main Ingress Plaza (Opposite Gate Turnstiles)",
      detail:
        "Credential verification assistance, accessibility support, and standard backpack cloakrooms.",
      badge: "Support Desk",
    },
    {
      id: "hotels-lodging",
      category: "Nearby Hotels & Lodging",
      icon: Building2,
      title: `Event Partner Hotels in ${district || "the District"}`,
      location: `Within 1.5 – 3.0 km of ${venue}`,
      detail:
        "Official partner hotels with dedicated EventFlow morning shuttle transit loops.",
      badge: "Partner Stays",
    },
    {
      id: "restaurants",
      category: "Local Dining",
      icon: Utensils,
      title: `Curated Restaurants & Bistros in ${district || "the Vicinity"}`,
      location: "Outer venue boulevard & promenade",
      detail:
        "Authentic regional dining spots, cafes, and late-night post-event eateries.",
      badge: "Curated Spots",
    },
  ];

  return (
    <div
      id="services-section"
      className="p-6 sm:p-7 rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-sm space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F7FAFF] pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#F7FAFF] text-[#4F7CFF] flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B6252] block">
              Hospitality & Amenities
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#0B1120] font-heading">
              Nearby Services
            </h2>
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-[#F7FAFF] text-[#382F27]">
          Event-Configured Amenities
        </span>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/80 space-y-2.5 hover:bg-[#F4F8FF]/80 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#2D5FD2]">
                  <Icon className="w-4 h-4" />
                  <span>{item.category}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EDE3CB]/80 text-[#6b5024] font-bold">
                  {item.badge}
                </span>
              </div>

              <div className="text-sm font-bold text-[#0B1120] leading-snug">
                {item.title}
              </div>

              <div className="flex items-start gap-1.5 text-xs text-[#6B6252]">
                <MapPin className="w-3.5 h-3.5 text-[#4F7CFF] shrink-0 mt-0.5" />
                <span>{item.location}</span>
              </div>

              <p className="text-xs text-[#4A4236] leading-relaxed pt-1 border-t border-[#C9D9F7]/60">
                {item.detail}
              </p>
            </div>
          );
        })}
      </div>

      {/* Prototype Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-[#F4F8FF] border border-[#C9D9F7]/90 text-[#4A4236] flex items-start gap-3 text-xs leading-relaxed">
        <AlertCircle className="w-4 h-4 text-[#6B6252] shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block text-[#0B1120]">
            Event-Configured Services Blueprint Notice
          </strong>
          <span>
            Nearby services, amenities, and hospitality statuses are synchronized in real time with event hospitality operators.
          </span>
        </div>
      </div>
    </div>
  );
};
