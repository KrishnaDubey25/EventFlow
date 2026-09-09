# EventFlow — True Rebuild

A fully local, single-page EventFlow demo with three roles:

- Attendee
- Operator
- Event Management

## What changed in this rebuild

- Completely new UI and page structure.
- Landing page has no map.
- Sign in opens an event hub first.
- Live / Upcoming / Completed event list uses real browser time.
- Attendee: event -> ticket -> live activity -> destination -> turn-by-turn navigation.
- Navigation is a built-in 3D-style road cockpit with next turn, ETA, crowded route, safer gate and event service points.
- Management: control room with live program, crowd, travel, food, stay, parking and team jobs.
- Operator: detailed work with where, why, by when, route, resources and steps.
- No database, no API key, no environment variables.
- Works from a normal static deployment.

## Demo accounts

Password for all demo accounts: `event123`

- Attendee: `attendee@eventflow.demo`
- Operator: `operator@eventflow.demo`
- Management: `manager@eventflow.demo`

## Run

You can open `index.html` directly, or run:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.
