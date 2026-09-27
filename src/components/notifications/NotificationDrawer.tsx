import React, { useState, useEffect } from "react";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getNotificationsForRole,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  initializeDefaultNotifications,
} from "../../services/notificationService";
import { AppNotification, InsightPriority } from "../../types/intelligence";

interface NotificationDrawerProps {
  eventId?: string;
  className?: string;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ eventId, className = "" }) => {
  const { user } = useAuth();
  const role = user?.role || "attendee";
  const userId = user?.id || "demo_user";

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const loadNotifications = () => {
    if (eventId) {
      initializeDefaultNotifications(eventId);
    }
    const notifs = getNotificationsForRole(role, userId, eventId);
    setNotifications(notifs);
  };

  useEffect(() => {
    loadNotifications();

    const handleUpdate = () => loadNotifications();
    window.addEventListener("eventflow_notifications_updated", handleUpdate);
    window.addEventListener("eventflow_action_updated", handleUpdate);

    return () => {
      window.removeEventListener("eventflow_notifications_updated", handleUpdate);
      window.removeEventListener("eventflow_action_updated", handleUpdate);
    };
  }, [role, userId, eventId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = (id: string) => {
    markNotificationAsRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead(role);
    loadNotifications();
  };

  const getPriorityStyle = (priority: InsightPriority) => {
    switch (priority) {
      case "CRITICAL":
        return {
          border: "border-rose-200 bg-rose-50/70",
          icon: <AlertCircle className="w-4 h-4 text-rose-600" />,
          badge: "bg-rose-100 text-rose-800",
        };
      case "WARNING":
        return {
          border: "border-blue-200 bg-blue-50/70",
          icon: <AlertTriangle className="w-4 h-4 text-blue-600" />,
          badge: "bg-blue-100 text-blue-800",
        };
      case "ADVISORY":
        return {
          border: "border-[#4F8FFF]/25 bg-[#10233D]/70",
          icon: <Sparkles className="w-4 h-4 text-[#4F7CFF]" />,
          badge: "bg-[#102D52] text-[#8EC1FF]",
        };
      case "INFO":
      default:
        return {
          border: "border-[#4F8FFF]/25 bg-[#0C1B30]/70",
          icon: <Info className="w-4 h-4 text-[#B7C6DA]" />,
          badge: "bg-[#10233D] text-[#DCE8F8]",
        };
    }
  };

  return (
    <>
      {/* Trigger Button with Badge */}
      <button
        onClick={() => setIsOpen(true)}
        className={`relative p-2.5 rounded-xl bg-[#0A1628] border border-[#4F8FFF]/25 hover:bg-[#10233D] text-[#DCE8F8] transition-colors shadow-2xs cursor-pointer flex items-center justify-center ${className}`}
        aria-label="Open notifications"
        title="Open Notification Center"
      >
        <Bell className="w-4.5 h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#4F7CFF] text-white font-mono font-bold text-[10px] flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Slide-over Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-[#0B1120]/40 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Drawer Panel */}
      <div
        style={{ display: isOpen ? "flex" : "none" }}
        aria-hidden={!isOpen}
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-[#0A1628] shadow-2xl border-l border-[#4F8FFF]/25 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#4F8FFF]/12 flex items-center justify-between gap-3 bg-[#0C1B30]/95">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#10233D] text-[#4F7CFF] flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#EAF2FF] font-heading">
                Notifications
              </h3>
              <span className="text-[11px] text-[#8FA4BE] font-mono capitalize">
                Role: {role} • {notifications.length} alerts
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-2.5 py-1 text-xs font-semibold text-[#4F7CFF] hover:text-[#2D5FD2] hover:bg-[#10233D] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark Read</span>
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-[#7187A1] hover:text-[#DCE8F8] hover:bg-[#10233D] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#10233D] text-[#7187A1] flex items-center justify-center mx-auto">
                <Bell className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#EAF2FF]">No active alerts</p>
                <p className="text-xs text-[#7187A1] max-w-xs mx-auto">
                  You are up to date. Operational notifications and priority guidance will appear here.
                </p>
              </div>
            </div>
          ) : (
            notifications.map((notif) => {
              const style = getPriorityStyle(notif.type);
              return (
                <div
                  key={notif.notificationId}
                  onClick={() => !notif.read && handleMarkRead(notif.notificationId)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    style.border
                  } ${notif.read ? "opacity-75" : "shadow-2xs"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {style.icon}
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${style.badge}`}
                      >
                        {notif.type}
                      </span>
                    </div>

                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[#4F7CFF] shrink-0" />
                    )}
                  </div>

                  <div className="mt-2 space-y-1">
                    <h4 className="text-xs font-bold text-[#EAF2FF] leading-snug">
                      {notif.title}
                    </h4>
                    <p className="text-xs text-[#B7C6DA] leading-relaxed">
                      {notif.message}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#4F8FFF]/20 flex items-center justify-between text-[10px] text-[#7187A1] font-mono">
                    <span>{notif.source}</span>
                    <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};
