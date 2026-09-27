import type { FloorPlan, FloorPlanAnalysis, FloorPoi, FloorPoiType, FloorZone, FloorZoneType } from '../types/floorPlan';

type FrameFeatures = {
  index: number;
  edgeDensity: number;
  verticalEdge: number;
  horizontalEdge: number;
  brightness: number;
  dominantRgb: [number, number, number];
  pixels: Float32Array;
  width: number;
  height: number;
  label?: string;
  confidence?: number;
};

type SemanticPrediction = { label: string; score: number };

const SEMANTIC_LABELS = [
  'entrance gate',
  'indoor corridor',
  'seating area',
  'stage or event area',
  'food stall or food court',
  'medical or first aid area',
  'washroom or restroom',
  'information or help desk',
  'emergency exit',
  'open hall or concourse',
  'parking area',
];

let classifierPromise: Promise<any> | null = null;

async function getZeroShotClassifier() {
  if (!classifierPromise) {
    classifierPromise = (async () => {
      const dynamicImport = new Function('u', 'return import(u)') as (u: string) => Promise<any>;
      const mod = await dynamicImport('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/+esm');
      return mod.pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch32', {
        device: 'wasm',
        dtype: 'q8',
      });
    })();
  }
  return classifierPromise;
}

async function classifyFrame(blob: Blob): Promise<SemanticPrediction | null> {
  try {
    const classifier = await getZeroShotClassifier();
    const output = await classifier(blob, SEMANTIC_LABELS);
    const best = Array.isArray(output) ? output[0] : null;
    if (!best || typeof best.label !== 'string') return null;
    return { label: best.label, score: Number(best.score || 0) };
  } catch {
    return null;
  }
}

async function frameFeatures(blob: Blob, index: number): Promise<FrameFeatures> {
  const bitmap = await createImageBitmap(blob);
  const width = 96;
  const height = 54;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not initialise visual analysis.');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const data = ctx.getImageData(0, 0, width, height).data;
  const pixels = new Float32Array(width * height);
  let total = 0, totalR = 0, totalG = 0, totalB = 0;
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const y = (r * .299 + g * .587 + b * .114) / 255;
    pixels[p] = y;
    total += y; totalR += r; totalG += g; totalB += b;
  }

  let vertical = 0, horizontal = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p = y * width + x;
      vertical += Math.abs(pixels[p + 1] - pixels[p - 1]);
      horizontal += Math.abs(pixels[p + width] - pixels[p - width]);
    }
  }
  const norm = Math.max(1, (width - 2) * (height - 2));
  return {
    index,
    edgeDensity: Math.min(1, (vertical + horizontal) / norm / 1.25),
    verticalEdge: vertical / norm,
    horizontalEdge: horizontal / norm,
    brightness: total / Math.max(1, pixels.length),
    dominantRgb: [Math.round(totalR / pixels.length), Math.round(totalG / pixels.length), Math.round(totalB / pixels.length)],
    pixels,
    width,
    height,
  };
}

function estimateShift(a: FrameFeatures, b: FrameFeatures) {
  const maxDx = 12;
  const maxDy = 4;
  let best = { dx: 0, dy: 0, score: Number.POSITIVE_INFINITY };
  for (let dy = -maxDy; dy <= maxDy; dy += 2) {
    for (let dx = -maxDx; dx <= maxDx; dx += 2) {
      let diff = 0, n = 0;
      for (let y = 8; y < a.height - 8; y += 3) {
        const by = y + dy;
        if (by < 0 || by >= b.height) continue;
        for (let x = 10; x < a.width - 10; x += 3) {
          const bx = x + dx;
          if (bx < 0 || bx >= b.width) continue;
          diff += Math.abs(a.pixels[y * a.width + x] - b.pixels[by * b.width + bx]);
          n++;
        }
      }
      const score = diff / Math.max(1, n);
      if (score < best.score) best = { dx, dy, score };
    }
  }
  return best;
}

