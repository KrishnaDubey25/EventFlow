/**
 * TelemetryHistoryService
 * Captures structured time-series observations from the central Live Event State.
 * Provides the historical telemetry foundation for the Prediction & Forecasting Engine.
 */

import { HistoricalTelemetryObservation } from "../types/intelligence";
import { EventOperationalLiveState } from "../types/operational";

const HISTORY_STORAGE_KEY = "eventflow_telemetry_history";
const MAX_HISTORY_POINTS_PER_EVENT = 60; // Keep up to 60 historical slices (e.g. last 1-2 hours)

// In-memory observation cache for performance
const memoryHistory: Record<string, HistoricalTelemetryObservation[]> = {};

/**
 * Loads all historical telemetry collections from storage
 */
export function loadAllTelemetryHistory(): Record<string, HistoricalTelemetryObservation[]> {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load telemetry history from storage:", err);
    return {};
  }
}

/**
 * Persists historical telemetry collections to storage
 */
export function saveTelemetryHistory(history: Record<string, HistoricalTelemetryObservation[]>): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (err) {
    console.error("Failed to persist telemetry history:", err);
  }
}

export const TelemetryHistoryService = {
  /**
   * Records a snapshot observation of the current live event state.
   */
  recordObservation(eventId: string, liveState: EventOperationalLiveState): HistoricalTelemetryObservation {
    const allHistory = loadAllTelemetryHistory();
    const eventHistory = allHistory[eventId] || memoryHistory[eventId] || [];

    const now = new Date();
    const timeMillis = now.getTime();

    // Extract parking usage mapping
    const parkingUsage: Record<string, number> = {};
    const parkingUtilization: Record<string, number> = {};
    Object.values(liveState.parkingResources || {}).forEach((p) => {
      parkingUsage[p.resourceId] = p.currentUsage;
      parkingUtilization[p.resourceId] = p.utilization;
    });

    // Extract transport usage mapping
    const transportUsage: Record<string, number> = {};
    const transportUtilization: Record<string, number> = {};
    Object.values(liveState.transportResources || {}).forEach((t) => {
      transportUsage[t.resourceId] = t.currentUsage;
      transportUtilization[t.resourceId] = t.utilization;
    });

    // Extract hospitality usage mapping
    const hospitalityUsage: Record<string, number> = {};
    Object.values(liveState.hospitalityResources || {}).forEach((h) => {
      hospitalityUsage[h.resourceId] = h.currentUsage;
    });

    // Extract accommodation usage mapping
    const accommodationUsage: Record<string, number> = {};
    Object.values(liveState.accommodationResources || {}).forEach((a) => {
      accommodationUsage[a.resourceId] = a.currentUsage;
    });

    // Extract zone counts mapping
    const zoneCounts: Record<string, number> = {};
    Object.values(liveState.crowdZones || {}).forEach((z) => {
      zoneCounts[z.id] = z.currentCount;
    });

    const newObservation: HistoricalTelemetryObservation = {
      id: `obs-${eventId}-${timeMillis}`,
      timestamp: now.toISOString(),
      timeMillis,
      eventId,
      currentAttendees: liveState.currentAttendees,
      arrivalRate: liveState.crowdState?.entryRate || liveState.telemetry?.arrivalRate || 0,
      exitRate: liveState.crowdState?.exitRate || liveState.telemetry?.exitRate || 0,
      parkingUsage,
      parkingUtilization,
      transportUsage,
      transportUtilization,
      hospitalityUsage,
      accommodationUsage,
      zoneCounts,
      sourceType: liveState.sourceType || "REAL",
    };

    // Avoid recording duplicate identical observations within 1 second
    const last = eventHistory[eventHistory.length - 1];
    if (last && Math.abs(last.timeMillis - timeMillis) < 800) {
      return last;
    }

    const updatedHistory = [...eventHistory, newObservation].slice(-MAX_HISTORY_POINTS_PER_EVENT);
    allHistory[eventId] = updatedHistory;
    memoryHistory[eventId] = updatedHistory;
    saveTelemetryHistory(allHistory);

    return newObservation;
  },

  /**
   * Retrieves historical observations for a specific event.
   * If bootstrapIfEmpty is true and history is empty, generates realistic preceding
   * history slices based on the current live state to enable instant demo evaluation.
   */
  getHistoricalObservations(
    eventId: string,
    fallbackLiveState?: EventOperationalLiveState,
    bootstrapIfEmpty: boolean = true
  ): HistoricalTelemetryObservation[] {
    const allHistory = loadAllTelemetryHistory();
    let history = allHistory[eventId] || memoryHistory[eventId] || [];

    if (history.length === 0 && bootstrapIfEmpty && fallbackLiveState) {
      history = this.bootstrapInitialHistory(eventId, fallbackLiveState);
      allHistory[eventId] = history;
      memoryHistory[eventId] = history;
      saveTelemetryHistory(allHistory);
    }

    return history;
  },

  /**
   * Bootstraps 6 realistic preceding telemetry slices based on current arrival rate.
   */
  bootstrapInitialHistory(
    eventId: string,
    liveState: EventOperationalLiveState
  ): HistoricalTelemetryObservation[] {
    const points: HistoricalTelemetryObservation[] = [];
    const now = Date.now();
    const currentPax = liveState.currentAttendees;
    const arrivalRate = liveState.crowdState?.entryRate || 60;
    const intervalsMinutes = [25, 20, 15, 10, 5, 0];

    intervalsMinutes.forEach((minsAgo, idx) => {
      const timeMillis = now - minsAgo * 60 * 1000;
      // Compute preceding attendees based on arrival rate
      const paxDelta = Math.round(arrivalRate * minsAgo * 0.85);
      const pax = Math.max(0, currentPax - paxDelta);

      const parkingUsage: Record<string, number> = {};
      const parkingUtilization: Record<string, number> = {};
      Object.values(liveState.parkingResources || {}).forEach((p) => {
        const parkDelta = Math.round(minsAgo * 8);
        const used = Math.max(0, p.currentUsage - parkDelta);
        parkingUsage[p.resourceId] = used;
        parkingUtilization[p.resourceId] = p.capacity > 0 ? Math.round((used / p.capacity) * 100) : 0;
      });

      const transportUsage: Record<string, number> = {};
      const transportUtilization: Record<string, number> = {};
      Object.values(liveState.transportResources || {}).forEach((t) => {
        const transDelta = Math.round(minsAgo * 10);
        const used = Math.max(0, t.currentUsage - transDelta);
        transportUsage[t.resourceId] = used;
        transportUtilization[t.resourceId] = t.capacity > 0 ? Math.round((used / t.capacity) * 100) : 0;
      });

      const hospitalityUsage: Record<string, number> = {};
      Object.values(liveState.hospitalityResources || {}).forEach((h) => {
        hospitalityUsage[h.resourceId] = Math.max(0, h.currentUsage - Math.round(minsAgo * 4));
      });

      const accommodationUsage: Record<string, number> = {};
      Object.values(liveState.accommodationResources || {}).forEach((a) => {
        accommodationUsage[a.resourceId] = Math.max(0, a.currentUsage - Math.round(minsAgo * 1));
      });

      const zoneCounts: Record<string, number> = {};
      Object.values(liveState.crowdZones || {}).forEach((z) => {
        const ratio = liveState.venueCapacity > 0 ? z.capacity / liveState.venueCapacity : 0.25;
        zoneCounts[z.id] = Math.round(pax * ratio);
      });

      points.push({
        id: `obs-${eventId}-${timeMillis}`,
        timestamp: new Date(timeMillis).toISOString(),
        timeMillis,
        eventId,
        currentAttendees: pax,
        arrivalRate: Math.max(10, arrivalRate - Math.round(minsAgo * 1.5)),
        exitRate: liveState.crowdState?.exitRate || 0,
        parkingUsage,
        parkingUtilization,
        transportUsage,
        transportUtilization,
        hospitalityUsage,
        accommodationUsage,
        zoneCounts,
        sourceType: liveState.sourceType || "REAL",
      });
    });

    return points;
  },

  /**
   * Clears telemetry history for an event (e.g. during reset)
   */
  clearHistoryForEvent(eventId: string): void {
    const allHistory = loadAllTelemetryHistory();
    delete allHistory[eventId];
    delete memoryHistory[eventId];
    saveTelemetryHistory(allHistory);
  },
};
