import type { VenueZone } from '../components/live/VenueMap';
export function predictGateUsage(zone: VenueZone | undefined, now: number, minutes: number): number | undefined {
 if (!zone || !zone.capacity || !zone.history) return undefined;
 const points = zone.history.filter(p => now - p.at <= 60 * 60_000 && p.capacity === zone.capacity).sort((a,b) => a.at-b.at);
 if (points.length < 3 || points.at(-1)!.at-points[0].at < 2*60_000 || now-points.at(-1)!.at>15*60_000) return undefined;
 const x=points.map(p=>(p.at-points[0].at)/60_000), y=points.map(p=>p.used);
 const xMean=x.reduce((a,b)=>a+b,0)/x.length, yMean=y.reduce((a,b)=>a+b,0)/y.length;
 const variance=x.reduce((a,b)=>a+(b-xMean)**2,0);
 if (variance<1) return undefined;
 const slope=x.reduce((a,b,i)=>a+(b-xMean)*(y[i]-yMean),0)/variance;
 if (slope <= 0) return undefined;
 return Math.min(100,Math.round(100 * Math.max(0,Math.min(zone.capacity,zone.used!+slope*minutes))/zone.capacity));
}
