/**
 * @file Browser entry point for the Cesium globe editor.
 *
 * Shapes are plain serializable records; Cesium entities are disposable views.
 * `shapes` contains completed geometry, `draft` contains an unfinished polygon,
 * and `drag` is a temporary interaction snapshot. Only completed shapes persist.
 *
 * Lifecycle: init -> bind -> pointer/tool events -> update geometry -> redraw
 * entities/handles -> save on completed edits. See geometry.js for pure maths.
 * Geographic angles are radians internally; distances are metres. The inspector
 * converts these to degrees and kilometres only for display.
 * @typedef {import('./geometry.js').GeoPoint} GeoPoint
 * @typedef {import('./geometry.js').Shape} Shape
 * @typedef {Object} PickMetadata
 * @property {string} id ID of the owning shape, not the rendered entity.
 * @property {'shape'|'center'|'radius'|'vertex'|'midpoint'|'polygonMove'} kind
 * @property {number} [index] Vertex index or starting index of an edge.
 * @property {GeoPoint} [point] Handle's current geographic position.
 */
import {
  destination,
  circleRing,
  insertVertex,
  clampRadius,
  restoreShapes,
  rotatePolygon,
  selectionCandidates,
  polygonMovePoint,
} from './geometry.js';
/**
 * @param {string} id Element ID.
 * @returns {HTMLElement} Required application element.
 */
const getElement = (id) => document.getElementById(id);

/** Versioned storage key; transient handles are never written to this record. */
const KEY = 'cesium-advanced-controls-v1';
let Cesium,
  viewer,
  mode = 'select',
  selected = null,
  draft = null,
  drag = null,
  gesture = null,
  suppressUntil = 0,
  toastTimer;
let shapes = [],
  handles = [],
  visuals = new Map(),
  meta = new Map();
const ui = {
  circle: 'Click the globe to place the circle centre.',
  polygon: 'Click to add vertices. Double-click or press Enter to finish.',
  select: 'Select a shape to edit. Drag empty globe to orbit; scroll to zoom.',
};
/**
 * Displays a transient, non-blocking status message.
 * @param {string} message Text shown to the user.
 * @returns {void}
 */
function toast(message) {
  getElement('toast').textContent = message;
  getElement('toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => getElement('toast').classList.remove('visible'), 3200);
}
/**
 * Persists completed shapes only. Storage failures leave editing usable.
 * @returns {void}
 */
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: 1, shapes }));
    getElement('saved').textContent = 'SAVED ON THIS DEVICE';
  } catch {
    getElement('saved').textContent = 'LOCAL SAVE UNAVAILABLE';
  }
}
/**
 * @returns {string} Browser-generated UUID for a new persistent shape.
 */
const createShapeId = () => crypto.randomUUID();
/**
 * @returns {Shape|undefined} The selected completed shape.
 */
const selectedShape = () => shapes.find((s) => s.id === selected);
/**
 * Projects a geographic point onto the WGS 84 surface at zero height.
 * @param {GeoPoint} p Longitude/latitude in radians.
 * @returns {Cesium.Cartesian3} Earth-fixed position.
 */
function toCartesian(p) {
  return Cesium.Cartesian3.fromRadians(p.lon, p.lat, 0);
}
/**
 * Converts an Earth-fixed surface hit to serializable radians.
 * @param {Cesium.Cartesian3} p Earth-fixed position.
 * @returns {GeoPoint}
 */
function toGeographic(p) {
  const c = Cesium.Cartographic.fromCartesian(p);
  return { lon: c.longitude, lat: c.latitude };
}
/**
 * Builds an ellipsoidal shortest path for distance and midpoint calculations.
 * @param {GeoPoint} a Start point.
 * @param {GeoPoint} b End point; must not be antipodal to a.
 * @returns {Cesium.EllipsoidGeodesic}
 */
