# EventFlow Live Data / Weather / Visibility Fix Report

## What changed

- Live Venue is now server-optional. It first requests `/api/live-venue/*`; if Vercel serves SPA HTML, returns a non-JSON response, or the route is unavailable, EventFlow switches to a local simulated JSON room instead of showing a JSON/doctype error.
- Simulation fallback includes crowd heat cells, individual demo attendee markers, operator markers, attendance counts, zones, parking, organizer shuttle, food and medical support.
- Published indoor map shows real attendee presence when available plus deterministic demo movement for Organizer/Operator views. Operators remain clickable on the attendee map for help requests.
- Crowd Management uses the published floor plan and displays live + simulated movement and operator points.
- Live Command resource cards now include recent trend sparklines, increasing/decreasing indicators, current capacity/load/available values, and an interactive impact/load slider. Slider changes feed the existing simulation engine and bell warnings.
- Weather Twin resolves coordinates per event, calls Open-Meteo when available, and falls back to a deterministic EventFlow forecast if the remote request is unavailable. It shows the weather source so demo fallback is explicit.
- Hospitality hides metro/train/public transport resources and presents organizer-operated fleet/shuttle resources only.
- Authenticated app text/input visibility rules remain hardened without changing the established palette.

## Data modes

- LIVE DATA: live backend JSON route is available.
- DEMO SIMULATION: live backend is missing/unavailable/returns HTML and the local fallback is active.

## Verification

- `node checks/final-workflow-check.mjs`: 24/24 PASS
- `node checks/user-request-audit.mjs`: 30/30 PASS
- TypeScript syntax-code scan on modified files: no TS1xxx parse/syntax errors. Full package type/build validation requires installed project dependencies.
