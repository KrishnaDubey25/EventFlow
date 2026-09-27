import React, { useState, useEffect } from "react";
import {
  ArrowLeftRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Car,
  LogIn,
  LogOut,
  Sliders,
  Sparkles,
  Zap,
  Lock,
  Unlock,
} from "lucide-react";
import { OperatorLayout } from "../../components/operator/OperatorLayout";
import { useAuth } from "../../context/AuthContext";
import { OperatorUser } from "../../types/auth";

interface GateRecord {
  id: string;
  name: string;
  type: "ENTRY" | "EXIT" | "BIDIRECTIONAL";
  facilityName: string;
  status: "OPEN" | "RESTRICTED" | "CLOSED" | "MAINTENANCE";
  throughputPerHour: number;
  totalProcessedToday: number;
  averageScanSeconds: number;
  laneCount: number;
}

const STORAGE_KEY = "eventflow_parking_gates";

function getStoredGates(): GateRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  const initialGates: GateRecord[] = [
    {
      id: "gate-1",
      name: "Gate 1 - East Concourse Ingress",
      type: "ENTRY",
      facilityName: "Parking Facility P2 (East Concourse)",
      status: "OPEN",
      throughputPerHour: 340,
      totalProcessedToday: 1420,
      averageScanSeconds: 2.8,
      laneCount: 4,
    },
    {
      id: "gate-2",
      name: "Gate 2 - FastTrack RFID Barrier",
      type: "ENTRY",
      facilityName: "Parking Facility P2 (East Concourse)",
      status: "OPEN",
      throughputPerHour: 510,
      totalProcessedToday: 2180,
      averageScanSeconds: 1.6,
      laneCount: 3,
    },
    {
      id: "gate-3",
      name: "Gate 3 - Main Egress Highway Exit",
      type: "EXIT",
      facilityName: "Parking Facility P2 (East Concourse)",
      status: "OPEN",
      throughputPerHour: 220,
      totalProcessedToday: 890,
      averageScanSeconds: 2.1,
      laneCount: 4,
    },
    {
      id: "gate-4",
      name: "Gate 4 - VIP & Logistics Access",
      type: "BIDIRECTIONAL",
      facilityName: "Main Entrance Parking P1",
      status: "RESTRICTED",
      throughputPerHour: 65,
      totalProcessedToday: 240,
      averageScanSeconds: 4.5,
      laneCount: 2,
    },
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialGates));
  return initialGates;
}

