# EventFlow — LiveOps RealMap Upgrade

This is an **upgrade of the existing EventFlow-LiveOps-RealMap build**, not a fresh replacement project.

## Preserved
- Landing page and local authentication
- Event selection
- Management / Operator / Attendee roles
- Shared local live event state
- Crowd, gates, parking, transport and hospitality monitoring
- Operator actions and same-browser sync
- Existing live road map and routing behavior

## Added in this upgrade
- White-first premium EventFlow visual identity
- Organizer Command Center with Event Health, attendance, alerts, operators and resource utilization
- Live Digital Map with toggle layers: Crowd, Gates, Transport, Parking, Hospitality, Food, Medical, Security, Alerts, Operators, Resources
- Venue boundary, gates, parking, pickup, shuttle, transport, food, hotel, medical, security, toilets, emergency, restricted and operator locations
- Clickable map objects with status, severity, handler and EventFlow recommendation
- Live Event Feed with animated incoming activity
- Five demo scenarios: Normal, Gate Congestion, Parking Crisis, Transport Surge, Event Exit
- AI prediction + ripple impact + Accept / Modify / Dismiss / Deploy Resource controls
- Gate congestion demo chain: detect → recommend → organizer approve → operator task → operator activation → attendee redistribution → measured impact
- Personalized attendee gate assignment using ticket/session seed and live capacity
- My Journey with walk time, ETA, security and backup route
- Plan My Exit with distributed exits, pickup, metro, shuttle and parking guidance
- Impact Monitor with before/after crowd and event health
- Event Summary
- Expanded operator assignments and resource controls
- Gradual simulated changes to crowd-related services and live activity

## Demo accounts
Password for all demo accounts: `event123`

- Attendee: `attendee@eventflow.demo`
- Operator: `operator@eventflow.demo`
- Management: `manager@eventflow.demo`

## Best judge demo
1. Sign in as Management.
2. Open the live cricket event.
3. Select **Gate Congestion** scenario.
4. Open **AI Intelligence** and Accept the recommendation.
5. Sign in / switch to Operator in another tab and open **Assignments**.
6. Activate & complete the Gate 4 task.
7. Open Attendee view: ticket-based routing now distributes guests across available gates.
8. Return to Management → **Impact Monitor** to show Gate 2 pressure reduction.

## Map
The road map uses MapLibre GL JS + OpenFreeMap. Internet is needed for external road-map tiles and OSRM routing. EventFlow operations and activity panels remain usable if tiles/routing are unavailable.
