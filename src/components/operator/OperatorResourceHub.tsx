import React, { useState } from "react";
import { MegaEvent, TransitRoute, ParkingZone, HospitalityStall, GateInfo } from "../../types";
import { 
  Bus, 
  Car, 
  Coffee, 
  DoorOpen, 
  Plus, 
  Radio, 
  RefreshCw, 
  Route, 
  ShieldCheck, 
  SlidersHorizontal, 
  Train, 
  Truck, 
  Zap,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

interface OperatorResourceHubProps {
  event: MegaEvent;
  onDispatchShuttle: (routeId: string) => void;
  onToggleParkingDivert: (parkingId: string) => void;
  onRestockConcession: (stallId: string) => void;
  onAdjustGateTurnstiles: (gateId: string, delta: number) => void;
}

export const OperatorResourceHub: React.FC<OperatorResourceHubProps> = ({
  event,
  onDispatchShuttle,
  onToggleParkingDivert,
  onRestockConcession,
  onAdjustGateTurnstiles,
}) => {
  const [activeTab, setActiveTab] = useState<"transport" | "parking" | "hospitality" | "turnstiles">("transport");
  const [operatorNotification, setOperatorNotification] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setOperatorNotification(msg);
    setTimeout(() => setOperatorNotification(null), 3500);
  };

  return (
    <div id="operator-resource-hub" className="space-y-6">
      {/* Operator Header & Domain Tabs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0B1120] border border-[#241E17]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <SlidersHorizontal className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Operator Resource Management</h2>
            <p className="text-xs text-[#8C8272]">
              Tactical controls for fleet dispatch, traffic diversion, concessions & gate infrastructure
            </p>
          </div>
        </div>

        {/* Tactical Sub-Domain Tabs */}
        <div className="flex items-center gap-1.5 bg-[#0B1120] p-1.5 rounded-xl border border-[#241E17] w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab("transport")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "transport"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-[#8C8272] hover:text-[#C9D9F7]"
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            <span>Transport & Shuttles</span>
          </button>

          <button
            onClick={() => setActiveTab("parking")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "parking"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-[#8C8272] hover:text-[#C9D9F7]"
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Parking & Roadways</span>
          </button>

          <button
            onClick={() => setActiveTab("hospitality")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "hospitality"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-[#8C8272] hover:text-[#C9D9F7]"
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Hospitality & Concessions</span>
          </button>

          <button
            onClick={() => setActiveTab("turnstiles")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "turnstiles"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-[#8C8272] hover:text-[#C9D9F7]"
            }`}
          >
            <DoorOpen className="w-3.5 h-3.5" />
            <span>Turnstiles & Bag Lanes</span>
          </button>
        </div>
      </div>

      {/* Operator Notification Banner */}
      {operatorNotification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{operatorNotification}</span>
          </div>
          <button onClick={() => setOperatorNotification(null)} className="text-[#8C8272] hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: TRANSPORT & SHUTTLES */}
      {activeTab === "transport" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#C9BBA0]">
              Active Transit Lines & Fleet Deployment ({event.transitLines.length})
            </h3>
            <span className="text-xs text-[#6B6252] font-mono">Synchronized with Municipal Transit Feed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.transitLines.map((transit) => {
              const isHeavy = transit.crowdLoadPercent > 80;

              return (
                <div
                  key={transit.id}
                  className="p-5 rounded-2xl bg-[#0B1120] border border-[#241E17] space-y-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {transit.type === "metro" ? <Train className="w-5 h-5" /> : <Bus className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{transit.name}</h4>
                        <p className="text-xs text-[#8C8272] mt-0.5">{transit.terminalStation}</p>
                      </div>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold uppercase ${
                        transit.status === "surging"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          : transit.status === "congested"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {transit.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Metrics bar */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#0B1120]/80 border border-[#241E17]/80 text-xs">
                    <div>
                      <span className="text-[10px] text-[#6B6252] uppercase block font-mono">Headway</span>
                      <strong className="text-[#C9D9F7]">{transit.headwayMinutes} mins</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6B6252] uppercase block font-mono">Vehicles Active</span>
                      <strong className="text-[#C9D9F7]">{transit.vehiclesActive} units</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6B6252] uppercase block font-mono">Rider Load</span>
                      <strong className={isHeavy ? "text-blue-400" : "text-emerald-400"}>
                        {transit.crowdLoadPercent}%
                      </strong>
                    </div>
                  </div>

                  {/* Progress load */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-[#8C8272]">
                      <span>Ridership Capacity</span>
                      <span>{transit.crowdLoadPercent}% saturated</span>
                    </div>
                    <div className="w-full bg-[#241E17] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          transit.crowdLoadPercent > 85
                            ? "bg-rose-500"
                            : transit.crowdLoadPercent > 70
                            ? "bg-blue-500"
                            : "bg-sky-500"
                        }`}
                        style={{ width: `${transit.crowdLoadPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Operator Dispatch Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#241E17]">
                    <button
                      onClick={() => {
                        onDispatchShuttle(transit.id);
                        showFeedback(`Dispatched +2 standby vehicles to ${transit.name}. Estimated headway reduced by 1 minute.`);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Inject +2 Vehicles</span>
                    </button>

                    <button
                      onClick={() => showFeedback(`Transit priority green-wave granted for ${transit.name} at Municipal Traffic Center.`)}
                      className="py-2 px-3 rounded-xl text-xs font-semibold bg-[#241E17] hover:bg-[#382F27] text-[#C9BBA0] transition-colors"
                    >
                      Traffic Green-Wave
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PARKING & ROADWAYS */}
      {activeTab === "parking" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#C9BBA0]">
              Perimeter Parking Lots & Dynamic Diversion ({event.parkingLots.length})
            </h3>
            <span className="text-xs text-[#6B6252] font-mono">Automated Roadway VMS Signs Connected</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.parkingLots.map((park) => {
              const pct = Math.round((park.occupiedBays / park.totalBays) * 100);
              const isFullOrDiverting = park.status === "full" || park.status === "diverting";

              return (
                <div
                  key={park.id}
                  className="p-5 rounded-2xl bg-[#0B1120] border border-[#241E17] space-y-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Car className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{park.name}</h4>
                        <p className="text-xs text-[#8C8272] mt-0.5">
                          Rate: {park.price} • Target: {park.targetZones.join(", ")}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold uppercase ${
                        park.status === "full" || park.status === "diverting"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          : park.status === "filling_fast"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {park.status === "diverting" ? "DIVERTING TRAFFIC" : park.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Occupancy stats */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#0B1120]/80 border border-[#241E17]/80 text-xs">
                    <div>
                      <span className="text-[10px] text-[#6B6252] uppercase block font-mono">Bays Taken</span>
                      <strong className="text-[#C9D9F7]">{park.occupiedBays.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6B6252] uppercase block font-mono">Total Capacity</span>
                      <strong className="text-[#C9D9F7]">{park.totalBays.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6B6252] uppercase block font-mono">EV Chargers</span>
                      <strong className="text-emerald-400">{park.evChargingBays} bays</strong>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-[#8C8272]">
                      <span>Available: {park.totalBays - park.occupiedBays} spots remaining</span>
                      <span className="font-mono">{pct}% full</span>
                    </div>
                    <div className="w-full bg-[#241E17] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          pct > 95 ? "bg-rose-500" : pct > 80 ? "bg-blue-500" : "bg-indigo-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Dynamic Diversion Toggle */}
                  <div className="pt-2 border-t border-[#241E17] flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#C9BBA0] font-medium">Variable Message Signs (VMS)</span>
                      <p className="text-[11px] text-[#6B6252]">
                        {isFullOrDiverting
                          ? "Road signs displaying: 'LOT FULL — DIVERT TO ZONE C'"
                          : "Road signs displaying: 'OPEN — FOLLOW GREEN LANES'"}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onToggleParkingDivert(park.id);
                        showFeedback(`Roadside electronic signs updated for ${park.name}. Dynamic routing active.`);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        park.status === "diverting"
                          ? "bg-blue-600 hover:bg-blue-500 text-white"
                          : "bg-[#241E17] hover:bg-[#382F27] text-[#C9D9F7]"
                      }`}
                    >
                      {park.status === "diverting" ? "Cancel Divert" : "Divert Vehicles"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: HOSPITALITY & CONCESSIONS */}
      {activeTab === "hospitality" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#C9BBA0]">
              Concourse Stalls, Hydration Stations & Hospitality Lounges ({event.hospitalityStalls.length})
            </h3>
            <span className="text-xs text-[#6B6252] font-mono">Mobile App Ordering Synchronized</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.hospitalityStalls.map((stall) => {
              const isLongLine = stall.queueTimeMins > 10;
              const isLowStock = stall.stockLevelPercent < 50;

              return (
                <div
                  key={stall.id}
                  className="p-5 rounded-2xl bg-[#0B1120] border border-[#241E17] space-y-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Coffee className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{stall.name}</h4>
                        <p className="text-xs text-[#8C8272] mt-0.5">
                          {stall.concourseLevel} • {stall.zone}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold uppercase ${
                        isLowStock
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          : isLongLine
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {isLowStock ? "RESTOCK NEEDED" : isLongLine ? "HIGH QUEUE" : "OPTIMAL"}
                    </span>
                  </div>

                  <p className="text-xs text-[#C9BBA0] italic bg-[#0B1120]/60 p-2.5 rounded-lg border border-[#241E17]/80">
                    Menu highlights: {stall.specialty}
                  </p>

                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#0B1120]/80 border border-[#241E17]/80 text-xs">
                    <div>
                      <span className="text-[10px] text-[#6B6252] uppercase block font-mono">Current Line Wait</span>
                      <strong className={isLongLine ? "text-blue-400" : "text-[#C9D9F7]"}>
                        {stall.queueTimeMins} minutes
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6B6252] uppercase block font-mono">Inventory Remaining</span>
                      <strong className={isLowStock ? "text-rose-400" : "text-emerald-400"}>
                        {stall.stockLevelPercent}% stock
                      </strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#241E17] flex items-center justify-between">
                    <span className="text-xs text-[#8C8272]">
                      Mobile Pick-Up: {stall.mobileOrderingEnabled ? "Active" : "In-Person Only"}
                    </span>

                    <button
                      onClick={() => {
                        onRestockConcession(stall.id);
                        showFeedback(`Restock dispatch truck dispatched to ${stall.name} with express delivery.`);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Dispatch Restock</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: TURNSTILES & BAG LANES */}
      {activeTab === "turnstiles" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#C9BBA0]">
              Perimeter Turnstiles & Security Bag Inspection Staffing
            </h3>
            <span className="text-xs text-[#6B6252] font-mono">Dynamic Flow Allocation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.gates.map((gate) => (
              <div
                key={gate.id}
                className="p-5 rounded-2xl bg-[#0B1120] border border-[#241E17] space-y-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <DoorOpen className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{gate.name}</h4>
                      <p className="text-xs text-[#8C8272] mt-0.5">
                        Capacity: {gate.capacityPerMin} pax/min • Queue: {gate.queueLength} pax
                      </p>
                    </div>
                  </div>

                  <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-[#241E17] text-[#C9BBA0]">
                    {gate.currentThroughput} pax/min
                  </span>
                </div>

                {/* Turnstiles slider / adjustment */}
                <div className="p-3.5 rounded-xl bg-[#0B1120]/80 border border-[#241E17]/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#C9BBA0] font-medium">Turnstiles Ingress Allocation</span>
                    <strong className="text-indigo-400 font-mono">
                      {gate.turnstilesActive} / {gate.turnstilesTotal} active
                    </strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onAdjustGateTurnstiles(gate.id, -1);
                        showFeedback(`Decreased active turnstiles for ${gate.name}`);
                      }}
                      disabled={gate.turnstilesActive <= 0}
                      className="px-2.5 py-1 rounded bg-[#241E17] hover:bg-[#382F27] disabled:opacity-30 text-white text-xs font-bold"
                    >
                      -
                    </button>

                    <div className="flex-1 bg-[#241E17] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full transition-all"
                        style={{
                          width: `${gate.turnstilesTotal > 0 ? (gate.turnstilesActive / gate.turnstilesTotal) * 100 : 0}%`,
                        }}
                      />
                    </div>

                    <button
                      onClick={() => {
                        onAdjustGateTurnstiles(gate.id, 1);
                        showFeedback(`Activated additional turnstile lane for ${gate.name}`);
                      }}
                      disabled={gate.turnstilesActive >= gate.turnstilesTotal}
                      className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#8C8272] pt-1">
                  <span>Bag Inspection Lanes: {gate.bagCheckLanes}</span>
                  <button
                    onClick={() => showFeedback(`Shifted 2 roaming security personnel to ${gate.name} bag inspection.`)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    + Shift 2 Officers Here
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
