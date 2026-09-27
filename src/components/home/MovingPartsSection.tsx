import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  ArrowUpRight, 
  ChevronLeft,
  ChevronRight,
  CheckCircle2, 
  ShieldCheck, 
  Store, 
  Ticket 
} from "lucide-react";

interface StakeholderCard {
  id: "organizers" | "hospitality" | "attendees";
  role: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  explanationLines: string[];
}

export const MovingPartsSection: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<StakeholderCard["id"]>("attendees");

  const cards: StakeholderCard[] = [
    {
      id: "organizers",
      role: "Organizers",
      subtitle: "Event Command & Decision Support",
      icon: ShieldCheck,
      badge: "Command View",
      explanationLines: [
        "Monitor live turnstile throughput & perimeter gate pressure",
        "Balance concourse crowd density before bottlenecks form",
        "Coordinate multi-agency operational actions in real time",
      ],
    },
    {
      id: "hospitality",
      role: "Hospitality & Operations",
      subtitle: "Mobility, Parking & Concessions",
      icon: Store,
      badge: "Ops Sync",
      explanationLines: [
        "Dispatch shuttle fleet headways and align municipal transit",
        "Guide drivers to open parking hubs with live variable signage",
        "Synchronize food, beverage, and merchandise stock to crowd flow",
      ],
    },
    {
      id: "attendees",
      role: "Attendees",
      subtitle: "Personalized Digital Experience",
      icon: Ticket,
      badge: "Live Companion",
      explanationLines: [
        "Receive personalized gate recommendations and shortest corridors",
        "Access digital ticket passes with live wait-time notifications",
        "Navigate seamless departure wayfinding to chosen transit options",
      ],
    },
  ];

  return (
    <section id="moving-parts" className="py-20 lg:py-28 relative bg-[#F5EFE2]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Section Header */}
        <div className="flex flex-col gap-6 mb-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B1120] border border-[#C9A15C]/40 text-xs font-semibold text-[#F5EFE2] shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A15C]" />
            <span className="uppercase tracking-wider text-[11px] font-mono">
              Coordinated Ecosystem
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.85rem] font-bold tracking-tight text-[#0B1120] font-heading leading-tight">
            One event. Every moving part.
          </h2>
          <p className="text-[#4A4236] text-base sm:text-lg leading-relaxed">
            Eliminate operational blind spots with three unified interfaces built
            specifically for the key stakeholders of mega-gatherings.
          </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const currentIndex = cards.findIndex((card) => card.id === activeCard);
                const nextIndex = (currentIndex - 1 + cards.length) % cards.length;
                setActiveCard(cards[nextIndex].id);
              }}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#0B1120]/15 bg-[#0B1120] text-[#E4D9BE] shadow-sm transition-all hover:border-[#C9A15C]/60 hover:text-[#C9A15C]"
              aria-label="Previous role"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                const currentIndex = cards.findIndex((card) => card.id === activeCard);
                const nextIndex = (currentIndex + 1) % cards.length;
                setActiveCard(cards[nextIndex].id);
              }}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#0B1120]/15 bg-[#0B1120] text-[#E4D9BE] shadow-sm transition-all hover:border-[#C9A15C]/60 hover:text-[#C9A15C]"
              aria-label="Next role"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 3 Prominent Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-stretch">
          {cards.map((card, index) => {
            const isActive = hoveredCard === card.id || activeCard === card.id;
            const Icon = card.icon;

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => setActiveCard(card.id)}
                whileHover={{ y: -6 }}
                className={`p-8 sm:p-9 rounded-2xl flex flex-col justify-between transition-all duration-300 border cursor-pointer ${
                  isActive
                    ? "bg-[#0B1120] border-[#C9A15C]/70 shadow-[0_26px_60px_-18px_rgba(11,17,32,0.55)] lg:scale-[1.035]"
                    : "bg-[#F0E9D6] border-[#0B1120]/10 shadow-[0_4px_26px_-8px_rgba(11,17,32,0.1)] hover:shadow-[0_18px_44px_-24px_rgba(201,161,92,0.35)]"
                } relative overflow-hidden group select-none`}
              >
                {/* Rotating gold sheen frame — visible on hover/active */}
                <div className={`gold-border-sheen ${isActive ? "is-active" : ""}`} />

                {/* Gold accent top stripe on hover */}
                <div 
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A15C] to-[#E4D9BE] transition-opacity duration-300 ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`} 
                />

                {/* Animated Light Flash Beam Sweeping Across Card from one side to the other */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-20">
                  <div 
                    className="card-flash-beam"
                    style={{ animationDelay: `${index * 1.5}s` }}
                  />
                </div>

                <div className="space-y-6">
                  {/* Top Bar with Icon & Role Badge */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-300 group-hover:rotate-[8deg] ${
                        isActive
                          ? "bg-[#C9A15C] text-[#0B1120] border-[#C9A15C]"
                          : "bg-[#F5EFE2] text-[#C9A15C] border-[#0B1120]/10 group-hover:bg-[#C9A15C] group-hover:text-white group-hover:border-[#C9A15C]"
                      }`}
                    >
                      <Icon className="w-5 h-5 transition-colors" />
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold border ${
                          isActive
                            ? "bg-[#C9A15C]/15 text-[#E4D9BE] border-[#C9A15C]/40"
                            : "bg-[#C9A15C]/10 text-[#8A6A32] border-[#C9A15C]/35"
                        }`}
                      >
                        {card.badge}
                      </span>
                      <div
                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                          isActive 
                            ? "bg-[#C9A15C] text-[#0B1120] border-[#C9A15C]" 
                            : "bg-[#F5EFE2] text-[#4A4236] border-[#0B1120]/10"
                        }`}
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Role Name & Subtitle */}
                  <div className="space-y-1.5 pt-1">
                    <h3 className={`text-2xl sm:text-[1.75rem] font-bold tracking-tight font-heading leading-tight ${isActive ? "text-[#F5EFE2]" : "text-[#0B1120]"}`}>
                      {card.role}
                    </h3>
                    <p className={`text-xs font-mono font-semibold uppercase tracking-wider ${isActive ? "text-[#C9A15C]" : "text-[#8A6A32]"}`}>
                      {card.subtitle}
                    </p>
                  </div>

                  {/* Subtle divider */}
                  <div className={`h-px w-full ${isActive ? "bg-[#F5EFE2]/15" : "bg-[#0B1120]/10"}`} />

                  {/* 3 Explanation Lines */}
                  <div className="space-y-3.5 pt-1">
                    {card.explanationLines.map((line, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-[#C9A15C] shrink-0 mt-0.5" />
                        <span className={`text-sm font-medium leading-relaxed ${isActive ? "text-[#E4D9BE]" : "text-[#4A4236]"}`}>
                          {line}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom status badge */}
                <div className={`pt-7 mt-6 border-t flex items-center justify-between text-xs font-mono ${isActive ? "border-[#F5EFE2]/15" : "border-[#0B1120]/10"}`}>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A15C]" />
                    <span className={`text-[11px] font-semibold ${isActive ? "text-[#E4D9BE]" : "text-[#4A4236]"}`}>
                      Operational Synchronization
                    </span>
                  </span>
                  <span className={`font-semibold uppercase tracking-wider text-[11px] ${isActive ? "text-[#F5EFE2]" : "text-[#0B1120]"}`}>
                    EventFlow Mesh
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
