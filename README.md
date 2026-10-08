# Advanced Controls for Cesium.js

A minimal 3D globe using CesiumJS 1.121.0 and its Natural Earth II raster tiles, with a black sky and custom circle/polygon editing. No Cesium ion account or API token is required.

## Run

Run `npm start` (Python 3 required) and open http://localhost:8080. Or serve `dist/` with any static HTTP server. Internet access is required for the pinned Cesium CDN distribution, workers and Natural Earth tiles. Opening the HTML directly as a file URL is not supported.

## Circle

Choose **Circle**, then click the globe. This first point is the exact centre. An initial radius is chosen relative to camera altitude, so the handles are immediately visible. Drag the solid centre handle to move the circle without changing its radius. Drag the edge handle to change its radius and bearing. The inspector also accepts an exact radius in kilometres (10 m–5,000 km).

Circles are sampled using Vincenty's WGS 84 direct geodesic; resizing uses Cesium's ellipsoidal inverse geodesic. The fill and outline are ground-clamped overlays above the imagery, following Earth curvature with no extruded walls.

## Polygon

Choose **Polygon** and click to add vertices. A filled interior appears once three points exist. Double-click to add the final vertex and close the polygon; the double-click's second click is ignored. Enter or **Finish polygon** also closes it, useful on touch devices. **Undo point** removes the last drawing point; Escape cancels unfinished drawing.

Select a finished polygon to edit it. Drag the gold **MOVE** handle near its middle to move the entire polygon, including immediately after finishing it. The move handle is synthetic and never becomes a vertex. Dragging the polygon interior or outline navigates the camera instead, preventing accidental geometry movement. All vertices rotate together over the globe and are projected onto WGS 84, avoiding longitude wrapping or pole stretching; angular shape is preserved, while ellipsoidal metre lengths may vary slightly with latitude. Vertex handles remain independently draggable. Drag any solid vertex handle. Click a hollow midpoint handle to insert a vertex there, including along the closing edge. The new vertex can immediately be dragged. Midpoints are interpolated along WGS 84 geodesics, not averaged longitude/latitude values. Simple polygons smaller than a hemisphere are the intended scope; self-intersections and holes are not supported. Avoid antipodal edges. Up to 500 vertices per polygon and 200 shapes are retained.

## Navigation and state

Drag empty globe to orbit, scroll or pinch to zoom. Camera inputs pause during handle drags and recover on release, cancellation or loss of focus. V = select, C = circle, P = polygon; Delete/Backspace removes the selected shape. There are no default Cesium navigation widgets, timeline, animation controls, stars, Sun, Moon or atmosphere. Credits and help are accessible using the custom `?` button.

Completed shapes save automatically to localStorage (`cesium-advanced-controls-v1`). Unfinished polygons are not persisted. Saves belong to the current browser and origin; clearing site data removes them. Delete shape persists immediately. No data is sent to an application backend.

## Checks

`npm test` tests geodesic destinations (including poles/dateline), constant-radius circle rings, midpoint insertion ordering and save validation. `npm run check` validates JavaScript syntax. Interactive GPU/browser and real-device checks are recommended before production use.

## Structure

- `dist/app.js`: viewer setup, picking, drawing, handle dragging, persistence and UI.
- `dist/geometry.js`: WGS 84 forward geodesics, circle sampling, insertion and save validation.
- `dist/index.html`, `dist/style.css`: minimal responsive UI.
- `tests/geometry.test.js`: geometry/state regression checks.

Natural Earth II is a low-resolution global basemap: zooming does not reveal street-level detail. Cesium's bundled tile pyramid has levels 0–2 in this pinned distribution.

## Credits

[CesiumJS](https://cesium.com/platform/cesiumjs/) is Apache-2.0 licensed; its distribution retains its licence and notices. [Natural Earth](https://www.naturalearthdata.com/) imagery is public domain. These are linked from the in-app help panel. No Cesium ion or third-party satellite imagery is used.

## Overlap selection

Click where two or more shapes overlap to open a compact chooser containing each shape once (its fill and outline do not create duplicate entries). The chooser shows circle radius or polygon vertex count and marks the current selection. Choose the shape you want; Escape or clicking outside dismisses it. Arrow keys navigate the menu. A simple click inside an already-selected polygon still opens this menu. Whole-polygon movement requires dragging the gold MOVE handle more than five screen pixels. Handles take priority over whole-shape dragging.

## Reading and maintaining the code

Start with `dist/app.js`: `init()` creates the viewer, `bind()` wires the interface, and the named pointer handlers route edits. Shape records are the source of truth; Cesium fill, line and handle entities are disposable views. The pick metadata map links them back to shapes. `draft`, `gesture` and `drag` are transient and never stored.

`dist/geometry.js` contains independent pure functions documented with JSDoc types, parameters, return values and units. `polygonMovePoint()` computes a display-only centre using a tangent-plane centroid and an interior fallback for concave polygons. It supports ordinary simple polygons smaller than a hemisphere; degenerate or unsupported geometry falls back to a vector mean. `rotatePolygon()` rotates the original drag snapshot, so repeated pointer events do not accumulate distortion.

All JavaScript, HTML and CSS use Prettier with two-space indentation. Run `npm install` once for the pinned development formatter, then `npm run format` to format or `npm run format:check` to check. `npm test` covers geometry, persistence and handle-only movement; rendering still requires browser/device validation.
