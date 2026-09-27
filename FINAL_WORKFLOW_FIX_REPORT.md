# EventFlow – Final Attendee + Organizer Workflow Fix

This build keeps the existing visual theme and focuses on the requested workflow cleanup.

## 1. Published Indoor Map
- Organizer edits a draft map and explicitly publishes it.
- Published map is indexed by event ID and normalized event name.
- Attendee and Operator load the same published map with polling/storage-event refresh.
- Indoor Map now renders inside the correct Attendee / Organizer / Operator application shell, so sidebar navigation remains visible.

## 2. Attendee Map + Nearby Operator Help
- Attendee chooses Source → Destination on the indoor map.
- `I'm inside` shares the attendee's indoor point and device geolocation (when permission is granted).
- Nearby volunteer markers are presented as **Operators**.
- Clicking an Operator shows operator status and distance from the selected indoor source.
- `Request help` creates a persistent help request.
- Organizer receives a bell notification.
- Operator receives the request in the map and Field Checklist and can Acknowledge / Resolve it.

## 3. Organizer Operator Dispatch
- Organizer sees live inside-event attendees in Crowd Management.
- Organizer can drag an Operator marker on the map.
- A field assignment is created with from/to venue locations.
- Operator receives a notification + checklist item and can Acknowledge / Done.

## 4. Attendee Cleanup
- Event schedule/plan is below the event banner.
- Event venue/location has fallbacks so a blank location is not silently rendered.
- Event plan was compressed into schedule + small Entry / Food / Medical / Help cards.
- Hero contrast was corrected for readable event details.
- Indoor Map + location are placed as compact work-zone cards.

## 5. JSON / HTML API Error Guard
Attendee-facing API readers now use safe JSON parsing. If a static host or misconfigured API returns `<!doctype html>`, EventFlow reports a controlled service-unavailable message instead of throwing `Unexpected token '<'`.

Covered paths include:
- Live Venue
- Attendee Journey live-room lookup
- Ticket live-room polling
- Nearby place API
- Nugen assistant
- weather social-signal API

## 6. Organizer Ecosystem Removal / Redistribution
- Ecosystem removed from organizer navigation.
- Old Ecosystem URLs redirect to Overview.
- Connected node count and aggregate capacity are on Organizer Overview.
- Resource inventory/capacity is in Live Command as cards.
- Resource calculations show Capacity / Load / Available / Utilization + Trend Registry samples.
- Operational Dependencies are surfaced in My Events configuration.

## 7. Live Command Cleanup
Removed the large Event Pressure and primary/secondary/connected-risk cards.
Kept compact:
- Simulation controls
- Average resource load
- Early warning count
- Open action count
- Early Warning + Action Pipeline
- Resource Capacity cards + trend

Simulation warnings are pushed into the common Notification Bell.
Repeated warnings refresh the existing bell item rather than being dropped.

## 8. Weather – Per Event
- Weather is separate from Nugen.
- Each organizer event links to its own Weather Twin route.
- Multiple events can be switched within Weather Twin.
- Each event uses its own event latitude/longitude.
- Displays live weather, next-rain window, what-if Rain / Temperature / Wind / Flood, suggested operational shifts and compact P10/P50/P90 uncertainty.

## 9. Hospitality Cleanup
- Medical Assistance tab removed from visible Hospitality tabs.
- Other Services tab removed from visible Hospitality tabs.
- Hospitality overview summary now displays Food & Concessions rather than mixing medical/other services.

## 10. Alerts
- Organizer Alerts removed from sidebar/navigation.
- Old Alerts URLs redirect to Overview.
- No manual alert-generation workflow is exposed.
- Alerts/warnings are consumed through the header Bell / Notification drawer.

## Validation
- `npm run test:final`: **24/24 PASS**
- `npm run test:user-flow`: **30/30 PASS**
- TypeScript parser audit: **0 syntax/parser errors**.
- Full Vite production build could not be executed in the artifact container because dependency installation timed out; local deployment should still run `npm install && npm run build` before pushing.

## Local-demo persistence
The requested organizer → attendee → operator shared workflow works across tabs on the same browser/origin using localStorage + IndexedDB + custom storage events. Cross-device synchronization still requires a shared database/realtime backend.
