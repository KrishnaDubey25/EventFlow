# EventFlow — Live Venue addition

The original event catalogue, booking screens, tickets, role dashboards, 3D homepage, simulations and resource workflows are retained. The new attendee journey appears inside the existing Overview dashboard and event hub. Organizer crowd and operator event detail screens contain expandable facility operations. The standalone `/live-venue` route remains available for direct room links.

## Dashboard journey and facilities

1. Log in as attendee. The first dashboard panel accepts a saved ticket, ticket ID, or uploaded pass (PNG/JPEG/WebP/PDF, up to 10 MB).
2. Image QR codes are matched against that account’s saved tickets. An unmatched pass or PDF requires event selection and is explicitly unverified; this does not validate admission or payment.
3. Answer “Are you at the event?” Yes requests browser location permission and opens the event map. A website cannot switch on device GPS without permission. “Not yet” opens the map without tracking.
4. If staff have published a room linked to that event, it connects automatically. Otherwise the event directory opens with the configured venue position and nearby listings.
5. Search/filter parking, hotels, stays, restaurants, food, booths, stalls, security, medical, water, toilets, transport, gates, exits, help and zones. Nearby OpenStreetMap listings depend on coverage and network access. They do not establish opening status, vacancies or crowd conditions.
6. Organizer/operator: expand “Venue map & facility operations”, create the linked event room or enter its private staff key, then publish exact facility coordinates and status. Optional capacity/usage fields display remaining rooms/spaces/seats. Both values are required together; availability is staff reported and can become stale.

Booths, stalls and event security points need staff-supplied positions. Facilities configured without coordinates are listed as awaiting map positions. No positions or vacancies are invented. Internal venue routing needs surveyed paths; the external Google Maps directions link requires no Google API key but does not incorporate internal crowd observations.

Nearby directory queries use a fixed 2 km radius and a 30-minute server cache. Failures show an explicit retry notice. The new pass panel does not call the legacy AI/OCR fallback. Uploaded files are decoded locally; only selection metadata is retained in this browser.

## Run locally

Use Node 22.12+ or Node 24.

```bash
npm ci
npm run dev
```

Open http://localhost:3000. No Google, OpenAI, or Gemini API key is needed for Live Venue. Existing optional AI features retain their original behavior. You do not need to copy the example environment file for local use. The original README refers to Gemini for its older AI features; this addition does not require it.

Production build:

```bash
npm run lint
npm run build
NODE_ENV=production npm start
```

Before production startup, set `LIVE_SETUP_KEY` to a private password you choose. This is not a purchased API key. The host password authorizes creation of new rooms. Set `LIVE_DATA_DIR` to persistent storage. Set `PORT` if required by your host.

## Try with two or three phones

1. Host the full Node server behind HTTPS. All devices must open the SAME deployed URL. Static-only Vite hosting does not provide the API. `localhost` on another phone is not your computer.
2. Open Live Venue and create a room with the event's actual latitude, longitude and proximity radius. Launching from an existing event pre-fills its coordinates. Confirm these coordinates before using them operationally.
3. The creator receives a private staff key saved in this browser tab's session storage. Copy it from Staff controls and keep it privately; it is needed after closing the tab. Give it only to trusted staff. The existing frontend demo login is NOT used as server authorization.
4. Staff select “Map a place”, click the real map position or enter coordinates, give the place a name/type/status, and publish. Update gates, parking, food, water, toilets and medical points here. These updates synchronize in about four seconds.
5. Share the room URL/code with attendees. The URL contains no staff key. Another staff phone uses the same room URL and enters the private staff key.
6. Attendees explicitly choose “I'm here · Start guidance” and grant location permission. Positions with accuracy worse than 100 metres, outside the venue proximity radius (allowing the accuracy margin), or older than two minutes are excluded from aggregation. The page reports accuracy and boundary uncertainty.
7. Purple map areas show approximate 50-metre cells of consenting devices. They are NOT total crowd estimates or people-per-square-metre density. Red/orange/green place markers are dated STAFF observations. After 15 minutes, observations are treated as unknown until staff update them.
8. Open “My attendance pass”. Staff first inspect the ORIGINAL admission ticket, then scan this separate Live Venue attendance QR for entry/exit. This pass records attendance only; it does not validate payment or entitlement. Duplicate entry/exit scans do not change the count. One browser session gets one pass; separate tabs can create separate registrations, so staff ticket checking remains essential.
9. Select a mapped destination. Open Google Maps walking directions without an API key for currently normal/busy places. Closed/crowded/unknown/stale places withhold this action. Google directions do not incorporate EventFlow observations or guarantee an approved internal path. Internal turn-by-turn navigation requires the venue's surveyed walkways and access rules; none are fabricated.
10. Stop sharing to remove your observation. Navigating away requests removal too; lost/offline clients expire automatically. Screen lock/background tabs cannot guarantee continuous web location. Keep the page visible for live guidance.

