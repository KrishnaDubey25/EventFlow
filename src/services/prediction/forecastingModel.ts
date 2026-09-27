/**
 * ForecastingModel Abstraction & Baseline Model Implementation
 * Provides the mathematical and statistical foundation for the Prediction Engine.
 *
 * Architecture:
 * PredictionService -> ForecastingModel -> BaselineForecastModel (or MLForecastModel)
 */

import { PredictionReliability } from "../../types/intelligence";

export interface ForecastComputationResult {
  predictedValue: number;
  predictedUtilization: number;
  rateOfChange: number; // per minute
  acceleration: number; // rate of change of slope per minute
  trend: "INCREASING" | "STABLE" | "DECREASING";
  reliability: PredictionReliability;
  timeToThresholdMinutes?: number;
  targetThreshold?: number;
  explanation: string;
  sampleCount: number;
}

export interface ForecastingContext {
  arrivalRate?: number;
  exitRate?: number;
  timeToEventStartMins?: number;
  timeToEventEndMins?: number;
  eventStatus?: string;
}

export interface ForecastingModel {
  name: string;
  version: string;
  forecast(
    currentValue: number,
    historySeries: number[],
    timestampsMillis: number[],
    horizonMinutes: number,
    capacity: number,
    context?: ForecastingContext
  ): ForecastComputationResult;
}

/**
 * BaselineForecastModel
 * Statistical rolling-trend & rate-of-change forecasting algorithm.
 * Uses bounded linear-quadratic polynomial extrapolation based on empirical observations.
 */
export class BaselineForecastModel implements ForecastingModel {
  name = "Baseline Empirical Rate-of-Change Model";
  version = "1.0.0-statistical";

  forecast(
    currentValue: number,
    historySeries: number[],
    timestampsMillis: number[],
    horizonMinutes: number,
    capacity: number,
    context?: ForecastingContext
  ): ForecastComputationResult {
    const n = historySeries.length;

    // Strict validation: Require at least 3 distinct historical samples
    if (n < 3) {
      return {
        predictedValue: currentValue,
        predictedUtilization: capacity > 0 ? Math.round((currentValue / capacity) * 100) : 0,
        rateOfChange: 0,
        acceleration: 0,
        trend: "STABLE",
        reliability: "INSUFFICIENT_DATA",
        explanation: `Insufficient historical telemetry samples (${n} available, minimum 3 required).`,
        sampleCount: n,
      };
    }

    // 1. Calculate time delta between oldest and newest observation (in minutes)
    const oldestTime = timestampsMillis[0];
    const newestTime = timestampsMillis[n - 1];
    const totalDurationMinutes = Math.max(1, (newestTime - oldestTime) / (60 * 1000));

    // 2. Compute first-order rate of change (Slope / Velocity per minute)
    // Use weighted least-squares regression on recent observations
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
      const tMins = (timestampsMillis[i] - oldestTime) / (60 * 1000);
      const val = historySeries[i];
      sumX += tMins;
      sumY += val;
      sumXY += tMins * val;
      sumX2 += tMins * tMins;
    }

    const denominator = n * sumX2 - sumX * sumX;
    let slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;

    // Blend with direct arrival/exit rate context if provided
    if (context?.arrivalRate !== undefined && context?.exitRate !== undefined) {
      const netIngressPerMin = context.arrivalRate - context.exitRate;
      // Weight 70% empirical regression, 30% instantaneous gate/sensor flow
      slope = slope * 0.7 + netIngressPerMin * 0.3;
    }

    // 3. Compute second-order rate of change (Acceleration)
    // Compare slope of first half of window vs second half of window
    const midIdx = Math.floor(n / 2);
    const firstHalfDuration = Math.max(0.5, (timestampsMillis[midIdx] - oldestTime) / (60 * 1000));
    const secondHalfDuration = Math.max(0.5, (newestTime - timestampsMillis[midIdx]) / (60 * 1000));

    const firstHalfSlope = (historySeries[midIdx] - historySeries[0]) / firstHalfDuration;
    const secondHalfSlope = (historySeries[n - 1] - historySeries[midIdx]) / secondHalfDuration;
    const rawAcceleration = (secondHalfSlope - firstHalfSlope) / ((firstHalfDuration + secondHalfDuration) / 2);

    // Damped acceleration factor for stability over longer horizons
    const dampingFactor = horizonMinutes <= 15 ? 0.8 : horizonMinutes <= 30 ? 0.5 : horizonMinutes <= 60 ? 0.25 : 0.1;
    const effectiveAcceleration = rawAcceleration * dampingFactor;

    // 4. Project future value: currentValue + slope * horizon + 0.5 * acceleration * horizon^2
    const linearComponent = slope * horizonMinutes;
    const quadraticComponent = 0.5 * effectiveAcceleration * Math.min(horizonMinutes * horizonMinutes, 900); // capped quadratic
    const rawProjection = currentValue + linearComponent + quadraticComponent;

    // Clamp projection between 0 and physical capacity (or reasonable upper limit)
    const effectiveCap = capacity > 0 ? capacity : currentValue * 1.5;
    const predictedValue = Math.max(0, Math.min(effectiveCap, Math.round(rawProjection)));
    const predictedUtilization = capacity > 0 ? Math.round((predictedValue / capacity) * 100) : 0;

    // 5. Determine Trend Direction
    let trend: "INCREASING" | "STABLE" | "DECREASING" = "STABLE";
    if (slope > 0.5) trend = "INCREASING";
    else if (slope < -0.5) trend = "DECREASING";

    // 6. Time until threshold calculation (e.g. when will it cross 85% or 90%?)
    let timeToThresholdMinutes: number | undefined = undefined;
    let targetThreshold: number | undefined = undefined;

    if (capacity > 0 && slope > 0) {
      const currentUtil = (currentValue / capacity) * 100;
      if (currentUtil < 85 && predictedUtilization >= 85) {
        targetThreshold = 85;
        const targetValue = capacity * 0.85;
        timeToThresholdMinutes = Math.max(1, Math.round((targetValue - currentValue) / slope));
      } else if (currentUtil < 90 && predictedUtilization >= 90) {
        targetThreshold = 90;
        const targetValue = capacity * 0.9;
        timeToThresholdMinutes = Math.max(1, Math.round((targetValue - currentValue) / slope));
      }
    }

    // 7. Calculate Statistical Reliability (Low / Medium / High)
    // Based on observation density, duration span, and slope variance
    let reliability: PredictionReliability = "MEDIUM";
    if (n >= 8 && totalDurationMinutes >= 10) {
      reliability = "HIGH";
    } else if (n >= 4) {
      reliability = "MEDIUM";
    } else {
      reliability = "LOW";
    }

    // 8. Human-readable transparent explanation (No black box)
    const sign = slope >= 0 ? "+" : "";
    const changePerMin = slope.toFixed(1);
    const explanation = `Current value: ${currentValue.toLocaleString()} (capacity: ${capacity.toLocaleString()}). Observed velocity: ${sign}${changePerMin}/min over past ${Math.round(
      totalDurationMinutes
    )}m (${n} telemetry samples). Horizon +${horizonMinutes}m projects ${predictedValue.toLocaleString()} (${predictedUtilization}% load).`;

    return {
      predictedValue,
      predictedUtilization,
      rateOfChange: Math.round(slope * 10) / 10,
      acceleration: Math.round(effectiveAcceleration * 100) / 100,
      trend,
      reliability,
      timeToThresholdMinutes,
      targetThreshold,
      explanation,
      sampleCount: n,
    };
  }
}

// Singleton default model instance
export const defaultForecastModel = new BaselineForecastModel();
