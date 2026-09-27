import React, { useState, useEffect } from "react";
import { 
  CalendarCheck, 
  MapPin, 
  DoorOpen, 
  Sparkles, 
  Radio, 
  TrendingUp,
  CheckCircle2,
  Trophy,
  Music2,
  Users2,
  Tent,
  Building2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const JourneySection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isManual, setIsManual] = useState<boolean>(false);

  const steps = [
    {
      id: "plan",
      title: "PLAN",
      subtitle: "Capacity & Demand Modeling",
      detail: "Predictive wave ingress modeling, staffing distribution, and transport frequency scheduling.",
      metric: "Dynamic Headway Ready",
      icon: CalendarCheck,
    },
    {
      id: "arrive",
      title: "ARRIVE",
      subtitle: "Arterial Transit & Parking",
      detail: "Variable roadside signage, automated parking overflow alerts, and synchronized shuttle injection.",
      metric: "Green-Wave Aligned",
      icon: MapPin,
    },
    {
      id: "enter",
      title: "ENTER",
      subtitle: "Gate Flow & Concourse Access",
      detail: "Real-time turnstile metering, ticket verification, and dynamic auxiliary gate balancing.",
      metric: "Sub-2s Mean Ingress",
      icon: DoorOpen,
    },
    {
      id: "experience",
      title: "EXPERIENCE",
      subtitle: "Concessions & Seat Journey",
      detail: "Express mobile queue diversion, localized concourse wayfinding, and seat-linked hospitality ordering.",
      metric: "Zero Corridor Surge",
      icon: Sparkles,
    },
    {
      id: "respond",
      title: "RESPOND",
      subtitle: "Real-Time Adjustments",
      detail: "Instant operational rerouting and incident decision support if a corridor, turnstile, or road surges.",
      metric: "Unified Agency Loop",
      icon: Radio,
    },
    {
      id: "disperse",
      title: "DISPERSE",
      subtitle: "Egress & Transit Departure",
      detail: "Staggered exit gate releases, coordinated municipal train capacity, and clear perimeter transit routes.",
      metric: "Rapid Safe Egress",
      icon: TrendingUp,
    },
  ];

  const archetypes = [
    { 
      name: "Sports", 
      icon: Trophy, 
      desc: "Stadiums & Arenas",
      stat: "85k+ attendees",
    },
    { 
      name: "Concerts", 
      icon: Music2, 
      desc: "Tours & Arenas",
      stat: "Multi-stage sync",
    },
    { 
      name: "Conferences", 
      icon: Users2, 
      desc: "Convention Centers",
      stat: "Keynote surges",
    },
    { 
      name: "Festivals", 
      icon: Tent, 
      desc: "Open Grounds",
      stat: "Perimeter gates",
    },
    { 
      name: "Large Gatherings", 
      icon: Building2, 
      desc: "Metropolitan Hubs",
      stat: "Multi-modal transit",
    },
  ];

  useEffect(() => {
    if (isManual) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isManual, steps.length]);

  return (
    <section id="journey-section" className="py-20 lg:pt-24 lg:pb-28 bg-[#FBF8F1] border-t border-[#0B1120]/8 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-20">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B1120] border border-[#C9A15C]/40 text-xs font-semibold text-[#F5EFE2] shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A15C]" />
            <span className="text-[11px] uppercase font-mono tracking-widest text-[#C9A15C] font-bold">
              End-to-End Operational Lifecycle
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-[#0B1120] font-heading leading-tight">
            From arrival to dispersal.
          </h2>
          <p className="text-[#4A4236] text-base sm:text-lg leading-relaxed">
            One intelligent continuum connecting planning, live surge management, and safe egress.
          </p>
        </div>

        {/* Interactive Horizontal Flowing Path — navy panel as the section's accent block */}
        <div className="p-7 sm:p-9 rounded-2xl bg-[#0B1120] shadow-[0_22px_60px_-30px_rgba(11,17,32,0.45)] border border-[#0B1120]">
          <div className="relative">
            <div className="hidden md:block absolute top-7 left-10 right-10 h-0.5 bg-[#E4D9BE]/18" />
            
            <div
              className="hidden md:block absolute top-7 left-10 h-0.5 bg-[#C9A15C] transition-all duration-700 ease-out shadow-[0_0_18px_rgba(201,161,92,0.8)]"
              style={{
                width: `${(activeStep / (steps.length - 1)) * 90}%`,
              }}
            />

            {/* 6 Journey Stages */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 relative z-10">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = activeStep === idx;
                const isPast = activeStep > idx;

                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      setIsManual(true);
                      setActiveStep(idx);
                    }}
                    className={`text-left p-3.5 rounded-xl transition-all duration-300 cursor-pointer group flex flex-col items-start ${
                      isActive
                        ? "bg-[#16213B]/80 border border-[#C9A15C]/40 shadow-xs scale-[1.02]"
                        : "hover:bg-[#16213B]/45 border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${
                        isActive
                          ? "bg-[#C9A15C] text-[#0B1120] shadow-md ring-4 ring-[#C9A15C]/20 scale-105"
                          : isPast
                          ? "bg-[#E4D9BE] text-[#0B1120]"
                          : "bg-[#16213B] text-[#E4D9BE] group-hover:bg-[#1C2B4A] group-hover:text-[#F5EFE2]"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <span
                      className={`text-xs font-mono font-bold tracking-wider transition-colors ${
                        isActive ? "text-[#C9A15C] font-extrabold" : "text-[#F5EFE2]"
                      }`}
                    >
                      {step.title}
                    </span>
                    <span className="text-[11px] font-medium text-[#E4D9BE] mt-1 leading-snug line-clamp-2">
                      {step.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Step Details Panel */}
          <div className="mt-8 pt-6 border-t border-[#E4D9BE]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-3"
              >
                <span className="px-2.5 py-1 rounded-md bg-[#C9A15C]/18 font-mono text-[#C9A15C] font-bold text-[11px]">
                  STAGE {activeStep + 1} OF 6
                </span>
                <span className="text-[#F5EFE2] font-medium text-sm">
                  {steps[activeStep].detail}
                </span>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-2 text-[11px] text-[#E4D9BE] font-mono shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A15C]" />
              <span>{steps[activeStep].metric}</span>
            </div>
          </div>
        </div>

        {/* Multi-Archetype Adaptability Section */}
        <div id="events-strip" className="space-y-8 pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-[#0B1120]/10 pb-5">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B1120] border border-[#C9A15C]/40 text-xs font-mono font-bold text-[#C9A15C] shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A15C]" />
                <span>MULTI-ARCHETYPE ADAPTABILITY</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1120] font-heading">
                Tailored for every venue geometry
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#4A4236] max-w-sm">
              From stadium concourses to metropolitan festival grounds, EventFlow dynamically calibrates routing and density thresholds.
            </p>
          </div>

          {/* 5-Column Clean Archetype Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {archetypes.map((arch, archIdx) => {
              const Icon = arch.icon;

              return (
                <motion.div
                  key={arch.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: archIdx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -5 }}
                  className="p-5 rounded-xl bg-[#F0E9D6] border border-[#0B1120]/10 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#C9A15C]/50 hover:shadow-[0_16px_38px_-22px_rgba(201,161,92,0.4)] transition-all duration-300 relative overflow-hidden group select-none"
                >
                  {/* Rotating gold sheen frame on hover */}
                  <div className="gold-border-sheen" />

                  {/* Light Flash Beam Sweeping Across Card */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-20">
                    <div 
                      className="archetype-flash-beam"
                      style={{ animationDelay: `${archIdx * 1.2}s` }}
                    />
                  </div>

                  <div className="space-y-3 relative z-10">
                    <div className="w-10 h-10 rounded-lg bg-[#0B1120] border border-[#0B1120] text-[#C9A15C] flex items-center justify-center group-hover:bg-[#C9A15C] group-hover:text-[#0B1120] group-hover:rotate-[8deg] transition-all duration-300">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-[#0B1120] font-heading">
                        {arch.name}
                      </h4>
                      <p className="text-xs text-[#4A4236] mt-0.5">
                        {arch.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#0B1120]/10 flex items-center justify-between text-[11px] font-mono text-[#4A4236] w-full relative z-10">
                    <span>{arch.stat}</span>
                    <span className="text-[#8A6A32] font-semibold">Mesh Ready</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
