import {
  Compass,
  Calendar,
  Ticket,
  User,
  LayoutDashboard,
  Shield,
  Activity,
  Users,
  Bus,
  Coffee,
  Bell,
  Layers,
  Gauge,
  Sparkles,
  LucideIcon,
  Network,
  CloudRain,
} from "lucide-react";
import { UserRole } from "../../types/auth";

export interface NavItemConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
  badge?: string;
  badgeVariant?: "default" | "success" | "warning" | "indigo";
  isPlaceholder?: boolean;
  phaseNote?: string;
  children?: NavItemConfig[];
}

export interface NavGroupConfig {
  id: string;
  title?: string;
  items: NavItemConfig[];
}

export const ATTENDEE_NAVIGATION: NavGroupConfig[] = [
  {
    id: "main-attendee",
    items: [
      {
        id: "attendee-overview",
        label: "Overview",
        icon: LayoutDashboard,
        path: "/overview",
        isPlaceholder: false,
      },
      {
        id: "attendee-discover",
        label: "Discover Events",
        icon: Compass,
        path: "/events",
      },
      {
        id: "attendee-my-event",
        label: "My Events",
        icon: Calendar,
        path: "/my-event",
        isPlaceholder: false,
      },
      {
        id: "attendee-ticket",
        label: "Ticket",
        icon: Ticket,
        path: "/ticket",
        isPlaceholder: false,
      },
      {
        id: "attendee-profile",
        label: "Profile",
        icon: User,
        path: "/profile",
        isPlaceholder: false,
      },
    ],
  },
];

export const ORGANIZER_NAVIGATION: NavGroupConfig[] = [
  {
    id: "main-organizer",
    items: [
      {
        id: "org-overview",
        label: "Overview",
        icon: LayoutDashboard,
        path: "/operations",
      },
      {
        id: "org-events",
        label: "Events",
        icon: Calendar,
        path: "/operations/events",
      },
      {
        id: "org-command",
        label: "Live Command Center",
        icon: Shield,
        path: "/operations/live",
        badge: "LIVE",
        badgeVariant: "success",
      },
      {
        id: "org-weather-twin",
        label: "Weather Twin",
        icon: CloudRain,
        path: "/operations/weather-twin",
        badge: "WEATHER",
        badgeVariant: "indigo",
      },
      {
        id: "org-crowd",
        label: "Crowd",
        icon: Users,
        isPlaceholder: true,
        phaseNote: "Turnstile Density & Zone Ingress",
      },
      {
        id: "org-transport",
        label: "Transport",
        icon: Bus,
        isPlaceholder: true,
        phaseNote: "Arterial Transit & Headways",
      },
      {
        id: "org-hospitality",
        label: "Hospitality",
        icon: Coffee,
        isPlaceholder: true,
        phaseNote: "Concessions & Hydration Stalls",
      },
    ],
  },
];

export const OPERATOR_NAVIGATION: NavGroupConfig[] = [
  {
    id: "main-operator",
    items: [
      {
        id: "op-overview",
        label: "Overview",
        icon: LayoutDashboard,
        path: "/operators",
      },
      {
        id: "op-resources",
        label: "Assigned Resources",
        icon: Layers,
        isPlaceholder: true,
        phaseNote: "Field Equipment & Radio Teams",
      },
      {
        id: "op-capacity",
        label: "Capacity",
        icon: Gauge,
        isPlaceholder: true,
        phaseNote: "Sector Metering & Gate Loads",
      },
      {
        id: "op-logistics",
        label: "Transport / Parking / Hospitality",
        icon: Bus,
        isPlaceholder: true,
        phaseNote: "Bay Diversions & Stock Alerts",
      },
      {
        id: "op-alerts",
        label: "Alerts",
        icon: Bell,
        isPlaceholder: true,
        phaseNote: "Localized Choke Contingencies",
      },
      {
        id: "op-profile",
        label: "Profile",
        icon: User,
        isPlaceholder: true,
        phaseNote: "Operator Credential & Sector Clearance",
      },
    ],
  },
];

export const getNavigationForRole = (role?: UserRole): NavGroupConfig[] => {
  switch (role) {
    case "organizer":
      return ORGANIZER_NAVIGATION;
    case "operator":
      return OPERATOR_NAVIGATION;
    case "attendee":
    default:
      return ATTENDEE_NAVIGATION;
  }
};