function geodesic(a, b) {
  return new Cesium.EllipsoidGeodesic(
    new Cesium.Cartographic(a.lon, a.lat),
    new Cesium.Cartographic(b.lon, b.lat),
  );
}
/**
 * Finds an edge midpoint along its WGS 84 geodesic, including the closing edge.
 * @param {GeoPoint} a Edge start.
 * @param {GeoPoint} b Edge end.
 * @returns {GeoPoint}
 */
function midpoint(a, b) {
  try {
    const p = geodesic(a, b).interpolateUsingFraction(0.5);
    return { lon: p.longitude, lat: p.latitude };
  } catch {
    return destination(a, 0, 10);
  }
}
/**
 * Converts viewport pointer coordinates into canvas-relative CSS pixels.
 * @param {PointerEvent|MouseEvent} e Browser input event.
 * @returns {Cesium.Cartesian2}
 */
function toScreenPosition(e) {
  const r = viewer.canvas.getBoundingClientRect();
  return new Cesium.Cartesian2(e.clientX - r.left, e.clientY - r.top);
}
/**
 * Raycasts the globe, ignoring overlay height. Returns null over black sky.
 * @param {Cesium.Cartesian2} p Canvas-relative pixels.
 * @returns {GeoPoint|null}
 */
function pickGlobePosition(p) {
  const ray = viewer.camera.getPickRay(p);
  if (!ray) return null;
  const hit = viewer.scene.globe.pick(ray, viewer.scene);
  return hit ? toGeographic(hit) : null;
}
/**
 * Collects every registered entity under the pointer, including overlaps.
 * @param {Cesium.Cartesian2} p Canvas-relative pixels.
 * @returns {PickMetadata[]} Front-to-back hit records; duplicates are possible.
 */
function pickAll(p) {
  return viewer.scene
    .drillPick(p, undefined, 12, 12)
    .map((h) => meta.get(h.id?.id))
    .filter(Boolean);
}
/**
 * Returns a handle before a shape body so editing controls take priority.
 * @param {Cesium.Cartesian2} p Canvas-relative pixels.
 * @returns {PickMetadata|undefined}
 */
function pick(p) {
  const hits = pickAll(p);
  return hits.find((h) => h.kind !== 'shape') || hits[0];
}
/**
 * Dismisses overlap choices and restores canvas focus when appropriate.
 * @returns {void}
 */
function closeSelectionMenu() {
  const menu = getElement('selectionMenu');
  const hadFocus = menu.contains(document.activeElement);
  menu.hidden = true;
  menu.replaceChildren();
  if (hadFocus) viewer.canvas.focus({ preventScroll: true });
}
/**
 * Selects a single hit directly, or builds an accessible popup for overlapping shapes.
 * @param {Cesium.Cartesian2} position Canvas-relative pick position.
 * @param {PointerEvent|MouseEvent} event Viewport coordinates used to position the popup.
 * @returns {void}
 */
function chooseAt(position, event) {
  const ids = selectionCandidates(pickAll(position), shapes);
  closeSelectionMenu();
  if (ids.length < 2) {
    select(ids[0] || null);
    return;
  }
  const menu = getElement('selectionMenu');
  const title = document.createElement('div');
  title.className = 'menu-heading';
  title.textContent = `${ids.length} overlapping shapes`;
  menu.append(title);
  for (const id of ids) {
    const s = shapes.find((s) => s.id === id),
      button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('role', 'menuitemradio');
    button.setAttribute('aria-checked', String(selected === id));
    const name = document.createElement('span');
    name.textContent = `${s.type === 'circle' ? 'Circle' : 'Polygon'} ${String(shapes.indexOf(s) + 1).padStart(2, '0')}`;
    const detail = document.createElement('small');
    detail.textContent =
      (s.type === 'circle'
        ? `${(s.radius / 1000).toFixed(1)} km radius`
        : `${s.vertices.length} vertices`) + (selected === id ? ' · selected' : '');
    button.append(name, detail);
    button.onclick = () => {
      select(id);
      toast(
        'Shape selected. Drag its handles' +
          (s.type === 'polygon' ? '; the gold MOVE handle moves the whole polygon.' : '.'),
      );
    };
    menu.append(button);
  }
  menu.hidden = false;
  menu.style.left = `${Math.max(8, Math.min(event.clientX + 12, innerWidth - menu.offsetWidth - 8))}px`;
  menu.style.top = `${Math.max(8, Math.min(event.clientY + 12, innerHeight - menu.offsetHeight - 8))}px`;
  menu.querySelector('button').focus({ preventScroll: true });
}

