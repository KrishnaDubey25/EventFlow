# EventFlow Final Indoor 3D Setup

The indoor venue feature is fully local and does not require LingBot, Colab, Cloudflare, GPU hosting, API keys, or a reconstruction backend.

## Organizer flow
1. Open an event and choose **Indoor 3D Map**.
2. Optionally attach venue photos / walkthrough video as visual references.
3. Click **Build Indoor 3D Map**.
4. Select a gate, facility, or volunteer and enable placement mode.
5. Click the 3D concourse to reposition it.
6. Add more gates, medical points, food, washrooms, security points, or volunteers.

The layout is stored locally for the event.

## Attendee flow
1. Open **Live Venue**.
2. Choose **Open indoor 3D map**.
3. Select an indoor destination.
4. Follow the illuminated route and live guide.
5. Tap a volunteer in the map to request assistance.

## Deploy
```bash
npm install
npm run build
vercel --prod
```
