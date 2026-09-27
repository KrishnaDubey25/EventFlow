import React from "react";
import { EventFlowLogo } from "./EventFlowLogo";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#EDE3CB] text-[#0B1120] pt-16 pb-14 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-12 relative z-10">
        {/* Main Brand & Mission Row (Clean & minimal, without duplicate navbar links) */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10">
          <div className="space-y-3 max-w-lg">
            <div
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <EventFlowLogo size={34} variant="light" className="transition-transform group-hover:scale-105 duration-200" />
              <span className="text-2xl font-bold tracking-tight text-[#0B1120] font-heading">
                EventFlow
              </span>
            </div>
            <p className="text-sm text-[#4A4236] leading-relaxed">
              Every event. One intelligent system. Real-time operational orchestration
              synchronizing venues, transport networks, hospitality, and attendee experiences worldwide.
            </p>
          </div>

          {/* Operational Infrastructure Status Badge */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#0B1120] border border-[#C9A15C]/25 text-xs font-mono text-[#E4D9BE] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#C9A15C] animate-pulse" />
            <span className="text-[#F5EFE2] font-semibold">GLOBAL MESH:</span>
            <span className="text-[#C9A15C] font-semibold">ONLINE</span>
            <span className="text-[#E4D9BE]/30">|</span>
            <span className="text-[#E4D9BE]">99.99% UPTIME</span>
          </div>
        </div>

        {/* Bottom Sub-Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#4A4236] font-mono">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A15C]" />
            <span>EventFlow Ecosystem Infrastructure</span>
            <span className="text-[#0B1120]/30">•</span>
            <span>Intelligent Orchestration</span>
          </div>

          <div>
            © {new Date().getFullYear()} EventFlow Technologies Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
