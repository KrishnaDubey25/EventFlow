# Video-derived 2D Floor Map

This build removes the previous fixed stadium/concert/expo floor templates from the generation path.

Generation now uses the uploaded venue media itself:

1. Sample keyframes from the walkthrough video.
2. Measure frame structure and estimate frame-to-frame horizontal motion to trace the walkthrough path and turns.
3. Run browser-side zero-shot visual classification on representative frames (CLIP via Transformers.js, no API key) to identify likely entrance, corridor, seating, stage, food, medical, washroom, help desk, exit, concourse, or parking areas.
4. Build zones and POIs around the traced path, so different videos generate different layouts.
5. Attendee navigation follows the actual generated walkway polyline rather than a fixed bezier route.

The result is still an operational navigation schematic, not a surveyed CAD floor plan. Low-confidence detections remain editable by the organizer.
