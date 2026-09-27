import React from "react";

interface EventFlowLogoProps {
  className?: string;
  size?: number;
  variant?: "light" | "dark";
}

/**
 * EventFlow Geometric Brand Emblem
 * A bespoke architectural symbol representing continuous, synchronized flow.
 * Two precision-crafted geometric loops seamlessly intertwine around a central
 * synchronized event hub, symbolizing connected movement, transit, and venue flow.
 */
export const EventFlowLogo: React.FC<EventFlowLogoProps> = ({
  className = "",
  size = 32,
  variant = "light",
}) => {
  const isDark = variant === "dark";
  // "dark" = drawn on a dark navy surface (ivory + gold strokes)
  // "light" = drawn on a beige/cream surface (deep navy + gold strokes)
  const primaryStroke = isDark ? "#FBF8F1" : "#0B1120";
  const flowStroke = isDark ? "#C9A15C" : "#8A6A32";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="EventFlow Brand Symbol"
    >
      {/* Outer Continuous Conduit 1 - Arterial Ingress Flow */}
      <path
        d="M10 22C10 14.268 16.268 8 24 8C29.5 8 34.2 11.2 36.4 15.8"
        stroke={flowStroke}
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Outer Continuous Conduit 2 - Dispersal & Transit Loop */}
      <path
        d="M34 22C34 29.732 27.732 36 20 36C14.5 36 9.8 32.8 7.6 28.2"
        stroke={primaryStroke}
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Synchronizing S-curve Spine linking both flow channels */}
      <path
        d="M14.5 27.5C17.5 23 26.5 21 29.5 16.5"
        stroke={flowStroke}
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      {/* Central Precision Event Anchor */}
      <rect
        x="19"
        y="19"
        width="6"
        height="6"
        rx="2"
        fill={primaryStroke}
      />

      {/* Active Synchronization Focal Pulse */}
      <circle cx="22" cy="22" r="1.5" fill={isDark ? "#E4D9BE" : "#C9A15C"} />
    </svg>
  );
};
