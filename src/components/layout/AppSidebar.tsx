import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  Calendar,
  Sparkles,
  Info,
} from "lucide-react";
import { EventFlowLogo } from "../home/EventFlowLogo";
import { useAuth } from "../../context/AuthContext";
import { getNavigationForRole, NavItemConfig } from "./sidebarConfig";

interface AppSidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeNotice, setActiveNotice] = useState<string | null>(null);

  const navGroups = getNavigationForRole(user?.role);

  const handleLogout = () => {
    logout();
    navigate("/signin", { replace: true });
  };

  const handleItemClick = (item: NavItemConfig) => {
    if (item.id === "attendee-my-event") {
      navigate("/my-event");
      onCloseMobile();
      return;
    }

    if (item.id === "attendee-ticket") {
      navigate("/ticket");
      onCloseMobile();
      return;
    }

    if (item.path) {
      navigate(item.path);
      onCloseMobile();
      return;
    }

    if (item.isPlaceholder) {
      setActiveNotice(
        item.phaseNote || `The ${item.label} module will be available shortly.`
      );
      setTimeout(() => setActiveNotice(null), 3500);
    }
  };

  const isItemActive = (item: NavItemConfig) => {
    if (item.id === "attendee-my-event") {
      return location.pathname === "/my-event";
    }
    if (item.id === "attendee-ticket") {
      return location.pathname === "/ticket";
    }
    if (!item.path) return false;
    if (
      item.path === "/events" &&
      (location.pathname === "/events" || location.pathname.startsWith("/events/"))
    ) {
      return true;
    }
    return location.pathname === item.path;
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-[#0B1120]/40 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Floating Placeholder Info Toast */}
      {activeNotice && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm p-4 rounded-xl bg-[#0B1120] text-white shadow-2xl border border-[#382F27]/80 animate-in fade-in slide-in-from-bottom-4 duration-200 flex items-start gap-3">
          <div className="w-6 h-6 rounded-md bg-[#5AA7FF]/12 text-[#8BC4FF] flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs space-y-1">
            <div className="font-semibold text-[#E4D9BE]">Roadmap Notice</div>
            <div className="text-[#B8B0A2] leading-relaxed">{activeNotice}</div>
          </div>
        </div>
      )}

      {/* Main Sidebar Container */}
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
            to="/"
            className="flex items-center gap-3 overflow-hidden group cursor-pointer"
            title="EventFlow Home"
          >
            <div className="shrink-0 transition-transform group-hover:scale-105 duration-200">
              <EventFlowLogo size={32} />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-bold tracking-tight text-[#F5EFE2] font-heading whitespace-nowrap">
                EventFlow
              </span>
            )}
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-[#8F897D] hover:text-[#EDE3CB] hover:bg-[#16213B] transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse / Expand Button */}
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
        </div>

        {/* Navigation Group Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.id} className="space-y-1">
              {group.title && !isCollapsed && (
                <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#8F897D] font-mono">
                  {group.title}
                </div>
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item);
                const displayBadge = item.badge;
                const badgeVariant = item.badgeVariant;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group relative ${
                      active
                        ? "bg-[#16213B] text-[#E3C081] font-semibold shadow-2xs"
                        : "text-[#E4D9BE] hover:text-[#F5EFE2] hover:bg-[#16213B]/80"
                    } ${isCollapsed ? "justify-center px-0" : "justify-between"}`}
                  >
                    {/* Active Left Indicator Bar */}
                    {active && (
                      <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#C9A15C] rounded-r-full" />
                    )}

                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-5 h-5 shrink-0 flex items-center justify-center relative transition-transform group-hover:scale-110 ${
                          active ? "text-[#D9B876]" : "text-[#B9B09F] group-hover:text-[#F5EFE2]"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      {!isCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {displayBadge && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              badgeVariant === "success"
                                ? "bg-emerald-100 text-emerald-800"
                                : badgeVariant === "indigo"
                                ? "bg-indigo-100 text-indigo-800"
                                : "bg-[#16213B] text-[#E4D9BE]"
                            }`}
                          >
                            {displayBadge}
                          </span>
                        )}

                        {item.isPlaceholder && !displayBadge && (
                          <span className="text-[10px] font-mono text-[#8F897D] group-hover:text-[#B9B09F]">
                            Info
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Session Footer Section */}
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
                title={user?.name || "User"}
              >
                {user?.initials || "EF"}
              </div>

              {!isCollapsed && (
                <div className="text-left min-w-0">
                  <div className="text-xs font-semibold text-[#F5EFE2] truncate">
                    {user?.fullName || user?.name || "Attendee"}
                  </div>
                  <div className="text-[10px] text-[#B9B09F] capitalize leading-none truncate">
                    {user?.role || "attendee"}
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-[#8F897D] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
