# EventFlow — Premium Mega-Event Orchestration Demo

This is a dependency-free frontend demo that can be opened directly in a browser and is already configured for the supplied Supabase project using a **publishable** browser key.

## Fastest run

1. Extract the ZIP.
2. Open `index.html` in Chrome/Edge/Safari.
3. Click **Launch demo** for the full seeded hackathon experience.

For a cleaner local origin, macOS users can also run:

```bash
cd EventFlow-Premium
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Enable persistent Supabase tables

The publishable key can authenticate browser users, but it cannot create database tables. To enable persistent EventFlow records:

1. Open Supabase Dashboard.
2. Open **SQL Editor**.
3. Paste and run `supabase-schema.sql` once.
4. Reload EventFlow and create/sign into a Supabase account.

The app automatically falls back to seeded live demo data if the tables are not installed or network access is unavailable.

## Best hackathon demo flow

1. Enter **Organizer / Command Center**.
2. Click **Crowd Surge**.
3. Open **AI Actions** and approve:
   - Redirect 700 attendees
   - Deploy 3 additional shuttles
   - Open Parking P4 overflow
4. Switch to **Operator** from the bottom-left role switch.
5. Open **Assignments** and accept/complete the new shuttle task.
6. Switch to **Attendee**.
7. Show the route changed to **East Gate**, updated shuttle guidance, and the simplified smart map.
8. Return to Organizer and show the improved EventFlow Coordination Score.

## Files

- `index.html` — app entry point
- `styles.css` — complete premium UI system
- `app.js` — dashboards, digital twin, simulations and cross-role state
- `supabase.js` — Supabase Auth/REST client with local demo fallback
- `config.js` — Supabase project URL + publishable key
- `supabase-schema.sql` — tables, seed data and RLS policies

## GitHub push

```bash
cd EventFlow-Premium
git init
git branch -M main
git remote add origin https://github.com/KrishnaDubey25/EventFlow.git
git add .
git commit -m "Rebuild EventFlow premium orchestration platform"
git push -u origin main --force
```

Only use `--force` if you intentionally want this rebuilt version to replace the current repository branch history. If you want to keep existing history, clone the repository first and copy these files into it, then commit normally.

## Security note

The included key is a Supabase **publishable** key intended for browser/client use. Never add a Supabase secret/service-role key, database password, or other server secret to this frontend or a public GitHub repository.
