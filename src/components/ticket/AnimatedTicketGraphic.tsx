import React from "react";
import { QrCode, Sparkles, ShieldCheck, Ticket as TicketIcon } from "lucide-react";

interface AnimatedTicketGraphicProps {
  isVerifying?: boolean;
  isVerified?: boolean;
  ticketCode?: string;
  eventName?: string;
}

export const AnimatedTicketGraphic: React.FC<AnimatedTicketGraphicProps> = ({
  isVerifying = false,
  isVerified = false,
  ticketCode = "EVF-PASS-2026",
  eventName = "Mega Event Ingress Pass",
}) => {
  return (
    <div className="relative w-full max-w-[320px] mx-auto select-none">
      {/* Soft ambient aura */}
      <div
        className={`absolute -inset-2 rounded-3xl blur-xl transition-all duration-700 pointer-events-none opacity-60 ${
          isVerified
            ? "bg-emerald-200/50"
            : isVerifying
            ? "bg-[#6EA8FF]/60 animate-pulse"
            : "bg-[#EDE3CB]/40"
        }`}
      />

      {/* Ticket Body with scalloped circular cutouts */}
      <div className="relative bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7]/90 shadow-lg overflow-hidden transition-all duration-300">
        {/* Ticket Header Bar */}
        <div className="bg-[#0B1120] text-white p-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#4F7CFF] flex items-center justify-center text-white">
              <TicketIcon className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold tracking-wider font-mono uppercase text-[#C9D9F7]">
              EventFlow Pass
            </span>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              isVerified
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                : isVerifying
                ? "bg-[#4F7CFF]/20 text-[#6EA8FF] animate-pulse"
                : "bg-[#F0E9D6]/10 text-[#C9BBA0]"
            }`}
          >
            {isVerified ? (
              <>
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Verified</span>
              </>
            ) : isVerifying ? (
              <span>Validating...</span>
            ) : (
              <span>Ready to Scan</span>
            )}
          </span>
        </div>

        {/* Event Micro Info */}
        <div className="px-5 pt-3 pb-2 border-b border-[#F7FAFF]">
          <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#8C8272]">
            Event Pass
          </div>
          <div className="text-xs font-bold text-[#0B1120] truncate mt-0.5">
            {eventName}
          </div>
        </div>

        {/* QR Section with Scanline Animation */}
        <div className="p-6 flex flex-col items-center justify-center bg-[#F4F8FF]/70 relative">
          <div className="relative p-3 bg-[#F0E9D6] rounded-xl border border-[#C9D9F7]/80 shadow-xs">
            {/* Corner Aiming Brackets */}
            <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-[#4F7CFF] rounded-tl" />
            <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-[#4F7CFF] rounded-tr" />
            <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-[#4F7CFF] rounded-bl" />
            <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-[#4F7CFF] rounded-br" />

            <div className="relative w-28 h-28 flex items-center justify-center overflow-hidden">
              <QrCode className="w-24 h-24 text-[#241E17]" strokeWidth={1.5} />

              {/* Scanning Ray Line */}
              {isVerifying && (
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#4F7CFF] to-transparent shadow-[0_0_8px_#3b82f6] animate-bounce" />
              )}
            </div>
          </div>

          {/* Ticket Code String */}
          <div className="mt-3 font-mono text-[11px] font-bold text-[#4A4236] tracking-wider">
            {ticketCode}
          </div>
        </div>

        {/* Perforated Divider with Circular Left and Right Notches */}
        <div className="relative h-4 flex items-center">
          {/* Left Notch */}
          <div className="absolute -left-2.5 w-5 h-5 bg-[#FAF9F5] rounded-full border border-[#C9D9F7]/90" />
          {/* Dashed Line */}
          <div className="w-full border-t border-dashed border-[#C9BBA0] mx-4" />
          {/* Right Notch */}
          <div className="absolute -right-2.5 w-5 h-5 bg-[#FAF9F5] rounded-full border border-[#C9D9F7]/90" />
        </div>

        {/* Ticket Stub Footer Barcode */}
        <div className="px-5 py-3 bg-[#F0E9D6] flex items-center justify-between text-[11px] text-[#6B6252] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4F7CFF]" />
            <span>Digital Ingress</span>
          </div>

          <div className="flex items-center gap-0.5">
            {/* Realistic Barcode Stripes */}
            <span className="w-0.5 h-4 bg-[#241E17]" />
            <span className="w-1 h-4 bg-[#241E17]" />
            <span className="w-0.5 h-4 bg-[#C9BBA0]" />
            <span className="w-1.5 h-4 bg-[#241E17]" />
            <span className="w-0.5 h-4 bg-[#C9BBA0]" />
            <span className="w-1 h-4 bg-[#241E17]" />
            <span className="w-2 h-4 bg-[#241E17]" />
            <span className="w-0.5 h-4 bg-[#241E17]" />
            <span className="w-1 h-4 bg-[#C9BBA0]" />
            <span className="w-1.5 h-4 bg-[#241E17]" />
            <span className="w-0.5 h-4 bg-[#241E17]" />
          </div>
        </div>
      </div>
    </div>
  );
};
