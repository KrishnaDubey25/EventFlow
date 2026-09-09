# EventFlow — Premium Local Demo

A full browser-based hackathon demo with three separate roles:

- Event Management
- Operator
- Attendee

## What this version includes

- Premium white / soft-blue visual system
- Very simple English across the UI
- Landing page that explains EventFlow before login
- Local Sign Up / Sign In using browser localStorage
- Three role-based dashboards
- Attendee ticket photo upload or ticket number flow
- Personal seat, best gate and route demo
- 3D-style stadium digital twin with crowd colors
- Live demo crowd changes
- Management actions that create operator tasks
- Operator task status that is saved locally
- Attendee messages that change after management/operator actions
- Parking, travel, hotel/stay, event timeline, alerts and reports
- Responsive desktop / tablet / mobile UI
- No database
- No API key
- No environment variables

## Run

The easiest way:

1. Open the folder.
2. Double-click `index.html`.

For a local server on macOS:

```bash
cd EventFlow-Reimagined
python3 -m http.server 8080
```

Then open:

`http://localhost:8080`

## Demo accounts

All demo passwords are:

`event123`

- Management: `manager@eventflow.demo`
- Operator: `operator@eventflow.demo`
- Attendee: `attendee@eventflow.demo`

You can also create your own local account.

## Best demo story

1. Open Management.
2. Click **Run crowd surge demo**.
3. North Gate becomes very busy.
4. Open **Smart Actions** and approve the East Gate move.
5. Sign out and open Operator.
6. Open **My Tasks**, accept/start/finish a new task.
7. Sign out and open Attendee.
8. Add a ticket photo or ticket number.
9. EventFlow shows the best gate, seat path, gate crowd and event journey.

## Important

This is intentionally a local demo. It does not claim to show real GPS crowd data across different phones. Cross-device GPS/crowd sharing would need a backend later.
