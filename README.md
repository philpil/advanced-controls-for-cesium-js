# Advanced Controls for Cesium.js

A minimal 3D globe using CesiumJS 1.121.0 and its Natural Earth II raster tiles, with a black sky and custom circle/polygon editing. No Cesium ion account or API token is required.

## Run

Run `npm start` (Python 3 required) and open http://localhost:8080. Or serve `dist/` with any static HTTP server. Internet access is required for the pinned Cesium CDN distribution, workers and Natural Earth tiles. Opening the HTML directly as a file URL is not supported.

## Circle

Choose **Circle**, then click the globe. This first point is the exact centre. An initial radius is chosen relative to camera altitude, so the handles are immediately visible. Drag the solid centre handle to move the circle without changing its radius. Drag the edge handle to change its radius and bearing. The inspector also accepts an exact radius in kilometres (10 m–5,000 km).

Circles are sampled using Vincenty's WGS 84 direct geodesic; resizing uses Cesium's ellipsoidal inverse geodesic. The fill and outline are ground-clamped overlays above the imagery, following Earth curvature with no extruded walls.

## Polygon

Choose **Polygon** and click to add vertices. A filled interior appears once three points exist. Double-click to add the final vertex and close the polygon; the double-click's second click is ignored. Enter or **Finish polygon** also closes it, useful on touch devices. **Undo point** removes the last drawing point; Escape cancels unfinished drawing.

Select a finished polygon to edit it. Drag the gold **MOVE** handle near its middle to move the entire polygon, including immediately after finishing it. The move handle is synthetic and never becomes a vertex. Dragging the polygon interior or outline navigates the camera instead, preventing accidental geometry movement. All vertices rotate together over the globe and are projected onto WGS 84, avoiding longitude wrapping or pole stretching; angular shape is preserved, while ellipsoidal metre lengths may vary slightly with latitude. Vertex handles remain independently draggable. Drag any solid vertex handle. Click a hollow midpoint handle to insert a vertex there, including along the closing edge. The new vertex can immediately be dragged. Midpoints are interpolated along WGS 84 geodesics, not averaged longitude/latitude values. Simple polygons comfortably inside one hemisphere are the intended scope; crossing edges, non-adjacent touches, backtracking and zero-area polygons are rejected. Holes are not supported. Avoid antipodal edges. Up to 500 vertices per polygon and 200 shapes are retained.

## Navigation and state

Click the bottom-right **shape count** to browse all completed circles and polygons. Each entry shows its radius or vertex count. Choose one to select it and fly to a padded, top-down view sized to its outline. Bounds include samples along geodesic edges and use Earth-fixed coordinates for dateline/pole support. Tiny shapes use a minimum camera distance. Arrow keys navigate the list; Escape or clicking outside closes it. Reduced-motion preferences disable the flight animation. Finish or cancel an unfinished polygon before flying elsewhere.

Drag empty globe to orbit, scroll or pinch to zoom. Camera inputs pause during handle drags and recover on release, cancellation or loss of focus. V = select, C = circle, P = polygon; Delete/Backspace removes the selected shape. There are no default Cesium navigation widgets, timeline, animation controls, stars, Sun, Moon or atmosphere. Credits and help are accessible using the custom `?` button.

Names and completed shapes save automatically to localStorage (`cesium-advanced-controls-v1`). Unfinished polygons are not persisted. Saves belong to the current browser and origin; clearing site data removes them. Delete shape persists immediately. No data is sent to an application backend.

## Checks

`npm test` covers geodesic destinations, midpoint insertion, save/name validation, selection/navigation, union, crossing-edge rollback and undo history. Merge tests include containment, identical boundaries, shared edges, concavity, circles, dateline/pole support and rejected holes/disconnected results. `npm run check` validates JavaScript syntax. Run `npm run test:browser` for a real Chromium smoke check (after `npm ci` and `npx playwright install chromium`). It exercises rendered labels, renaming/save reload, multi-selection, merge, undo/redo, an actual crossing vertex drag, midpoint rollback, and desktop/phone viewport layout. Internet access is needed for the pinned Cesium CDN. Real iPhone/Safari checks remain recommended before production use.

## Structure

- `dist/app.js`: viewer setup, picking, drawing, handle dragging, persistence and UI.
- `dist/geometry.js`: WGS 84 forward geodesics, circle sampling, insertion, name and save validation.
- `dist/topology.js`: WGS 84 edge sampling, polygon validity and two-shape boundary union.
- `dist/history.js`: bounded, independent snapshots for undo/redo.
- `dist/vendor/`: checked-in local geometry dependencies and licence notices.
- `scripts/vendor-entry.js`: reproducible bundling entry; run `npm run build:vendor` after dependency updates.
- `tests/browser-smoke.cjs`: real Cesium/Chromium interaction checks; test-only state access is injected by Playwright, never shipped in the app.
- `dist/index.html`, `dist/style.css`: minimal responsive UI.
- `tests/geometry.test.js`: geometry/state regression checks.

Natural Earth II is a low-resolution global basemap: zooming does not reveal street-level detail. Cesium's bundled tile pyramid has levels 0–2 in this pinned distribution.

## Credits

