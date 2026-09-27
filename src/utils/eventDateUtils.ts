/**
 * Event date, countdown, and timeline journey utility calculations for EventFlow.
 */

export interface EventTimelineStage {
  id: "PLAN" | "ARRIVE" | "ENTER" | "EXPERIENCE" | "EXIT";
  label: string;
  sublabel: string;
  status: "completed" | "active" | "pending";
}

export interface ParsedEventDates {
  startDate: Date;
  endDate: Date;
  isMultiDay: boolean;
}

export interface EventCountdownResult {
  status: "UPCOMING" | "LIVE" | "COMPLETED";
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  timelineStages: EventTimelineStage[];
  currentStageId: "PLAN" | "ARRIVE" | "ENTER" | "EXPERIENCE" | "EXIT";
}

const MONTH_NAMES: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

/**
 * Parses event date string (e.g. "November 18 - 20, 2026" or "May 31, 2026")
 * and time string (e.g. "09:00 - 18:30 IST") into concrete Date objects.
 */
export function parseEventDates(dateStr: string, timeStr: string): ParsedEventDates {
  try {
    const rawTime = timeStr || "09:00 - 18:00";
    const timeMatches = rawTime.match(/(\d{1,2}):(\d{2})/g) || ["09:00", "18:00"];
    const [startHourStr, startMinStr] = (timeMatches[0] || "09:00").split(":");
    const [endHourStr, endMinStr] = (timeMatches[1] || timeMatches[0] || "18:00").split(":");

    const startH = parseInt(startHourStr, 10);
    const startM = parseInt(startMinStr, 10);
    const endH = parseInt(endHourStr, 10);
    const endM = parseInt(endMinStr, 10);

    const yearMatch = (dateStr || "").match(/\b(20\d\d)\b/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : 2026;

    // Clean out year from date string
    const dateNoYear = (dateStr || "")
      .replace(/,\s*20\d\d/, "")
      .replace(/20\d\d/, "")
      .trim();

    // Check if range e.g. "November 18 - 20" or "November 14 - 15"
    if (dateNoYear.includes("-")) {
      const parts = dateNoYear.split("-").map((p) => p.trim());
      const firstPart = parts[0];
      const secondPart = parts[1];

      // Extract month name from firstPart
      const firstMonthMatch = firstPart.match(/^[A-Za-z]+/);
      const firstMonthStr = firstMonthMatch ? firstMonthMatch[0].toLowerCase() : "november";
      const startMonthIndex = MONTH_NAMES[firstMonthStr] ?? 10;

      const firstDayMatch = firstPart.match(/\d+/);
      const startDay = firstDayMatch ? parseInt(firstDayMatch[0], 10) : 1;

      // Extract month and day from secondPart
      const secondMonthMatch = secondPart.match(/^[A-Za-z]+/);
      const secondMonthStr = secondMonthMatch ? secondMonthMatch[0].toLowerCase() : firstMonthStr;
      const endMonthIndex = MONTH_NAMES[secondMonthStr] ?? startMonthIndex;

      const secondDayMatch = secondPart.match(/\d+/);
      const endDay = secondDayMatch ? parseInt(secondDayMatch[0], 10) : startDay;

      const startDate = new Date(year, startMonthIndex, startDay, startH, startM, 0);
      let endDate = new Date(year, endMonthIndex, endDay, endH, endM, 0);

      // Handle overnight festival events (e.g. 15:00 - 01:00)
      if (endDate <= startDate) {
        endDate = new Date(year, endMonthIndex, endDay + 1, endH, endM, 0);
      }

      return {
        startDate,
        endDate,
        isMultiDay: startDay !== endDay || startMonthIndex !== endMonthIndex,
      };
    } else {
      // Single date e.g. "May 31"
      const monthMatch = dateNoYear.match(/^[A-Za-z]+/);
      const monthStr = monthMatch ? monthMatch[0].toLowerCase() : "may";
      const monthIndex = MONTH_NAMES[monthStr] ?? 4;

      const dayMatch = dateNoYear.match(/\d+/);
      const day = dayMatch ? parseInt(dayMatch[0], 10) : 1;

      const startDate = new Date(year, monthIndex, day, startH, startM, 0);
      let endDate = new Date(year, monthIndex, day, endH, endM, 0);

      if (endDate <= startDate) {
        endDate = new Date(year, monthIndex, day + 1, endH, endM, 0);
      }

      return {
        startDate,
        endDate,
        isMultiDay: false,
      };
    }
  } catch {
    const fallbackStart = new Date(2026, 10, 18, 9, 0, 0);
    const fallbackEnd = new Date(2026, 10, 20, 18, 30, 0);
    return {
      startDate: fallbackStart,
      endDate: fallbackEnd,
      isMultiDay: true,
    };
  }
}

/**
 * Computes event countdown, live status, and journey timeline stage.
 */
export function getEventStatusAndCountdown(
  startDate: Date,
  endDate: Date,
  nowDate: Date = new Date()
): EventCountdownResult {
  const now = nowDate.getTime();
  const start = startDate.getTime();
  const end = endDate.getTime();

  let status: "UPCOMING" | "LIVE" | "COMPLETED";
  let diffMs = 0;

  if (now < start) {
    status = "UPCOMING";
    diffMs = start - now;
  } else if (now >= start && now <= end) {
    status = "LIVE";
    diffMs = 0;
  } else {
    status = "COMPLETED";
    diffMs = 0;
  }

  const seconds = Math.floor((diffMs / 1000) % 60);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Determine Timeline Stage:
  // PLAN -> ARRIVE -> ENTER -> EXPERIENCE -> EXIT
  const arriveThreshold = start - 3 * 3600 * 1000; // 3 hours before start
  const enterThreshold = start - 45 * 60 * 1000;   // 45 minutes before start
  const experienceThreshold = start + 30 * 60 * 1000; // 30 minutes after start

  let currentStageId: "PLAN" | "ARRIVE" | "ENTER" | "EXPERIENCE" | "EXIT" = "PLAN";

  if (now < arriveThreshold) {
    currentStageId = "PLAN";
  } else if (now < enterThreshold) {
    currentStageId = "ARRIVE";
  } else if (now < experienceThreshold) {
    currentStageId = "ENTER";
  } else if (now <= end) {
    currentStageId = "EXPERIENCE";
  } else {
    currentStageId = "EXIT";
  }

  const stageOrder: ("PLAN" | "ARRIVE" | "ENTER" | "EXPERIENCE" | "EXIT")[] = [
    "PLAN",
    "ARRIVE",
    "ENTER",
    "EXPERIENCE",
    "EXIT",
  ];

  const currentStageIndex = stageOrder.indexOf(currentStageId);

  const stageDescriptions: Record<
    "PLAN" | "ARRIVE" | "ENTER" | "EXPERIENCE" | "EXIT",
    { label: string; sublabel: string }
  > = {
    PLAN: { label: "PLAN", sublabel: "Transit, gate & credential prep" },
    ARRIVE: { label: "ARRIVE", sublabel: "En route & parking access" },
    ENTER: { label: "ENTER", sublabel: "Turnstile QR scanning" },
    EXPERIENCE: { label: "EXPERIENCE", sublabel: "Event sessions & live arena" },
    EXIT: { label: "EXIT", sublabel: "Egress & departure corridor" },
  };

  const timelineStages: EventTimelineStage[] = stageOrder.map((stageId, idx) => {
    let stageStatus: "completed" | "active" | "pending";
    if (idx < currentStageIndex) {
      stageStatus = "completed";
    } else if (idx === currentStageIndex) {
      stageStatus = "active";
    } else {
      stageStatus = "pending";
    }

    return {
      id: stageId,
      label: stageDescriptions[stageId].label,
      sublabel: stageDescriptions[stageId].sublabel,
      status: stageStatus,
    };
  });

  return {
    status,
    days,
    hours,
    minutes,
    seconds,
    timelineStages,
    currentStageId,
  };
}

export type EventTimingMode = "PRE_EVENT" | "EVENT_DAY" | "LIVE" | "COMPLETED";

export interface EventTimingStatus {
  timingMode: EventTimingMode;
  statusBadgeLabel: string;
  countdownText: string;
  hoursRemaining: number;
  totalMsRemaining: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isWithin24Hours: boolean;
  isLive: boolean;
  isCompleted: boolean;
  startDate: Date;
  endDate: Date;
  timelineStages: EventTimelineStage[];
  currentStageId: "PLAN" | "ARRIVE" | "ENTER" | "EXPERIENCE" | "EXIT";
}

/**
 * High-level dynamic timing status calculator for EventFlow Attendee Experience:
 * - PRE_EVENT: > 24 hours before start
 * - EVENT_DAY: <= 24 hours before start
 * - LIVE: Current time is between start and end
 * - COMPLETED: Current time is after end
 */
export function getEventTimingStatus(
  dateStr: string,
  timeStr: string,
  simulatedNow?: Date
): EventTimingStatus {
  const { startDate, endDate } = parseEventDates(dateStr, timeStr);
  const now = (simulatedNow || new Date()).getTime();
  const start = startDate.getTime();
  const end = endDate.getTime();

  const countdown = getEventStatusAndCountdown(startDate, endDate, simulatedNow || new Date());

  let timingMode: EventTimingMode;
  let statusBadgeLabel: string;
  let countdownText: string;
  let hoursRemaining = 0;
  let totalMsRemaining = 0;

  if (now < start) {
    totalMsRemaining = start - now;
    hoursRemaining = totalMsRemaining / (1000 * 3600);

    if (hoursRemaining > 24) {
      timingMode = "PRE_EVENT";
      statusBadgeLabel = "PRE-EVENT";
      countdownText =
        countdown.days === 1
          ? "STARTS IN 1 DAY"
          : `STARTS IN ${countdown.days} DAYS`;
    } else {
      timingMode = "EVENT_DAY";
      statusBadgeLabel = "EVENT DAY MODE";
      const h = countdown.hours;
      const m = countdown.minutes;
      countdownText =
        h > 0
          ? `STARTS IN ${h}H ${m}M`
          : `STARTS IN ${m} MINUTES`;
    }
  } else if (now >= start && now <= end) {
    timingMode = "LIVE";
    statusBadgeLabel = "LIVE NOW";
    countdownText = "LIVE NOW";
  } else {
    timingMode = "COMPLETED";
    statusBadgeLabel = "EVENT COMPLETED";
    countdownText = "EVENT COMPLETED";
  }

  return {
    timingMode,
    statusBadgeLabel,
    countdownText,
    hoursRemaining,
    totalMsRemaining,
    days: countdown.days,
    hours: countdown.hours,
    minutes: countdown.minutes,
    seconds: countdown.seconds,
    isWithin24Hours: timingMode === "EVENT_DAY",
    isLive: timingMode === "LIVE",
    isCompleted: timingMode === "COMPLETED",
    startDate,
    endDate,
    timelineStages: countdown.timelineStages,
    currentStageId: countdown.currentStageId,
  };
}

/**
 * Calculates a recommended arrival time based on the entry window.
 * E.g., if entry window is "08:00 AM - 10:00 AM", recommends "08:30 AM".
 */
export function getRecommendedArrivalTime(entryWindow?: string, eventTime?: string): string {
  if (!entryWindow && !eventTime) return "30 minutes prior to gate opening";

  const targetStr = entryWindow || eventTime || "";
  const match = targetStr.match(/(\d{1,2}:\d{2})\s*(AM|PM|IST)?/i);

  if (match) {
    const [hoursStr, minutesStr] = match[1].split(":");
    const modifier = match[2] ? match[2].toUpperCase() : "";
    let hour = parseInt(hoursStr, 10);
    const min = parseInt(minutesStr, 10);

    // Add 30 mins or adjust for smooth entry
    const newMin = (min + 30) % 60;
    const addedHour = min + 30 >= 60 ? 1 : 0;
    hour = (hour + addedHour);

    const formattedHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const formattedMin = newMin < 10 ? `0${newMin}` : `${newMin}`;
    const period = modifier.includes("PM") || (hour >= 12 && !modifier.includes("AM")) ? "PM" : "AM";

    return `${formattedHour}:${formattedMin} ${period}`;
  }

  return "30 mins before gate ingress";
}
