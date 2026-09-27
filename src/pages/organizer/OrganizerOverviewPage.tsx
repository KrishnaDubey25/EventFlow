import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Activity,
  Users,
  ArrowRight,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sliders,
  Sparkles,
  Layers,
  ShieldCheck,
  ChevronRight,
  Ticket,
  Coffee,
  CloudRain,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { OrganizerLayout } from "../../components/organizer/OrganizerLayout";
import { getOrganizerEvents } from "../../services/eventStorageService";
import {
  getEventLiveState,
  computeEventReadiness,
} from "../../services/operationalStateService";
import { getAllBookings } from "../../services/bookingService";
import { AppEvent } from "../../types/event";
import { getEventImage } from "../../utils/eventImageResolver";
import { getEventEcosystem } from "../../services/eventEcosystemService";

export const OrganizerOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState<AppEvent[]>([]);
  const [eventStates, setEventStates] = useState<Record<string, any>>({});
  const [readinessMap, setReadinessMap] = useState<Record<string, any>>({});

  useEffect(() => {
    if (user?.id) {
      const orgEvents = getOrganizerEvents(user.id);
      setEvents(orgEvents);

      const states: Record<string, any> = {};
      const ready: Record<string, any> = {};

      orgEvents.forEach((evt) => {
        const state = getEventLiveState(evt.id, evt);
        states[evt.id] = state;
        ready[evt.id] = computeEventReadiness(evt, state);
      });

      setEventStates(states);
      setReadinessMap(ready);
    }
  }, [user?.id]);

  // Aggregate stats across organizer's events
  const activeEventsCount = events.filter((e) => {
    const st = eventStates[e.id]?.eventStatus;
    return st === "LIVE" || st === "PREPARING";
  }).length;

  const upcomingEventsCount = events.filter((e) => {
    const st = eventStates[e.id]?.eventStatus;
    return st === "UPCOMING" || !st;
  }).length;

  const allBookings = getAllBookings();
  const totalExpectedAttendees = events.reduce((sum, e) => {
    const st = eventStates[e.id];
    const exp =
      st?.crowdState?.totalExpected ||
      parseInt(String(e.expectedAttendance).replace(/,/g, "") || "0", 10);
    return sum + (isNaN(exp) ? 0 : exp);
  }, 0);

  const networkSummary = events.reduce((acc, evt) => {
    try {
      const eco = getEventEcosystem(evt.id);
      acc.nodes += eco.resources.length;
      acc.capacity += eco.resources.reduce((s, r) => s + (r.totalCapacity || 0), 0);
    } catch {}
    return acc;
  }, { nodes: 0, capacity: 0 });

  return (
    <OrganizerLayout
      pageTitle="Operations Overview"
      pageSubtitle="Central command overview of active events, attendee turnout and operational readiness."
      pageBadge="Command Dashboard"
      actions={
        <Link
          to="/operations/events"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white shadow-2xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </Link>
      }
    >
      <div className="space-y-8 font-sans">
        {/* Welcome Banner Card */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0B1120] font-heading">
              Operations Headquarters
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6252] mt-1">
              Real-time telemetry, synchronized event states, crowd dynamics, and transit logistics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/operations/events"
              className="px-4 py-2 rounded-xl bg-[#F0E9D6] border border-[#C9D9F7]/90 text-[#382F27] hover:text-[#4F7CFF] hover:border-[#6EA8FF] font-bold text-xs transition-colors shadow-2xs"
            >
              All Events ({events.length})
            </Link>
            <Link
              to="/operations/weather-twin"
              className="px-4 py-2 rounded-xl bg-[#0B1120] hover:bg-[#173B69] text-white font-bold text-xs transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span>Weather Digital Twin</span>
            </Link>
            <Link
              to="/operations/live"
              className="px-4 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white font-bold text-xs transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live Command Center</span>
            </Link>
          </div>
        </div>

        {/* Macro KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Events */}
          <div className="p-5 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs font-medium text-[#6B6252]">
              <span className="uppercase tracking-wider font-mono text-[10px] font-bold text-[#8C8272]">
                ACTIVE / PREPARING
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#0B1120] font-heading">
              {activeEventsCount}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium">
              Live operational monitoring
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="p-5 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs font-medium text-[#6B6252]">
              <span className="uppercase tracking-wider font-mono text-[10px] font-bold text-[#8C8272]">
                SCHEDULED EVENTS
              </span>
              <div className="p-2 rounded-xl bg-[#F7FAFF] text-[#4F7CFF]">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#0B1120] font-heading">
              {upcomingEventsCount}
            </div>
            <div className="text-[11px] text-[#2D5FD2] font-medium">
              On upcoming operations schedule
            </div>
          </div>

          {/* Total Expected Attendees */}
          <div className="p-5 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs font-medium text-[#6B6252]">
              <span className="uppercase tracking-wider font-mono text-[10px] font-bold text-[#8C8272]">
                EXPECTED ATTENDANCE
              </span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#0B1120] font-heading">
              {totalExpectedAttendees.toLocaleString()}
            </div>
            <div className="text-[11px] text-indigo-700 font-medium">
              Across all managed venues
            </div>
          </div>

          {/* Connected Nodes */}
          <div className="p-5 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs font-medium text-[#6B6252]">
              <span className="uppercase tracking-wider font-mono text-[10px] font-bold text-[#8C8272]">CONNECTED NODES</span>
              <div className="p-2 rounded-xl bg-[#F7FAFF] text-[#4F7CFF]"><Layers className="w-4 h-4" /></div>
            </div>
            <div className="text-3xl font-black text-[#0B1120] font-heading">{networkSummary.nodes}</div>
            <div className="text-[11px] text-[#2D5FD2] font-medium">Capacity {networkSummary.capacity.toLocaleString()}</div>
          </div>
        </div>

        {/* Quick Access Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/operations/live"
            className="p-5 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs hover:border-[#6EA8FF] hover:shadow-xs transition-all space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F7FAFF] text-[#4F7CFF] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0B1120] group-hover:text-[#4F7CFF]">
              Live Command Center
            </h3>
            <p className="text-xs text-[#6B6252] leading-relaxed">
              Real-time operational switches, status overrides, and AI-suggested interventions.
            </p>
          </Link>

          <Link
            to="/operations/crowd"
            className="p-5 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs hover:border-[#6EA8FF] hover:shadow-xs transition-all space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0B1120] group-hover:text-emerald-600">
              Crowd & Gates
            </h3>
            <p className="text-xs text-[#6B6252] leading-relaxed">
              Turnstile flow velocity, ingress gate load balancing, and zone density limits.
            </p>
          </Link>

          <Link
            to="/operations/hospitality"
            className="p-5 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs hover:border-[#6EA8FF] hover:shadow-xs transition-all space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Coffee className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0B1120] group-hover:text-purple-600">
              Hospitality & Resources
            </h3>
            <p className="text-xs text-[#6B6252] leading-relaxed">
              Transit routes, parking bays, partner lodging, dining courts, and medical hubs.
            </p>
          </Link>

        </div>

        {/* Managed Events Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-heading text-[#0B1120]">
                Managed Event Operations
              </h2>
              <p className="text-xs text-[#6B6252]">
                Live readiness index, venue capacity metrics, and one-click command access.
              </p>
            </div>
            <Link
              to="/operations/events"
              className="text-xs font-bold text-[#4F7CFF] hover:text-[#2D5FD2] flex items-center gap-1"
            >
              <span>Manage all ({events.length})</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F7FAFF] text-[#4F7CFF] flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-[#0B1120] font-heading">No Events Created Yet</h3>
                <p className="text-xs text-[#6B6252] mt-1">
                  Create your first event to configure ingress gates, enable live operational telemetry, and monitor attendees.
                </p>
              </div>
              <Link
                to="/operations/events"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#4F7CFF] text-white hover:bg-[#2D5FD2] shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create Event</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map((evt) => {
                const liveState = eventStates[evt.id];
                const readiness = readinessMap[evt.id];
                const status = liveState?.eventStatus || "UPCOMING";
                const eventBookings = allBookings.filter((b) => b.eventId === evt.id);
                const soldTickets = eventBookings.reduce((s, b) => s + (b.quantity || 1), 0);

                return (
                  <div
                    key={evt.id}
                    className="rounded-3xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
                  >
                    {/* Event Banner Image with Status Badge */}
                    <div className="relative h-44 w-full bg-[#0B1120] overflow-hidden">
                      <img
                        src={getEventImage(evt)}
                        alt={evt.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/90 via-[#0B1120]/30 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider font-mono px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white border border-white/20">
                          {evt.category}
                        </span>

                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider font-mono px-2.5 py-1 rounded-full border shadow-2xs ${
                            status === "LIVE"
                              ? "bg-emerald-500 text-white border-emerald-400 animate-pulse"
                              : status === "PREPARING"
                              ? "bg-blue-500 text-white border-blue-400"
                              : status === "COMPLETED"
                              ? "bg-[#382F27] text-[#C9D9F7] border-[#4A4236]"
                              : "bg-[#4F7CFF] text-white border-[#4F7CFF]"
                          }`}
                        >
                          {status}
                        </span>
                      </div>

                      {/* Bottom Info on Image */}
                      <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                        <h3 className="font-heading font-bold text-base line-clamp-1 text-white">
                          {evt.name}
                        </h3>
                        <p className="text-[11px] text-[#C9BBA0] line-clamp-1 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#4F7CFF] shrink-0" />
                          <span>{evt.venue}</span>
                        </p>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      {/* Operational Metrics Grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF]">
                          <span className="text-[10px] uppercase font-mono font-bold text-[#8C8272] block">
                            Date & Schedule
                          </span>
                          <span className="font-semibold text-[#241E17] line-clamp-1 mt-0.5">
                            {evt.date}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF]">
                          <span className="text-[10px] uppercase font-mono font-bold text-[#8C8272] block">
                            Capacity / Expected
                          </span>
                          <span className="font-semibold text-[#241E17] line-clamp-1 mt-0.5">
                            {liveState?.crowdState?.totalExpected?.toLocaleString() ||
                              evt.expectedAttendance}{" "}
                            / {evt.capacity}
                          </span>
                        </div>
                      </div>

                      {/* Operational Readiness Meter */}
                      {readiness && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-medium text-[#4A4236] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#4F7CFF]" />
                              Operational Readiness
                            </span>
                            <span className="font-mono font-bold text-[#2D5FD2]">
                              {readiness.overallPercent}%
                            </span>
                          </div>
                          <div className="w-full bg-[#F7FAFF] h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#4F7CFF] rounded-full transition-all"
                              style={{ width: `${readiness.overallPercent}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Action Links */}
                      <div className="pt-2 border-t border-[#F7FAFF] flex items-center gap-2">
                        <Link
                          to={`/operations/events/${evt.id}/live`}
                          className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-[#4F7CFF] hover:bg-[#2D5FD2] text-white flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                        >
                          <Activity className="w-3.5 h-3.5 text-[#C9D9F7]" />
                          <span>Command Center</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>

                        <Link
                          to={`/operations/events/${evt.id}`}
                          title="Configure Event Parameters"
                          className="p-2 rounded-xl text-[#4A4236] hover:text-[#4F7CFF] bg-[#F7FAFF] hover:bg-[#C9D9F7] transition-colors"
                        >
                          <Sliders className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </OrganizerLayout>
  );
};
