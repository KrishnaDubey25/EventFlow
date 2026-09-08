# EventFlow — Free Maps + Live GPS Crowd Routing

This build removes Google Maps and all Google Maps API key requirements.

## Stack

- **MapLibre GL JS** — interactive browser map, no Google key.
- **OpenStreetMap raster tiles** — road/base geography.
- **Browser Geolocation API** — attendee live GPS after explicit permission.
- **Supabase** — authentication + latest attendee GPS rows + aggregate crowd RPC.
- **Public OSRM demo router** — key-free road route and alternative-route demo.
- **EventFlow crowd logic** — combines gate pressure with opted-in GPS density and recommends a lower-pressure gate.

## Important privacy behavior

Attendee GPS is collected only after the attendee taps **Share live GPS** and the browser grants permission. Raw attendee locations are protected by RLS. The organizer map reads only rounded, short-lived aggregate cells through `get_crowd_cells()`.

## Supabase setup

1. Open your Supabase project.
2. Go to **SQL Editor**.
3. Run all of `supabase-schema.sql` once.
4. For real cross-device GPS, create/sign in with an attendee account before sharing location.

Your supplied Supabase project URL + publishable key are already in `config.js`.

Never put a `service_role` key, JWT secret, or database password in this frontend.

## Run locally

Because browser geolocation requires a secure context, use localhost rather than opening the file directly:

```bash
cd EventFlow-FreeMaps-GPS
python3 -m http.server 8080
```

Open `http://localhost:8080` on the same computer.

For a phone GPS demo, deploy the folder to an HTTPS host (for example Vercel/Netlify/GitHub Pages) and scan the organizer's **Check-in QR** from the phone. Modern mobile browsers require HTTPS for geolocation.

## Demo flow

1. Organizer → Live Map → **Check-in QR**.
2. Attendee scans QR on phone.
3. Attendee signs in/registers with Supabase if needed.
4. Tap **Share live GPS** and allow location permission.
5. Organizer sees aggregate live crowd circles on the MapLibre/OpenStreetMap map.
6. Trigger **Crowd Surge** or gather multiple GPS signals near a gate.
7. Attendee taps **Find alternate route**.
8. EventFlow scores gates using crowd pressure + distance, selects a lower-pressure gate, then requests up to 3 road alternatives from the key-free OSRM demo router.

## No paid map key

There is no `GOOGLE_MAPS_API_KEY` and no Google Maps dependency in this build.

### Demo-service note

The standard OpenStreetMap tile server and public OSRM router are community/demo infrastructure, not production SLA services. They are appropriate for a hackathon demo with light traffic. For a production deployment, self-host tiles/routing or use a provider that gives you an SLA and usage allowance.
