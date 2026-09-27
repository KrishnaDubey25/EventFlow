import { useState, useEffect, useCallback } from "react";
import { PredictionService } from "../services/prediction/predictionService";
import { PredictedEventState, ForecastHorizon } from "../types/intelligence";

export function useEventPrediction(eventId?: string) {
  const [predictedState, setPredictedState] = useState<PredictedEventState | null>(() => {
    if (!eventId) return null;
    try {
      return PredictionService.generateForecast(eventId);
    } catch {
      return null;
    }
  });

  const [selectedHorizon, setSelectedHorizon] = useState<ForecastHorizon>(30);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshForecast = useCallback(() => {
    if (!eventId) return;
    try {
      const forecast = PredictionService.generateForecast(eventId);
      setPredictedState(forecast);
    } catch (err) {
      console.error("Error refreshing forecast:", err);
    }
  }, [eventId]);

  useEffect(() => {
    if (!eventId) {
      setPredictedState(null);
      return;
    }

    refreshForecast();

    // Re-evaluate predictions on live state updates
    const handleLiveUpdate = (e: Event) => {
      const customEvt = e as CustomEvent<{ eventId: string }>;
      if (!customEvt.detail?.eventId || customEvt.detail.eventId === eventId) {
        refreshForecast();
      }
    };

    window.addEventListener("eventflow_live_state_updated", handleLiveUpdate);
    window.addEventListener("storage", handleLiveUpdate);

    return () => {
      window.removeEventListener("eventflow_live_state_updated", handleLiveUpdate);
      window.removeEventListener("storage", handleLiveUpdate);
    };
  }, [eventId, refreshForecast]);

  return {
    predictedState,
    selectedHorizon,
    setSelectedHorizon,
    refreshForecast,
    isLoading,
  };
}
