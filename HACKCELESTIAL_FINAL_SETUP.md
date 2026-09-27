# HackCelestial Final Setup

## 1. Install + verify

```bash
npm install
npm run test:final
npm run build
```

## 2. Nugen mandatory alignment

```bash
export NUGEN_API_KEY='YOUR_PRIVATE_KEY'
npm run nugen:align
```

Copy the non-secret IDs printed/written by the script into Vercel:

```text
NUGEN_API_KEY=<private server secret>
NUGEN_MODEL_ID=<aligned model id>
NUGEN_ALIGNMENT_ID=<alignment id>
NUGEN_BASE_MODEL=qwen-v2p5-0p5b-instruct
NUGEN_ALIGNMENT_NAME=EventFlow Role Assistant Intelligence
```

## 3. Demo flow

### Indoor operations
1. Organizer creates/opens an event.
2. Organizer opens **Indoor Map**, uploads venue video/photos, generates the floor map, verifies markers, then **Publish map**.
3. Attendee opens the same event → **Indoor Map**, selects source/destination, taps **I'm inside**, and can request nearby help.
4. Organizer Crowd Management sees inside-event attendee positions.
5. Organizer drags a volunteer to a new zone; an operator field task is created.
6. Operator opens the event → **Indoor live map / Field checklist**, acknowledges and completes the task.

### Weather Digital Twin
1. Organizer opens **Weather Twin**.
2. Show live/current weather + next rain window.
3. Show venue geospatial impact map and public-signal count.
4. Move rain/temperature/wind/flood controls.
5. Show updated gate/transport impacts, suggested shifts and P10/P50/P90 uncertainty.

### Nugen
1. Open the Nugen bot on Attendee, Organizer and Operator separately.
2. Ask role-relevant EventFlow questions.
3. Demonstrate that unrelated or other-role requests are refused/limited to the current role context.