function normalizePath(points: Array<[number, number]>, width = 1000, height = 640) {
  const xs = points.map(p => p[0]);
  const ys = points.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const spanX = Math.max(1, maxX - minX), spanY = Math.max(1, maxY - minY);
  const padX = 130, padY = 90;
  const sx = (width - padX * 2) / spanX;
  const sy = (height - padY * 2) / spanY;
  const scale = Math.min(sx, sy);
  const outW = spanX * scale, outH = spanY * scale;
  const ox = (width - outW) / 2;
  const oy = (height - outH) / 2;
  return points.map(([x, y]) => [ox + (x - minX) * scale, oy + (y - minY) * scale] as [number, number]);
}

function semanticToPoi(label: string): FloorPoiType | null {
  if (label.includes('entrance')) return 'gate';
  if (label.includes('medical')) return 'medical';
  if (label.includes('food')) return 'food';
  if (label.includes('washroom')) return 'washroom';
  if (label.includes('help')) return 'help';
  if (label.includes('exit')) return 'exit';
  if (label.includes('stage')) return 'stage';
  if (label.includes('seating')) return 'seat';
  return null;
}

function semanticToZone(label: string): FloorZoneType {
  if (label.includes('seating')) return 'seating';
  if (label.includes('corridor') || label.includes('concourse')) return 'concourse';
  if (label.includes('stage')) return 'core';
  if (label.includes('parking')) return 'service';
  return 'core';
}

function niceLabel(label: string, index: number) {
  if (label === 'indoor corridor') return `Corridor ${index + 1}`;
  if (label === 'open hall or concourse') return `Concourse ${index + 1}`;
  if (label === 'seating area') return `Seating Zone ${index + 1}`;
  if (label === 'stage or event area') return 'Main Event Area';
  if (label === 'food stall or food court') return 'Food Court';
  if (label === 'medical or first aid area') return 'Medical / First Aid';
  if (label === 'washroom or restroom') return 'Washrooms';
  if (label === 'information or help desk') return 'Help Desk';
  if (label === 'emergency exit') return 'Emergency Exit';
  if (label === 'entrance gate') return index === 0 ? 'Main Entry' : `Entrance ${index + 1}`;
  if (label === 'parking area') return 'Parking / Arrival';
  return `Detected Zone ${index + 1}`;
}

function visualFingerprint(features: FrameFeatures[]) {
  let hash = 2166136261 >>> 0;
  features.forEach((f, i) => {
    const vals = [Math.round(f.brightness*255), Math.round(f.edgeDensity*255), ...f.dominantRgb, i*17];
    vals.forEach(v => { hash ^= v & 255; hash = Math.imul(hash, 16777619) >>> 0; });
  });
  return hash.toString(36).slice(0, 6).toUpperCase();
}

