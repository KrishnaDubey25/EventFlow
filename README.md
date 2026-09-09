# EventFlow LiveOps RealMap

A static, no-database hackathon demo of an end-to-end event operating system.

## What is new
- Premium landing page with no map.
- Sign in -> main event list with Live / Upcoming / Completed filters.
- Attendee ticket -> live program -> food/parking/stay/transport -> real road navigation.
- MapLibre + OpenFreeMap/OpenStreetMap real vector map (no Google Maps key).
- OSRM road routing with turn steps and alternatives when the public service is reachable.
- Live gate crowd overlays, parking markers, food/status markers, medical, transit, hotel.
- Operator can open/close gates, add lines, free parking, mark food free and deploy shuttles.
- LocalStorage + BroadcastChannel syncs those demo operations across tabs in the same browser.

## Demo accounts
- attendee@eventflow.demo / event123
- operator@eventflow.demo / event123
- manager@eventflow.demo / event123

## Run locally
```bash
python3 -m http.server 8080
```
Open http://localhost:8080

## Notes
- External road map tiles and road routing require an internet connection in the browser.
- Crowd/operations values are demo simulation data, not real-world telemetry.
- Browser geolocation requires the user's permission and works on HTTPS (Vercel) or localhost.
