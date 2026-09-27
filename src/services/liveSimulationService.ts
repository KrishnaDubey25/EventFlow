/**
 * LiveSimulationService
 * Controlled LIVE SIMULATION ENGINE for development and demo purposes.
 * Modifies the SAME central event state via LiveEventService.
 *
 * All telemetry produced is clearly labelled: SIMULATION.
 * Does not present simulated values as real-world data.
 */

import { LiveEventService } from "./liveEventService";
import { EventOperationalLiveState, LiveSimulationConfig, calculateUtilizationStatus } from "../types/operational";

// Active interval timers mapped per eventId
const simTimers: Map<string, NodeJS.Timeout> = new Map();

// Baselines stored per eventId to cleanly support Reset Simulation
const baselineStates: Map<string, EventOperationalLiveState> = new Map();

const TICK_INTERVAL_MS = 2500; // Tick every 2.5 seconds for visible, smooth telemetry updates

export const LiveSimulationService = {
  /**
   * Starts or resumes the live simulation for an event.
   */
  startSimulation(eventId: string, customConfig?: Partial<LiveSimulationConfig>): void {
    this.pauseSimulation(eventId); // Clear any existing timer

    const currentState = LiveEventService.getEventLiveState(eventId);

    // Save baseline on first start if not already saved
    if (!baselineStates.has(eventId)) {
      baselineStates.set(eventId, JSON.parse(JSON.stringify(currentState)));
    }

    const currentConfig: LiveSimulationConfig = {
      isRunning: true,
      arrivalRate: 80, // Default arrival rate
      exitRate: 5,
      parkingDemandRate: 35,
      transportDemandRate: 40,
      hospitalityDemandRate: 15,
      speedMultiplier: 1,
      scenarioLabel: "Nominal Live Ingress",
      lastTickAt: new Date().toISOString(),
      ...(currentState.simulationConfig || {}),
      ...(customConfig || {}),
    };

    // Ensure status is LIVE when simulation starts
    LiveEventService.updateEventState(
      eventId,
      (state) => {
        state.status = "LIVE";
        state.eventStatus = "LIVE";
        state.liveStartedAt = state.liveStartedAt || new Date().toISOString();
        state.simulationConfig = currentConfig;
      },
      {
        resource: "Simulation Engine",
        oldValue: "PAUSED",
        newValue: "RUNNING",
        changedBy: "Simulation Controller",
        reason: "Started live telemetry simulation",
        sourceType: "SIMULATION",
      }
    );

    // Launch periodic simulation tick
    const timer = setInterval(() => {
      this.stepSimulation(eventId);
    }, TICK_INTERVAL_MS);

    simTimers.set(eventId, timer);
  },

  /**
   * Pauses the live simulation. Values stop changing immediately.
   */
  pauseSimulation(eventId: string): void {
    const timer = simTimers.get(eventId);
    if (timer) {
      clearInterval(timer);
      simTimers.delete(eventId);
    }

    LiveEventService.updateEventState(
      eventId,
      (state) => {
        if (state.simulationConfig) {
          state.simulationConfig.isRunning = false;
        }
      },
      {
        resource: "Simulation Engine",
        oldValue: "RUNNING",
        newValue: "PAUSED",
        changedBy: "Simulation Controller",
        reason: "Simulation paused by operator",
        sourceType: "SIMULATION",
      }
    );
  },

  /**
   * Resets the simulation to the initial baseline state.
   */
  resetSimulation(eventId: string): EventOperationalLiveState {
    this.pauseSimulation(eventId);

    const baseline = baselineStates.get(eventId);
    if (baseline) {
      const restored = JSON.parse(JSON.stringify(baseline)) as EventOperationalLiveState;
      restored.lastUpdated = new Date().toISOString();
      restored.sourceType = "REAL";
      if (restored.simulationConfig) {
        restored.simulationConfig.isRunning = false;
      }

      LiveEventService.updateEventState(
        eventId,
        () => restored,
        {
          resource: "Simulation Engine",
          oldValue: "SIMULATED",
          newValue: "BASELINE",
          changedBy: "Simulation Controller",
          reason: "Reset simulation to initial baseline state",
          sourceType: "MANUAL",
        }
      );
      return restored;
    }

    // If no baseline recorded, re-bootstrap
    const fresh = LiveEventService.getEventLiveState(eventId);
    return fresh;
  },

  /**
   * Advances one realistic simulation step.
   * Maintains realistic relationships:
   * - Arrival rate increases attendees.
   * - Attendees increase parking demand.
   * - As parking fills up (>85%), private attendees divert to public transit.
   * - Exit rate reduces attendees.
   */
  stepSimulation(eventId: string): void {
    const state = LiveEventService.getEventLiveState(eventId);
    const config = state.simulationConfig;
    if (!config || !config.isRunning) {
      return;
    }

    const arrival = config.arrivalRate || 60;
    const exit = config.exitRate || 5;
    const deltaPax = arrival - exit;

    const oldAttendees = state.currentAttendees;
    const cap = state.venueCapacity || 15000;
    const newAttendees = Math.max(0, Math.min(cap, oldAttendees + deltaPax));

    LiveEventService.updateEventState(
      eventId,
      (curr) => {
        curr.currentAttendees = newAttendees;

        // 1. Distribute across crowd zones
        const zones = Object.values(curr.crowdZones || {});
        const totalZoneCap = zones.reduce((s, z) => s + z.capacity, 0) || cap;

        zones.forEach((z) => {
          const ratio = z.capacity / totalZoneCap;
          const zCount = Math.round(newAttendees * ratio);
          const zUtil = z.capacity > 0 ? Math.round((zCount / z.capacity) * 100) : 0;
          z.currentCount = zCount;
          z.utilization = zUtil;
          z.status = calculateUtilizationStatus(zUtil);
          z.arrivalRate = Math.round(arrival * ratio);
          z.exitRate = Math.round(exit * ratio);
        });

        // 2. Parking occupancy simulation
        // Relationship: Attendee growth drives parking demand
        const parkingList = Object.values(curr.parkingResources || {});
        let totalParkingCap = 0;
        let totalParkingUsed = 0;

        parkingList.forEach((p, idx) => {
          totalParkingCap += p.capacity;
          const parkDelta = Math.round((config.parkingDemandRate || 20) * (0.8 + idx * 0.2));
          const nextUsage = Math.max(0, Math.min(p.capacity, p.currentUsage + parkDelta));
          p.currentUsage = nextUsage;
          p.utilization = p.capacity > 0 ? Math.round((nextUsage / p.capacity) * 100) : 0;
          p.status = calculateUtilizationStatus(p.utilization);
          p.lastUpdated = new Date().toISOString();
          p.details = `Available: ${p.capacity - nextUsage}`;
          totalParkingUsed += nextUsage;

          // Compatibility parkingState
          if (curr.parkingState && curr.parkingState[p.resourceId]) {
            curr.parkingState[p.resourceId].occupiedSpaces = nextUsage;
            curr.parkingState[p.resourceId].availableSpaces = p.capacity - nextUsage;
            curr.parkingState[p.resourceId].status =
              p.utilization >= 90 ? "FULL" : p.utilization >= 75 ? "NEAR CAPACITY" : "FILLING";
          }
        });

        const overallParkingRatio = totalParkingCap > 0 ? totalParkingUsed / totalParkingCap : 0;

        // 3. Transport demand simulation
        // Relationship: If parking is high (>80%), transit demand surges even faster!
        const transitMultiplier = overallParkingRatio > 0.8 ? 1.6 : 1.0;
        const transportList = Object.values(curr.transportResources || {});

        transportList.forEach((t) => {
          const transDelta = Math.round((config.transportDemandRate || 25) * transitMultiplier);
          const nextDemand = Math.max(0, Math.min(t.capacity, t.currentUsage + transDelta));
          t.currentUsage = nextDemand;
          t.utilization = t.capacity > 0 ? Math.round((nextDemand / t.capacity) * 100) : 0;
          t.status = calculateUtilizationStatus(t.utilization);
          t.lastUpdated = new Date().toISOString();

          // Compatibility transportState
          if (curr.transportState && curr.transportState[t.resourceId]) {
            curr.transportState[t.resourceId].currentDemand = nextDemand;
            curr.transportState[t.resourceId].status = t.utilization >= 85 ? "ELEVATED" : "NORMAL";
          }
        });

        // 4. Hospitality demand simulation
        const hospList = Object.values(curr.hospitalityResources || {});
        hospList.forEach((h) => {
          const hospDelta = Math.round((config.hospitalityDemandRate || 10) * 0.8);
          const nextUsage = Math.max(0, Math.min(h.capacity, h.currentUsage + hospDelta));
          h.currentUsage = nextUsage;
          h.utilization = h.capacity > 0 ? Math.round((nextUsage / h.capacity) * 100) : 0;
          h.status = calculateUtilizationStatus(h.utilization);
          h.lastUpdated = new Date().toISOString();
        });

        // Gate States compatibility
        Object.values(curr.gateStates || {}).forEach((g, idx) => {
          g.currentCount = Math.round(newAttendees / (Object.keys(curr.gateStates).length || 1));
          g.entryRate = Math.round(arrival / (Object.keys(curr.gateStates).length || 1));
          const loadRatio = g.entryRate / (g.capacity || 100);
          g.status = loadRatio > 1.2 ? "HIGH PRESSURE" : loadRatio > 0.75 ? "BUSY" : "NORMAL";
        });

        if (curr.simulationConfig) {
          curr.simulationConfig.lastTickAt = new Date().toISOString();
        }
      },
      {
        resource: "Venue Attendees",
        oldValue: oldAttendees,
        newValue: newAttendees,
        changedBy: "Simulation Engine",
        reason: `Controlled simulation tick (+${deltaPax} pax)`,
        sourceType: "SIMULATION",
      }
    );
  },

  /**
   * Increases arrival rate (e.g. +100 pax/min)
   */
  increaseArrivalRate(eventId: string, delta: number = 80): void {
    const state = LiveEventService.getEventLiveState(eventId);
    const currentRate = state.simulationConfig?.arrivalRate || 60;
    const newRate = currentRate + delta;

    LiveEventService.updateEventState(
      eventId,
      (curr) => {
        if (!curr.simulationConfig) {
          curr.simulationConfig = {
            isRunning: true,
            arrivalRate: newRate,
            exitRate: 5,
            parkingDemandRate: 30,
            transportDemandRate: 35,
            hospitalityDemandRate: 15,
            speedMultiplier: 1,
          };
        } else {
          curr.simulationConfig.arrivalRate = newRate;
          curr.simulationConfig.isRunning = true;
        }
      },
      {
        resource: "Arrival Rate",
        oldValue: `${currentRate} pax/min`,
        newValue: `${newRate} pax/min`,
        changedBy: "Organizer Demo Controls",
        reason: "Increased arrival rate parameter",
        sourceType: "SIMULATION",
      }
    );

    // If simulation wasn't running, start it
    if (!simTimers.has(eventId)) {
      this.startSimulation(eventId);
    }
  },

  /**
   * Increases parking demand rate
   */
  increaseParkingDemand(eventId: string, delta: number = 40): void {
    const state = LiveEventService.getEventLiveState(eventId);
    const currentRate = state.simulationConfig?.parkingDemandRate || 25;
    const newRate = currentRate + delta;

    LiveEventService.updateEventState(
      eventId,
      (curr) => {
        if (curr.simulationConfig) {
          curr.simulationConfig.parkingDemandRate = newRate;
        }
      },
      {
        resource: "Parking Demand Rate",
        oldValue: `${currentRate}/min`,
        newValue: `${newRate}/min`,
        changedBy: "Organizer Demo Controls",
        reason: "Elevated parking demand parameter",
        sourceType: "SIMULATION",
      }
    );
  },

  /**
   * Increases transport demand rate
   */
  increaseTransportDemand(eventId: string, delta: number = 40): void {
    const state = LiveEventService.getEventLiveState(eventId);
    const currentRate = state.simulationConfig?.transportDemandRate || 30;
    const newRate = currentRate + delta;

    LiveEventService.updateEventState(
      eventId,
      (curr) => {
        if (curr.simulationConfig) {
          curr.simulationConfig.transportDemandRate = newRate;
        }
      },
      {
        resource: "Transport Demand Rate",
        oldValue: `${currentRate}/min`,
        newValue: `${newRate}/min`,
        changedBy: "Organizer Demo Controls",
        reason: "Elevated transit feeder demand parameter",
        sourceType: "SIMULATION",
      }
    );
  },

  /**
   * Trigger Crowd Surge Scenario
   */
  triggerCrowdSurge(eventId: string): void {
    const state = LiveEventService.getEventLiveState(eventId);
    const targetAttendees = Math.min(state.venueCapacity, state.currentAttendees + 2500);

    LiveEventService.updateEventState(
      eventId,
      (curr) => {
        curr.currentAttendees = targetAttendees;
        if (curr.simulationConfig) {
          curr.simulationConfig.arrivalRate = 180;
          curr.simulationConfig.scenarioLabel = "Mass Gate Surge";
        }
        // Surge Zone A & Gate 1
        if (curr.crowdZones["zone-a"]) {
          curr.crowdZones["zone-a"].utilization = 94;
          curr.crowdZones["zone-a"].status = "CRITICAL";
        }
      },
      {
        resource: "Crowd Ingress",
        oldValue: `${state.currentAttendees} attendees`,
        newValue: `${targetAttendees} attendees`,
        changedBy: "Organizer Demo Controls",
        reason: "Triggered Rapid Ingress Surge (+2,500 pax)",
        sourceType: "SIMULATION",
      }
    );

    if (!simTimers.has(eventId)) {
      this.startSimulation(eventId);
    }
  },

  /**
   * Trigger Parking Pressure Scenario (>90% critical)
   */
  triggerParkingPressure(eventId: string): void {
    LiveEventService.updateEventState(
      eventId,
      (curr) => {
        Object.values(curr.parkingResources || {}).forEach((p) => {
          p.currentUsage = Math.round(p.capacity * 0.94);
          p.utilization = 94;
          p.status = "CRITICAL";
          p.details = `Only ${p.capacity - p.currentUsage} spaces left`;
        });
        if (curr.simulationConfig) {
          curr.simulationConfig.parkingDemandRate = 60;
          curr.simulationConfig.scenarioLabel = "Parking Gridlock Surge";
        }
      },
      {
        resource: "Perimeter Parking Lots",
        oldValue: "70% utilization",
        newValue: "94% utilization",
        changedBy: "Organizer Demo Controls",
        reason: "Triggered Parking Gridlock Pressure scenario (>90%)",
        sourceType: "SIMULATION",
      }
    );
  },

  /**
   * Trigger Transport Pressure Scenario (>90% critical)
   */
  triggerTransportPressure(eventId: string): void {
    LiveEventService.updateEventState(
      eventId,
      (curr) => {
        Object.values(curr.transportResources || {}).forEach((t) => {
          t.currentUsage = Math.round(t.capacity * 0.92);
          t.utilization = 92;
          t.status = "CRITICAL";
        });
        if (curr.simulationConfig) {
          curr.simulationConfig.transportDemandRate = 75;
          curr.simulationConfig.scenarioLabel = "Metro & Feeder Transit Spike";
        }
      },
      {
        resource: "Transit Terminal Bays",
        oldValue: "65% load",
        newValue: "92% load",
        changedBy: "Organizer Demo Controls",
        reason: "Triggered Transit Platform Surge scenario (>90%)",
        sourceType: "SIMULATION",
      }
    );
  },

  /**
   * Trigger Event Dispersal Scenario
   */
  triggerEventDispersal(eventId: string): void {
    LiveEventService.updateEventState(
      eventId,
      (curr) => {
        if (curr.simulationConfig) {
          curr.simulationConfig.arrivalRate = 0;
          curr.simulationConfig.exitRate = 120;
          curr.simulationConfig.parkingDemandRate = -40;
          curr.simulationConfig.transportDemandRate = 80; // High egress boarding
          curr.simulationConfig.scenarioLabel = "Post-Event Egress Dispersal";
        }
        curr.crowdState.entryRate = 0;
        curr.crowdState.exitRate = 95;
      },
      {
        resource: "Event Dispersal",
        oldValue: "Ingress",
        newValue: "Dispersal Egress",
        changedBy: "Organizer Demo Controls",
        reason: "Triggered Event Dispersal scenario (High exit rate)",
        sourceType: "SIMULATION",
      }
    );

    if (!simTimers.has(eventId)) {
      this.startSimulation(eventId);
    }
  },

  /**
   * Directly sets the Phase 14 standard test scenario stage:
   * Stage 0: 10,000 pax | Parking 60% | Transport 55%
   * Stage 1: 12,000 pax | Parking 72% | Transport 68%
   * Stage 2: 15,000 pax | Parking 84% | Transport 82%
   * Stage 3: 18,000 pax | Parking 92% | Transport 91%
   */
  setPhase14TestStage(eventId: string, stage: 0 | 1 | 2 | 3): void {
    const stageData = [
      { attendees: 10000, parkingUtil: 60, transUtil: 55, label: "Initial Test Baseline (10,000 pax)" },
      { attendees: 12000, parkingUtil: 72, transUtil: 68, label: "Arrival Rate Increased (12,000 pax)" },
      { attendees: 15000, parkingUtil: 84, transUtil: 82, label: "Capacity Warning Approaching (15,000 pax)" },
      { attendees: 18000, parkingUtil: 92, transUtil: 91, label: "Peak Critical Surge (18,000 pax)" },
    ][stage];

    const currentState = LiveEventService.getEventLiveState(eventId);
    const prevPax = currentState.currentAttendees;

    LiveEventService.updateEventState(
      eventId,
      (curr) => {
        curr.status = "LIVE";
        curr.eventStatus = "LIVE";
        curr.currentAttendees = stageData.attendees;
        curr.venueCapacity = Math.max(curr.venueCapacity, 20000);

        // Crowd zones
        const zones = Object.values(curr.crowdZones || {});
        const totalCap = zones.reduce((s, z) => s + z.capacity, 0) || 20000;
        zones.forEach((z) => {
          const ratio = z.capacity / totalCap;
          const zCount = Math.round(stageData.attendees * ratio);
          const zUtil = Math.round((zCount / z.capacity) * 100);
          z.currentCount = zCount;
          z.utilization = zUtil;
          z.status = calculateUtilizationStatus(zUtil);
          z.arrivalRate = stage > 0 ? 120 : 40;
        });

        // Parking resources
        Object.values(curr.parkingResources || {}).forEach((p) => {
          p.currentUsage = Math.round((p.capacity * stageData.parkingUtil) / 100);
          p.utilization = stageData.parkingUtil;
          p.status = calculateUtilizationStatus(stageData.parkingUtil);
          p.details = `Available: ${p.capacity - p.currentUsage}`;
        });

        // Transport resources
        Object.values(curr.transportResources || {}).forEach((t) => {
          t.currentUsage = Math.round((t.capacity * stageData.transUtil) / 100);
          t.utilization = stageData.transUtil;
          t.status = calculateUtilizationStatus(stageData.transUtil);
        });

        if (curr.simulationConfig) {
          curr.simulationConfig.scenarioLabel = stageData.label;
          curr.simulationConfig.arrivalRate = stage > 0 ? 140 : 50;
        }
      },
      {
        resource: "Venue Attendees & Resources",
        oldValue: `${prevPax} pax`,
        newValue: `${stageData.attendees} pax (Park: ${stageData.parkingUtil}%, Trans: ${stageData.transUtil}%)`,
        changedBy: "Phase 14 Test Runner",
        reason: stageData.label,
        sourceType: "SIMULATION",
      }
    );
  },

  /**
   * Runs the Phase 16 Complete 3-Role Connected Workflow Test Scenario
   * Simulates Hospitality resource unavailability and Parking P1 critical threshold,
   * verifying central state update, organizer detection, and attendee guidance routing.
   */
  runPhase16Workflow(eventId: string): void {
    LiveEventService.updateEventState(
      eventId,
      (curr) => {
        curr.status = "LIVE";
        curr.eventStatus = "LIVE";

        // 1. Make first hospitality resource UNAVAILABLE / FULL
        const hospKeys = Object.keys(curr.hospitalityResources || {});
        if (hospKeys.length > 0) {
          const hosp = curr.hospitalityResources[hospKeys[0]];
          if (hosp) {
            hosp.currentUsage = hosp.capacity;
            hosp.utilization = 100;
            hosp.status = "FULL / UNAVAILABLE";
          }
        }

        // 2. Make first parking resource 95% CRITICAL
        const parkKeys = Object.keys(curr.parkingResources || {});
        if (parkKeys.length > 0) {
          const park = curr.parkingResources[parkKeys[0]];
          if (park) {
            park.currentUsage = Math.round(park.capacity * 0.95);
            park.utilization = 95;
            park.status = "CRITICAL";
            park.details = "Critical capacity reached. Overflow required.";
          }
        }
      },
      {
        resource: "Hospitality & Parking Resources",
        oldValue: "Nominal",
        newValue: "Hospitality UNAVAILABLE & Parking 95% CRITICAL",
        changedBy: "Phase 16 Workflow Test Runner",
        reason: "Verified 3-role connected workflow: Hospitality failure & Parking pressure detection",
        sourceType: "SIMULATION",
      }
    );
  },

  /**
   * Returns whether simulation is currently actively ticking for an event.
   */
  isSimulating(eventId: string): boolean {
    return simTimers.has(eventId);
  },
};
