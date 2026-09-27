# EventFlow Weather-Driven Digital Twin

Weather is a **separate Organizer feature** at `Weather Twin`. It is not combined with the Nugen chatbot.

## Mandatory challenge requirements

1. **Live weather integration** — current and forecast data from Open-Meteo, including rain, temperature, wind and the next detected rain window/probability.
2. **Geospatial visualization** — Leaflet/OpenStreetMap venue map with venue risk halo and projected impact nodes for gates, transit, parking and covered areas.
3. **Real-world public/social signals** — the backend queries recent public disruption/weather signals and exposes the current signal count to the twin.
4. **What-if simulation** — organizer can vary rain, temperature, wind and flood depth and see corresponding changes in operational impact.

## Operational outputs

The twin keeps the UI intentionally compact and focuses on:

- transport stress,
- gate pressure,
- rain/heat/flood risk,
- suggested staff/gate/route shifts,
- P10/P50/P90 uncertainty and confidence.

It is an operational simulation layer: changing the scenario changes the simulated EventFlow state without changing the real event.

## Data/cache behavior

Weather and signal responses use browser-side cache/fallback so short network interruptions do not immediately blank the dashboard. Simulation inputs and observations remain event-specific.

## Nugen is separate

Nugen is implemented independently as the role-scoped EventFlow AI chatbot. See `NUGEN_INTEGRATION.md`.
