import React, { useState } from "react";
import { Menu, Sparkles, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { EventFlowLogo } from "../home/EventFlowLogo";
import { useAuth } from "../../context/AuthContext";
import { AppSidebar } from "./AppSidebar";
import { NotificationDrawer } from "../notifications/NotificationDrawer";
import { NugenRoleAssistant } from "../ai/NugenRoleAssistant";

interface AppLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageBadge?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  pageTitle,
  pageBadge,
}) => {
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="eventflow-app min-h-screen bg-[#0B1120] text-[#F5EFE2] flex flex-col font-sans selection:bg-[#C9A15C] selection:text-[#0B1120]">
      {/* Left Sidebar */}
      <AppSidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Mobile Top App Bar (Visible on mobile/tablet screens only) */}
      <header className="lg:hidden sticky top-0 z-30 bg-[#0B1120]/95 backdrop-blur-md border-b border-[#C9A15C]/15 px-4 h-16 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl text-[#E4D9BE] hover:text-[#F5EFE2] hover:bg-[#16213B] transition-colors cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="flex items-center gap-2.5 group">
            <EventFlowLogo size={28} />
            <span className="font-bold text-base text-[#F5EFE2] font-heading">
              EventFlow
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          <NotificationDrawer />
          {pageBadge && (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#16213B] text-[#E3C081] border border-[#C9A15C]/20">
              {pageBadge}
            </span>
          )}
          <div
            className="w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center shadow-2xs"
            style={{ backgroundColor: user?.avatarColor || "#8A6A32" }}
          >
            {user?.initials || "EF"}
          </div>
        </div>
      </header>

      {/* Desktop Top Header Bar for Notifications & User Profile */}
      <div
        className={`hidden lg:flex items-center justify-end px-10 pt-4 pb-0 gap-3 transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-24" : "lg:pl-72"
        }`}
      >
        <NotificationDrawer />
      </div>

      {/* Main Content Area: Adjusted left margin according to sidebar collapsed state */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10">
          {children}
        </main>
      </div>
      <NugenRoleAssistant />
    </div>
  );
};

