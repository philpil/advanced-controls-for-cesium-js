import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import { polygonProblem, mergeVertices } from '../dist/topology.js';
import { restoreShapes, normalizeName, insertVertex } from '../dist/geometry.js';
import { createHistory } from '../dist/history.js';
const p = (x, y) => ({ lon: (x * Math.PI) / 180, lat: (y * Math.PI) / 180 });
const ring = (pairs) => pairs.map(([x, y]) => p(x, y));
const box = (x, y, w = 2, h = 2) =>
  ring([
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ]);
const shape = (vertices, id = 'a') => ({ id, type: 'polygon', vertices });

test('validation rejects bowties, touches, duplicate vertices and collinear backtracking', () => {
  assert.equal(polygonProblem(box(0, 0)), null);
  assert.match(
    polygonProblem(
      ring([
        [0, 0],
        [2, 2],
        [0, 2],
        [2, 0],
      ]),
    ),
    /cross/,
  );
  assert.ok(
    polygonProblem(
      ring([
        [0, 0],
        [2, 0],
        [1, 0],
        [2, 2],
        [0, 2],
      ]),
    ),
  );
  assert.ok(
    polygonProblem(
      ring([
        [0, 0],
        [2, 0],
        [2, 2],
        [0, 0],
        [0, 2],
      ]),
    ),
  );
  assert.ok(
    polygonProblem(
      ring([
        [0, 0],
        [0, 0],
        [1, 1],
      ]),
    ),
  );
  assert.ok(
    polygonProblem(
      ring([
        [0, 0],
        [1, 0],
        [2, 0],
      ]),
    ),
  );
});
test('validation accepts midpoint insertion on a curved high-latitude WGS84 edge', async () => {
  const { geodesic } = await import('../dist/vendor/geographic-tools.js');
  const points = ring([
    [-5, 70],
    [5, 70],
    [5, 75],
    [-5, 75],
  ]);
  const inv = geodesic.Inverse(70, -5, 70, 5);
  const middle = geodesic.Direct(70, -5, inv.azi1, inv.s12 / 2);
  assert.equal(polygonProblem(insertVertex(points, 0, p(middle.lon2, middle.lat2))), null);
});
test('union retains concavity and originals; containment and identical shapes succeed', () => {
  const a = shape(box(0, 0)),
    b = shape(box(1, 1), 'b'),
    original = structuredClone([a, b]);
  const merged = mergeVertices([a, b]);
  assert.equal(polygonProblem(merged), null);
  assert.ok(merged.length >= 8, 'true union keeps the notches rather than a convex hull');
  assert.deepEqual([a, b], original);
  assert.equal(polygonProblem(mergeVertices([a, shape(box(0.5, 0.5, 0.5, 0.5), 'b')])), null);
  assert.equal(polygonProblem(mergeVertices([a, structuredClone(a)])), null);
});
test('shared edges merge; disjoint shapes and point-only contact keep originals', () => {
  const a = shape(box(0, 0));
  assert.equal(polygonProblem(mergeVertices([a, shape(box(2, 0), 'b')])), null);
  assert.throws(() => mergeVertices([a, shape(box(4, 4), 'b')]), /overlap|share/);
  assert.throws(() => mergeVertices([a, shape(box(2, 2), 'b')]));
  assert.throws(() => mergeVertices([a]), /exactly two/);
});
test('union rejects a hole rather than silently filling it', () => {
  const bottom = shape(
    ring([
      [0, 0],
      [4, 0],
      [4, 4],
      [3, 4],
      [3, 1],
      [1, 1],
      [1, 4],
      [0, 4],
    ]),
  );
  const top = shape(box(0, 3, 4, 1), 'b');
  assert.throws(() => mergeVertices([bottom, top]), /hole/);
});
test('validation and union work across the date line and near both poles', () => {
  const a = shape(
    ring([
      [179, 5],
      [-179, 5],
      [-179, 7],
      [179, 7],
    ]),
  );
  const b = shape(
    ring([
      [178, 6],
      [-178, 6],
      [-178, 8],
      [178, 8],
    ]),
    'b',
  );
  assert.equal(polygonProblem(a.vertices), null);
  assert.equal(polygonProblem(mergeVertices([a, b])), null);
  for (const latitude of [88, -88]) {
    const polar = shape(box(-4, latitude, 8, 0.5));
    assert.equal(polygonProblem(polar.vertices), null);
    assert.equal(
      polygonProblem(mergeVertices([polar, shape(box(-2, latitude + 0.1, 8, 0.5), 'b')])),
      null,
    );
  }
});
test('circles merge with polygons and circles into editable polygons', () => {
  const circle = { id: 'c', type: 'circle', center: p(0, 0), radius: 150000 };
  assert.equal(polygonProblem(mergeVertices([circle, shape(box(0, 0), 'b')])), null);
  assert.equal(
    polygonProblem(mergeVertices([circle, { ...circle, id: 'd', center: p(1, 0) }])),
    null,
  );
});
test('names are sanitized and survive saves without changing older save compatibility', () => {
  assert.equal(normalizeName('  Area\nAlpha  '), 'AreaAlpha');
  assert.equal(normalizeName('x'.repeat(100)).length, 80);
  const named = { ...shape(box(0, 0)), name: '<b>Coverage</b>' };
  assert.deepEqual(restoreShapes({ version: 1, shapes: [named] }), [named]);
});
test('history clones snapshots, bounds growth and clears redo after a new edit', () => {
  const h = createHistory(2),
    original = [shape(box(0, 0))];
  h.reset(original);
  h.record(original);
  assert.equal(h.canUndo, false);
  original[0].name = 'Alpha';
  h.record(original);
  original[0].name = 'Beta';
  h.record(original);
  assert.equal(h.undo()[0].name, 'Alpha');
  const undone = h.undo();
  assert.equal(undone[0].name, undefined);
  undone[0].name = 'Do not mutate history';
  assert.equal(h.redo()[0].name, 'Alpha');
  h.record([{ ...original[0], name: 'New branch' }]);
  assert.equal(h.canRedo, false);
  h.record([{ ...original[0], name: 'Last' }]);
  h.undo();
  h.undo();
  assert.equal(h.canUndo, false);
});

