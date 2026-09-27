/**
 * PredictionService
 * Centralized EventFlow Prediction & Forecasting Engine.
 *
 * Responsibilities:
 * - Collects central live state & time-series observations
 * - Generates features & invokes ForecastingModel abstraction
 * - Forecasts Crowd, Parking, Transport, Hospitality, Accommodation, and Crowd Zones across 15, 30, 60, 120 min horizons
 * - Detects Arrival and Exit/Dispersal waves
 * - Computes Predicted Risk & deduplicated Prediction Alerts
 * - Provides non-black-box mathematical explanations
 */

import { LiveEventService } from "../liveEventService";
import { TelemetryHistoryService } from "../telemetryHistoryService";
import { defaultForecastModel, ForecastingModel } from "./forecastingModel";
import {
  PredictedEventState,
  ResourceForecast,
  ZoneForecast,
  ArrivalWaveForecast,
  ExitWaveForecast,
  PredictionAlert,
  ForecastHorizon,
  PredictionReliability,
} from "../../types/intelligence";
import { calculateUtilizationStatus, CentralUtilizationStatus } from "../../types/operational";

const PREDICTION_ALERTS_STORAGE_KEY = "eventflow_prediction_alerts";

// In-memory active prediction alerts to prevent duplication across ticks
const activePredictionAlerts: Map<string, PredictionAlert> = new Map();

