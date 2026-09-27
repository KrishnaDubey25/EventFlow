# EventFlow Video-assisted 2D Floor Map

- Replaces the experimental 3D venue feature with a stable 2D indoor floor-map workflow.
- Organizer uploads a walkthrough video and/or venue photos.
- EventFlow samples up to 8 key frames locally in the browser.
- Frames are analysed for coverage, structural edge density, brightness and dominant visual tone.
- A stadium / concert / expo / generic operational floor-plan template is generated from event context and analysis.
- Organizer can drag POI and volunteer markers to align the schematic with the real venue.
- The plan is stored in IndexedDB per event and reused by attendee view.
- Attendee can select source and destination and see an animated indoor route plus volunteers/facilities.
- No external API, GPU, Colab, Cloudflare tunnel or API key is required.

Note: the result is an operational navigation schematic derived from venue references, not an architectural survey/CAD extraction.
