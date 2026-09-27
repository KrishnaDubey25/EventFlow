# Validation — September 25, 2026

## Passed

- TypeScript check (`npm run lint`).
- Production frontend + server build (`npm run build`).
- API regression checks (`npm run test:live`): staff/guest authorization, invalid coordinates, location proximity and accuracy filtering, stop-sharing removal, room-scoped updates, duplicate entry/exit protection, unknown-pass rejection and omission of private credentials from public responses.
- Chromium browser interaction checks using two isolated contexts: permission-granted location contributes one device; stop removes it; attendance QR renders; entry/exit and duplicate handling work; staff closing a destination removes the attendee directions action; new staff place appears in the other browser; original homepage renders without JS exceptions.
- Desktop (1440px) and mobile (390px) screenshots visually inspected. No horizontal overflow at 390px.
- No original source file removed. Original screens preserved with additive dashboard panels and limited build compatibility repairs.

- Added API checks cover automatic event-room lookup, invalid nearby coordinates, all facility categories and capacity/usage validation.
- Dashboard browser checks: saved pass → arrival → map, “Not yet” leaves GPS off, “Yes” starts opt-in location under React StrictMode, QR image matches the account ticket, facility filtering/save/directions, automatic linked room connection, and organizer hotel update (20 rooms, 7 used) appearing as 13 available for the attendee.
- Fixed a closed legacy notification drawer extending the mobile page width; its feature remains available.

## Explicit limits

- External OpenStreetMap raster tiles were blocked/unavailable in the execution environment. Leaflet controls, coordinate overlays, staff markers, location layers and the tile-failure notice were verified, but successful street-tile download was NOT verified here. Internet access to tile.openstreetmap.org is needed when running the app.
- Nearby directory filtering used an explicitly named HTTP test fixture. Successful live Overpass responses were not verified in this environment; the app handles upstream failure without fabricated listings.
- Camera capture on physical phones and real GPS outdoors have not been field-tested. Automated browser location was supplied through the browser test API.
- The preserved application has a large pre-existing frontend bundle; Vite emits a size advisory. The new Live Venue page is lazy loaded.
- Tests verify the new additive live workspace, not every branch of the legacy booking/simulation product.
- Legacy accounts, bookings and operational simulations remain browser-local. New shared observations use the Live Venue staff panel; old simulated controls do not write to live rooms.

See LIVE_VENUE_GUIDE.md for deployment and a multi-phone walkthrough.

## Example mode follow-up

- Ticket-driven browser path checked: the account’s saved ticket opens its map from Example mode; the displayed ticket ID, gate and section match account data. Staff published a busy Gate 1, and its updated status appeared in attendee guidance. The 10-minute interval option and mobile width were exercised.
- Gate trend checked with three synthetic time-stamped utilization observations, and with insufficient observations (no estimate). Real performance and route travel times were not measured.
- A locally bundled vector illustration makes the example card render even when external event photos cannot load. The old dashboard remains behind “More dashboard tools”.
