import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Building,
  BedDouble,
  CalendarCheck,
  CheckCircle2,
  TrendingUp,
  Bell,
  User,
  Truck,
  Route,
  Gauge,
  Activity,
  Car,
  BarChart3,
  ArrowLeftRight,
  UtensilsCrossed,
  HeartPulse,
  Users,
  AlertTriangle,
  HardHat,
  Wrench,
  Layers,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { EventFlowLogo } from "../home/EventFlowLogo";
import { OperatorUser, OperatorType, normalizeOperatorType } from "../../types/auth";
import { getOperatorAlerts, getAcknowledgedAlertIds } from "../../services/operatorAssignmentService";

interface OperatorSidebarProps {
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface SidebarNavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
  badge?: string;
  badgeVariant?: "danger" | "success" | "info";
}

export const OperatorSidebar: React.FC<OperatorSidebarProps> = ({
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const operatorUser = user as OperatorUser | null;
  const operatorType: OperatorType = normalizeOperatorType(operatorUser?.operatorType);

  const handleLogout = () => {
    logout();
    navigate("/signin", { replace: true });
  };

  // Get active unacknowledged alert count
  const alerts = user ? getOperatorAlerts(user.id) : [];
  const ackedIds = user ? getAcknowledgedAlertIds(user.id) : [];
  const unreadAlertsCount = alerts.filter((a) => !ackedIds.includes(a.id) && a.status === "ACTIVE").length;

  // Configuration-driven navigation structure strictly by OperatorType
  const getNavItemsForType = (type: OperatorType): SidebarNavItem[] => {
    const alertItem: SidebarNavItem = {
      to: "/operators/alerts",
      label: "Alerts",
      icon: Bell,
      badge: unreadAlertsCount > 0 ? String(unreadAlertsCount) : undefined,
      badgeVariant: "danger",
      end: false,
    };

    const profileItem: SidebarNavItem = {
      to: "/operators/profile",
      label: "Profile",
      icon: User,
      end: false,
    };

    switch (type) {
      case "Accommodation":
        return [
          { to: "/operators", label: "Overview", icon: LayoutDashboard, end: true },
          { to: "/operators/events", label: "My Events", icon: Calendar, end: false },
          { to: "/operators/resources", label: "My Properties", icon: Building, end: false },
          { to: "/operators/capacity", label: "Rooms & Capacity", icon: BedDouble, end: false },
          { to: "/operators/bookings", label: "Bookings", icon: CalendarCheck, end: false },
          { to: "/operators/availability", label: "Availability", icon: CheckCircle2, end: false },
          { to: "/operators/demand", label: "Event Demand", icon: TrendingUp, end: false },
          alertItem,
          profileItem,
        ];

      case "Transport":
        return [
          { to: "/operators", label: "Overview", icon: LayoutDashboard, end: true },
          { to: "/operators/events", label: "My Events", icon: Calendar, end: false },
          { to: "/operators/resources", label: "Fleet", icon: Truck, end: false },
          { to: "/operators/routes", label: "Routes & Trips", icon: Route, end: false },
          { to: "/operators/capacity", label: "Capacity", icon: Gauge, end: false },
          { to: "/operators/live", label: "Live Status", icon: Activity, end: false, badge: "LIVE", badgeVariant: "success" },
          { to: "/operators/demand", label: "Demand", icon: TrendingUp, end: false },
          alertItem,
          profileItem,
        ];

      case "Parking":
        return [
          { to: "/operators", label: "Overview", icon: LayoutDashboard, end: true },
          { to: "/operators/events", label: "My Events", icon: Calendar, end: false },
          { to: "/operators/resources", label: "Parking Facilities", icon: Car, end: false },
          { to: "/operators/capacity", label: "Slots & Capacity", icon: Gauge, end: false },
          { to: "/operators/occupancy", label: "Occupancy", icon: BarChart3, end: false },
          { to: "/operators/entry-exit", label: "Entry / Exit", icon: ArrowLeftRight, end: false },
          { to: "/operators/availability", label: "Availability", icon: CheckCircle2, end: false },
          alertItem,
          profileItem,
        ];

      case "Food & Dining":
        return [
          { to: "/operators", label: "Overview", icon: LayoutDashboard, end: true },
          { to: "/operators/events", label: "My Events", icon: Calendar, end: false },
          { to: "/operators/resources", label: "Outlets", icon: UtensilsCrossed, end: false },
          { to: "/operators/capacity", label: "Capacity & Avail.", icon: Gauge, end: false },
          { to: "/operators/live", label: "Service Status", icon: Activity, end: false, badge: "LIVE", badgeVariant: "success" },
          { to: "/operators/demand", label: "Demand", icon: TrendingUp, end: false },
          alertItem,
          profileItem,
        ];

      case "Medical & Assistance":
        return [
          { to: "/operators", label: "Overview", icon: LayoutDashboard, end: true },
          { to: "/operators/events", label: "My Events", icon: Calendar, end: false },
          { to: "/operators/resources", label: "Medical Points", icon: HeartPulse, end: false },
          { to: "/operators/capacity", label: "Staff & Capacity", icon: Users, end: false },
          { to: "/operators/availability", label: "Availability", icon: CheckCircle2, end: false },
          { to: "/operators/incidents", label: "Incidents", icon: AlertTriangle, end: false },
          alertItem,
          profileItem,
        ];

      case "Venue Services":
        return [
          { to: "/operators", label: "Overview", icon: LayoutDashboard, end: true },
          { to: "/operators/events", label: "My Events", icon: Calendar, end: false },
          { to: "/operators/resources", label: "Assigned Services", icon: HardHat, end: false },
          { to: "/operators/capacity", label: "Service Capacity", icon: Gauge, end: false },
          { to: "/operators/live", label: "Operations Status", icon: Activity, end: false, badge: "LIVE", badgeVariant: "success" },
          { to: "/operators/issues", label: "Maintenance / Issues", icon: Wrench, end: false },
          alertItem,
          profileItem,
        ];

      case "Other Services":
      default:
        return [
          { to: "/operators", label: "Overview", icon: LayoutDashboard, end: true },
          { to: "/operators/events", label: "My Events", icon: Calendar, end: false },
          { to: "/operators/resources", label: "My Resources", icon: Layers, end: false },
          { to: "/operators/capacity", label: "Capacity", icon: Gauge, end: false },
          { to: "/operators/availability", label: "Availability", icon: CheckCircle2, end: false },
          { to: "/operators/live", label: "Service Status", icon: Activity, end: false, badge: "LIVE", badgeVariant: "success" },
          alertItem,
          profileItem,
        ];
    }
  };

  const navItems = getNavItemsForType(operatorType);

  const getOperatorTypeIcon = (type: OperatorType) => {
    switch (type) {
      case "Accommodation":
        return Building;
      case "Transport":
        return Truck;
      case "Parking":
        return Car;
      case "Food & Dining":
        return UtensilsCrossed;
      case "Medical & Assistance":
        return HeartPulse;
      case "Venue Services":
        return HardHat;
      case "Other Services":
      default:
        return Layers;
    }
  };

  const TypeIcon = getOperatorTypeIcon(operatorType);

  return (
    <aside
      className={`h-full bg-[#0B1120] border-r border-[#C9A15C]/15 flex flex-col justify-between transition-all duration-300 ease-in-out shadow-xs select-none ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Top Header: Brand Logo & Collapse Toggle */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="h-18 px-5 border-b border-[#C9A15C]/12 flex items-center justify-between shrink-0">
          <Link
            to="/operators"
            className="flex items-center gap-2.5 overflow-hidden group cursor-pointer"
            title="EventFlow Operator Command"
          >
            <div className="shrink-0 transition-transform group-hover:scale-105 duration-200">
              <EventFlowLogo size={32} />
            </div>
            {!isCollapsed && (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-lg font-bold tracking-tight text-[#F5EFE2] font-heading whitespace-nowrap">
                  EventFlow
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#16213B] text-[#E3C081] border border-[#C9A15C]/30 font-mono shrink-0">
                  Ops
                </span>
              </div>
            )}
          </Link>

          {/* Mobile Close Button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[#8F897D] hover:text-[#382F27] hover:bg-[#16213B] transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Desktop Collapse / Expand Button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
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
          )}
        </div>

        {/* Role & Operator Specialization Badge */}
        {!isCollapsed && operatorUser && (
          <div className="px-3 pt-3 pb-1 shrink-0">
            <div className="p-3 rounded-xl bg-[#0B1120] border border-[#C9A15C]/30 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-[#16213B] text-[#D9B876] shrink-0">
                  <TypeIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#F5EFE2] truncate">
                    {operatorType}
                  </p>
                  <p className="text-[10px] text-[#B9B09F] truncate">
                    {operatorUser.organization || "EventFlow Ops"}
                  </p>
                </div>
              </div>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[9px] shrink-0">
                ON DUTY
              </span>
            </div>
          </div>
        )}

        {/* Dynamic Navigation Items */}
        <div className="px-3 py-3 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#8F897D] font-mono flex items-center justify-between">
              <span>{operatorType} Portal</span>
              <span className="text-[9px] text-[#D9B876] font-medium lowercase">v2.0</span>
            </div>
          )}

          {navItems.map((item) => (
            <NavLink
              key={item.to + item.label}
              to={item.to}
              end={item.end}
              onClick={onCloseMobile}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group relative ${
                  isActive
                    ? "bg-[#16213B] text-[#E3C081] font-semibold shadow-2xs"
                    : "text-[#E4D9BE] hover:text-[#F5EFE2] hover:bg-[#16213B]/80"
                } ${isCollapsed ? "justify-center px-0" : "justify-between"}`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active Left Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#C9A15C] rounded-r-full" />
                  )}

                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-5 h-5 shrink-0 flex items-center justify-center relative transition-transform group-hover:scale-110 ${
                        isActive ? "text-[#D9B876]" : "text-[#B9B09F] group-hover:text-[#F5EFE2]"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                    </div>

                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        item.badgeVariant === "danger"
                          ? "bg-rose-100 text-rose-800 animate-pulse"
                          : item.badgeVariant === "success"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-[#1C2B4A] text-[#E4D9BE]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* User Session Footer Section */}
      <div className="p-3 border-t border-[#C9A15C]/12 bg-[#0B1120]/60 shrink-0">
        <div
          className={`flex items-center gap-2.5 rounded-xl p-2 transition-colors ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs"
              style={{ backgroundColor: operatorUser?.avatarColor || "#8A6A32" }}
              title={operatorUser?.name || "Operator"}
            >
              {operatorUser?.initials || "OP"}
            </div>

            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#F5EFE2] truncate leading-tight">
                  {operatorUser?.fullName || operatorUser?.name || "Operator"}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] font-semibold text-[#D9B876]">{operatorType}</span>
                  <span className="text-[#C9BBA0]">•</span>
                  <span className="text-[10px] text-[#B9B09F] truncate">
                    {operatorUser?.operatingCity || "Active"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-[#8F897D] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
              title="Sign out of EventFlow"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
