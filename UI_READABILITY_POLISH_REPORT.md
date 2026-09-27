# EventFlow UI Readability & Professional Polish

This pass intentionally keeps the existing EventFlow palette and feature set. It only improves readability, hierarchy, form visibility, alignment and visual consistency inside authenticated pages. The landing experience was not redesigned.

## Fixed
- Create Event form input text, selected values and placeholders are now explicitly dark and readable on the beige/light form surface.
- Added a global form-control safety layer so inherited cream text from the dark application shell cannot become invisible inside light inputs.
- Preserved intentionally dark command-center inputs with an explicit dark-input override.
- Added a light-surface/dark-surface contrast matrix for legacy cards that mixed brown text with navy backgrounds.
- Secondary copy is stronger on both light and dark surfaces.
- Existing bright EventFlow blue is automatically shifted to the already-used stronger blue where it carries text/button contrast on light surfaces.
- Card borders, shadows, focus states, form labels, tables and mobile inputs received a consistency pass.
- No workflow, route, Weather, Nugen, indoor-map, crowd, capacity, operator or attendee feature was removed.

## Contrast spot checks
- Primary ink #0B1120 on paper #FFFDF8: ~18.5:1
- Primary ink #0B1120 on beige #F0E9D6: ~15.5:1
- Secondary ink #5F594F on beige #F0E9D6: ~5.7:1
- Light text #F8F6F0 on navy #0B1120: ~17.4:1
- Muted light text #BBC7D8 on navy #0B1120: ~11.0:1
- White on strong EventFlow blue #2D5FD2: ~5.7:1

## Validation
- Existing final workflow audit: 24/24 passed after this UI pass.
- `npm ci` could not finish in the artifact container because dependency download timed out, so a full Vite production build still needs to be run on the user's machine before deployment.
