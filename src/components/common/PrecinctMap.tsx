import React, { useState } from "react";
import { MegaEvent, GateInfo, ParkingZone, TransitRoute, HospitalityStall, IncidentAlert } from "../../types";
import { AlertTriangle, Bus, Car, Coffee, DoorOpen, Eye, Info, Layers, Train, Users, ShieldAlert, Sparkles } from "lucide-react";

interface PrecinctMapProps {
  event: MegaEvent;
  onSelectGate?: (gate: GateInfo) => void;
  onSelectParking?: (parking: ParkingZone) => void;
  onSelectTransit?: (transit: TransitRoute) => void;
  onSelectIncident?: (incident: IncidentAlert) => void;
  highlightGateId?: string;
  highlightParkingId?: string;
  userRole?: "organizer" | "operator" | "attendee";
}

export const PrecinctMap: React.FC<PrecinctMapProps> = ({
  event,
  onSelectGate,
  onSelectParking,
  onSelectTransit,
  onSelectIncident,
  highlightGateId,
  highlightParkingId,
  userRole = "organizer",
}) => {
  const [activeLayer, setActiveLayer] = useState<"all" | "gates" | "transit" | "parking" | "hospitality" | "density">("all");
  const [selectedEntity, setSelectedEntity] = useState<{
    type: "gate" | "parking" | "transit" | "hospitality" | "incident";
    data: any;
  } | null>(null);

  // Status color helper for gates
  const getGateColor = (status: GateInfo["status"], isHighlight?: boolean) => {
    if (isHighlight) return "#6366F1"; // indigo highlight
    switch (status) {
      case "critical":
        return "#EF4444"; // red
      case "congested":
        return "#F59E0B"; // amber
      case "overflow_open":
        return "#4F7CFF"; // blue
      case "closed":
        return "#64748B"; // slate
      case "optimal":
      default:
        return "#10B981"; // emerald
    }
  };

  const getParkingColor = (status: ParkingZone["status"], isHighlight?: boolean) => {
    if (isHighlight) return "#6366F1";
    switch (status) {
      case "full":
      case "diverting":
        return "#EF4444";
      case "filling_fast":
        return "#F59E0B";
      case "available":
      default:
        return "#10B981";
    }
  };

  return (
    <div id="precinct-map-container" className="relative w-full rounded-2xl bg-[#0B1120]/90 border border-[#241E17] p-4 sm:p-5 overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Map Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 z-10 relative">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-sm font-semibold tracking-wide uppercase text-[#C9BBA0]">
            Spatial Command Map — {event.venue}
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono">
            LIVE TELEMETRY
          </span>
        </div>

        {/* Layer Filters */}
        <div className="flex items-center gap-1.5 bg-[#0B1120]/80 p-1 rounded-xl border border-[#241E17]/80 text-xs">
          <span className="text-[#6B6252] px-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Layers:
          </span>
          <button
            onClick={() => setActiveLayer("all")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeLayer === "all" ? "bg-indigo-600 text-white font-medium shadow-sm" : "text-[#8C8272] hover:text-[#C9D9F7]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveLayer("density")}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              activeLayer === "density" ? "bg-indigo-600 text-white font-medium shadow-sm" : "text-[#8C8272] hover:text-[#C9D9F7]"
            }`}
          >
            <Users className="w-3 h-3" /> Crowd Density
          </button>
          <button
            onClick={() => setActiveLayer("gates")}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              activeLayer === "gates" ? "bg-indigo-600 text-white font-medium shadow-sm" : "text-[#8C8272] hover:text-[#C9D9F7]"
            }`}
          >
            <DoorOpen className="w-3 h-3" /> Gates
          </button>
          <button
            onClick={() => setActiveLayer("transit")}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              activeLayer === "transit" ? "bg-indigo-600 text-white font-medium shadow-sm" : "text-[#8C8272] hover:text-[#C9D9F7]"
            }`}
          >
            <Train className="w-3 h-3" /> Transit
          </button>
          <button
            onClick={() => setActiveLayer("parking")}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              activeLayer === "parking" ? "bg-indigo-600 text-white font-medium shadow-sm" : "text-[#8C8272] hover:text-[#C9D9F7]"
            }`}
          >
            <Car className="w-3 h-3" /> Parking
          </button>
          <button
            onClick={() => setActiveLayer("hospitality")}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              activeLayer === "hospitality" ? "bg-indigo-600 text-white font-medium shadow-sm" : "text-[#8C8272] hover:text-[#C9D9F7]"
            }`}
          >
            <Coffee className="w-3 h-3" /> Stalls
          </button>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative w-full aspect-[16/9] min-h-[380px] sm:min-h-[460px] bg-[#0B1120] rounded-xl border border-[#241E17]/80 overflow-hidden flex items-center justify-center">
        {/* Subtle coordinate grid lines */}
        <div 
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#818cf8 1px, transparent 1px), linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)",
            backgroundSize: "40px 40px, 40px 40px, 40px 40px",
          }}
        />

        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full select-none"
          style={{ transform: "translateZ(0)" }}
        >
          <defs>
            {/* Gradients */}
            <radialGradient id="arenaGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1E293B" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#0F172A" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#020617" stopOpacity="1" />
            </radialGradient>

            <radialGradient id="crowdDensityHigh" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#F97316" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="crowdDensityMedium" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#EAB308" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="crowdDensitySmooth" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#065F46" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </radialGradient>

            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Precinct Roads / Perimeter Tracks */}
          <path
            d="M 120 180 Q 250 80 500 80 T 880 180 Q 940 320 850 480 Q 500 580 150 480 Q 70 320 120 180 Z"
            fill="none"
            stroke="#1E293B"
            strokeWidth="32"
            strokeLinejoin="round"
          />
          <path
            d="M 120 180 Q 250 80 500 80 T 880 180 Q 940 320 850 480 Q 500 580 150 480 Q 70 320 120 180 Z"
            fill="none"
            stroke="#334155"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />

          {/* Transit Connector Lines */}
          {(activeLayer === "all" || activeLayer === "transit") && (
            <g className="transit-flow-lines">
              {/* Metro Rail Track Top */}
              <path
                d="M 200 40 L 420 120 L 500 160"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="4"
                strokeDasharray="8 6"
                className="animate-pulse"
                opacity="0.8"
              />
              {/* Shuttle Bus Loop */}
              <path
                d="M 500 80 Q 640 180 620 480 T 800 520"
                fill="none"
                stroke="#A855F7"
                strokeWidth="3"
                strokeDasharray="6 4"
                opacity="0.75"
              />
              {/* Suburban Rail Track Left */}
              <path
                d="M 50 120 L 220 280 L 300 350"
                fill="none"
                stroke="#06B6D4"
                strokeWidth="4"
                strokeDasharray="8 6"
                opacity="0.8"
              />
            </g>
          )}

          {/* Main Stadium / Arena Outer Bowl */}
          <ellipse
            cx="500"
            cy="310"
            rx="270"
            ry="180"
            fill="url(#arenaGlow)"
            stroke="#334155"
            strokeWidth="3"
          />

          {/* Concourse Walkway Rings */}
          <ellipse
            cx="500"
            cy="310"
            rx="225"
            ry="145"
            fill="none"
            stroke="#1E293B"
            strokeWidth="20"
            strokeOpacity="0.7"
          />
          <ellipse
            cx="500"
            cy="310"
            rx="180"
            ry="115"
            fill="#0F172A"
            stroke="#475569"
            strokeWidth="1.5"
          />

          {/* Central Playing Field / Concert Stage / Event Pitch */}
          {event.type === "sports" ? (
            // Oval cricket or soccer grass pitch
            <g>
              <ellipse
                cx="500"
                cy="310"
                rx="120"
                ry="75"
                fill="#064E3B"
                stroke="#10B981"
                strokeWidth="2"
              />
              <ellipse
                cx="500"
                cy="310"
                rx="85"
                ry="50"
                fill="#047857"
                stroke="#34D399"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Cricket pitch strip */}
              <rect x="488" y="290" width="24" height="40" rx="3" fill="#D97706" opacity="0.8" />
              <text x="500" y="315" textAnchor="middle" fill="#A7F3D0" fontSize="11" fontWeight="600" letterSpacing="1">
                CENTRAL PITCH
              </text>
            </g>
          ) : event.type === "festival" ? (
            // Festival stages
            <g>
              <rect x="420" y="270" width="160" height="80" rx="10" fill="#312E81" stroke="#818CF8" strokeWidth="2" />
              <text x="500" y="315" textAnchor="middle" fill="#C7D2FE" fontSize="12" fontWeight="700" letterSpacing="1">
                KINETIC MAINSTAGE
              </text>
              <circle cx="500" cy="270" r="14" fill="#6366F1" opacity="0.6" className="animate-ping" />
            </g>
          ) : event.type === "motorsport" ? (
            // Circuit straight & paddock
            <g>
              <path
                d="M 380 280 L 620 280 L 620 340 L 380 340 Z"
                fill="#1E293B"
                stroke="#E2E8F0"
                strokeWidth="3"
              />
              <text x="500" y="315" textAnchor="middle" fill="#F8FAFC" fontSize="12" fontWeight="700">
                START / FINISH STRAIGHT
              </text>
            </g>
          ) : (
            // Conference auditorium
            <g>
              <rect x="410" y="260" width="180" height="100" rx="8" fill="#1E293B" stroke="#6366F1" strokeWidth="2" />
              <text x="500" y="315" textAnchor="middle" fill="#E0E7FF" fontSize="12" fontWeight="600">
                EXECUTIVE PLENARY
              </text>
            </g>
          )}

          {/* Crowd Density Heatmap Blobs (Conditional Layer) */}
          {(activeLayer === "all" || activeLayer === "density") && (
            <g className="crowd-density-layer pointer-events-none">
              {/* Gate 3 / East Concourse Pressure Hotspot */}
              <circle cx="730" cy="230" r="85" fill="url(#crowdDensityHigh)" />
              <circle cx="730" cy="230" r="45" fill="url(#crowdDensityHigh)" />

              {/* Gate 2 / North Concourse Moderate Pressure */}
              <circle cx="430" cy="180" r="70" fill="url(#crowdDensityMedium)" />

              {/* Promenade Smooth Flow */}
              <circle cx="780" cy="410" r="60" fill="url(#crowdDensitySmooth)" />
              <circle cx="260" cy="310" r="60" fill="url(#crowdDensitySmooth)" />

              {/* Central Pitch / Concourse boundary labels */}
              <text x="730" y="235" textAnchor="middle" fill="#FECACA" fontSize="10" fontWeight="600" className="opacity-90">
                CHOKE POINT (3.8/m²)
              </text>
            </g>
          )}

          {/* Sector / Stand Markers inside Bowl */}
          <g className="text-[#8C8272] text-[10px] font-semibold select-none pointer-events-none">
            <text x="500" y="195" textAnchor="middle" fill="#94A3B8">NORTH STAND (PAVILION)</text>
            <text x="700" y="315" textAnchor="middle" fill="#94A3B8">EAST STAND</text>
            <text x="500" y="440" textAnchor="middle" fill="#94A3B8">SOUTH STAND (PRESIDENT'S BOX)</text>
            <text x="300" y="315" textAnchor="middle" fill="#94A3B8">WEST STAND</text>
          </g>

          {/* Gates Layer */}
          {(activeLayer === "all" || activeLayer === "gates") && (
            <g className="gates-layer">
              {event.gates.map((gate) => {
                const isHighlight = highlightGateId === gate.id;
                const gateX = gate.locationCoord.x * 10;
                const gateY = gate.locationCoord.y * 6;
                const color = getGateColor(gate.status, isHighlight);

                return (
                  <g
                    key={gate.id}
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={() => {
                      setSelectedEntity({ type: "gate", data: gate });
                      onSelectGate?.(gate);
                    }}
                  >
                    {/* Pulsing ring if congested/critical or highlighted */}
                    {(gate.status === "critical" || isHighlight) && (
                      <circle
                        cx={gateX}
                        cy={gateY}
                        r="20"
                        fill={color}
                        opacity="0.3"
                        className="animate-ping"
                      />
                    )}

                    <circle
                      cx={gateX}
                      cy={gateY}
                      r="14"
                      fill="#0B0F17"
                      stroke={color}
                      strokeWidth={isHighlight ? "3.5" : "2.5"}
                      filter="url(#neonGlow)"
                    />
                    <text
                      x={gateX}
                      y={gateY + 4}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {gate.name.replace(/Gate\s*/i, "").charAt(0)}
                    </text>

                    {/* Compact Label */}
                    <rect
                      x={gateX - 35}
                      y={gateY + 16}
                      width="70"
                      height="18"
                      rx="4"
                      fill="#0F172A"
                      stroke={color}
                      strokeWidth="1"
                      opacity="0.92"
                    />
                    <text
                      x={gateX}
                      y={gateY + 28}
                      textAnchor="middle"
                      fill="#F8FAFC"
                      fontSize="8"
                      fontWeight="600"
                    >
                      {gate.avgWaitMins > 0 ? `${gate.avgWaitMins}m wait` : "Closed"}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Parking Zones Layer */}
          {(activeLayer === "all" || activeLayer === "parking") && (
            <g className="parking-layer">
              {event.parkingLots.map((park) => {
                const isHighlight = highlightParkingId === park.id;
                const parkX = park.locationCoord.x * 10;
                const parkY = park.locationCoord.y * 6;
                const color = getParkingColor(park.status, isHighlight);
                const pctOccupied = Math.round((park.occupiedBays / park.totalBays) * 100);

                return (
                  <g
                    key={park.id}
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={() => {
                      setSelectedEntity({ type: "parking", data: park });
                      onSelectParking?.(park);
                    }}
                  >
                    <rect
                      x={parkX - 28}
                      y={parkY - 20}
                      width="56"
                      height="40"
                      rx="6"
                      fill="#0B132B"
                      stroke={color}
                      strokeWidth={isHighlight ? "3" : "2"}
                    />
                    <text
                      x={parkX}
                      y={parkY - 4}
                      textAnchor="middle"
                      fill="#C9D9F7"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      P-{park.name.split(" ")[1] || "LOT"}
                    </text>
                    <text
                      x={parkX}
                      y={parkY + 11}
                      textAnchor="middle"
                      fill={color}
                      fontSize="9"
                      fontWeight="700"
                    >
                      {pctOccupied}% full
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Transit Hubs Layer */}
          {(activeLayer === "all" || activeLayer === "transit") && (
            <g className="transit-layer">
              {event.transitLines.map((transit) => {
                const trX = transit.locationCoord.x * 10;
                const trY = transit.locationCoord.y * 6;

                return (
                  <g
                    key={transit.id}
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={() => {
                      setSelectedEntity({ type: "transit", data: transit });
                      onSelectTransit?.(transit);
                    }}
                  >
                    <circle
                      cx={trX}
                      cy={trY}
                      r="16"
                      fill="#0369A1"
                      stroke="#38BDF8"
                      strokeWidth="2.5"
                    />
                    <text
                      x={trX}
                      y={trY + 4}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {transit.type === "metro" ? "METRO" : "BUS"}
                    </text>
                    <rect
                      x={trX - 45}
                      y={trY + 18}
                      width="90"
                      height="16"
                      rx="4"
                      fill="#0C4A6E"
                      opacity="0.9"
                    />
                    <text
                      x={trX}
                      y={trY + 29}
                      textAnchor="middle"
                      fill="#E0F2FE"
                      fontSize="8"
                      fontWeight="600"
                    >
                      {transit.headwayMinutes}m headway
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Hospitality / Concessions Layer */}
          {(activeLayer === "all" || activeLayer === "hospitality") && (
            <g className="hospitality-layer">
              {event.hospitalityStalls.map((stall) => {
                const stX = stall.locationCoord.x * 10;
                const stY = stall.locationCoord.y * 6;
                const isBusy = stall.queueTimeMins > 10;

                return (
                  <g
                    key={stall.id}
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={() => setSelectedEntity({ type: "hospitality", data: stall })}
                  >
                    <circle
                      cx={stX}
                      cy={stY}
                      r="10"
                      fill={isBusy ? "#D97706" : "#059669"}
                      stroke="#FEF3C7"
                      strokeWidth="1.5"
                    />
                    <text
                      x={stX}
                      y={stY + 3.5}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="8"
                      fontWeight="bold"
                    >
                      {stall.type === "water_station" ? "💧" : "🍴"}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Active Incidents Pins */}
          {event.incidents
            .filter((i) => i.status === "active")
            .map((incident, idx) => {
              // Position near related coordinate
              const incX = 720;
              const incY = 160 + idx * 45;

              return (
                <g
                  key={incident.id}
                  className="cursor-pointer animate-bounce"
                  onClick={() => {
                    setSelectedEntity({ type: "incident", data: incident });
                    onSelectIncident?.(incident);
                  }}
                >
                  <circle cx={incX} cy={incY} r="14" fill="#DC2626" stroke="#FEF2F2" strokeWidth="2" />
                  <text x={incX} y={incY + 4} textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
                    !
                  </text>
                  <rect
                    x={incX + 16}
                    y={incY - 10}
                    width="115"
                    height="20"
                    rx="4"
                    fill="#7F1D1D"
                    stroke="#EF4444"
                    strokeWidth="1"
                  />
                  <text x={incX + 22} y={incY + 4} fill="#FEE2E2" fontSize="8.5" fontWeight="bold">
                    INCIDENT ACTIVE
                  </text>
                </g>
              );
            })}
        </svg>

        {/* Legend Overlay in Bottom Left */}
        <div className="absolute bottom-3 left-3 bg-[#0B1120]/85 backdrop-blur-md px-3 py-2 rounded-xl border border-[#241E17] text-[11px] text-[#C9BBA0] flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Optimal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            <span>Congested</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Critical Choke</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
            <span>Transit Node</span>
          </div>
        </div>
      </div>

      {/* Selected Entity Tactical Drawer / Modal */}
      {selectedEntity && (
        <div className="mt-4 p-4 rounded-xl bg-[#0B1120] border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {selectedEntity.type === "gate" && <DoorOpen className="w-5 h-5" />}
              {selectedEntity.type === "parking" && <Car className="w-5 h-5" />}
              {selectedEntity.type === "transit" && <Train className="w-5 h-5" />}
              {selectedEntity.type === "hospitality" && <Coffee className="w-5 h-5" />}
              {selectedEntity.type === "incident" && <AlertTriangle className="w-5 h-5 text-rose-400" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-semibold text-[#8C8272]">
                  {selectedEntity.type} telemetry
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#241E17] text-[#C9BBA0] font-mono">
                  {selectedEntity.data.name || selectedEntity.data.title}
                </span>
              </div>

              {selectedEntity.type === "gate" && (
                <p className="text-xs text-[#C9BBA0] mt-1">
                  Queue: <strong className="text-white">{selectedEntity.data.queueLength} attendees</strong> | Avg Wait:{" "}
                  <strong className={selectedEntity.data.avgWaitMins > 10 ? "text-blue-400" : "text-emerald-400"}>
                    {selectedEntity.data.avgWaitMins} mins
                  </strong>{" "}
                  | Throughput: {selectedEntity.data.currentThroughput} pax/min | Turnstiles: {selectedEntity.data.turnstilesActive}/
                  {selectedEntity.data.turnstilesTotal} Active
                </p>
              )}

              {selectedEntity.type === "parking" && (
                <p className="text-xs text-[#C9BBA0] mt-1">
                  Occupancy: <strong className="text-white">{selectedEntity.data.occupiedBays} / {selectedEntity.data.totalBays}</strong> bays (
                  {Math.round((selectedEntity.data.occupiedBays / selectedEntity.data.totalBays) * 100)}%) | EV Bays:{" "}
                  {selectedEntity.data.evChargingBays} | Connected via Shuttle: {selectedEntity.data.shuttleRouteId}
                </p>
              )}

              {selectedEntity.type === "transit" && (
                <p className="text-xs text-[#C9BBA0] mt-1">
                  Headway: <strong className="text-white">{selectedEntity.data.headwayMinutes} mins</strong> | Capacity per car:{" "}
                  {selectedEntity.data.capacityPerVehicle} | Fleet in circuit: {selectedEntity.data.vehiclesActive} vehicles | Current Load:{" "}
                  <strong className="text-blue-400">{selectedEntity.data.crowdLoadPercent}%</strong>
                </p>
              )}

              {selectedEntity.type === "incident" && (
                <p className="text-xs text-rose-300 mt-1">
                  {selectedEntity.data.description} — <em>Suggested: {selectedEntity.data.suggestedAction}</em>
                </p>
              )}

              {selectedEntity.type === "hospitality" && (
                <p className="text-xs text-[#C9BBA0] mt-1">
                  Queue: <strong className="text-white">{selectedEntity.data.queueTimeMins} mins</strong> | Stock:{" "}
                  <strong className="text-emerald-400">{selectedEntity.data.stockLevelPercent}%</strong> | Specialty:{" "}
                  {selectedEntity.data.specialty}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => setSelectedEntity(null)}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#241E17] text-[#8C8272] hover:text-white hover:bg-[#382F27] transition-colors self-end md:self-auto"
          >
            Close Inspector
          </button>
        </div>
      )}
    </div>
  );
};
