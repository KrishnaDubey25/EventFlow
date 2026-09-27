import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Activity,
  Users2,
  Bus,
  Car,
  Coffee,
  UserCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Radio,
  Sparkles,
  Sliders,
  Gauge,
  CloudRain,
  MapPinned,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getOrganizerEvents } from "../../services/eventStorageService";
import { AppEvent } from "../../types/event";
import { EventFlowLogo } from "../home/EventFlowLogo";
import { NotificationDrawer } from "../notifications/NotificationDrawer";
import { NugenRoleAssistant } from "../ai/NugenRoleAssistant";

interface NavItem {
  name: string;
  href: (eventId?: string) => string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: string;
  badgeVariant?: "success" | "blue" | "neutral";
}

export const ORGANIZER_NAV_ITEMS: NavItem[] = [
  {
    name: "Overview",
    href: () => "/operations",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: "Events",
    href: () => "/operations/events",
    icon: Calendar,
  },
  {
    name: "Indoor Venue Map",
    href: (eventId) => (eventId ? `/operations/events/${eventId}/3d-venue` : "/operations/events"),
    icon: MapPinned,
    badge: "LIVE MAP",
    badgeVariant: "blue",
  },
  {
    name: "Live Command Center",
    href: (eventId) => (eventId ? `/operations/events/${eventId}/live` : "/operations/live"),
    icon: Activity,
    badge: "LIVE",
    badgeVariant: "success",
  },
  {
    name: "Weather Twin",
    href: (eventId) => (eventId ? `/operations/events/${eventId}/weather-twin` : "/operations/weather-twin"),
    icon: CloudRain,
    badge: "WEATHER",
    badgeVariant: "blue",
  },
  {
    name: "Crowd",
    href: (eventId) => (eventId ? `/operations/events/${eventId}/crowd` : "/operations/crowd"),
    icon: Users2,
  },
  {
    name: "Hospitality",
    href: (eventId) => (eventId ? `/operations/events/${eventId}/hospitality` : "/operations/hospitality"),
    icon: Coffee,
  },
  {
    name: "Profile",
    href: () => "/operations/profile",
    icon: UserCheck,
  },
];

interface OrganizerLayoutProps {
  children: React.ReactNode;
  activeEvent?: AppEvent | null;
  onSelectEventId?: (id: string) => void;
  pageTitle?: string;
  pageSubtitle?: string;
  pageBadge?: string;
  actions?: React.ReactNode;
}

