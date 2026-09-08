window.EVENTFLOW_CONFIG = {
  SUPABASE_URL: 'https://hwlduzkerlevvfnycsyz.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_uqoEubeWSZgdws5sGzYHdg__kWmbWpd',
  APP_NAME: 'EventFlow',
  // 100% key-free map/routing demo stack:
  // MapLibre GL JS + OpenStreetMap raster tiles + public OSRM routing.
  // Public OSM/OSRM endpoints are best-effort demo services; for production,
  // self-host or switch to a provider with an SLA.
  EVENT_CENTER: { lat: 19.0607, lng: 72.8676 },
  EVENT_GATES: {
    north: { lat: 19.0642, lng: 72.8674, label: 'North Gate' },
    east:  { lat: 19.0608, lng: 72.8720, label: 'East Gate' },
    south: { lat: 19.0576, lng: 72.8675, label: 'South Gate' },
    west:  { lat: 19.0607, lng: 72.8632, label: 'West Gate' }
  },
  DEMO_EVENT_ID: 'unity-arena-final-2026',
  OSRM_BASE_URL: 'https://router.project-osrm.org'
};