// Exercise the actual production edit handlers with rendering/camera boundaries stubbed.
const source = fs.readFileSync(new URL('../dist/app.js', import.meta.url), 'utf8');
const editing = source.slice(
  source.indexOf('function addVertex('),
  source.indexOf('function handlePointerDown('),
);
function editHarness(vertices, drag = null) {
  const polygon = shape(structuredClone(vertices));
  const state = {
    draft: null,
    shapes: [polygon],
    drag,
    notices: [],
    createShapeId: () => 'draft',
    selectedShape: () => polygon,
    polygonProblem,
    validEdge: () => true,
    renderShape() {},
    renderHandles() {},
    updateUI() {},
    toast(message) {
      state.notices.push(message);
    },
    stopDrag() {
      state.drag = null;
    },
    Cesium: {
      Cartesian3: {
        angleBetween: () => 0.1,
        distance: (a, b) => Math.hypot(a.lon - b.lon, a.lat - b.lat) * 6378137,
      },
    },
    toCartesian: (p) => p,
    viewer: { camera: { positionCartographic: { height: 1000 } }, canvas: { style: {} } },
  };
  vm.runInNewContext(editing, state);
  return { state, polygon };
}
test('drawing discards a new point that crosses an existing or closing edge', () => {
  const { state } = editHarness([]);
  for (const point of ring([
    [0, 0],
    [2, 0],
    [2, 2],
  ]))
    state.addVertex(point);
  state.addVertex(p(3, 1));
  assert.equal(state.draft.vertices.length, 3);
  assert.match(state.notices.at(-1), /New point removed/);
});
test('existing vertex restores its drag-start location even after an intermediate valid move', () => {
  const original = box(0, 0),
    { state, polygon } = editHarness(original, {
      kind: 'vertex',
      index: 0,
      originalVertices: structuredClone(original),
    });
  state.applyDrag(p(-0.1, 0.1));
  assert.notDeepEqual(polygon.vertices, original);
  state.applyDrag(p(3, 1));
  assert.deepEqual(JSON.parse(JSON.stringify(polygon.vertices)), original);
  assert.match(state.notices.at(-1), /starting location/);
});
test('dragging a new midpoint across another edge deletes that inserted point', () => {
  const original = box(0, 0),
    vertices = insertVertex(original, 0, p(1, 0));
  const { state, polygon } = editHarness(vertices, {
    kind: 'vertex',
    index: 1,
    newVertex: true,
    originalVertices: structuredClone(original),
  });
  state.applyDrag(p(1, 3));
  assert.deepEqual(JSON.parse(JSON.stringify(polygon.vertices)), original);
  assert.equal(state.drag, null);
  assert.match(state.notices.at(-1), /New point removed/);
});
