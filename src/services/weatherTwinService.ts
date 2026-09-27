import { AppEvent } from '../types/event';
import { cacheGet, cacheSet } from './persistentCacheService';
import { safeJsonFetch } from './safeJsonFetch';

export type WeatherTwinScenario = {
  rainMmH: number;
  temperatureC: number;
  windKmh: number;
  stormMinutes: number;
  floodCm: number;
};

export type LiveWeatherSnapshot = {
  temperatureC: number;
  apparentTemperatureC: number;
  precipitationMm: number;
  rainMm: number;
  windKmh: number;
  windGustKmh: number;
  humidityPct: number;
  weatherCode: number;
  observedAt: string;
  source: string;
  nextRainAt?: string;
  nextRainProbability?: number;
};

export type SocialSignal = {
  title: string;
  url: string;
  domain: string;
  seenAt?: string;
  tone?: 'alert' | 'watch' | 'normal';
};

export type WeatherTwinImpact = {
  riskScore: number;
  riskBand: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  confidence: number;
  arrivalDelayPct: number;
  attendanceChangePct: number;
  transportStressPct: number;
  gatePressurePct: number;
  indoorMigrationPct: number;
  parkingDemandChangePct: number;
  hospitalityDemandChangePct: number;
  hotelDemandChangePct: number;
  medicalDemandChangePct: number;
  workforceAvailabilityPct: number;
  routeRiskPct: number;
  p10Risk: number;
  p50Risk: number;
  p90Risk: number;
  cascade: { from: string; to: string; effect: string; severity: number }[];
  actions: string[];
};


export function resolveEventCoordinates(event: AppEvent): { latitude: number; longitude: number; source: string } {
  const lat = Number(event.latitude), lng = Number(event.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 85 && Math.abs(lng) <= 180 && (Math.abs(lat) > .01 || Math.abs(lng) > .01)) return { latitude: lat, longitude: lng, source: 'event coordinates' };
  const text = `${event.location || ''} ${event.venue || ''} ${event.district || ''} ${event.state || ''} ${event.country || ''}`.toLowerCase();
  const known: Array<[RegExp, number, number]> = [
    [/mumbai|bombay|navi mumbai|thane/,19.076,72.8777], [/delhi|new delhi|noida|gurugram|gurgaon/,28.6139,77.2090],
    [/bengaluru|bangalore/,12.9716,77.5946], [/hyderabad/,17.3850,78.4867], [/chennai/,13.0827,80.2707],
    [/kolkata/,22.5726,88.3639], [/pune/,18.5204,73.8567], [/goa|vagator|panaji/,15.4909,73.8278],
    [/ahmedabad|motera/,23.0225,72.5714], [/jaipur/,26.9124,75.7873], [/kochi|ernakulam/,9.9312,76.2673],
    [/london|wembley/,51.5072,-0.1276], [/tokyo/,35.6762,139.6503]
  ];
  const found=known.find(([re])=>re.test(text));
  return found ? { latitude:found[1], longitude:found[2], source:'location fallback' } : { latitude:19.076, longitude:72.8777, source:'default fallback' };
}

function fallbackWeather(event: AppEvent): LiveWeatherSnapshot {
  const { latitude, longitude } = resolveEventCoordinates(event);
  const now = new Date();
  const hour = now.getHours(); const month = now.getMonth()+1;
  const seed = Math.abs(Math.round(latitude*1000 + longitude*100 + now.getDate()*17));
  const monsoon = month >= 6 && month <= 9;
  const tempBase = 29 - Math.min(8, Math.abs(latitude)/12) + Math.sin((hour-14)/24*Math.PI*2)*3;
  const temperatureC = Math.round((tempBase + (seed%30)/10)*10)/10;
  const rainChance = monsoon ? 45 + seed%35 : 8 + seed%24;
  const rainMm = rainChance > 55 ? Math.round(((seed%18)/10)*10)/10 : 0;
  const windKmh = 8 + seed%18;
  const nextRainAt = new Date(now.getTime() + (2 + seed%7)*3600000).toISOString();
  return { temperatureC, apparentTemperatureC:Math.round((temperatureC+1.4)*10)/10, precipitationMm:rainMm, rainMm, windKmh, windGustKmh:windKmh+7, humidityPct:monsoon?72+seed%18:48+seed%24, weatherCode:rainMm>0?61:rainChance>45?3:1, observedAt:now.toISOString(), source:'EventFlow forecast fallback', nextRainAt, nextRainProbability:rainChance };
}

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));

