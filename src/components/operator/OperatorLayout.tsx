import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Bell, Radio, RefreshCw } from "lucide-react";
import { OperatorSidebar } from "./OperatorSidebar";
import { EventFlowLogo } from "../home/EventFlowLogo";
import { useAuth } from "../../context/AuthContext";
import { OperatorUser } from "../../types/auth";
import { getOperatorAlerts, getAcknowledgedAlertIds } from "../../services/operatorAssignmentService";
import { NotificationDrawer } from "../notifications/NotificationDrawer";
import { NugenRoleAssistant } from "../ai/NugenRoleAssistant";

interface OperatorLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  pageBadge?: string;
  actions?: React.ReactNode;
}

export const OperatorLayout: React.FC<OperatorLayoutProps> = ({
  children,
  title,
  subtitle,
  pageBadge,
  actions,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const { user } = useAuth();
  const location = useLocation();
  const operatorUser = user as OperatorUser | null;

  // Listen for live updates across browser tabs & local events
  useEffect(() => {
    const handleUpdate = () => {
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };

    window.addEventListener("eventflow_live_state_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("eventflow_live_state_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const alerts = user ? getOperatorAlerts(user.id) : [];
  const ackedIds = user ? getAcknowledgedAlertIds(user.id) : [];
  const activeUnacked = alerts.filter((a) => !ackedIds.includes(a.id) && a.status === "ACTIVE");

  return (
    <div className="eventflow-app min-h-screen bg-[#0B1120] text-[#F5EFE2] flex flex-col font-sans selection:bg-[#C9A15C] selection:text-[#0B1120] antialiased">
      {/* Left Sidebar (Desktop Fixed & Mobile Drawer) */}
      <div className="hidden lg:block fixed top-0 bottom-0 left-0 z-40">
        <OperatorSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-[#0B1120]/40 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <OperatorSidebar onCloseMobile={() => setIsMobileOpen(false)} />
      </div>

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
          <Link to="/operators" className="flex items-center gap-2 group">
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
          <NotificationDrawer />
          <Link
            to="/operators/alerts"
            className="relative p-2 rounded-lg text-[#E4D9BE] hover:text-[#F5EFE2] hover:bg-[#16213B] transition-colors"
            title="Operational Alerts"
          >
            <Bell className="w-5 h-5" />
            {activeUnacked.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </Link>
          <div
            className="w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center shadow-2xs"
            style={{ backgroundColor: operatorUser?.avatarColor || "#8A6A32" }}
          >
            {operatorUser?.initials || "OP"}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* Desktop Sticky Header Bar */}
        <header className="hidden lg:flex sticky top-0 z-30 h-16 bg-[#0B1120]/95 backdrop-blur-md border-b border-[#C9A15C]/15 px-8 items-center justify-between shadow-2xs">
          <div>
            {title ? (
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-[#F5EFE2] font-heading tracking-tight">
                  {title}
                </h1>
                {pageBadge ? (
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#16213B] text-[#E3C081] border border-[#C9A15C]/20">
                    {pageBadge}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold">
                    <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                    LIVE OPS
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xl font-bold text-[#F5EFE2] font-heading">EventFlow Operations</span>
            )}
            {subtitle && <p className="text-xs text-[#B9B09F] mt-0.5">{subtitle}</p>}
          </div>

          {/* Right Header Badges & Actions */}
          <div className="flex items-center gap-3">
            {actions}
            <NotificationDrawer />

            {/* Sync status pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16213B]/80 border border-[#C9A15C]/30 text-[#E4D9BE] text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Synced {lastSyncTime}</span>
            </div>

            {/* Alerts Quick Link */}
            <Link
              to="/operators/alerts"
              className="relative p-2 rounded-xl text-[#E4D9BE] hover:text-[#F5EFE2] hover:bg-[#16213B] transition-colors"
              title="Operational Alerts"
            >
              <Bell className="w-5 h-5" />
              {activeUnacked.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </Link>

            {/* Operator Avatar Indicator */}
            {operatorUser && (
              <div className="flex items-center gap-2.5 pl-3 border-l border-[#C9A15C]/25">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-2xs"
                  style={{ backgroundColor: operatorUser.avatarColor || "#8A6A32" }}
                >
                  {operatorUser.initials || "OP"}
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-[#F5EFE2] leading-tight">
                    {operatorUser.fullName || operatorUser.name}
                  </p>
                  <p className="text-[11px] text-[#D9B876] font-medium">
                    {operatorUser.operatorType || "Field Ops"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10">
          {children}
        </main>
      </div>
      <NugenRoleAssistant />
    </div>
  );
};
