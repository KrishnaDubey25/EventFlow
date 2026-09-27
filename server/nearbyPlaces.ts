import { Router } from 'express';
export const nearbyRouter = Router();
const cache = new Map<string, { at: number; value: unknown }>();
let inFlight = 0;
nearbyRouter.get('/', async (req, res) => {
 const lat=Number(req.query.lat), lng=Number(req.query.lng);
 if (!req.query.lat || !req.query.lng || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat)>85 || Math.abs(lng)>180) return res.status(400).json({error:'Valid venue coordinates required.'});
 const key=`${lat.toFixed(3)},${lng.toFixed(3)}`; const previous=cache.get(key);
 if(previous && Date.now()-previous.at<1800000) return res.json(previous.value);
 if(inFlight>=2) return res.status(429).json({error:'Nearby search is busy. Try again shortly.'});
 const around=`(around:2000,${lat},${lng})`;
 const query=`[out:json][timeout:12][maxsize:8388608];(nwr[amenity~"^(restaurant|cafe|fast_food|food_court|parking|hospital|clinic|pharmacy|police|drinking_water|toilets|bus_station)$"]${around};nwr[tourism~"^(hotel|hostel|guest_house|motel|apartment)$"]${around};);out center 160;`;
 inFlight++;
 try {
  const upstream=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','User-Agent':'EventFlow/1.0 (venue facility discovery)'},body:new URLSearchParams({data:query}),signal:AbortSignal.timeout(15000)});
  if(!upstream.ok) throw new Error('Provider unavailable');
  const data:any=await upstream.json(); if(!Array.isArray(data.elements) || data.remark) throw new Error('Incomplete result');
  const places=data.elements.flatMap((p:any)=>{
   const tags=p.tags||{}, point=p.center||p;
   if(!Number.isFinite(point.lat)||!Number.isFinite(point.lon))return [];
   const kind=tags.tourism ? (tags.tourism==='hotel'?'hotel':'stay') : ({restaurant:'restaurant',cafe:'restaurant',fast_food:'food',food_court:'food',parking:'parking',hospital:'medical',clinic:'medical',pharmacy:'medical',police:'security',drinking_water:'water',toilets:'toilet',bus_station:'transport'} as Record<string,string>)[tags.amenity];
   if(!kind)return [];
   return [{id:`osm-${p.type}-${p.id}`,name:String(tags.name||tags['name:en']||tags.amenity||tags.tourism).replaceAll('_',' '),kind,lat:point.lat,lng:point.lon,status:'unknown',note:[tags['addr:street'],tags.opening_hours?`Listed hours: ${tags.opening_hours}`:'',tags.wheelchair?`Wheelchair: ${tags.wheelchair}`:''].filter(Boolean).join(' · '),updatedAt:0,source:'osm',url:`https://www.openstreetmap.org/${p.type}/${p.id}`}];
  });
  const value={places,source:'OpenStreetMap',retrievedAt:Date.now()};
  if(cache.size>=200)cache.delete(cache.keys().next().value!);cache.set(key,{at:Date.now(),value});res.json(value);
 } catch {res.status(503).json({error:'Nearby directory is unavailable right now. Event-team locations remain available; try again later.'});} finally {inFlight--;}
});