const numberCapacity = (v: number | string) => {
  if (typeof v === 'number') return v;
  const parsed = Number(String(v).replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

export async function fetchLiveWeather(event: AppEvent): Promise<LiveWeatherSnapshot> {
  const cacheKey = `weather:${event.id}`;
  const qs = new URLSearchParams({
    latitude: String(resolveEventCoordinates(event).latitude),
    longitude: String(resolveEventCoordinates(event).longitude),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'precipitation',
      'rain',
      'relative_humidity_2m',
      'weather_code',
      'wind_speed_10m',
      'wind_gusts_10m',
    ].join(','),
    hourly: 'precipitation_probability,rain,temperature_2m',
    forecast_days: '2',
    timezone: 'auto',
  });
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${qs.toString()}`);
    if (!res.ok) throw new Error(`Weather service returned ${res.status}`);
    const data = await res.json();
    const c = data.current || {};
    const times: string[] = Array.isArray(data?.hourly?.time) ? data.hourly.time : [];
    const probs: number[] = Array.isArray(data?.hourly?.precipitation_probability) ? data.hourly.precipitation_probability : [];
    const rains: number[] = Array.isArray(data?.hourly?.rain) ? data.hourly.rain : [];
    const currentTime = new Date(String(c.time || Date.now())).getTime();
    const nextRainIndex = times.findIndex((t, i) => new Date(t).getTime() > currentTime && (Number(probs[i] || 0) >= 40 || Number(rains[i] || 0) >= 0.2));
    const snapshot: LiveWeatherSnapshot = {
    temperatureC: Number(c.temperature_2m ?? 30),
    apparentTemperatureC: Number(c.apparent_temperature ?? c.temperature_2m ?? 30),
    precipitationMm: Number(c.precipitation ?? 0),
    rainMm: Number(c.rain ?? c.precipitation ?? 0),
    windKmh: Number(c.wind_speed_10m ?? 0),
    windGustKmh: Number(c.wind_gusts_10m ?? c.wind_speed_10m ?? 0),
    humidityPct: Number(c.relative_humidity_2m ?? 60),
    weatherCode: Number(c.weather_code ?? 0),
    observedAt: String(c.time ?? new Date().toISOString()),
    source: 'Open-Meteo',
    nextRainAt: nextRainIndex >= 0 ? times[nextRainIndex] : undefined,
    nextRainProbability: nextRainIndex >= 0 ? Number(probs[nextRainIndex] || 0) : undefined,
    };
    cacheSet(cacheKey, snapshot, 10 * 60 * 1000);
    return snapshot;
  } catch (error) {
    const cached = cacheGet<LiveWeatherSnapshot>(cacheKey, true);
    if (cached) return { ...cached, source: `${cached.source} · cached` };
    const fallback=fallbackWeather(event); cacheSet(cacheKey,fallback,10*60*1000); return fallback;
  }
}

export async function fetchSocialSignals(event: AppEvent): Promise<SocialSignal[]> {
  const qs = new URLSearchParams({
    event: event.name,
    city: event.district || event.state || event.country,
  });
  const cacheKey = `social:${event.id}`;
  try {
    const data = await safeJsonFetch<any>(`/api/weather-twin/social?${qs.toString()}`);
    const signals = Array.isArray(data.signals) ? data.signals : [];
    cacheSet(cacheKey, signals, 15 * 60 * 1000);
    return signals;
  } catch {
    return cacheGet<SocialSignal[]>(cacheKey, true) || [];
  }
}

export function scenarioFromWeather(w: LiveWeatherSnapshot): WeatherTwinScenario {
  return {
    rainMmH: Math.max(w.rainMm, w.precipitationMm),
    temperatureC: w.temperatureC,
    windKmh: Math.max(w.windKmh, w.windGustKmh * 0.75),
    stormMinutes: Math.max(w.rainMm > 1 ? 60 : 20, 20),
    floodCm: 0,
  };
}

export function simulateWeatherTwin(
  scenario: WeatherTwinScenario,
  event: AppEvent,
  socialSignals: SocialSignal[] = [],
  telemetryPoints = 0,
): WeatherTwinImpact {
  const rain = clamp(scenario.rainMmH / 50, 0, 1.5);
  const heat = clamp((scenario.temperatureC - 31) / 14, 0, 1.4);
  const wind = clamp(scenario.windKmh / 85, 0, 1.5);
  const duration = clamp(scenario.stormMinutes / 240, 0, 1.5);
  const flood = clamp(scenario.floodCm / 40, 0, 1.5);
  const socialAlertShare = socialSignals.length
    ? socialSignals.filter((s) => s.tone === 'alert').length / socialSignals.length
    : 0.15;

  const hazard = clamp((rain * 30 + heat * 18 + wind * 16 + duration * 12 + flood * 32 + socialAlertShare * 10), 0, 100);
  const crowdScale = clamp(numberCapacity(event.expectedAttendance) / Math.max(1, numberCapacity(event.capacity)), 0.25, 1.15);

  const arrivalDelayPct = clamp(4 + rain * 24 + flood * 30 + wind * 14 + duration * 8, 0, 75);
  const transportStressPct = clamp(28 + rain * 30 + flood * 38 + wind * 22 + duration * 10, 0, 100);
  const indoorMigrationPct = clamp(8 + rain * 55 + heat * 20 + flood * 12, 0, 95);
  const gatePressurePct = clamp(34 + crowdScale * 28 + indoorMigrationPct * 0.27 + transportStressPct * 0.16, 0, 100);
  const attendanceChangePct = -Math.round(clamp(rain * 8 + heat * 7 + wind * 5 + flood * 15 + duration * 4, 0, 35));
  const parkingDemandChangePct = Math.round(clamp(rain * 16 + heat * 4 - flood * 25 + wind * 3, -30, 30));
  const hospitalityDemandChangePct = Math.round(clamp(rain * 18 + heat * 20 + indoorMigrationPct * 0.14, 0, 45));
  const hotelDemandChangePct = Math.round(clamp(duration * 8 + flood * 15 + wind * 6 + arrivalDelayPct * 0.12, 0, 35));
  const medicalDemandChangePct = Math.round(clamp(heat * 35 + rain * 7 + flood * 10 + gatePressurePct * 0.08, 0, 55));
  const workforceAvailabilityPct = Math.round(clamp(97 - rain * 8 - flood * 22 - heat * 6 - wind * 8 - duration * 5, 55, 99));
  const routeRiskPct = Math.round(clamp(12 + rain * 24 + flood * 50 + wind * 13, 0, 100));

  const confidence = Math.round(clamp(69 + Math.min(14, telemetryPoints * 1.5) + Math.min(7, socialSignals.length) - hazard * 0.08, 58, 92));
  const spread = Math.round(6 + hazard * 0.10 + (socialSignals.length === 0 ? 5 : 0));
  const p50Risk = Math.round(hazard);
  const p10Risk = Math.round(clamp(p50Risk - spread));
  const p90Risk = Math.round(clamp(p50Risk + spread));
  const riskBand: WeatherTwinImpact['riskBand'] = hazard >= 75 ? 'SEVERE' : hazard >= 52 ? 'HIGH' : hazard >= 28 ? 'MODERATE' : 'LOW';

  const cascade = [
    { from: 'Weather shock', to: 'Transport network', effect: `stress ${Math.round(transportStressPct)}%`, severity: transportStressPct },
    { from: 'Transport network', to: 'Arrival pattern', effect: `delay ${Math.round(arrivalDelayPct)}%`, severity: arrivalDelayPct },
    { from: 'Arrival pattern', to: 'Gate pressure', effect: `pressure ${Math.round(gatePressurePct)}%`, severity: gatePressurePct },
    { from: 'Weather shock', to: 'Indoor migration', effect: `${Math.round(indoorMigrationPct)}% shift`, severity: indoorMigrationPct },
    { from: 'Indoor migration', to: 'Hospitality', effect: `demand +${hospitalityDemandChangePct}%`, severity: hospitalityDemandChangePct + 30 },
    { from: 'Heat / crowd', to: 'Medical', effect: `demand +${medicalDemandChangePct}%`, severity: medicalDemandChangePct + 30 },
  ];

  const actions: string[] = [];
  if (rain > 0.35) actions.push('Move outdoor queues to covered holding zones and broadcast dry-route guidance.');
  if (transportStressPct > 60) actions.push('Stage shuttle reserve and stagger ingress messaging to absorb clustered arrivals.');
  if (gatePressurePct > 68) actions.push('Open overflow gates and rebalance security lanes before the predicted arrival pulse.');
  if (heat > 0.35) actions.push('Increase hydration points, shaded rest areas, and medical roaming teams.');
  if (flood > 0.25) actions.push('Close low-lying access paths and divert parking / pickup to elevated alternatives.');
  if (hospitalityDemandChangePct > 22) actions.push('Pre-position F&B stock and staff at covered concourses with highest projected dwell time.');
  if (!actions.length) actions.push('Maintain baseline staffing; continue live weather and social-signal monitoring.');

  return {
    riskScore: Math.round(hazard),
    riskBand,
    confidence,
    arrivalDelayPct: Math.round(arrivalDelayPct),
    attendanceChangePct,
    transportStressPct: Math.round(transportStressPct),
    gatePressurePct: Math.round(gatePressurePct),
    indoorMigrationPct: Math.round(indoorMigrationPct),
    parkingDemandChangePct,
    hospitalityDemandChangePct,
    hotelDemandChangePct,
    medicalDemandChangePct,
    workforceAvailabilityPct,
    routeRiskPct,
    p10Risk,
    p50Risk,
    p90Risk,
    cascade,
    actions,
  };
}

export function recordWeatherTwinObservation(eventId: string, weather: LiveWeatherSnapshot, impact: WeatherTwinImpact) {
  const key = `eventflow_weather_twin_history_${eventId}`;
  try {
    const prev = JSON.parse(localStorage.getItem(key) || '[]');
    const next = [...prev, { at: new Date().toISOString(), weather, impact }].slice(-48);
    localStorage.setItem(key, JSON.stringify(next));
    return next.length;
  } catch {
    return 1;
  }
}

export function getWeatherTwinObservationCount(eventId: string) {
  try {
    return JSON.parse(localStorage.getItem(`eventflow_weather_twin_history_${eventId}`) || '[]').length || 0;
  } catch {
    return 0;
  }
}
