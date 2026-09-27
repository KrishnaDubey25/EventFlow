import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, type Variants } from "motion/react";
import { ArrowRight, CheckCircle2, Play, X } from "lucide-react";
import { EventFlowLogo } from "./EventFlowLogo";

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export const HeroSection: React.FC = () => {
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#0B1120]">
      <div className="relative min-h-[calc(100vh-5rem)]">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-100"
          src="/media/eventflow-hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        {/* Navy scrim so video stays premium & text stays legible */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,17,32,0.95)_0%,rgba(11,17,32,0.78)_32%,rgba(11,17,32,0.32)_62%,rgba(11,17,32,0.08)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(11,17,32,0.9)_0%,rgba(11,17,32,0.15)_46%,rgba(11,17,32,0.05)_100%)]" />
        <div className="hero-scan-grid absolute inset-0 opacity-15" />

        {/* Text block anchored lower-left for a cinematic, premium composition */}
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-end px-6 pb-14 pt-28 sm:pb-20 lg:items-end lg:px-10 lg:pb-24">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="w-full"
          >
            <div className="hero-text-float max-w-xl space-y-7 text-left">
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-3 rounded-full border border-[#C9A15C]/35 bg-[#16213B]/70 px-4 py-2 text-xs font-semibold tracking-wider text-[#F5EFE2] shadow-[0_0_42px_-20px_rgba(201,161,92,0.85)] backdrop-blur-xl"
              >
                <EventFlowLogo
                  size={24}
                  variant="dark"
                  className="drop-shadow-[0_0_14px_rgba(201,161,92,0.5)]"
                />
                <span className="gold-pulse-glow h-1.5 w-1.5 rounded-full bg-[#C9A15C]" />
                <span className="font-mono text-[11px] uppercase tracking-widest text-[#E4D9BE]">
                  Live Event OS
                </span>
              </motion.div>

              <div className="space-y-4">
                <motion.h1
                  variants={itemVariants}
                  className="font-heading text-5xl font-bold leading-[1.02] tracking-tight text-[#F5EFE2] sm:text-6xl lg:text-[4.7rem]"
                >
                  Event
                  <span className="bg-gradient-to-r from-[#D9B876] via-[#C9A15C] to-[#8A6A32] bg-clip-text text-transparent drop-shadow-[0_0_22px_rgba(201,161,92,0.35)]">
                    Flow
                  </span>
                </motion.h1>

                <motion.p
                  variants={itemVariants}
                  className="max-w-md text-base leading-relaxed text-[#E4D9BE]/85 sm:text-lg"
                >
                  Real-time event guidance for attendees, operators and organizers.
                </motion.p>
              </div>

              <motion.div
                variants={itemVariants}
                className="flex flex-col items-start justify-center gap-3.5 pt-1 sm:flex-row"
              >
                <Link
                  to="/events"
                  className="group flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#D9B876] to-[#C9A15C] px-7 py-3.5 text-sm font-semibold text-[#0B1120] shadow-[0_0_40px_-16px_rgba(201,161,92,0.95)] transition-all hover:from-[#E3C081] hover:to-[#D9B876] hover:shadow-[0_0_54px_-14px_rgba(201,161,92,0.95)] active:scale-[0.98] sm:w-auto"
                >
                  <span>Explore Events</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>

                <button
                  onClick={() => setShowDemoModal(true)}
                  className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-[#E4D9BE]/25 bg-[#16213B]/70 px-6 py-3.5 text-sm font-semibold text-[#F5EFE2] shadow-xs backdrop-blur-xl transition-all hover:border-[#C9A15C]/50 hover:bg-[#0B1120] hover:shadow-[0_0_34px_-18px_rgba(201,161,92,0.85)] active:scale-[0.98] sm:w-auto"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C9A15C]/15 text-[#C9A15C]">
                    <Play className="ml-0.5 h-3 w-3 fill-[#C9A15C]" />
                  </div>
                  <span>Watch Walkthrough</span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1120]/75 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg space-y-6 rounded-2xl border border-[#E4D9BE]/18 bg-[#0B1120] p-7 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E4D9BE]/12 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C9A15C]/12 text-[#C9A15C]">
                  <Play className="ml-0.5 h-4 w-4 fill-[#C9A15C]" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-[#F5EFE2]">
                    EventFlow System Walkthrough
                  </h3>
                  <p className="text-xs text-[#E4D9BE]">Live operational loop coordination</p>
                </div>
              </div>
              <button
                onClick={() => setShowDemoModal(false)}
                className="cursor-pointer rounded-lg p-1.5 text-[#E4D9BE] transition-colors hover:bg-[#16213B] hover:text-[#F5EFE2]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-sm leading-relaxed text-[#E4D9BE]">
              <p>
                Modern mega-events involve tens of thousands of concurrent movements.
                EventFlow unifies venues, transit networks, and attendees through a synchronized telemetry mesh:
              </p>

              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-2.5 rounded-xl border border-[#E4D9BE]/12 bg-[#0B1120] p-3 text-xs">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C9A15C]" />
                  <div>
                    <strong className="block font-semibold text-[#F5EFE2]">
                      Organizers
                    </strong>
                    Real-time situational awareness and automated turnstile load balancing.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-xl border border-[#E4D9BE]/12 bg-[#0B1120] p-3 text-xs">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  <div>
                    <strong className="block font-semibold text-[#F5EFE2]">
                      Operations &amp; Transport
                    </strong>
                    Dynamic dispatch of shuttles, parking corridors, and concessions stocking.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-xl border border-[#E4D9BE]/12 bg-[#0B1120] p-3 text-xs">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#E4D9BE]" />
                  <div>
                    <strong className="block font-semibold text-[#F5EFE2]">
                      Attendees
                    </strong>
                    Frictionless digital passes, tailored gate navigation, and shortest wait times.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-[#E4D9BE]/12 pt-2">
              <button
                onClick={() => setShowDemoModal(false)}
                className="cursor-pointer rounded-xl bg-gradient-to-r from-[#D9B876] to-[#C9A15C] px-5 py-2.5 text-xs font-semibold text-[#0B1120] transition-colors hover:from-[#E3C081] hover:to-[#D9B876]"
              >
                Close Walkthrough
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
