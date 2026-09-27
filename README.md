# EventFlow

EventFlow is an event-operations platform for **Attendee, Organizer and Operator** workflows.

## Current integrated features

- Published indoor 2D venue map shared across roles
- Attendee source → destination navigation and inside-event location sharing
- Organizer live crowd view and volunteer reassignment
- Operator field checklist and resource/capacity operations
- Separate Weather Digital Twin (live weather, map, social/public signals, what-if + uncertainty)
- Separate Nugen-aligned, role-scoped EventFlow AI assistant
- Browser-persistent demo state for maps, collaboration, trends and weather cache

## Run

```bash
npm install
npm run test:final
npm run build
npm run dev
```

## Nugen aligned model

See `NUGEN_INTEGRATION.md`.

```bash
export NUGEN_API_KEY='YOUR_PRIVATE_KEY'
npm run nugen:align
```

Configure the resulting Nugen IDs as server-side Vercel environment variables. Never commit the API key or expose it with a `VITE_` prefix.

## Demo data persistence

The current hackathon build intentionally supports same-browser/same-origin synchronization through localStorage/IndexedDB. For true cross-device production synchronization, replace this persistence layer with a shared database/realtime backend.
