import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
export function PassScanner({ onScan, onClose }: { onScan: (pass: string) => void; onClose: () => void }) {
 const video = useRef<HTMLVideoElement>(null); const [error, setError] = useState('');
 useEffect(() => {
  let stream: MediaStream | undefined, frame = 0, cancelled = false;
  const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const tick = () => {
   if (cancelled) return;
   const v = video.current;
   if (v && v.readyState >= 2 && ctx) {
    canvas.width = v.videoWidth; canvas.height = v.videoHeight; ctx.drawImage(v, 0, 0);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height); const result = jsQR(pixels.data, pixels.width, pixels.height);
    if (result) { onScan(result.data); return; }
   }
   frame = requestAnimationFrame(tick);
  };
  (async () => { try {
   if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera needs HTTPS or localhost. You can paste the pass instead.');
   stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
   if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
   if (video.current) { video.current.srcObject = stream; await video.current.play(); frame = requestAnimationFrame(tick); }
  } catch (e) { setError(e instanceof Error ? e.message : 'Camera unavailable. Paste the pass instead.'); } })();
  return () => { cancelled = true; cancelAnimationFrame(frame); stream?.getTracks().forEach(t => t.stop()); };
 }, []);
 return <div className="ef-scanner"><video ref={video} playsInline muted /><p>{error || 'Point the camera at a Live Venue attendance QR.'}</p><button onClick={onClose} className="ef-btn secondary">Close camera</button></div>;
}
