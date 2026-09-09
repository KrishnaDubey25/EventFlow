# EventFlow — End-to-End Premium Demo

EventFlow is an original hackathon prototype for end-to-end event guidance and operations.

## What is included

- Premium landing page with no map
- Live event cards first
- Three roles: Attendee, Operator, Event Management
- Local browser sign-in/sign-up (`localStorage`), no database
- Live / Upcoming / Completed event lists with unique Event IDs
- Attendee ticket number → pass → happening now → full journey → food/stay/help → 3D guide
- Short events skip mandatory stay; long or multi-day events include stay planning
- Operator event assignments, detailed jobs, work steps, work location and 3D work map
- Management views for guests, travel, gates, parking, food, hotels, staff, mobile assets, messages, tasks and reports
- 3D MapLibre/OpenFreeMap map only where a map is useful
- Built-in local 3D venue fallback so a failed tile request never leaves a blank map

## Map stack

The map uses MapLibre GL JS 5.24.0 and OpenFreeMap vector maps. No Google Maps key is required.

The previous prototype attempted to load a MapLibre v6 browser build using the old v5 UMD file path. This build pins a compatible v5 browser script and uses OpenFreeMap's documented `liberty` style.

## Run

You can open `index.html` directly, but a local web server is better:

```bash
python3 -m http.server 8080
```

Then open:

`http://localhost:8080`

## Demo accounts

Password for all demo accounts: `event123`

- Management: `manager@eventflow.demo`
- Operator: `operator@eventflow.demo`
- Attendee: `attendee@eventflow.demo`

## Product research note

The event operations design was informed by publicly described crowd-management capabilities such as visitor-flow analysis, arrival/departure analysis, location-based messaging, operations management and engagement analysis. EventFlow is an original prototype and is not affiliated with or endorsed by PwC.
