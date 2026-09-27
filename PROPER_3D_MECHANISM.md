# Proper 3D Venue Mechanism

This build replaces the previous depth-relief / warped-plane visualization.

Pipeline:
1. Organizer uploads venue walkthrough video/photos.
2. EventFlow extracts real key frames.
3. Browser loads a monocular neural depth model (Depth Anything V2 Small via Transformers.js).
4. Each sampled source pixel is back-projected into XYZ camera space using its estimated depth.
5. Source RGB values become the point colours, producing a dense real-pixel neural point cloud.
6. Three.js auto-frames the reconstructed bounds and provides orbit/zoom/pan inspection.
7. The same stored venue source can be loaded for organizer/attendee views.

No cartoon stadium or procedural venue geometry is used in the reconstruction canvas.

Important: this is browser-side monocular reconstruction, not multi-camera survey photogrammetry. Exact building-scale geometry still needs multi-view pose estimation / SLAM or a dedicated reconstruction backend.
