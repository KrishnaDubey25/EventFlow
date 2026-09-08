# EventFlow — Intelligent Mega-Event Orchestration Platform

A self-contained hackathon demo website based on the EventFlow product specification.

## Run
No installation is required.

1. Unzip the folder.
2. Open `index.html` in Chrome, Edge, Safari or Firefox.

For best local development behavior, you can also serve the folder:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Recommended demo story
1. Launch EventFlow and enter **Organizer** mode.
2. Trigger **Crowd Surge**.
3. Observe North Gate pressure, alert changes and score drop.
4. Approve the **Redirect attendees** and **Deploy 3 shuttle buses** recommendations.
5. Switch to **Operator** using the bottom-left role switcher.
6. Accept the shuttle assignment and mark it completed.
7. Switch to **Attendee**.
8. See the personalized route and shuttle guidance updated.

## Features included
- Premium dark landing page and mission-control visual identity
- Organizer, Operator and Attendee role-specific experiences
- Event digital twin with simulated crowds and movement
- Real-time simulation state changes
- Crowd surge / parking full / transport failure / rain / exit / emergency scenarios
- Rule-based EventFlow recommendations
- AI Action Center with approve and simulate-impact actions
- Cross-role organizer → operator → attendee state synchronization
- Operator tasks and capacity actions
- Attendee journey, crowd-aware routing and accommodation recommendations
- Event timeline, alerts, analytics and command palette
- CMD/Ctrl + K shortcut
- LocalStorage persistence
- Responsive mobile layout
- Reduced-motion accessibility support
- No API key, database or paid map service required

## Demo note
All event telemetry, crowd data and recommendations are simulated for prototype demonstration purposes. EventFlow does not claim to replace official emergency-management systems.