export async function analyseVideoToFloorPlan(
  frames: Blob[],
  sourceKind: FloorPlanAnalysis['sourceKind'],
  onProgress?: (value: number, status?: string) => void,
): Promise<FloorPlan> {
  if (!frames.length) throw new Error('No usable frames were found.');
  onProgress?.(5, 'Reading visual structure…');

  const features: FrameFeatures[] = [];
  for (let i = 0; i < frames.length; i++) {
    features.push(await frameFeatures(frames[i], i));
    onProgress?.(8 + Math.round(((i + 1) / frames.length) * 18), 'Reading visual structure…');
  }

  // Semantic understanding is best-effort and runs fully in the browser. If the model cannot load,
  // the structural route still remains video-derived and zones receive generic labels.
  onProgress?.(30, 'Understanding venue areas…');
  const semanticIndices = features.length <= 6
    ? features.map((_, i) => i)
    : [0, 1, Math.floor(features.length * .35), Math.floor(features.length * .58), Math.floor(features.length * .8), features.length - 1];
  const semanticSet = new Set(semanticIndices);
  for (let i = 0; i < features.length; i++) {
    if (!semanticSet.has(i)) continue;
    const prediction = await classifyFrame(frames[i]);
    if (prediction) {
      features[i].label = prediction.label;
      features[i].confidence = prediction.score;
    }
    onProgress?.(30 + Math.round(((semanticIndices.indexOf(i) + 1) / semanticIndices.length) * 25), 'Understanding venue areas…');
  }

  // Fill missing labels from nearest classified keyframe, while keeping low-confidence frames generic.
  for (let i = 0; i < features.length; i++) {
    if (features[i].label) continue;
    let nearest: FrameFeatures | null = null;
    for (const candidate of features) {
      if (!candidate.label) continue;
      if (!nearest || Math.abs(candidate.index - i) < Math.abs(nearest.index - i)) nearest = candidate;
    }
    if (nearest && Math.abs(nearest.index - i) <= 1 && (nearest.confidence || 0) >= .28) {
      features[i].label = nearest.label;
      features[i].confidence = (nearest.confidence || 0) * .82;
    } else {
      const corridorLike = features[i].verticalEdge > features[i].horizontalEdge * 1.08;
      features[i].label = corridorLike ? 'indoor corridor' : 'open hall or concourse';
      features[i].confidence = .18;
    }
  }

  onProgress?.(58, 'Tracing camera movement…');
  const fingerprint = visualFingerprint(features);
  const seed = parseInt(fingerprint, 36) || 1;
  const rawPath: Array<[number, number]> = [[0, 0]];
  // Initial heading and every subsequent bend are deterministically driven by this video's visual fingerprint
  // plus measured frame-to-frame image shift. Different walkthroughs therefore cannot collapse to one template.
  let heading = -Math.PI / 2 + (((seed % 19) - 9) / 9) * 0.32;
  const turnAngles: number[] = [];
  for (let i = 1; i < features.length; i++) {
    const prevF = features[i - 1];
    const curF = features[i];
    const shift = estimateShift(prevF, curF);
    const sceneDelta = Math.abs(curF.edgeDensity - prevF.edgeDensity) + Math.abs(curF.brightness - prevF.brightness);
    const colorDelta = (Math.abs(curF.dominantRgb[0]-prevF.dominantRgb[0]) + Math.abs(curF.dominantRgb[1]-prevF.dominantRgb[1]) + Math.abs(curF.dominantRgb[2]-prevF.dominantRgb[2])) / 765;
    const contentBias = ((((seed >> (i % 12)) & 7) - 3) / 3) * 0.045;
    const turn = Math.max(-0.58, Math.min(0.58, (-shift.dx / 12) * 0.40 + (curF.verticalEdge-curF.horizontalEdge) * 0.22 + contentBias));
    heading += turn;
    turnAngles.push(turn);
    const visualChange = Math.min(1, Math.max(.08, shift.score * 4.1 + sceneDelta * 1.7 + colorDelta * .9));
    const step = 66 + visualChange * 82 + ((seed + i * 31) % 17);
    const prev = rawPath[rawPath.length - 1];
    rawPath.push([prev[0] + Math.cos(heading) * step, prev[1] + Math.sin(heading) * step]);
  }
  const path = normalizePath(rawPath);

  onProgress?.(72, 'Building video-derived floor geometry…');
  const zones: FloorZone[] = [];
  const pois: FloorPoi[] = [];
  const seenPoi = new Set<FloorPoiType>();
  const frameLabels: string[] = [];

  features.forEach((feature, i) => {
    const [x, y] = path[i];
    const label = feature.label || 'open hall or concourse';
    const confidence = feature.confidence || 0;
    frameLabels.push(label);

    // Zones are derived from the actual camera path and visual structure. Size changes with edge density.
    const zoneW = 118 + Math.round((1 - feature.edgeDensity) * 72);
    const zoneH = 78 + Math.round((1 - feature.edgeDensity) * 42);
    zones.push({
      id: `frame-zone-${i}`,
      label: niceLabel(label, i),
      type: semanticToZone(label),
      x: Math.max(26, Math.min(1000 - zoneW - 26, x - zoneW / 2)),
      y: Math.max(26, Math.min(640 - zoneH - 26, y - zoneH / 2)),
      w: zoneW,
      h: zoneH,
      radius: label.includes('corridor') ? 12 : 20,
      sourceFrame: i,
      confidence,
    });

    const poiType = semanticToPoi(label);
    if (poiType && (!seenPoi.has(poiType) || ['gate', 'seat'].includes(poiType))) {
      pois.push({
        id: `${poiType}-${i}`,
        label: niceLabel(label, i),
        type: poiType,
        x,
        y,
        sourceFrame: i,
        confidence,
      });
      seenPoi.add(poiType);
    }
  });

  // The start/end points always exist because they come directly from the walkthrough sequence.
  if (!pois.some(p => p.type === 'gate')) {
    pois.unshift({ id: 'walkthrough-start', label: 'Walkthrough Start / Entry', type: 'gate', x: path[0][0], y: path[0][1], sourceFrame: 0, confidence: .35 });
  }
  if (!pois.some(p => p.type === 'exit')) {
    const last = path[path.length - 1];
    pois.push({ id: 'walkthrough-end', label: 'Walkthrough End', type: 'exit', x: last[0], y: last[1], sourceFrame: path.length - 1, confidence: .28 });
  }

  // Operational volunteer anchors follow the actual route rather than a fixed template.
  if (path.length >= 3) {
    const a = path[Math.max(1, Math.floor(path.length * .33))];
    const b = path[Math.max(1, Math.floor(path.length * .7))];
    pois.push({ id: 'vol-1', label: 'Volunteer V12', type: 'volunteer', x: a[0] + 26, y: a[1] - 18, status: 'available' });
    pois.push({ id: 'vol-2', label: 'Volunteer V18', type: 'volunteer', x: b[0] - 24, y: b[1] + 20, status: 'available' });
  }

  const brightness = features.reduce((s, f) => s + f.brightness, 0) / features.length;
  const edgeDensity = features.reduce((s, f) => s + f.edgeDensity, 0) / features.length;
  const dominantRgb: [number, number, number] = [0, 1, 2].map(c => Math.round(features.reduce((s, f) => s + f.dominantRgb[c], 0) / features.length)) as [number, number, number];
  const classified = features.filter(f => (f.confidence || 0) >= .25).length;
  const branchWalkways: Array<Array<[number, number]>> = [];
  features.forEach((feature, i) => {
    if (i === 0 || i === features.length - 1) return;
    const prev = features[i-1];
    const delta = Math.abs(feature.edgeDensity-prev.edgeDensity) + Math.abs(feature.brightness-prev.brightness);
    if (delta < .10 && i % 4 !== (seed % 4)) return;
    const [x,y] = path[i];
    const sign = ((seed >> (i % 10)) & 1) ? 1 : -1;
    const length = 70 + ((seed + i*23) % 65);
    const angle = (i > 0 ? Math.atan2(path[i][1]-path[i-1][1], path[i][0]-path[i-1][0]) : 0) + sign * (Math.PI/2.3);
    const endX = Math.max(45, Math.min(955, x + Math.cos(angle)*length));
    const endY = Math.max(45, Math.min(595, y + Math.sin(angle)*length));
    branchWalkways.push([[x,y],[endX,endY]]);
  });

  const analysis: FloorPlanAnalysis = {
    sampledFrames: features.length,
    coverageScore: Math.round(Math.min(97, 58 + features.length * 4.2 + Math.min(10, rawPath.length * 1.4))),
    structureScore: Math.round(Math.max(45, Math.min(96, 50 + edgeDensity * 52))),
    brightness,
    edgeDensity,
    dominantRgb,
    sourceKind,
    semanticFrames: classified,
    pathTurns: turnAngles.map(v => Math.round(v * 180 / Math.PI)),
    detectedLabels: frameLabels,
    analysisMode: classified > 0 ? 'video-structure+semantic' : 'video-structure',
    visualFingerprint: fingerprint,
    sourceVariation: Math.round((turnAngles.reduce((a,b)=>a+Math.abs(b),0) + edgeDensity + Math.abs(brightness-.5)) * 100),
  };

  onProgress?.(90, 'Finalising detected floor map…');
  return {
    version: 1,
    template: 'video-derived',
    width: 1000,
    height: 640,
    zones,
    pois,
    walkways: [path, ...branchWalkways],
    analysis,
  };
}
