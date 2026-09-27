/**
 * NotificationService
 * Single centralized notification repository across Organizer, Operator, and Attendee.
 * Enforces role-based filtering, read status, and real-time custom event broadcasting.
 */

import { AppNotification, InsightPriority } from "../types/intelligence";

const NOTIFICATIONS_STORAGE_KEY = "eventflow_notifications";

export function getAllNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAllNotifications(notifications: AppNotification[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new CustomEvent("eventflow_notifications_updated"));
  } catch (err) {
    console.error("Failed to save notifications:", err);
  }
}

export function addNotification(notification: AppNotification): void {
  const all = getAllNotifications();
  // Check if identical notification already exists recently
  const existingIndex = all.findIndex(
    (n) => n.eventId === notification.eventId && n.title === notification.title && n.userId === notification.userId
  );
  if (existingIndex >= 0) {
    all[existingIndex] = { ...all[existingIndex], ...notification, read: false };
    saveAllNotifications(all.slice(0, 100));
    return;
  }

  all.unshift(notification);
  // Keep last 100
  const trimmed = all.slice(0, 100);
  saveAllNotifications(trimmed);
}

export function getNotificationsForRole(
  role: "organizer" | "operator" | "attendee",
  userId?: string,
  eventId?: string
): AppNotification[] {
  const all = getAllNotifications();
  return all.filter((n) => {
    if (eventId && n.eventId !== eventId) return false;

    if (role === "organizer") {
      return n.role === "organizer" || !n.role;
    }
    if (role === "operator") {
      return n.role === "operator";
    }
    if (role === "attendee") {
      return n.role === "attendee" && (!userId || n.userId === userId || n.userId === "all_attendees");
    }
    return false;
  });
}

export function markNotificationAsRead(notificationId: string): void {
  const all = getAllNotifications();
  const target = all.find((n) => n.notificationId === notificationId);
  if (target) {
    target.read = true;
    saveAllNotifications(all);
  }
}

export function markAllNotificationsAsRead(role: "organizer" | "operator" | "attendee"): void {
  const all = getAllNotifications();
  all.forEach((n) => {
    if (n.role === role) {
      n.read = true;
    }
  });
  saveAllNotifications(all);
}

export function initializeDefaultNotifications(eventId: string): void {
  const existing = getAllNotifications().filter((n) => n.eventId === eventId);
  if (existing.length > 0) return;

  const now = new Date();

  const defaults: AppNotification[] = [
    {
      notificationId: `notif-org-pres-${eventId}`,
      userId: "organizer",
      role: "organizer",
      eventId,
      type: "ADVISORY",
      title: "Operational Status Advisory",
      message: "Ingress turnstile flow is running smoothly across all perimeter gates. Early arrival wave is within projected capacity limits.",
      createdAt: new Date(now.getTime() - 20 * 60 * 1000).toISOString(),
      read: false,
      source: "Operational Pressure Engine",
    },
    {
      notificationId: `notif-op-park-${eventId}`,
      userId: "operator",
      role: "operator",
      eventId,
      type: "WARNING",
      title: "Parking Capacity Notice",
      message: "Primary Multilevel lot reached 85% capacity. Electronic matrix guidance signs are redirecting vehicles to overflow bays.",
      createdAt: new Date(now.getTime() - 12 * 60 * 1000).toISOString(),
      read: false,
      source: "Perimeter Parking Services",
      relatedResourceId: "res-park-0",
    },
    {
      notificationId: `notif-att-gate-${eventId}`,
      userId: "all_attendees",
      role: "attendee",
      eventId,
      type: "INFO",
      title: "Gate Ingress Window Active",
      message: "Fast-track turnstile scanning is open. Present your digital QR pass at your designated gate.",
      createdAt: new Date(now.getTime() - 8 * 60 * 1000).toISOString(),
      read: false,
      source: "Venue Access Control",
    },
  ];

  const all = getAllNotifications();
  saveAllNotifications([...defaults, ...all]);
}
