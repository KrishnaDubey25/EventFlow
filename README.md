# EventFlow — 3D Premium Demo

A browser-first EventFlow prototype with three roles:

- Event Management
- Operator
- Attendee

## Important design choices

- No map on the public landing page.
- Live demo events are shown before login.
- Accounts and demo state run locally in the browser using localStorage.
- No Supabase, database, API key or environment file is required.
- 3D maps only appear inside attendee / operator / management workflows where a map is useful.
- 3D maps use MapLibre GL JS with OpenFreeMap / OpenStreetMap map data. No Google Maps API key is required.
- If map tiles cannot load, EventFlow shows a clean offline fallback instead of breaking the page.

## Run

You can double-click `index.html`, but for the best browser behavior use a local server:

```bash
python3 -m http.server 8080
```

Then open:

`http://localhost:8080`

## Demo flow

1. Open the landing page.
2. Pick one of the four demo live events.
3. Choose Attendee, Operator or Event Management.
4. Attendee: enter a ticket number (or use Demo Pass), choose what you want to do now, then press **Go there** to open the 3D map and route.
5. Operator: pick a live event, open tasks, use **Show on 3D map**, and update task status.
6. Management: open a live event, see the event health overview, crowd, travel, hotels, tasks and 3D operations map.

## Demo accounts

Password for all demo accounts: `event123`

- Management: `manager@eventflow.demo`
- Operator: `operator@eventflow.demo`
- Attendee: `attendee@eventflow.demo`

The accounts are seeded into localStorage when the app first runs.
