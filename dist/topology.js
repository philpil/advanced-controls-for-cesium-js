/**
 * @file Simple-polygon validation and geographic union, independent of Cesium/DOM.
 * WGS84 edges are adaptively sampled in one local gnomonic projection. Unlike
 * longitude/latitude clipping, this handles the dateline and either pole.
 * Only geometry comfortably within one hemisphere is supported. Operations
 * fail without mutating their inputs when this or the 500-vertex limit is exceeded.
 */
import { union, geodesic } from './vendor/geographic-tools.js';
import { A, circleRing, wrapLongitude } from './geometry.js';
const DEG = 180 / Math.PI;
const dot = (a, b) => a.reduce((sum, x, i) => sum + x * b[i], 0);
const unit = (p) => [
  Math.cos(p.lat) * Math.cos(p.lon),
  Math.cos(p.lat) * Math.sin(p.lon),
  Math.sin(p.lat),
];

/** @param {import('./geometry.js').GeoPoint[]} vertices All operation vertices. */
function projection(vertices) {
  const vectors = vertices.map(unit);
  let normal = vectors.reduce((sum, v) => sum.map((x, i) => x + v[i]), [0, 0, 0]);
  const length = Math.hypot(...normal);
  if (length < 1e-8) throw new Error('Keep the polygon within one hemisphere.');
  normal = normal.map((x) => x / length);
  const lon = Math.atan2(normal[1], normal[0]);
  const east = [-Math.sin(lon), Math.cos(lon), 0];
  const north = [
    -normal[2] * east[1],
    normal[2] * east[0],
    normal[0] * east[1] - normal[1] * east[0],
  ];
  return {
    forward(p) {
      const v = unit(p),
        denominator = dot(v, normal);
      if (denominator <= 0.1) throw new Error('Keep the polygon within one hemisphere.');
      return [(A * dot(v, east)) / denominator, (A * dot(v, north)) / denominator];
    },
    inverse([x, y]) {
      const v = normal.map((n, i) => n + (x / A) * east[i] + (y / A) * north[i]);
      return {
        lon: wrapLongitude(Math.atan2(v[1], v[0])),
        lat: Math.atan2(v[2], Math.hypot(v[0], v[1])),
      };
    },
  };
}
const distanceToLine = (p, a, b) => {
  const dx = b[0] - a[0],
    dy = b[1] - a[1];
  return Math.abs(dx * (p[1] - a[1]) - dy * (p[0] - a[0])) / (Math.hypot(dx, dy) || 1);
};

/**
 * Samples an ellipsoidal geodesic to a projected chord tolerance in metres.
 * A 200km initial step plus midpoint refinement bounds curvature approximation.
 * @param {import('./geometry.js').GeoPoint} a Start, radians.
 * @param {import('./geometry.js').GeoPoint} b End, radians.
 * @param {Object} frame Shared projection.
 * @param {number} tolerance Maximum projected midpoint deviation in metres.
 * @returns {number[][]} Projected points including both endpoints.
 */
function edgePoints(a, b, frame, tolerance) {
  const line = geodesic.Inverse(a.lat * DEG, a.lon * DEG, b.lat * DEG, b.lon * DEG);
  if (line.s12 < 0.001 || line.a12 > 178.8)
    throw new Error('Edges need distinct, non-antipodal endpoints.');
  const pointAt = (t) => {
    if (t === 0) return frame.forward(a);
    if (t === 1) return frame.forward(b);
    const p = geodesic.Direct(a.lat * DEG, a.lon * DEG, line.azi1, line.s12 * t);
    return frame.forward({ lon: p.lon2 / DEG, lat: p.lat2 / DEG });
  };
  const result = [pointAt(0)];
  const refine = (t0, p0, t1, p1, depth) => {
    const tm = (t0 + t1) / 2,
      pm = pointAt(tm);
    if (distanceToLine(pm, p0, p1) > tolerance) {
      if (depth >= 12) throw new Error('This edge is too large to edit safely.');
      refine(t0, p0, tm, pm, depth + 1);
      refine(tm, pm, t1, p1, depth + 1);
    } else result.push(p1);
  };
  const steps = Math.max(1, Math.ceil(line.s12 / 200000));
  for (let i = 0; i < steps; i++)
    refine(i / steps, result.at(-1), (i + 1) / steps, pointAt((i + 1) / steps), 0);
  return result;
}

const orientation = (a, b, p) => {
  const value = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
  const epsilon = 0.001 * Math.max(1, Math.hypot(b[0] - a[0], b[1] - a[1]));
  return Math.abs(value) <= epsilon ? 0 : Math.sign(value);
};
const onSegment = (a, b, p) =>
  orientation(a, b, p) === 0 &&
  p[0] >= Math.min(a[0], b[0]) - 0.001 &&
  p[0] <= Math.max(a[0], b[0]) + 0.001 &&
  p[1] >= Math.min(a[1], b[1]) - 0.001 &&
  p[1] <= Math.max(a[1], b[1]) + 0.001;