## What is real, and what remains the original prototype

- Live Venue: actual server-stored room state, staff observations, attendance scan state, consenting browser positions, camera QR reading and cross-device polling.
- Base map: Leaflet with OpenStreetMap tiles. Attribution retained. External internet is required. Failed map tiles display an explicit connection notice while the place list remains usable. OSM public tiles are subject to their usage policy and are not a free guaranteed mega-event infrastructure service; plan compliant tile hosting for heavy production traffic.
- Existing event simulations/localStorage dashboards remain unchanged and are separate from Live Venue observations. Updating an OLD simulated gate control does not silently change the new live room. Use the new Live Venue staff controls for shared real-device observations.
- The legacy ticket OCR fallback in `server.ts` already produces demonstration fields without AI. It was retained to honor the preservation request and must not be treated as real ticket verification. The new attendance desk explicitly requires original-ticket checking.
- No crowd count is invented, no simulated attendees are injected into live rooms, no prediction is advertised without sufficient measurements, and no emergency route is inferred from phone density.
- This addition uses a single Node instance and a private JSON data file. It is suitable for a small operational pilot. For large public events, replace this with authenticated per-operator roles, a transactional database, shared infrastructure and venue-approved routing/response procedures. Legacy account/booking sync across devices remains outside this additive change.

## Preservation and build repairs

- Added new files under `server/`, `src/components/live/`, and `src/pages/live/`.
- Existing components receive small import/link additions; no existing route or feature was removed.
- Added missing compatibility exports to `attendeeIntelligenceService.ts` needed by the pre-existing `AttendeeLiveStatusGuide`; its existing UI remains intact.
- Fixed the original Vite/esbuild dependency conflict; added Leaflet and its types; included a reproducible npm lockfile. The original bun lock is preserved for reference; use npm ci for this verified dependency tree.
- Development uses `node --import tsx server.ts`, avoiding the TSX CLI's unnecessary IPC dependency. Production server respects `PORT`.
- Added reduced-motion accessibility support, responsive layout, keyboard focus states, animated counters, orbit accents, transitions and map recentering.

## Data

Room staff and guest tokens are hashed on the server. No individual position history is returned to viewers; only aggregated cells. Location observations expire after two minutes (cleanup checks every 30 seconds); attendance records persist in the live data directory. Do not commit this directory or distribute it with the source ZIP. Room codes grant viewing access and are intended to be shared with attendees; public views contain aggregate activity and staff announcements.

## Example mode and ticket guidance

The attendee Overview now opens with a focused Example mode card. “Open live demo” uses the first ticket already booked on that account and opens its event map directly without requesting location. The conceptual upcoming cards only show other future events. The original dashboard tools remain accessible in the “More dashboard tools” section.

A matched EventFlow ticket identifies its event, ticket number, assigned gate, section and entry window. Event team gate observations appear beside the assigned gate. Status changes arrive through the shared room polling; attendees can choose an in-page summary every 10 or 30 minutes while the page remains open. This is an on-page interval, not a background push notification. The room and event map require the full Node server and external map tiles.

Staff can publish gate capacity and usage repeatedly. With at least three observations spanning two minutes in the last hour and a fresh latest reading, a simple linear trend estimates utilization 10 or 30 minutes ahead. The estimate is bounded to 100%, is labelled as a trend, and disappears when the data is stale or insufficient. Configured gate wait times are labelled event plan, not live ETA. A candidate alternative is shown only when the ticket's allowed gates include it and staff recently reported it normal; attendees are told to confirm reassignment with staff. Walking directions require an exact mapped gate coordinate and a fresh normal/busy status. The app does not promise a faster route or draw an unapproved interior path.
