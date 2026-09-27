import type { OperatorResourceRecord } from '../types/operator';

export type CapacitySnapshot = {
  at: number;
  total: number;
  occupied: number;
  available: number;
  utilization: number;
  projected: number;
  reserveAfterProjection: number;
  status: 'STABLE' | 'WATCH' | 'CRITICAL';
};

const KEY = 'eventflow_capacity_calculation_history';

export function calculateResourceCapacity(resources: OperatorResourceRecord[], liveDemand = 0): CapacitySnapshot {
  const total = resources.reduce((sum, r) => sum + Number(r.capacity || 0), 0);
  const occupied = resources.reduce((sum, r) => sum + Number(r.occupiedCapacity || 0), 0);
  const available = Math.max(0, total - occupied);
  const utilization = total ? Math.round((occupied / total) * 100) : 0;
  const projected = Math.min(total, Math.round(occupied + Math.max(0, liveDemand)));
  const reserveAfterProjection = Math.max(0, total - projected);
  const projectedPct = total ? (projected / total) * 100 : 0;
  const status: CapacitySnapshot['status'] = projectedPct >= 90 ? 'CRITICAL' : projectedPct >= 75 ? 'WATCH' : 'STABLE';
  return { at: Date.now(), total, occupied, available, utilization, projected, reserveAfterProjection, status };
}

export function recordCapacitySnapshot(operatorId: string, snapshot: CapacitySnapshot) {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    const history = Array.isArray(raw[operatorId]) ? raw[operatorId] : [];
    raw[operatorId] = [...history, snapshot].slice(-24);
    localStorage.setItem(KEY, JSON.stringify(raw));
    window.dispatchEvent(new CustomEvent('eventflow_capacity_calculated'));
  } catch {}
}

export function getCapacityHistory(operatorId: string): CapacitySnapshot[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    return Array.isArray(raw[operatorId]) ? raw[operatorId] : [];
  } catch {
    return [];
  }
}
