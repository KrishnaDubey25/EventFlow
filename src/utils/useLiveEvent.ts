import { useState, useEffect, useCallback, useMemo } from "react";
import { LiveEventService } from "../services/liveEventService";
import { LiveSimulationService } from "../services/liveSimulationService";
import { PredictionService } from "../services/prediction/predictionService";
import { EventOperationalLiveState } from "../types/operational";
import { PredictedEventState } from "../types/intelligence";
import { AppEvent } from "../types/event";

export function useLiveEvent(eventId?: string, fallbackEvent?: AppEvent) {
  const [liveState, setLiveState] = useState<EventOperationalLiveState | null>(() => {
    if (!eventId) return null;
    try {
      return LiveEventService.getEventLiveState(eventId, fallbackEvent);
    } catch {
      return null;
    }
  });

  const [isStale, setIsStale] = useState<boolean>(false);
  const [clockInfo, setClockInfo] = useState<{ label: string; timeString: string; isLive: boolean }>({
    label: "EVENT STARTS IN",
    timeString: "00:00:00",
    isLive: false,
  });

  useEffect(() => {
    if (!eventId) {
      setLiveState(null);
      return;
    }

    // Subscribe to LiveEventService centralized engine
    const unsubscribe = LiveEventService.subscribe(eventId, (updatedState) => {
      setLiveState({ ...updatedState });
    });

    return () => {
      unsubscribe();
    };
  }, [eventId]);

  // Compute prediction state whenever liveState updates
  const predictedState = useMemo<PredictedEventState | null>(() => {
    if (!eventId || !liveState) return null;
    try {
      return PredictionService.generateForecast(eventId);
    } catch {
      return null;
    }
  }, [eventId, liveState]);

  // Clock ticker and stale detector
  useEffect(() => {
    if (!liveState) return;

    const tick = () => {
      // Check stale fail-safe
      const stale = LiveEventService.isDataStale(liveState.lastUpdated);
      setIsStale(stale);

      // Update central event clock
      const targetDate = fallbackEvent?.date || new Date().toISOString().split("T")[0];
      const targetTime = fallbackEvent?.time || "18:00";
      const clock = LiveEventService.getEventClockDisplay(
        targetDate,
        targetTime,
        liveState.liveStartedAt,
        liveState.status
      );
      setClockInfo(clock);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [liveState, fallbackEvent?.date, fallbackEvent?.time]);

  const startEvent = useCallback(
    (user: string = "Organizer") => {
      if (!eventId) return;
      const next = LiveEventService.startEvent(eventId, user);
      setLiveState({ ...next });
    },
    [eventId]
  );

  const pauseEvent = useCallback(
    (user: string = "Organizer") => {
      if (!eventId) return;
      const next = LiveEventService.pauseEvent(eventId, user);
      setLiveState({ ...next });
    },
    [eventId]
  );

  const completeEvent = useCallback(
    (user: string = "Organizer") => {
      if (!eventId) return;
      const next = LiveEventService.completeEvent(eventId, user);
      setLiveState({ ...next });
    },
    [eventId]
  );

  const startSimulation = useCallback(
    (customConfig?: any) => {
      if (!eventId) return;
      LiveSimulationService.startSimulation(eventId, customConfig);
    },
    [eventId]
  );

  const pauseSimulation = useCallback(() => {
    if (!eventId) return;
    LiveSimulationService.pauseSimulation(eventId);
  }, [eventId]);

  const resetSimulation = useCallback(() => {
    if (!eventId) return;
    const restored = LiveSimulationService.resetSimulation(eventId);
    setLiveState({ ...restored });
  }, [eventId]);

  const increaseArrivalRate = useCallback(
    (delta: number = 80) => {
      if (!eventId) return;
      LiveSimulationService.increaseArrivalRate(eventId, delta);
    },
    [eventId]
  );

  const increaseParkingDemand = useCallback(
    (delta: number = 40) => {
      if (!eventId) return;
      LiveSimulationService.increaseParkingDemand(eventId, delta);
    },
    [eventId]
  );

  const increaseTransportDemand = useCallback(
    (delta: number = 40) => {
      if (!eventId) return;
      LiveSimulationService.increaseTransportDemand(eventId, delta);
    },
    [eventId]
  );

  const triggerCrowdSurge = useCallback(() => {
    if (!eventId) return;
    LiveSimulationService.triggerCrowdSurge(eventId);
  }, [eventId]);

  const triggerParkingPressure = useCallback(() => {
    if (!eventId) return;
    LiveSimulationService.triggerParkingPressure(eventId);
  }, [eventId]);

  const triggerTransportPressure = useCallback(() => {
    if (!eventId) return;
    LiveSimulationService.triggerTransportPressure(eventId);
  }, [eventId]);

  const triggerEventDispersal = useCallback(() => {
    if (!eventId) return;
    LiveSimulationService.triggerEventDispersal(eventId);
  }, [eventId]);

  const setPhase14TestStage = useCallback(
    (stage: 0 | 1 | 2 | 3) => {
      if (!eventId) return;
      LiveSimulationService.setPhase14TestStage(eventId, stage);
    },
    [eventId]
  );

  const runPhase16Workflow = useCallback(() => {
    if (!eventId) return;
    LiveSimulationService.runPhase16Workflow(eventId);
  }, [eventId]);

  return {
    liveState,
    predictedState,
    isStale,
    clockInfo,
    isSimulating: eventId ? LiveSimulationService.isSimulating(eventId) : false,
    startEvent,
    pauseEvent,
    completeEvent,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    increaseArrivalRate,
    increaseParkingDemand,
    increaseTransportDemand,
    triggerCrowdSurge,
    triggerParkingPressure,
    triggerTransportPressure,
    triggerEventDispersal,
    setPhase14TestStage,
    runPhase16Workflow,
  };
}