[CesiumJS](https://cesium.com/platform/cesiumjs/) is Apache-2.0 licensed; its distribution retains its licence and notices. [Natural Earth](https://www.naturalearthdata.com/) imagery is public domain. These are linked from the in-app help panel. No Cesium ion or third-party satellite imagery is used. [polygon-clipping](https://github.com/mfogel/polygon-clipping), [GeographicLib](https://geographiclib.sourceforge.io/), robust-predicates and splaytree are bundled locally under their MIT licences; see `dist/vendor/NOTICE.txt`. Geometry editing does not require an additional CDN or API token.

## Overlap selection

Click where two or more shapes overlap to open a compact chooser containing each shape once (its fill and outline do not create duplicate entries). The chooser shows circle radius or polygon vertex count and marks the current selection. Choose the shape you want; Escape or clicking outside dismisses it. Arrow keys navigate the menu. A simple click inside an already-selected polygon still opens this menu. Whole-polygon movement requires dragging the gold MOVE handle more than five screen pixels. Handles take priority over whole-shape dragging.

## Reading and maintaining the code

Start with `dist/app.js`: `init()` creates the viewer, `bind()` wires the interface, and the named pointer handlers route edits. Shape records are the source of truth; Cesium fill, line and handle entities are disposable views. The pick metadata map links them back to shapes. `draft`, `gesture` and `drag` are transient and never stored.

`dist/geometry.js` contains independent pure functions documented with JSDoc types, parameters, return values and units. `polygonMovePoint()` computes a display-only centre using a tangent-plane centroid and an interior fallback for concave polygons. It supports ordinary simple polygons smaller than a hemisphere; degenerate or unsupported geometry falls back to a vector mean. `rotatePolygon()` rotates the original drag snapshot, so repeated pointer events do not accumulate distortion.

All JavaScript, HTML and CSS use Prettier with two-space indentation. Run `npm install` once for the pinned development formatter, then `npm run format` to format or `npm run format:check` to check. `npm test` covers geometry, persistence and handle-only movement; rendering still requires browser/device validation.

## Shape names and labels

Every completed shape displays its name on the globe, in the shape list and in overlap choices. Select one shape and use **Shape name → Rename** in the inspector (Enter also submits). Names are trimmed, limited to 80 characters, rendered as text, and included in local saves. Old version-1 saves remain compatible: missing names receive a stable default when loaded. Existing names do not change when another shape is deleted. Labels follow the shape during editing and respect globe occlusion. Dense labels may overlap; a label visibility switch would be a useful future extension.

## Multiple selection and merge

Use **Shift/Ctrl/Cmd-click**, or enable **Multi** and tap/click shapes to toggle their selection. This also works in the shape list; normal list selection still flies to a shape. Overlapping shapes retain the chooser. Selected shapes are highlighted together; individual edit handles appear only for a single selection with Multi disabled. The group panel can delete all selected shapes. Use its × to clear the selection.

Select exactly two shapes and choose **Merge into polygon**. Polygon/polygon, circle/polygon and circle/circle combinations are supported. The operation computes the actual combined boundary, preserving concavity rather than creating a convex hull. Circles become polygons using their displayed 160-point boundary. The new name combines both names and can be changed immediately.

Shapes must overlap or share an edge. Separate islands, point-only contact, holes, output above 500 vertices and geometry outside the supported projection hemisphere are rejected, leaving both originals intact. Very large shapes near the projection horizon are also rejected. Geographic clipping uses a shared gnomonic projection and adaptively sampled WGS 84 geodesics, with a 2-metre projected chord tolerance and millimetre coordinate rounding. It is an approximation for interactive editing, not survey-grade boundary analysis. Small coincident neighbours below 1cm are collapsed after clipping.

## Crossing-edge protection

Validation includes the closing edge as soon as a draft has three points, matching the live filled preview. If a new drawing point causes a crossing or invalid ring, that point is discarded immediately. If an existing vertex is dragged into an invalid position, the geometry returns to its drag-start snapshot; dragging back into a valid position can continue the edit. If a newly inserted midpoint is dragged across an edge, that insertion is removed and the original polygon is restored. The camera is released and a status message explains the rejected edit. Whole-polygon moves are validated too.

Validation samples WGS 84 geodesics to a 25cm projected chord tolerance and checks crossings, non-adjacent touches, repeated points, backtracking and degenerate area. As with any sampled numerical method, intersections within that tolerance are not a survey-grade guarantee. Legacy invalid polygons are retained on load with a warning; newly drawn/edited geometry must pass validation, and invalid legacy shapes cannot be merged.

## Undo and redo

Use the **Undo / Redo** buttons, **Ctrl/Cmd+Z**, or **Ctrl/Cmd+Shift+Z** (**Ctrl/Cmd+Y** also redoes). Creation, renaming, radius changes, completed drags, midpoint insertion, merge and deletion are recorded. A drag is one edit; a midpoint insertion plus its drag is one edit. Rejected edits do not create a history entry. Undoing a merge restores both originals with their names. Up to 50 edits are retained in memory; reloading starts a fresh history while retaining saved shapes. Finish or cancel a draft before undoing completed shapes. Drafts continue to use **Undo point**.

## Movable inspector panels

Drag the grip/title at the top of the shape inspector or multi-selection panel to move it out of the way with a mouse or finger. Each panel retains its own position for the page session, including when changing selections. Fields, Rename, Merge, Delete and × remain normal controls. Panels stay inside the visible screen when dragged, resized or rotated; tall panels scroll internally. Keyboard users can focus the header grip and use arrow keys (16px steps), Shift+arrows (64px), or Home to return to the default responsive position.

Use **−** in either panel header to minimise it to a draggable title bar, and **+** to restore it. Minimising leaves the selection and all active editing handles intact, so circles can still be moved/resized and polygon vertices or the gold MOVE handle remain editable. The minimise state is independent for each panel and lasts for the page session. **×** still clears the selection.
