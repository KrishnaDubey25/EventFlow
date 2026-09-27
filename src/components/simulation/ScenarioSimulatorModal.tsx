import React, { useState } from "react";
import { MegaEvent } from "../../types";
import { 
  AlertTriangle, 
  CloudRain, 
  DoorClosed, 
  Play, 
  Sliders, 
  Train, 
  Users, 
  X, 
  Zap,
  CheckCircle2,
  RotateCcw
} from "lucide-react";

interface ScenarioSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: MegaEvent;
  onApplyScenario: (scenarioName: string, changes: Partial<MegaEvent>) => void;
  onResetBaseline: () => void;
}

export const ScenarioSimulatorModal: React.FC<ScenarioSimulatorModalProps> = ({
  isOpen,
  onClose,
  event,
  onApplyScenario,
  onResetBaseline,
}) => {
  const [activeScenario, setActiveScenario] = useState<string>("baseline");
  const [surgeAttendance, setSurgeAttendance] = useState<number>(event.currentAttendance);
  const [transitDelayMins, setTransitDelayMins] = useState<number>(3);

  if (!isOpen) return null;

  const scenarios = [
    {
      id: "baseline",
      title: "Nominal Operations",
      desc: "Balanced gate queues, on-time metro headways, optimal concourse distribution.",
      icon: CheckCircle2,
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      apply: () => {
        setActiveScenario("baseline");
        onResetBaseline();
      },
    },
    {
      id: "ingress-peak",
      title: "Mass Ingress Surge",
      desc: "+14,000 rapid arrivals in 15 minutes. Gate 3 queue builds to 2,800 pax, parking lots nearing 95%.",
      icon: Users,
      color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
      apply: () => {
        setActiveScenario("ingress-peak");
        onApplyScenario("Mass Ingress Surge", {
          currentAttendance: Math.min(event.capacity - 2000, event.currentAttendance + 14000),
          currentPhase: "Ingress Peak",
          gates: event.gates.map((g) =>
            g.id === "gate-3"
              ? { ...g, status: "critical", queueLength: 2850, avgWaitMins: 22 }
              : g.id === "gate-2"
              ? { ...g, status: "congested", queueLength: 1650, avgWaitMins: 14 }
              : g
          ),
          incidents: [
            ...event.incidents.filter((i) => i.id !== "sim-1"),
            {
              id: "sim-1",
              title: "Surge Pressure at Gate 3 Turnstiles",
              type: "gate_choke",
              severity: "critical",
              timestamp: "Just now",
              location: "Gate 3 Concourse",
              description: "Queue spilling past boulevard perimeter. Crowd density exceeded 4.1 persons/sqm.",
              status: "active",
              suggestedAction: "Activate Gate 3B overflow auxiliary turnstiles and reroute digital tickets.",
            },
          ],
        });
      },
    },
    {
      id: "train-delay",
      title: "Suburban Train Delay & Clustered Arrival",
      desc: "15-minute signal block cleared. 3 heavy passenger trains arrive simultaneously at Churchgate station.",
      icon: Train,
      color: "text-sky-400 border-sky-500/30 bg-sky-500/10",
      apply: () => {
        setActiveScenario("train-delay");
        onApplyScenario("Suburban Train Delay", {
          transitLines: event.transitLines.map((t) =>
            t.type === "metro" ? { ...t, crowdLoadPercent: 96, status: "surging", headwayMinutes: 6 } : t
          ),
          gates: event.gates.map((g) =>
            g.id === "gate-2"
              ? { ...g, status: "critical", queueLength: 2400, avgWaitMins: 19 }
              : g
          ),
          incidents: [
            ...event.incidents.filter((i) => i.id !== "sim-transit"),
            {
              id: "sim-transit",
              title: "Suburban Train Bulk Ingress Shock",
              type: "transit_delay",
              severity: "warning",
              timestamp: "Just now",
              location: "Churchgate Rail Terminal Link",
              description: "6,000 passengers disembarked in 4 minutes. Flow directed to Gate 2.",
              status: "active",
              suggestedAction: "Inject 4 standby electric shuttles to divert crowd to Gate 4 Coastal.",
            },
          ],
        });
      },
    },
    {
      id: "turnstile-jam",
      title: "Gate 2 Optical Turnstile Outage",
      desc: "Hardware failure halts 6 automated turnstiles at Gate 2. Immediate pedestrian bottleneck.",
      icon: DoorClosed,
      color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
      apply: () => {
        setActiveScenario("turnstile-jam");
        onApplyScenario("Gate Turnstile Outage", {
          gates: event.gates.map((g) =>
            g.id === "gate-2"
              ? { ...g, turnstilesActive: 4, status: "critical", avgWaitMins: 28, queueLength: 2900 }
              : g
          ),
          incidents: [
            ...event.incidents.filter((i) => i.id !== "sim-gate"),
            {
              id: "sim-gate",
              title: "Gate 2 Scanner Hardware Malfunction",
              type: "equipment",
              severity: "critical",
              timestamp: "Just now",
              location: "Gate 2 Turnstiles 2C-2H",
              description: "Network link drop causing barcode scanners to timeout. Manual scanning active.",
              status: "active",
              suggestedAction: "Switch Gate 4 into Express Ingress and dispatch mobile handheld scanners.",
            },
          ],
        });
      },
    },
    {
      id: "weather-shock",
      title: "Sudden Monsoon / Rainstorm Shock",
      desc: "Heavy tropical downpour forces 35,000 fans from open plazas into covered interior concourses.",
      icon: CloudRain,
      color: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
      apply: () => {
        setActiveScenario("weather-shock");
        onApplyScenario("Sudden Rainstorm", {
          weather: {
            temp: "25°C",
            condition: "Heavy Monsoon Rainstorm",
            alert: "Slip hazard on outdoor promenades; concourses at peak density",
          },
          hospitalityStalls: event.hospitalityStalls.map((s) => ({
            ...s,
            queueTimeMins: s.queueTimeMins + 8,
          })),
          incidents: [
            ...event.incidents.filter((i) => i.id !== "sim-weather"),
            {
              id: "sim-weather",
              title: "Monsoon Downpour: Concourse Migration",
              type: "weather",
              severity: "warning",
              timestamp: "Just now",
              location: "All Level 1-2 Covered Concourses",
              description: "High indoor density. Outdoor food groves evacuated into inner ring.",
              status: "active",
              suggestedAction: "Broadcast public guidance to hold position in designated dry zones.",
            },
          ],
        });
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1120]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0B1120] border border-[#241E17] rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#241E17]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Stress Scenario & Cross-Ecosystem Simulator
              </h3>
              <p className="text-xs text-[#8C8272]">
                Test EventFlow's predictive AI, automated diversions & resource responses under pressure
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#241E17] hover:bg-[#382F27] text-[#8C8272] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pre-configured Real-World Stress Scenarios */}
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8C8272]">
            Select Live Scenario Injection
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {scenarios.map((sc) => {
              const Icon = sc.icon;
              const isSelected = activeScenario === sc.id;

              return (
                <button
                  key={sc.id}
                  onClick={sc.apply}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "bg-[#0B1120] border-blue-500 shadow-md shadow-blue-500/10"
                      : "bg-[#0B1120]/60 border-[#241E17] hover:border-[#382F27]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl border ${sc.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-white">{sc.title}</h4>
                    </div>

                    {isSelected && (
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-[#8C8272] mt-2 leading-relaxed">{sc.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Manual Parameter Sliders */}
        <div className="p-4 rounded-2xl bg-[#0B1120]/70 border border-[#241E17] space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#C9BBA0]">Live Attendance Surge Meter</span>
            <span className="font-mono text-indigo-400 font-bold">
              {surgeAttendance.toLocaleString()} attendees ({Math.round((surgeAttendance / event.capacity) * 100)}%)
            </span>
          </div>

          <input
            type="range"
            min={event.capacity * 0.3}
            max={event.capacity}
            step={1000}
            value={surgeAttendance}
            onChange={(e) => {
              const val = Number(e.target.value);
              setSurgeAttendance(val);
              onApplyScenario("Custom Attendance Load", { currentAttendance: val });
            }}
            className="w-full accent-indigo-500 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-[#6B6252] font-mono">
            <span>30% Pre-Gate</span>
            <span>70% Standard</span>
            <span>100% Sold-Out Cap</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#241E17]">
          <button
            onClick={() => {
              onResetBaseline();
              setActiveScenario("baseline");
            }}
            className="flex items-center gap-1.5 text-xs text-[#8C8272] hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All to Baseline</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md"
          >
            Apply & Inspect Live Ecosystem
          </button>
        </div>
      </div>
    </div>
  );
};