/**
 * Creates an entity and registers its application metadata for picking.
 * @param {Object} options Cesium Entity constructor options.
 * @param {PickMetadata} data Editing metadata, kept outside persisted shape records.
 * @returns {Cesium.Entity}
 */
function entity(options, data) {
  const e = viewer.entities.add(options);
  meta.set(e.id, data);
  return e;
}
/**
 * Removes a rendered entity and its pick metadata; accepts missing entities.
 * @param {Cesium.Entity|undefined} e Entity to discard.
 * @returns {void}
 */
function remove(e) {
  if (!e) return;
  meta.delete(e.id);
  viewer.entities.remove(e);
}
/**
 * Removes the fill and outline for one shape without changing its data.
 * @param {string} id Shape identifier.
 * @returns {void}
 */
function removeVisual(id) {
  const v = visuals.get(id);
  if (v) {
    remove(v.fill);
    remove(v.line);
    visuals.delete(id);
  }
}
/**
 * Creates or updates ground-clamped fill/outline entities from shape data.
 * @param {Shape} s Shape or unfinished polygon.
 * @param {boolean} [isDraft=false] Use active styling for unfinished geometry.
 * @returns {void}
 */
function renderShape(s, isDraft = false) {
  const vertices = s.type === 'circle' ? circleRing(s) : s.vertices;
  let v = visuals.get(s.id);
  if (!v) {
    v = {};
    visuals.set(s.id, v);
  }
  const active = s.id === selected || isDraft,
    color = Cesium.Color.fromCssColorString(active ? '#adf0d0' : '#70b5d7');
  const points = vertices.map(toCartesian);
  if (points.length >= 3) {
    const hierarchy = new Cesium.PolygonHierarchy(points);
    if (!v.fill)
      v.fill = entity(
        {
          polygon: {
            hierarchy,
            material: color.withAlpha(0.23),
            perPositionHeight: false,
            classificationType: Cesium.ClassificationType.TERRAIN,
            zIndex: active ? 2 : 1,
            arcType: Cesium.ArcType.GEODESIC,
          },
        },
        { kind: 'shape', id: s.id },
      );
    else {
      v.fill.polygon.hierarchy = hierarchy;
      v.fill.polygon.material = color.withAlpha(0.23);
      v.fill.polygon.zIndex = active ? 2 : 1;
    }
  } else if (v.fill) {
    remove(v.fill);
    v.fill = null;
  }
  if (points.length >= 2) {
    const closed = points.length >= 3 ? [...points, points[0]] : points;
    if (!v.line)
      v.line = entity(
        {
          polyline: {
            positions: closed,
            width: 2,
            material: color,
            clampToGround: true,
            classificationType: Cesium.ClassificationType.TERRAIN,
            zIndex: active ? 3 : 1,
            arcType: Cesium.ArcType.GEODESIC,
          },
        },
        { kind: 'shape', id: s.id },
      );
    else {
      v.line.polyline.positions = closed;
      v.line.polyline.material = color;
    }
  } else if (v.line) {
    remove(v.line);
    v.line = null;
  }
  viewer.scene.requestRender();
}
/**
 * Creates a vertex, midpoint, circle-centre or radius editing point.
 * @param {GeoPoint} p Handle location.
 * @param {PickMetadata} data Owning shape and interaction type.
 * @param {boolean} [hollow=false] Distinguish insertion handles from vertex handles.
 * @returns {Cesium.Entity}
 */
