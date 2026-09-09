# EventFlow — Visual Premium Local Demo

A clean, visual-first EventFlow prototype with three separate experiences:

- **Attendee** — ticket photo/number → event pass → best gate → simple destination route → travel/stay/event timing
- **Operator** — four live events → choose event → detailed tasks with where/what/by when → travel movement → hotel/resources
- **Management** — multi-event view → simple live event map → crowd decisions → operator task assignment

## What changed in this build

- Less white / less dashboard clutter; stronger navy + soft violet/aqua contrast.
- Landing page explains EventFlow visually before sign-in.
- Landing page contains a simple animated event world/map.
- Four live demo events are visible.
- Attendee ticket photo opens the demo pass automatically.
- Attendee chooses a destination: Seat, Food, Washroom, Medical Help, Exit, Parking, Stay.
- Event map intentionally shows only useful places and one focused route.
- Operator starts from a live-event hub instead of a dense dashboard.
- Operator tasks now show **WHERE / WHAT TO DO / BY WHEN / route area**.
- Management can select events and focuses on current decisions and team work.
- All user-facing copy uses simple English.
- Local browser auth only. No database, env file, API key, Supabase, or Google Maps required.

## Demo accounts

Password for all: `event123`

- Management: `manager@eventflow.demo`
- Operator: `operator@eventflow.demo`
- Attendee: `attendee@eventflow.demo`

## Run locally

You can double-click `index.html`, or use a local web server:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Vercel

From the project folder:

```bash
vercel login
vercel --prod
```

This is a static site and requires no build command.

## Important demo note

Ticket image analysis is simulated locally for the prototype. No uploaded ticket is sent to a server. The project is designed as a hackathon demonstration of the EventFlow experience and cross-role workflow.