export const OrganizerLayout: React.FC<OrganizerLayoutProps> = ({
  children,
  activeEvent,
  onSelectEventId,
  pageTitle,
  pageSubtitle,
  pageBadge,
  actions,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams<{ eventId?: string }>();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [organizerEvents, setOrganizerEvents] = useState<AppEvent[]>([]);

  // Determine current active event ID
  const resolvedEventId =
    params.eventId ||
    activeEvent?.id ||
    organizerEvents[0]?.id ||
    "mumbai-tech-ai-expo-2026";

  useEffect(() => {
    if (user?.id) {
      const events = getOrganizerEvents(user.id);
      setOrganizerEvents(events);
    }
  }, [user?.id]);

  const handleLogout = () => {
    logout();
    navigate("/signin", { replace: true });
  };

  const currentEvent =
    activeEvent || organizerEvents.find((e) => e.id === resolvedEventId) || organizerEvents[0];

  const handleEventSwitch = (newEventId: string) => {
    if (onSelectEventId) {
      onSelectEventId(newEventId);
    }

    // Preserve the sub-route if on an event-specific page
    const path = location.pathname;
    if (path.includes("/intelligence")) {
      navigate(`/operations/events/${newEventId}/intelligence`);
    } else if (path.includes("/3d-venue")) {
      navigate(`/operations/events/${newEventId}/3d-venue`);
    } else if (path.includes("/weather-twin")) {
      navigate(`/operations/events/${newEventId}/weather-twin`);
    } else if (path.includes("/live")) {
      navigate(`/operations/events/${newEventId}/live`);
    } else if (path.includes("/crowd")) {
      navigate(`/operations/events/${newEventId}/crowd`);
    } else if (path.includes("/transport")) {
      navigate(`/operations/events/${newEventId}/transport`);
    } else if (path.includes("/parking")) {
      navigate(`/operations/events/${newEventId}/parking`);
    } else if (path.includes("/hospitality")) {
      navigate(`/operations/events/${newEventId}/hospitality`);
    } else if (path.includes("/operations/events/")) {
      navigate(`/operations/events/${newEventId}`);
    }
  };

  const isNavActive = (item: NavItem) => {
    const target = item.href(resolvedEventId);
    if (item.exact) {
      return location.pathname === target;
    }
    if (
      item.name === "Events" &&
      (location.pathname === "/operations/events" ||
        (location.pathname.startsWith("/operations/events/") &&
          !location.pathname.includes("/intelligence") &&
          !location.pathname.includes("/weather-twin") &&
          !location.pathname.includes("/3d-venue") &&
          !location.pathname.includes("/live") &&
          !location.pathname.includes("/crowd") &&
          !location.pathname.includes("/transport") &&
          !location.pathname.includes("/parking") &&
          !location.pathname.includes("/hospitality") &&
          !location.pathname.includes("/alerts")))
    ) {
      return true;
    }
    if (
      item.name === "Live Command Center" &&
      (location.pathname.includes("/live") ||
        location.pathname.includes("/intelligence") ||
        location.pathname === "/operations/live" ||
        location.pathname === "/operations/intelligence")
    ) {
      return true;
    }
    if (
      item.name === "Crowd Control" &&
      (location.pathname.includes("/crowd") || location.pathname === "/operations/crowd")
    ) {
      return true;
    }
    if (
      item.name === "Transport & Transit" &&
      (location.pathname.includes("/transport") || location.pathname === "/operations/transport")
    ) {
      return true;
    }
    if (
      item.name === "Parking Ops" &&
      (location.pathname.includes("/parking") || location.pathname === "/operations/parking")
    ) {
      return true;
    }
    if (
      item.name === "Hospitality & Safety" &&
      (location.pathname.includes("/hospitality") || location.pathname === "/operations/hospitality")
    ) {
      return true;
    }
    if (
      item.name === "Operational Alerts" &&
      (location.pathname.includes("/alerts") || location.pathname === "/operations/alerts")
    ) {
      return true;
    }
    if (item.name === "Organizer Profile" && location.pathname === "/operations/profile") {
      return true;
    }
    return location.pathname === target;
  };

  return (
    <div className="eventflow-app min-h-screen bg-[#0B1120] text-[#F5EFE2] flex flex-col font-sans selection:bg-[#C9A15C] selection:text-[#0B1120] antialiased">
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-[#0B1120]/40 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Mobile Top App Bar */}
      <header className="lg:hidden sticky top-0 z-30 bg-[#0B1120]/95 backdrop-blur-md border-b border-[#C9A15C]/15 px-4 h-16 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl text-[#E4D9BE] hover:text-[#F5EFE2] hover:bg-[#16213B] transition-colors cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/operations" className="flex items-center gap-2 group">
            <EventFlowLogo size={28} />
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-[#F5EFE2] font-heading">
                EventFlow
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#16213B] text-[#E3C081] border border-[#C9A15C]/30 font-mono">
                Ops
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {pageBadge && (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#16213B] text-[#E3C081] border border-[#C9A15C]/20">
              {pageBadge}
            </span>
          )}
          <div
            className="w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center shadow-2xs"
            style={{ backgroundColor: user?.avatarColor || "#8A6A32" }}
          >
            {user?.initials || "OR"}
          </div>
        </div>
      </header>

      {/* Main Sidebar Container (Identical structure and theme to Attendee AppSidebar) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#0B1120] border-r border-[#C9A15C]/15 flex flex-col transition-all duration-300 ease-in-out shadow-xs select-none ${
          isCollapsed ? "w-20" : "w-64"
        } ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Header: Brand Logo & Collapse Toggle */}
        <div className="h-18 px-5 border-b border-[#C9A15C]/12 flex items-center justify-between">
          <Link
            to="/operations"
            className="flex items-center gap-2.5 overflow-hidden group cursor-pointer"
            title="EventFlow Operations Home"
          >
            <div className="shrink-0 transition-transform group-hover:scale-105 duration-200">
              <EventFlowLogo size={32} />
            </div>
            {!isCollapsed && (
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-[#F5EFE2] font-heading whitespace-nowrap">
                  EventFlow
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#16213B] text-[#E3C081] border border-[#C9A15C]/30 font-mono">
                  Ops
                </span>
              </div>
            )}
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-[#8F897D] hover:text-[#382F27] hover:bg-[#16213B] transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse / Expand Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-[#8F897D] hover:text-[#F5EFE2] hover:bg-[#16213B] transition-colors cursor-pointer"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Selected Event Context Switcher */}
        {!isCollapsed && organizerEvents.length > 0 && (
          <div className="p-3 border-b border-[#C9A15C]/12 bg-[#0B1120]/50">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[10px] uppercase font-mono font-bold text-[#8F897D] tracking-wider">
                Active Event
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                SYNCED
              </span>
            </div>
            <div className="relative">
              <select
                value={currentEvent?.id || ""}
                onChange={(e) => handleEventSwitch(e.target.value)}
                className="w-full text-xs font-semibold bg-[#0B1120] border border-[#C9A15C]/25 hover:border-[#C9A15C]/45 rounded-xl py-2 px-3 text-[#F5EFE2] focus:outline-none focus:ring-1 focus:ring-[#8A6A32] pr-7 appearance-none cursor-pointer truncate shadow-2xs"
              >
                {organizerEvents.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#8F897D] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#8F897D] font-mono">
              Operations Control
            </div>
          )}

          {ORGANIZER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item);
            const href = item.href(resolvedEventId);

            return (
              <Link
                key={item.name}
                to={href}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed ? item.name : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group relative ${
                  active
                    ? "bg-[#132944] text-[#F8F4EA] font-semibold shadow-2xs"
                    : "text-[#E4D9BE] hover:text-[#F5EFE2] hover:bg-[#16213B]/80"
                } ${isCollapsed ? "justify-center px-0" : "justify-between"}`}
              >
                {/* Active Left Indicator Bar */}
                {active && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#5AA7FF] rounded-r-full" />
                )}

                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-5 h-5 shrink-0 flex items-center justify-center relative transition-transform group-hover:scale-110 ${
                      active ? "text-[#8BC4FF]" : "text-[#9FB0C5] group-hover:text-[#F8F4EA]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                      item.badgeVariant === "success"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-[#132944] text-[#D8C79F] border border-[#5AA7FF]/20"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Session Footer */}
        <div className="p-3 border-t border-[#C9A15C]/12 bg-[#0B1120]/60">
          <div
            className={`flex items-center gap-2.5 rounded-xl p-2 transition-colors ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs"
                style={{ backgroundColor: user?.avatarColor || "#8A6A32" }}
                title={user?.name || "Organizer"}
              >
                {user?.initials || "OR"}
              </div>

              {!isCollapsed && (
                <div className="text-left min-w-0">
                  <div className="text-xs font-semibold text-[#F5EFE2] truncate">
                    {user?.fullName || user?.name || "Event Organizer"}
                  </div>
                  <div className="text-[10px] text-[#B9B09F] capitalize leading-none truncate">
                    {(user as any)?.organization || "Event Controller"}
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-[#8F897D] hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Body: Left padding matching collapsed/expanded sidebar */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* Optional Page Top Banner */}
        {(pageTitle || actions) && (
          <div className="bg-[#0B1120] border-b border-[#C9A15C]/30 px-4 sm:px-6 lg:px-10 py-5">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  {pageBadge && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-[#16213B] text-[#E3C081] border border-[#C9A15C]/30">
                      <Radio className="w-3 h-3 text-[#D9B876] animate-pulse" />
                      {pageBadge}
                    </span>
                  )}
                  <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#F5EFE2] tracking-tight">
                    {pageTitle}
                  </h1>
                </div>
                {pageSubtitle && (
                  <p className="text-xs sm:text-sm text-[#B9B09F] mt-1">{pageSubtitle}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {actions}
                <NotificationDrawer eventId={resolvedEventId} />
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10">
          {children}
        </main>
      </div>
      <NugenRoleAssistant />
    </div>
  );
};