function handlePoint(p, data, hollow = false) {
  return entity(
    {
      position: toCartesian(p),
      point: {
        pixelSize: hollow ? 10 : 13,
        color: Cesium.Color.fromCssColorString(hollow ? '#142921' : '#dbffed'),
        outlineColor: Cesium.Color.fromCssColorString(hollow ? '#adf0d0' : '#315b48'),
        outlineWidth: hollow ? 2 : 3,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: 0,
      },
    },
    { ...data, point: p },
  );
}
/**
 * Creates the synthetic gold MOVE control for a completed polygon. It is never a vertex.
 * @param {import('./geometry.js').PolygonShape} shape Polygon to position the handle within.
 * @returns {Cesium.Entity}
 */
function moveHandle(shape) {
  const point = polygonMovePoint(shape.vertices);
  return entity(
    {
      position: toCartesian(point),
      point: {
        pixelSize: 20,
        color: Cesium.Color.fromCssColorString('#ffcb70'),
        outlineColor: Cesium.Color.fromCssColorString('#6a4520'),
        outlineWidth: 3,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: 0,
      },
      label: {
        text: 'MOVE',
        font: '10px sans-serif',
        fillColor: Cesium.Color.fromCssColorString('#ffda97'),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(0, -24),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    },
    { kind: 'polygonMove', id: shape.id, point },
  );
}
/**
 * Discards the selected/draft shape handles and their pick metadata.
 * @returns {void}
 */
function clearHandles() {
  handles.forEach(remove);
  handles = [];
}
/**
 * Rebuilds handles for the selected shape or draft. Drafts have no move handle.
 * @returns {void}
 */
function renderHandles() {
  clearHandles();
  const s = draft || selectedShape();
  if (!s) return;
  if (s.type === 'circle') {
    handles.push(handlePoint(s.center, { kind: 'center', id: s.id }));
    handles.push(
      handlePoint(destination(s.center, s.bearing, s.radius), { kind: 'radius', id: s.id }),
    );
  } else {
    s.vertices.forEach((p, i) =>
      handles.push(handlePoint(p, { kind: 'vertex', id: s.id, index: i })),
    );
    if (!draft)
      s.vertices.forEach((p, i) =>
        handles.push(
          handlePoint(
            midpoint(p, s.vertices[(i + 1) % s.vertices.length]),
            { kind: 'midpoint', id: s.id, index: i },
            true,
          ),
        ),
      );
    if (!draft) handles.push(moveHandle(s));
  }
  viewer.scene.requestRender();
}
/**
 * Synchronizes inspector, tools, hints and counts without overwriting a focused radius input.
 * @returns {void}
 */
function updateUI() {
  const s = selectedShape();
  getElement('inspector').hidden = !s || !!draft;
  getElement('drawing').hidden = mode !== 'polygon';
  getElement('shapeCount').textContent = `${shapes.length} SHAPE${shapes.length === 1 ? '' : 'S'}`;
  for (const t of ['select', 'circle', 'polygon']) {
    getElement(t + 'Tool').classList.toggle('active', t === mode);
    getElement(t + 'Tool').setAttribute('aria-pressed', String(t === mode));
  }
  getElement('hintText').textContent =
    s && mode === 'select'
      ? s.type === 'circle'
        ? 'Drag the centre to move. Drag the edge handle to resize.'
        : 'Drag the gold MOVE handle to move the polygon. Other handles edit vertices.'
      : ui[mode];
  getElement('drawingCount').textContent = `${draft?.vertices.length || 0} points`;
  getElement('finishPolygon').disabled = !draft || draft.vertices.length < 3;
  getElement('undoPoint').disabled = !draft?.vertices.length;
  if (s) {
    getElement('shapeType').textContent = s.type.toUpperCase();
    getElement('shapeName').textContent =
      `${s.type === 'circle' ? 'Circle' : 'Polygon'} ${String(shapes.indexOf(s) + 1).padStart(2, '0')}`;
    getElement('circleFields').hidden = s.type !== 'circle';
    getElement('polygonFields').hidden = s.type !== 'polygon';
    if (s.type === 'circle') {
      if (document.activeElement !== getElement('radiusInput'))
        getElement('radiusInput').value = (s.radius / 1000).toFixed(3);
      getElement('centreValue').textContent =
        `${Cesium.Math.toDegrees(s.center.lat).toFixed(3)}°, ${Cesium.Math.toDegrees(s.center.lon).toFixed(3)}°`;
    } else getElement('vertexCount').textContent = s.vertices.length;
  }
  viewer.canvas.style.cursor = mode === 'select' ? 'grab' : 'crosshair';
}
/**
 * Changes selection and refreshes both old/new styling and editing handles.
 * @param {string|null} id Shape ID, or null to deselect.
 * @returns {void}
 */
function select(id) {
  closeSelectionMenu();
  const old = selected;
  selected = id;
  if (old) {
    const s = shapes.find((x) => x.id === old);
    if (s) renderShape(s);
  }
  if (id) {
    const s = selectedShape();
    if (s) renderShape(s);
  }
  renderHandles();
  updateUI();
}
/**
 * Ends an active edit, restores camera input, and saves the completed edit.
 * @returns {void}
 */
function stopDrag() {
  if (drag) {
    drag = null;
    viewer.scene.screenSpaceCameraController.enableInputs = true;
    save();
  }
}
/**
 * Switches drawing tools, cancelling any unfinished polygon and active drag.
 * @param {'select'|'circle'|'polygon'} next New tool.
 * @returns {void}
 */
function setMode(next) {
  closeSelectionMenu();
  stopDrag();
  if (draft) {
    removeVisual(draft.id);
    draft = null;
  }
  mode = next;
  select(null);
}
/**
 * Validates the closing edge and commits the draft as a selected polygon.
 * @returns {void}
 */
function finishPolygon() {
  if (!draft || draft.vertices.length < 3) {
    toast('Add at least three vertices first.');
    return;
  }
  if (!validEdge(draft.vertices.at(-1), draft.vertices[0])) {
    toast('The closing edge needs distinct, non-antipodal endpoints.');
    return;
  }
  const s = draft;
  shapes.push(s);
  draft = null;
  mode = 'select';
  select(s.id);
  save();
  toast('Polygon closed. Drag the gold MOVE handle to move the whole shape.');
}
/**
 * Adds a distinct drawing point and updates live polygon fill from three points onward.
 * @param {GeoPoint} p New surface position.
 * @returns {void}
 */
function addVertex(p) {
  if (!draft) {
    draft = { id: createShapeId(), type: 'polygon', vertices: [] };
  }
  const last = draft.vertices.at(-1);
  if (
    last &&
    Cesium.Cartesian3.distance(toCartesian(last), toCartesian(p)) <
      Math.max(1, viewer.camera.positionCartographic.height * 0.000001)
  )
    return;
  if (draft.vertices.length >= 500) {
    toast('Maximum 500 vertices per polygon.');
    return;
  }
  draft.vertices.push(p);
  renderShape(draft, true);
  renderHandles();
  updateUI();
}
/**
 * Deletes only the selected completed shape and persists the result.
 * @returns {void}
 */
function deleteSelected() {
  if (!selected) return;
  removeVisual(selected);
  shapes = shapes.filter((s) => s.id !== selected);
  select(null);
  save();
}
/**
 * Rejects coincident and nearly antipodal endpoints before geodesic construction.
 * @param {GeoPoint} a Edge start.
 * @param {GeoPoint} b Edge end.
 * @returns {boolean}
 */
function validEdge(a, b) {
  return (
    Cesium.Cartesian3.distance(toCartesian(a), toCartesian(b)) > 1 &&
    Cesium.Cartesian3.angleBetween(toCartesian(a), toCartesian(b)) < Math.PI - 0.02
  );
}
/**
 * Updates geometry for the active handle. Whole-polygon rotation always uses the original snapshot to avoid accumulating drift.
 * @param {GeoPoint} p Current surface hit; callers ignore pointer positions over sky.
 * @returns {void}
 */
function applyDrag(p) {
  const s = selectedShape();
  if (!s || !drag) return;
  if (drag.kind === 'polygon') {
    s.vertices = rotatePolygon(drag.original, drag.anchor, p);
  } else if (drag.kind === 'center') {
    s.center = p;
  } else if (drag.kind === 'radius') {
    try {
      const line = geodesic(s.center, p);
      s.radius = clampRadius(line.surfaceDistance);
      s.bearing = line.startHeading;
    } catch {
      return;
    }
  } else if (drag.kind === 'vertex') {
    const prev = s.vertices[(drag.index + s.vertices.length - 1) % s.vertices.length],
      next = s.vertices[(drag.index + 1) % s.vertices.length];
    if (!validEdge(prev, p) || !validEdge(p, next)) return;
    s.vertices[drag.index] = p;
  }
  renderShape(s);
  renderHandles();
  updateUI();
  viewer.canvas.style.cursor = 'grabbing';
}
/**
 * Starts editing only on an explicit handle. Shape fills/outlines remain available for selection and normal camera navigation.
 * @param {PointerEvent} e Primary pointer-down event.
 * @returns {void}
 */
function handlePointerDown(e) {
  const canvas = viewer.canvas;
  if (!e.isPrimary || e.button !== 0) return;
  closeSelectionMenu();
  gesture = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
  if (mode !== 'select') return;
  const position = toScreenPosition(e),
    hits = pickAll(position),
    handle = hits.find((h) => h.kind !== 'shape');
  let data;
  if (handle) {
    const s = shapes.find((s) => s.id === handle.id);
    if (!s) return;
    selected = s.id;
    data = { ...handle };
    if (handle.kind === 'midpoint') {
      if (s.vertices.length >= 500) {
        toast('Maximum 500 vertices per polygon.');
        return;
      }
      s.vertices = insertVertex(s.vertices, handle.index, handle.point);
      data = { kind: 'vertex', id: s.id, index: handle.index + 1 };
      renderShape(s);
      renderHandles();
      updateUI();
      save();
    }
  } else return;
  // Whole-polygon movement is restricted to its synthetic handle.
  if (handle.kind === 'polygonMove') {
    const anchor = pickGlobePosition(position);
    if (!anchor) return;
    data = {
      kind: 'polygon',
      id: handle.id,
      anchor,
      original: selectedShape().vertices.map((p) => ({ ...p })),
    };
  }
  drag = data;
  viewer.scene.screenSpaceCameraController.enableInputs = false;
  canvas.setPointerCapture(e.pointerId);
  e.preventDefault();
  e.stopImmediatePropagation();
  canvas.style.cursor = 'grabbing';
}
/**
 * Updates readout, hover cursor, or the active edit after the drag threshold.
 * @param {PointerEvent} e Pointer movement.
 * @returns {void}
 */
function handlePointerMove(e) {
  // Ignore a second finger while the primary pointer owns an edit.
  if (gesture && e.pointerId !== gesture.id) return;
  const canvas = viewer.canvas;
  if (gesture && Math.hypot(e.clientX - gesture.x, e.clientY - gesture.y) > 5) gesture.moved = true;
  const pos = toScreenPosition(e),
    p = pickGlobePosition(pos);
  if (p)
    getElement('coordinates').textContent =
      `${Cesium.Math.toDegrees(p.lat).toFixed(3)}°  ${Cesium.Math.toDegrees(p.lon).toFixed(3)}°`;
  if (drag) {
    if (p && (drag.kind !== 'polygon' || gesture?.moved)) applyDrag(p);
    e.preventDefault();
    e.stopImmediatePropagation();
  } else if (mode === 'select' && !gesture) {
    const h = pick(pos);
    canvas.style.cursor = h
      ? h.kind === 'midpoint'
        ? 'copy'
        : h.kind === 'shape'
          ? 'pointer'
          : 'grab'
      : 'grab';
  }
}
/**
 * Completes a handle edit and suppresses its synthetic click, then releases pointer capture.
 * @param {PointerEvent} e Pointer release.
 * @returns {void}
 */
function handlePointerUp(e) {
  const canvas = viewer.canvas;
  if (gesture?.id !== e.pointerId) return;
  const captured = !!drag,
    moved = gesture.moved;
  if (captured || moved) suppressUntil = performance.now() + 150;
  stopDrag();
  gesture = null;
  if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
  if (captured) {
    e.preventDefault();
    e.stopImmediatePropagation();
  }
  updateUI();
}
/**
 * Registers browser, toolbar and keyboard interactions once after viewer creation.
 * @returns {void}
 */
function bind() {
  const canvas = viewer.canvas;
  canvas.style.touchAction = 'none';
  canvas.tabIndex = 0;
  document.addEventListener(
    'pointerdown',
    (e) => {
      if (!getElement('selectionMenu').contains(e.target)) closeSelectionMenu();
    },
    true,
  );
  getElement('selectionMenu').addEventListener('keydown', (e) => {
    const buttons = [...getElement('selectionMenu').querySelectorAll('button')],
      i = buttons.indexOf(document.activeElement);
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      closeSelectionMenu();
    } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      const next =
        e.key === 'Home'
          ? 0
          : e.key === 'End'
            ? buttons.length - 1
            : (i + (e.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next]?.focus();
    }
  });
  addEventListener('resize', closeSelectionMenu);
  viewer.camera.moveStart.addEventListener(closeSelectionMenu);

  canvas.addEventListener('pointerdown', handlePointerDown, true);
  canvas.addEventListener('pointermove', handlePointerMove, true);
  canvas.addEventListener('pointerup', handlePointerUp, true);
  canvas.addEventListener('pointercancel', () => {
    stopDrag();
    gesture = null;
    suppressUntil = performance.now() + 150;
  });
  canvas.addEventListener('lostpointercapture', () => {
    stopDrag();
    gesture = null;
  });
  addEventListener('blur', () => {
    stopDrag();
    gesture = null;
  });
  canvas.addEventListener('click', (e) => {
    if (performance.now() < suppressUntil || e.detail > 1) return;
    const position = toScreenPosition(e),
      p = pickGlobePosition(position);
    if (mode === 'circle') {
      if (!p) return;
      if (shapes.length >= 200) {
        toast('Maximum 200 shapes. Delete a shape first.');
        return;
      }
      const s = {
        id: createShapeId(),
        type: 'circle',
        center: p,
        radius: clampRadius(viewer.camera.positionCartographic.height * 0.055),
        bearing: Math.PI / 2,
      };
      shapes.push(s);
      mode = 'select';
      select(s.id);
      save();
    } else if (mode === 'polygon') {
      if (!p) return;
      if (shapes.length >= 200) return toast('Maximum 200 shapes.');
      if (draft?.vertices.length && !validEdge(draft.vertices.at(-1), p))
        return toast('Choose a distinct point less than halfway around the globe.');
      addVertex(p);
    } else {
      chooseAt(position, e);
    }
  });
  canvas.addEventListener('dblclick', (e) => {
    e.preventDefault();
    if (mode === 'polygon') finishPolygon();
  });
  for (const t of ['select', 'circle', 'polygon'])
    getElement(t + 'Tool').onclick = () => setMode(t);
  getElement('finishPolygon').onclick = finishPolygon;
  getElement('cancelDrawing').onclick = () => setMode('select');
  getElement('undoPoint').onclick = () => {
    if (draft) {
      draft.vertices.pop();
      renderShape(draft, true);
      renderHandles();
      updateUI();
    }
  };
  getElement('deleteShape').onclick = deleteSelected;
  getElement('closeInspector').onclick = () => select(null);
  getElement('radiusInput').onchange = () => {
    const s = selectedShape(),
      value = Number(getElement('radiusInput').value) * 1000;
    if (!s || s.type !== 'circle') return;
    if (!Number.isFinite(value) || value < 10 || value > 5000000) {
      toast('Enter a radius between 0.01 and 5,000 km.');
      getElement('radiusInput').value = (s.radius / 1000).toFixed(3);
      return;
    }
    s.radius = value;
    renderShape(s);
    renderHandles();
    save();
  };
  getElement('aboutButton').onclick = () => getElement('about').showModal();
  getElement('closeAbout').onclick = () => getElement('about').close();
  addEventListener('keydown', (e) => {
    if (
      ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName) ||
      getElement('about').open ||
      !getElement('selectionMenu').hidden
    )
      return;
    const k = e.key.toLowerCase();
    if (k === 'escape') {
      setMode('select');
      return;
    }
    if (k === 'enter' && mode === 'polygon') {
      e.preventDefault();
      finishPolygon();
    } else if (k === 'delete' || k === 'backspace') {
      e.preventDefault();
      if (mode === 'polygon') getElement('undoPoint').click();
      else deleteSelected();
    } else if (k === 'v') setMode('select');
    else if (k === 'c') setMode('circle');
    else if (k === 'p') setMode('polygon');
  });
  addEventListener('pagehide', save);
}
/**
 * Loads Cesium, creates the minimal viewer, restores shapes and installs interactions.
 * @returns {Promise<void>} Resolves after application setup; throws if Cesium is unavailable.
 */