function segmentsMeet(a, b, c, d) {
  if (
    Math.max(a[0], b[0]) + 0.001 < Math.min(c[0], d[0]) ||
    Math.max(c[0], d[0]) + 0.001 < Math.min(a[0], b[0]) ||
    Math.max(a[1], b[1]) + 0.001 < Math.min(c[1], d[1]) ||
    Math.max(c[1], d[1]) + 0.001 < Math.min(a[1], b[1])
  )
    return false;
  const abC = orientation(a, b, c),
    abD = orientation(a, b, d),
    cdA = orientation(c, d, a),
    cdB = orientation(c, d, b);
  return (
    (abC * abD < 0 && cdA * cdB < 0) ||
    onSegment(a, b, c) ||
    onSegment(a, b, d) ||
    onSegment(c, d, a) ||
    onSegment(c, d, b)
  );
}

/**
 * Validates closed fill from three vertices onward (including the closing edge).
 * Rejects crossings, non-adjacent touches, backtracking, duplicates and zero area.
 * @param {import('./geometry.js').GeoPoint[]} vertices Implicitly closed ring.
 * @returns {string|null} User-facing rejection reason, or null when valid.
 */
export function polygonProblem(vertices) {
  if (vertices.length < 2) return null;
  try {
    const frame = projection(vertices),
      points = vertices.map(frame.forward);
    const closed = vertices.length >= 3;
    const edges = Array.from({ length: closed ? vertices.length : vertices.length - 1 }, (_, i) =>
      edgePoints(vertices[i], vertices[(i + 1) % vertices.length], frame, 0.25),
    );
    for (let i = 0; i < points.length && closed; i++) {
      const a = points[(i + points.length - 1) % points.length],
        b = points[i],
        c = points[(i + 1) % points.length];
      if (onSegment(a, b, c) || onSegment(b, c, a))
        return 'Edges cannot double back over one another.';
    }
    for (let i = 0; i < edges.length; i++)
      for (let j = i + 1; j < edges.length; j++) {
        const adjacent = j === i + 1 || (closed && i === 0 && j === edges.length - 1);
        for (let m = 0; m < edges[i].length - 1; m++)
          for (let n = 0; n < edges[j].length - 1; n++) {
            // Only the segments sharing the actual vertex may meet. Curved adjacent edges can cross elsewhere.
            if (
              adjacent &&
              ((j === i + 1 && m === edges[i].length - 2 && n === 0) ||
                (closed &&
                  i === 0 &&
                  j === edges.length - 1 &&
                  m === 0 &&
                  n === edges[j].length - 2))
            )
              continue;
            if (segmentsMeet(edges[i][m], edges[i][m + 1], edges[j][n], edges[j][n + 1]))
              return 'Polygon edges cannot cross or touch other edges.';
          }
      }
    if (closed) {
      const ring = edges.flatMap((edge) => edge.slice(0, -1));
      const area =
        Math.abs(
          ring.reduce((sum, p, i) => {
            const q = ring[(i + 1) % ring.length];
            return sum + p[0] * q[1] - q[0] * p[1];
          }, 0),
        ) / 2;
      if (area < 1) return 'A polygon needs a non-zero area.';
    }
    return null;
  } catch (error) {
    return error.message;
  }
}

/**
 * True boundary union of two circles/polygons; never convex-hulls or fills gaps.
 * Circles use the same 160-point boundary as the renderer; curved WGS84 edges
 * are sampled to 2m projected tolerance. Result is a simple editable polygon.
 * Disconnected pieces, holes, point-only contact and oversized output fail.
 * @param {import('./geometry.js').Shape[]} shapes Exactly two completed shapes.
 * @returns {import('./geometry.js').GeoPoint[]} New independent vertex array.
 * @throws {Error} Originals should be retained on any failure.
 */
export function mergeVertices(shapes) {
  if (shapes.length !== 2) throw new Error('Select exactly two shapes to merge.');
  const boundaries = shapes.map((s) => (s.type === 'circle' ? circleRing(s) : s.vertices));
  for (const ring of boundaries) {
    const problem = polygonProblem(ring);
    if (problem) throw new Error(problem);
  }
  const frame = projection(boundaries.flat());
  const rings = boundaries.map((ring) => {
    const sampled = ring.flatMap((p, i) =>
      edgePoints(p, ring[(i + 1) % ring.length], frame, 2).slice(0, -1),
    );
    // Millimetre quantization makes shared boundaries deterministic in both directions.
    const rounded = sampled.map((p) => p.map((v) => Math.round(v * 1000) / 1000));
    return [...rounded, rounded[0]];
  });
  const result = union([rings[0]], [rings[1]]);
  if (result.length !== 1)
    throw new Error('Shapes must overlap or share an edge to make one polygon.');
  if (result[0].length !== 1)
    throw new Error('This merge creates a hole. The originals have been kept.');
  const outline = result[0][0].slice(0, -1);
  // Clipping can leave sub-millimetre segments at sampled-edge intersections.
  // Collapse only coincident neighbours; this stays far below the 2m tolerance.
  const clean = outline.filter(
    (p, i) =>
      Math.hypot(
        p[0] - outline[(i + outline.length - 1) % outline.length][0],
        p[1] - outline[(i + outline.length - 1) % outline.length][1],
      ) > 0.01,
  );
  const vertices = clean.map(frame.inverse);
  if (vertices.length > 500) throw new Error('The merged polygon exceeds the 500-vertex limit.');
  const problem = polygonProblem(vertices);
  if (problem) throw new Error(problem);
  return vertices;
}
