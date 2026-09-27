export type FloorZoneType = 'core' | 'seating' | 'concourse' | 'service' | 'restricted';
export type FloorPoiType = 'gate' | 'medical' | 'food' | 'washroom' | 'help' | 'exit' | 'volunteer' | 'stage' | 'seat';

export type FloorZone = {
  id: string;
  label: string;
  type: FloorZoneType;
  x: number;
  y: number;
  w: number;
  h: number;
  radius?: number;
  sourceFrame?: number;
  confidence?: number;
};

export type FloorPoi = {
  id: string;
  label: string;
  type: FloorPoiType;
  x: number;
  y: number;
  status?: 'available' | 'busy' | 'normal';
  sourceFrame?: number;
  confidence?: number;
};

export type FloorPlanAnalysis = {
  sampledFrames: number;
  coverageScore: number;
  structureScore: number;
  brightness: number;
  edgeDensity: number;
  dominantRgb: [number, number, number];
  sourceKind: 'video' | 'photos' | 'mixed';
  semanticFrames?: number;
  pathTurns?: number[];
  detectedLabels?: string[];
  analysisMode?: 'video-structure' | 'video-structure+semantic';
  visualFingerprint?: string;
  sourceVariation?: number;
};

export type FloorPlan = {
  version: 1;
  template: 'stadium' | 'concert' | 'expo' | 'generic' | 'video-derived';
  width: number;
  height: number;
  zones: FloorZone[];
  pois: FloorPoi[];
  walkways: Array<Array<[number, number]>>;
  analysis: FloorPlanAnalysis;
};
