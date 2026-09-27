# EventFlow Attendee + Simulation Help Update

## Scope preserved
- Landing page unchanged.
- Existing routes and previously implemented workflows retained.
- Only attendee overview contrast plus attendee/operator/organizer map collaboration enhancements were changed.

## Changes
- Attendee Overview uses the existing navy + beige identity instead of a blue-only surface.
- Indoor map now includes attendee destination search.
- Attendee can inspect nearby operators and use the existing operator detail card to request help.
- Help requests continue to reach organizer notifications and the operator help/task flow.
- Organizer Crowd Management now exposes two clear controls: Run Simulation and Simulated Data.
- Run Simulation animates synthetic attendee movement on the published venue map.
- Simulated Data shows fake GPS-enabled demo devices with an explicit SIMULATED label.
- Real presence remains based on attendee opt-in/browser geolocation; synthetic devices are never presented as real phones.
- Text/readability styles were strengthened only for the updated attendee/map surfaces.

## Validation
- Existing final workflow audit: 24/24 PASS.
- Existing user-request audit: 30/30 PASS.
- New targeted workflow checks: 10/10 PASS.
- TypeScript/TSX syntax scan: 159 files, 0 syntax errors.
- Full Vite build was not run because project dependencies are not installed in this execution environment.