export const OperatorEntryExitPage: React.FC = () => {
  const { user } = useAuth();
  const operatorUser = user as OperatorUser | null;

  const [gates, setGates] = useState<GateRecord[]>(getStoredGates());
  const [feedback, setFeedback] = useState<string | null>(null);

  const saveGates = (updated: GateRecord[]) => {
    setGates(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleGateStatus = (gateId: string, newStatus: GateRecord["status"]) => {
    const updated = gates.map((g) => (g.id === gateId ? { ...g, status: newStatus } : g));
    saveGates(updated);
    setFeedback(`Gate updated to "${newStatus}"`);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleTriggerCycle = (gateId: string, delta: number) => {
    const updated = gates.map((g) =>
      g.id === gateId
        ? {
            ...g,
            totalProcessedToday: g.totalProcessedToday + delta,
            throughputPerHour: g.throughputPerHour + delta,
          }
        : g
    );
    saveGates(updated);
    setFeedback(`Vehicle entry recorded (+${delta})`);
    setTimeout(() => setFeedback(null), 2000);
  };

  const totalProcessed = gates.reduce((acc, g) => acc + g.totalProcessedToday, 0);
  const totalThroughput = gates.reduce((acc, g) => acc + g.throughputPerHour, 0);

  return (
    <OperatorLayout
      title="Parking Gate Flow & Entry / Exit Management"
      subtitle="Control automated RFID boom barriers, monitor vehicular ingress/egress, and override lanes during surges."
    >
      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Total Ingress/Egress</span>
            <div className="p-2 rounded-xl bg-[#F7FAFF] text-[#4F7CFF]">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0B1120] mt-2 font-heading">{totalProcessed.toLocaleString()}</p>
          <p className="text-xs text-[#6B6252] mt-0.5">Vehicles cleared today</p>
        </div>

        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Current Flow Rate</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-indigo-700 mt-2 font-heading">{totalThroughput} / hr</p>
          <p className="text-xs text-[#6B6252] mt-0.5">Combined barrier throughput</p>
        </div>

        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Avg Scan Time</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-teal-700 mt-2 font-heading">2.3 sec</p>
          <p className="text-xs text-[#6B6252] mt-0.5">FastTrack RFID & QR validation</p>
        </div>

        <div className="bg-[#F0E9D6] rounded-2xl p-5 border border-[#C9D9F7]/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C8272]">Barrier Health</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2 font-heading">100% Online</p>
          <p className="text-xs text-[#6B6252] mt-0.5">All electronic booms synced</p>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-600">✕</button>
        </div>
      )}

      {/* Gates Control Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gates.map((gate) => (
          <div
            key={gate.id}
            className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7]/80 p-5 shadow-2xs space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    gate.type === "ENTRY"
                      ? "bg-emerald-50 text-emerald-600"
                      : gate.type === "EXIT"
                      ? "bg-[#F7FAFF] text-[#4F7CFF]"
                      : "bg-purple-50 text-purple-600"
                  }`}
                >
                  {gate.type === "ENTRY" ? (
                    <LogIn className="w-5 h-5" />
                  ) : gate.type === "EXIT" ? (
                    <LogOut className="w-5 h-5" />
                  ) : (
                    <ArrowLeftRight className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0B1120] font-heading">{gate.name}</h3>
                  <p className="text-xs text-[#6B6252]">
                    {gate.facilityName} • {gate.laneCount} Active Lanes
                  </p>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  gate.status === "OPEN"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : gate.status === "RESTRICTED"
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : gate.status === "CLOSED"
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-[#F7FAFF] text-[#382F27] border border-[#C9D9F7]"
                }`}
              >
                {gate.status}
              </span>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7]/60 text-center">
              <div>
                <p className="text-[10px] text-[#8C8272] font-bold uppercase">Throughput</p>
                <p className="text-sm font-bold text-[#0B1120] mt-0.5">{gate.throughputPerHour} / hr</p>
              </div>
              <div>
                <p className="text-[10px] text-[#8C8272] font-bold uppercase">Today Total</p>
                <p className="text-sm font-bold text-[#2D5FD2] mt-0.5">{gate.totalProcessedToday}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#8C8272] font-bold uppercase">Scan Speed</p>
                <p className="text-sm font-bold text-emerald-700 mt-0.5">{gate.averageScanSeconds}s</p>
              </div>
            </div>

            {/* Quick Gate Action Bar */}
            <div className="pt-2 border-t border-[#F7FAFF] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleTriggerCycle(gate.id, 1)}
                  className="px-2.5 py-1 rounded-lg bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#241E17] text-xs font-bold transition-colors cursor-pointer"
                  title="Record single vehicle pass"
                >
                  +1 Pass
                </button>
                <button
                  onClick={() => handleTriggerCycle(gate.id, 10)}
                  className="px-2.5 py-1 rounded-lg bg-[#F7FAFF] hover:bg-[#C9D9F7] text-[#241E17] text-xs font-bold transition-colors cursor-pointer"
                  title="Record batch surge pass"
                >
                  +10 Fast Pass
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleGateStatus(gate.id, "OPEN")}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Unlock className="w-3 h-3" />
                  <span>Open</span>
                </button>
                <button
                  onClick={() => handleGateStatus(gate.id, "RESTRICTED")}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Restrict
                </button>
                <button
                  onClick={() => handleGateStatus(gate.id, "CLOSED")}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" />
                  <span>Close</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </OperatorLayout>
  );
};
