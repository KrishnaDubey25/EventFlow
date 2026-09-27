import { useCallback, useEffect, useState } from 'react';
import { safeJsonFetch } from '../../services/safeJsonFetch';
import { buildSimulatedNearbyPlaces } from '../../services/liveVenueFallbackService';

export function useNearbyPlaces(lat?:number,lng?:number){
  const [places,setPlaces]=useState<any[]>([]); const [loading,setLoading]=useState(false); const [error,setError]=useState(''); const [nonce,setNonce]=useState(0);
  const retry=useCallback(()=>setNonce(v=>v+1),[]);
  useEffect(()=>{if(!lat||!lng)return;const controller=new AbortController();setLoading(true);setError('');safeJsonFetch<any>(`/api/live-venue/nearby?lat=${lat}&lng=${lng}`,{signal:controller.signal}).then(d=>setPlaces((d.places&&d.places.length)?d.places:buildSimulatedNearbyPlaces(lat,lng))).catch(e=>{if(e.name!=='AbortError'){setPlaces(buildSimulatedNearbyPlaces(lat,lng));setError('');}}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});return()=>controller.abort();},[lat,lng,nonce]);
  return {places,loading,error,retry};
}
