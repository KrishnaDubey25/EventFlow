# EventFlow — White Premium Rebuild

A fresh EventFlow demo rebuild focused on a clean white premium UI (no blue), simple English, clear navigation, detailed parking/food/stay flows, operator missions and management control.

## Run

Open `index.html` directly, or preferably:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Demo accounts

Use **Use demo account** after selecting a role.

- Attendee
- Operator
- Management

No database or API key is required. Accounts and live demo state use browser localStorage. Operator changes sync across tabs with BroadcastChannel where supported.

## Map

The navigation screen uses MapLibre + OpenFreeMap for the road map and tries OSRM public routing for route geometry/turn steps. If map tiles or routing are blocked, the route instructions and event status panels still remain usable.

## Main improvements

- White premium theme with coral, violet and green accents; no blue UI theme.
- Landing page has no map.
- Sign in -> event list -> Live / Upcoming / Completed -> event-specific flow.
- Attendee ticket -> live schedule -> choose destination -> navigation.
- Specific food stalls with wait time and Go There buttons.
- Car/bike parking with free-space counts and road restrictions.
- Stay/hotel cards with price, rooms, shuttle and demo contact numbers.
- Operator tasks for gate, cleaning, parking, lighting and health issues.
- Operator service controls update guest/management status locally.
- Management control room with guests, gates, food, parking, travel, stay, teams and jobs.
- Navigation shows turn card, ETA, distance, route steps, crowd status and nearby live services.
