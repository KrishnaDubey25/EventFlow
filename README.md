# EventFlow — White Premium Rebuild (Edited)

This is the edited version of the existing White Premium Rebuild, not a separate redesign.

## Roles
- Attendee
- Hospitality
- Organizer

## Added in this edit
- Stronger white premium visual contrast with coral, violet, green and amber accents (no blue theme)
- More motion, hover feedback, live pulse and polished cards
- Attendee Live Updates page and notification feed
- Help & Support page with demo contacts and map shortcuts
- More colorful MapLibre/OpenFreeMap road map (`liberty` style)
- Cleaner crowd markers and crowd legend
- Turn-by-turn road routing using OSRM when available
- Google Maps fallback link for every selected destination
- Operator renamed to Hospitality
- Hospitality overview, tasks, transport/fleet capacity, hotels & rooms, housekeeping, live services and work map
- Hotel room cleaning actions
- Transport capacity/task flow
- Management renamed to Organizer
- Organizer can edit event start/end timing and event phase
- Organizer can assign new tasks to Hospitality teams
- Hospitality actions update Attendee and Organizer live state in the same browser via localStorage/BroadcastChannel

## Demo mode
No backend or database is required. Data is stored locally in the browser.

## Run
Open `index.html`, or serve the folder locally:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080

## Notes
- The road map requires internet access to load OpenFreeMap tiles.
- OSRM routing also requires internet access.
- If you prefer an external navigator, every route includes an **Open in Google Maps** link.
- Demo contact phone numbers are fictional placeholders.