async function init() {
  // The classic Cesium script is deferred; wait for all deferred scripts to finish.
  if (document.readyState === 'loading')
    await new Promise((resolve) => addEventListener('DOMContentLoaded', resolve, { once: true }));
  if (!window.Cesium) throw new Error('Cesium could not load. Check your connection and reload.');
  Cesium = window.Cesium;
  viewer = new Cesium.Viewer('globe', {
    baseLayer: false,
    animation: false,
    timeline: false,
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    navigationInstructionsInitiallyVisible: false,
    fullscreenButton: false,
    vrButton: false,
    infoBox: false,
    selectionIndicator: false,
    skyBox: false,
    skyAtmosphere: false,
    scene3DOnly: true,
    shouldAnimate: false,
    requestRenderMode: true,
    maximumRenderTimeChange: Infinity,
    terrainProvider: new Cesium.EllipsoidTerrainProvider(),
    creditContainer: getElement('cesiumCredits'),
  });
  viewer.scene.backgroundColor = Cesium.Color.BLACK;
  viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#173345');
  viewer.scene.globe.enableLighting = false;
  viewer.scene.globe.showGroundAtmosphere = false;
  viewer.scene.fog.enabled = false;
  viewer.scene.screenSpaceCameraController.minimumZoomDistance = 100;
  viewer.scene.screenSpaceCameraController.maximumZoomDistance = 60000000;
  viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
  viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  const imagery = new Cesium.UrlTemplateImageryProvider({
    url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII') + '/{z}/{x}/{reverseY}.jpg',
    tilingScheme: new Cesium.GeographicTilingScheme(),
    maximumLevel: 2,
    hasAlphaChannel: false,
    credit: new Cesium.Credit('Natural Earth II'),
  });
  viewer.imageryLayers.addImageryProvider(imagery);
  let imageryWarned = false;
  imagery.errorEvent.addEventListener(() => {
    if (!imageryWarned) {
      imageryWarned = true;
      toast('Imagery could not load. Check your internet connection.');
    }
  });
  viewer.camera.setView({ destination: Cesium.Cartesian3.fromDegrees(8, 25, 19500000) });
  try {
    shapes = restoreShapes(JSON.parse(localStorage.getItem(KEY)));
  } catch {
    shapes = [];
  }
  for (const s of shapes) renderShape(s);
  bind();
  updateUI();
  getElement('loading').hidden = true;
  viewer.scene.renderError.addEventListener((_scene, error) => {
    console.error(error);
    toast('The globe renderer stopped. Reload to recover your saved drawings.');
  });
}
init().catch((error) => {
  console.error(error);
  getElement('loading').replaceChildren();
  const p = document.createElement('p');
  p.textContent = error.message;
  getElement('loading').append(p);
});