export const PredictionService = {
  /**
   * Generates a comprehensive future forecast for an event across all horizons.
   */
  generateForecast(eventId: string, model: ForecastingModel = defaultForecastModel): PredictedEventState {
    const liveState = LiveEventService.getEventLiveState(eventId);
    const history = TelemetryHistoryService.getHistoricalObservations(eventId, liveState, true);

    const nowIso = new Date().toISOString();
    const horizons: ForecastHorizon[] = [15, 30, 60, 120];
    const n = history.length;

    // Check data sufficiency
    const dataSufficiency = n >= 3 ? "SUFFICIENT" : "INSUFFICIENT_DATA";

    // 1. Crowd Attendance Forecasts across horizons
    const paxHistory = history.map((h) => h.currentAttendees);
    const timestamps = history.map((h) => h.timeMillis);

    const crowd15 = model.forecast(liveState.currentAttendees, paxHistory, timestamps, 15, liveState.venueCapacity, {
      arrivalRate: liveState.crowdState?.entryRate,
      exitRate: liveState.crowdState?.exitRate,
    });
    const crowd30 = model.forecast(liveState.currentAttendees, paxHistory, timestamps, 30, liveState.venueCapacity, {
      arrivalRate: liveState.crowdState?.entryRate,
      exitRate: liveState.crowdState?.exitRate,
    });
    const crowd60 = model.forecast(liveState.currentAttendees, paxHistory, timestamps, 60, liveState.venueCapacity, {
      arrivalRate: liveState.crowdState?.entryRate,
      exitRate: liveState.crowdState?.exitRate,
    });
    const crowd120 = model.forecast(liveState.currentAttendees, paxHistory, timestamps, 120, liveState.venueCapacity, {
      arrivalRate: liveState.crowdState?.entryRate,
      exitRate: liveState.crowdState?.exitRate,
    });

    // 2. Crowd Zones Forecasts
    const zoneForecasts: Record<string, ZoneForecast> = {};
    Object.values(liveState.crowdZones || {}).forEach((z) => {
      const zHistory = history.map((h) => h.zoneCounts[z.id] ?? Math.round(h.currentAttendees * 0.25));
      const z15 = model.forecast(z.currentCount, zHistory, timestamps, 15, z.capacity);
      const z30 = model.forecast(z.currentCount, zHistory, timestamps, 30, z.capacity);
      const z60 = model.forecast(z.currentCount, zHistory, timestamps, 60, z.capacity);
      const z120 = model.forecast(z.currentCount, zHistory, timestamps, 120, z.capacity);

      zoneForecasts[z.id] = {
        zoneId: z.id,
        zoneName: z.name,
        capacity: z.capacity,
        currentCount: z.currentCount,
        currentUtilization: z.utilization,
        predictedCount15m: z15.predictedValue,
        predictedCount30m: z30.predictedValue,
        predictedCount60m: z60.predictedValue,
        predictedCount120m: z120.predictedValue,
        predictedUtilization15m: z15.predictedUtilization,
        predictedUtilization30m: z30.predictedUtilization,
        predictedUtilization60m: z60.predictedUtilization,
        predictedUtilization120m: z120.predictedUtilization,
        predictedStatus: calculateUtilizationStatus(z30.predictedUtilization),
        explanation: z30.explanation,
        reliability: z30.reliability,
      };
    });

    // 3. Parking Forecasts
    const parkingForecasts: Record<string, ResourceForecast> = {};
    Object.values(liveState.parkingResources || {}).forEach((p) => {
      const pHistory = history.map((h) => h.parkingUsage[p.resourceId] ?? Math.round(p.currentUsage * 0.8));
      const p15 = model.forecast(p.currentUsage, pHistory, timestamps, 15, p.capacity);
      const p30 = model.forecast(p.currentUsage, pHistory, timestamps, 30, p.capacity);
      const p60 = model.forecast(p.currentUsage, pHistory, timestamps, 60, p.capacity);
      const p120 = model.forecast(p.currentUsage, pHistory, timestamps, 120, p.capacity);

      parkingForecasts[p.resourceId] = {
        resourceId: p.resourceId,
        resourceName: p.name,
        type: "parking",
        currentUsage: p.currentUsage,
        capacity: p.capacity,
        currentUtilization: p.utilization,
        predictedUsage15m: p15.predictedValue,
        predictedUsage30m: p30.predictedValue,
        predictedUsage60m: p60.predictedValue,
        predictedUsage120m: p120.predictedValue,
        predictedUtilization15m: p15.predictedUtilization,
        predictedUtilization30m: p30.predictedUtilization,
        predictedUtilization60m: p60.predictedUtilization,
        predictedUtilization120m: p120.predictedUtilization,
        predictedStatus: calculateUtilizationStatus(p30.predictedUtilization),
        timeToThresholdMinutes: p30.timeToThresholdMinutes || p60.timeToThresholdMinutes,
        targetThresholdName: p30.targetThreshold ? `${p30.targetThreshold}% Capacity` : undefined,
        explanation: p30.explanation,
        rateOfChange: p30.rateOfChange,
        acceleration: p30.acceleration,
        reliability: p30.reliability,
      };
    });

    // 4. Transport Forecasts
    const transportForecasts: Record<string, ResourceForecast> = {};
    Object.values(liveState.transportResources || {}).forEach((t) => {
      const tHistory = history.map((h) => h.transportUsage[t.resourceId] ?? Math.round(t.currentUsage * 0.75));
      const t15 = model.forecast(t.currentUsage, tHistory, timestamps, 15, t.capacity);
      const t30 = model.forecast(t.currentUsage, tHistory, timestamps, 30, t.capacity);
      const t60 = model.forecast(t.currentUsage, tHistory, timestamps, 60, t.capacity);
      const t120 = model.forecast(t.currentUsage, tHistory, timestamps, 120, t.capacity);

      transportForecasts[t.resourceId] = {
        resourceId: t.resourceId,
        resourceName: t.name,
        type: "transport",
        currentUsage: t.currentUsage,
        capacity: t.capacity,
        currentUtilization: t.utilization,
        predictedUsage15m: t15.predictedValue,
        predictedUsage30m: t30.predictedValue,
        predictedUsage60m: t60.predictedValue,
        predictedUsage120m: t120.predictedValue,
        predictedUtilization15m: t15.predictedUtilization,
        predictedUtilization30m: t30.predictedUtilization,
        predictedUtilization60m: t60.predictedUtilization,
        predictedUtilization120m: t120.predictedUtilization,
        predictedStatus: calculateUtilizationStatus(t30.predictedUtilization),
        timeToThresholdMinutes: t30.timeToThresholdMinutes || t60.timeToThresholdMinutes,
        targetThresholdName: t30.targetThreshold ? `${t30.targetThreshold}% Capacity` : undefined,
        explanation: t30.explanation,
        rateOfChange: t30.rateOfChange,
        acceleration: t30.acceleration,
        reliability: t30.reliability,
      };
    });

    // 5. Hospitality Forecasts
    const hospitalityForecasts: Record<string, ResourceForecast> = {};
    Object.values(liveState.hospitalityResources || {}).forEach((h) => {
      const hHistory = history.map((hist) => hist.hospitalityUsage[h.resourceId] ?? Math.round(h.currentUsage * 0.8));
      const h30 = model.forecast(h.currentUsage, hHistory, timestamps, 30, h.capacity);

      hospitalityForecasts[h.resourceId] = {
        resourceId: h.resourceId,
        resourceName: h.name,
        type: "hospitality",
        currentUsage: h.currentUsage,
        capacity: h.capacity,
        currentUtilization: h.utilization,
        predictedUsage15m: Math.round(h.currentUsage * 1.1),
        predictedUsage30m: h30.predictedValue,
        predictedUsage60m: Math.round(h.currentUsage * 1.3),
        predictedUsage120m: Math.round(h.currentUsage * 1.2),
        predictedUtilization15m: Math.round(h.utilization * 1.1),
        predictedUtilization30m: h30.predictedUtilization,
        predictedUtilization60m: Math.round(h.utilization * 1.3),
        predictedUtilization120m: Math.round(h.utilization * 1.2),
        predictedStatus: calculateUtilizationStatus(h30.predictedUtilization),
        explanation: h30.explanation,
        rateOfChange: h30.rateOfChange,
        acceleration: h30.acceleration,
        reliability: h30.reliability,
      };
    });

    // 6. Accommodation Forecasts
    const accommodationForecasts: Record<string, ResourceForecast> = {};
    Object.values(liveState.accommodationResources || {}).forEach((a) => {
      const aHistory = history.map((hist) => hist.accommodationUsage[a.resourceId] ?? a.currentUsage);
      const a30 = model.forecast(a.currentUsage, aHistory, timestamps, 30, a.capacity);

      accommodationForecasts[a.resourceId] = {
        resourceId: a.resourceId,
        resourceName: a.name,
        type: "accommodation",
        currentUsage: a.currentUsage,
        capacity: a.capacity,
        currentUtilization: a.utilization,
        predictedUsage15m: a.currentUsage,
        predictedUsage30m: a30.predictedValue,
        predictedUsage60m: a30.predictedValue,
        predictedUsage120m: a30.predictedValue,
        predictedUtilization15m: a.utilization,
        predictedUtilization30m: a30.predictedUtilization,
        predictedUtilization60m: a30.predictedUtilization,
        predictedUtilization120m: a30.predictedUtilization,
        predictedStatus: calculateUtilizationStatus(a30.predictedUtilization),
        explanation: a30.explanation,
        rateOfChange: a30.rateOfChange,
        acceleration: a30.acceleration,
        reliability: a30.reliability,
      };
    });

    // 7. Arrival Wave Detection
    const arrivalRate = liveState.crowdState?.entryRate || 0;
    const isWaveDetected = arrivalRate > 50 && crowd30.trend === "INCREASING";
    const arrivalWave: ArrivalWaveForecast = {
      isWaveDetected,
      waveIntensity: arrivalRate > 120 ? "CRITICAL" : arrivalRate > 80 ? "HIGH" : arrivalRate > 50 ? "MODERATE" : "LOW",
      estimatedTimeToPeakMinutes: isWaveDetected ? 25 : 0,
      projectedPeakArrivalRate: Math.round(arrivalRate * 1.4),
      description: isWaveDetected
        ? `High arrival pressure expected within 25 minutes. Ingress velocity +${Math.round(arrivalRate * 1.4)} pax/min.`
        : "Arrival velocity within nominal ingress flow limits.",
      explanation: `Observed gate inflow ${arrivalRate} pax/min with upward velocity (+${crowd30.rateOfChange}/min).`,
    };

    // 8. Exit / Dispersal Wave Detection
    const exitRate = liveState.crowdState?.exitRate || 0;
    const isDispersalWaveDetected = liveState.status === "COMPLETED" || exitRate > 40;
    const exitWave: ExitWaveForecast = {
      isDispersalWaveDetected,
      estimatedTimeToDispersalMinutes: isDispersalWaveDetected ? 15 : 90,
      projectedDispersalDemandPax: Math.round(liveState.currentAttendees * 0.7),
      projectedTransportDemand: isDispersalWaveDetected ? "CRITICAL" : "NORMAL",
      projectedParkingEgressRate: Math.round(exitRate * 0.4),
      description: isDispersalWaveDetected
        ? `Event dispersal in progress. Heavy exit demand projected on transit & parking egress lanes.`
        : "Main event in progress. Dispersal projected near scheduled conclusion.",
      explanation: `Current exit rate ${exitRate} pax/min across venue perimeters.`,
    };

    // Overall crowd pressure calculation
    const overallCrowdPressure = calculateUtilizationStatus(crowd30.predictedUtilization);

    const predictedState: PredictedEventState = {
      eventId,
      generatedAt: nowIso,
      horizons,
      currentAttendees: liveState.currentAttendees,
      predictedAttendees15m: crowd15.predictedValue,
      predictedAttendees30m: crowd30.predictedValue,
      predictedAttendees60m: crowd60.predictedValue,
      predictedAttendees120m: crowd120.predictedValue,
      predictedUtilization15m: crowd15.predictedUtilization,
      predictedUtilization30m: crowd30.predictedUtilization,
      predictedUtilization60m: crowd60.predictedUtilization,
      predictedUtilization120m: crowd120.predictedUtilization,
      predictedArrivalRate: crowd30.rateOfChange > 0 ? Math.round(crowd30.rateOfChange * 1.2) : 0,
      predictedExitRate: liveState.crowdState?.exitRate || 0,
      zoneForecasts,
      parkingForecasts,
      transportForecasts,
      hospitalityForecasts,
      accommodationForecasts,
      overallCrowdPressure,
      arrivalWave,
      exitWave,
      predictionAlerts: [],
      dataSufficiency,
      forecastReliability: crowd30.reliability,
      sampleObservationsCount: n,
      explanation: crowd30.explanation,
    };

    // 9. Evaluate Prediction Alerts & Deduplicate
    predictedState.predictionAlerts = this.evaluatePredictionAlerts(predictedState);

    return predictedState;
  },

  /**
   * Evaluates prediction alerts across thresholds and prevents duplicate alerts every tick.
   */
  evaluatePredictionAlerts(predictedState: PredictedEventState): PredictionAlert[] {
    const alerts: PredictionAlert[] = [];
    const eventId = predictedState.eventId;
    const nowIso = new Date().toISOString();

    // Helper to register / update deduplicated alert
    const registerAlert = (
      ruleKey: string,
      alertData: Omit<PredictionAlert, "predictionId" | "createdAt" | "status" | "ruleKey">
    ) => {
      const existing = activePredictionAlerts.get(ruleKey);
      if (existing && existing.eventId === eventId) {
        // Update existing alert in-place
        existing.predictedUtilization = alertData.predictedUtilization;
        existing.timeUntilPressureMinutes = alertData.timeUntilPressureMinutes;
        existing.severity = alertData.severity;
        existing.title = alertData.title;
        existing.message = alertData.message;
        existing.potentialImpact = alertData.potentialImpact;
        existing.explanation = alertData.explanation;
        existing.status = "ACTIVE";
        alerts.push(existing);
      } else {
        const newAlert: PredictionAlert = {
          ...alertData,
          predictionId: `pred-alt-${eventId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          createdAt: nowIso,
          status: "ACTIVE",
          ruleKey,
        };
        activePredictionAlerts.set(ruleKey, newAlert);
        alerts.push(newAlert);
      }
    };

    // 1. Evaluate Parking Predictions
    Object.values(predictedState.parkingForecasts).forEach((p) => {
      const ruleKey = `pred-rule-parking-${eventId}-${p.resourceId}`;
      if (p.predictedUtilization30m >= 90) {
        registerAlert(ruleKey, {
          eventId,
          resourceId: p.resourceId,
          resourceName: p.resourceName,
          resourceType: "parking",
          severity: "PREDICTED_CRITICAL",
          title: `Parking ${p.resourceName} is projected to reach critical capacity (${p.predictedUtilization30m}%)`,
          message: `At current vehicle arrival rates, ${p.resourceName} is projected to exceed 90% capacity in ~${
            p.timeToThresholdMinutes || 25
          } minutes.`,
          forecastHorizonMinutes: 30,
          predictedUtilization: p.predictedUtilization30m,
          timeUntilPressureMinutes: p.timeToThresholdMinutes || 25,
          potentialImpact: "Inbound private vehicles will face boulevard queues. Overflow lots must be prepared.",
          explanation: p.explanation,
        });
      } else if (p.predictedUtilization30m >= 75) {
        registerAlert(ruleKey, {
          eventId,
          resourceId: p.resourceId,
          resourceName: p.resourceName,
          resourceType: "parking",
          severity: "PREDICTED_WARNING",
          title: `Parking ${p.resourceName} is projected to approach capacity (${p.predictedUtilization30m}%)`,
          message: `${p.resourceName} is filling steadily and projected to reach high utilization in ~30 minutes.`,
          forecastHorizonMinutes: 30,
          predictedUtilization: p.predictedUtilization30m,
          timeUntilPressureMinutes: 30,
          potentialImpact: "Available bay buffer shrinking.",
          explanation: p.explanation,
        });
      } else {
        // Normal -> resolve if previously active
        const existing = activePredictionAlerts.get(ruleKey);
        if (existing) {
          existing.status = "RESOLVED";
        }
      }
    });

    // 2. Evaluate Transport Predictions
    Object.values(predictedState.transportForecasts).forEach((t) => {
      const ruleKey = `pred-rule-trans-${eventId}-${t.resourceId}`;
      if (t.predictedUtilization30m >= 90) {
        registerAlert(ruleKey, {
          eventId,
          resourceId: t.resourceId,
          resourceName: t.resourceName,
          resourceType: "transport",
          severity: "PREDICTED_CRITICAL",
          title: `Transit pressure expected on ${t.resourceName} (${t.predictedUtilization30m}%)`,
          message: `Platform passenger demand projected to exceed throughput capacity within ~30 minutes.`,
          forecastHorizonMinutes: 30,
          predictedUtilization: t.predictedUtilization30m,
          timeUntilPressureMinutes: 30,
          potentialImpact: "Platform crowding and extended wait times for arriving passengers.",
          explanation: t.explanation,
        });
      } else if (t.predictedUtilization30m >= 80) {
        registerAlert(ruleKey, {
          eventId,
          resourceId: t.resourceId,
          resourceName: t.resourceName,
          resourceType: "transport",
          severity: "PREDICTED_ADVISORY",
          title: `Transit demand elevation projected on ${t.resourceName} (${t.predictedUtilization30m}%)`,
          message: `Demand trend indicates growing passenger queues on this corridor in ~30 minutes.`,
          forecastHorizonMinutes: 30,
          predictedUtilization: t.predictedUtilization30m,
          timeUntilPressureMinutes: 30,
          potentialImpact: "Feeder shuttle frequency will require monitoring.",
          explanation: t.explanation,
        });
      }
    });

    // 3. Evaluate Zone Predictions
    Object.values(predictedState.zoneForecasts).forEach((z) => {
      const ruleKey = `pred-rule-zone-${eventId}-${z.zoneId}`;
      if (z.predictedUtilization30m >= 90) {
        registerAlert(ruleKey, {
          eventId,
          resourceId: z.zoneId,
          resourceName: z.zoneName,
          resourceType: "zone",
          severity: "PREDICTED_WARNING",
          title: `High crowd density projected in ${z.zoneName} (${z.predictedUtilization30m}%)`,
          message: `${z.zoneName} is projected to approach physical capacity in ~30 minutes.`,
          forecastHorizonMinutes: 30,
          predictedUtilization: z.predictedUtilization30m,
          timeUntilPressureMinutes: 30,
          potentialImpact: "Ingress turnstiles and internal aisles will slow down.",
          explanation: z.explanation,
        });
      }
    });

    return alerts.slice(0, 10);
  },
};
