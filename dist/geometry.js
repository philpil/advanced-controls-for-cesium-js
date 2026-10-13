/**
 * @file Pure geometry and persistence validation. No browser or Cesium dependency.
 * Angles use radians and distances use metres throughout this module.
 * @typedef {Object} GeoPoint
 * @property {number} lon Longitude in [-PI, PI].
 * @property {number} lat Latitude in [-PI/2, PI/2].
 * @typedef {Object} CircleShape
 * @property {string} id Persistent identifier.
 * @property {string} [name] User-visible name, up to 80 characters.
 * @property {'circle'} type Shape discriminator.
 * @property {GeoPoint} center Geographic centre.
 * @property {number} radius Surface radius in metres.
 * @property {number} bearing Radius-handle azimuth clockwise from north, radians.
 * @typedef {Object} PolygonShape
 * @property {string} id Persistent identifier.
 * @property {string} [name] User-visible name, up to 80 characters.
 * @property {'polygon'} type Shape discriminator.
 * @property {GeoPoint[]} vertices Ordered vertices; closure is implicit.
 * @typedef {CircleShape|PolygonShape} Shape
 */
// WGS 84 direct geodesic (Vincenty). Angles are radians, distances are metres.
export const A = 6378137,
  F = 1 / 298.257223563,
  B = A * (1 - F),
  MAX_RADIUS = 5_000_000,
  MIN_RADIUS = 10;
/**
 * @param {number} r Radius in metres.
 * @returns {number} Radius within supported limits.
 */
export const clampRadius = (r) => Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, r));
/**
 * @param {number} x Longitude in radians.
 * @returns {number} Longitude in [-PI, PI).
 */
export const wrapLongitude = (x) =>
  ((((x + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
/**
 * Solves the direct WGS 84 geodesic with Vincenty iteration. Coefficient names follow the standard formula; convergence tolerance is 1e-12 radians.
 * @param {GeoPoint} origin Start location.
 * @param {number} bearing Azimuth clockwise from north, radians.
 * @param {number} distance Surface distance in metres.
 * @returns {GeoPoint} Destination normalized across the dateline.
 */
export function destination(origin, bearing, distance) {
  const U1 = Math.atan((1 - F) * Math.tan(origin.lat)),
    sU1 = Math.sin(U1),
    cU1 = Math.cos(U1),
    sb = Math.sin(bearing),
    cb = Math.cos(bearing);
  const sigma1 = Math.atan2(Math.tan(U1), cb),
    sinAlpha = cU1 * sb,
    cosSqAlpha = 1 - sinAlpha * sinAlpha;
  const uSq = (cosSqAlpha * (A * A - B * B)) / (B * B),
    ka = 1 + (uSq / 16384) * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq))),
    kb = (uSq / 1024) * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
  let sigma = distance / (B * ka);
  for (let i = 0; i < 50; i++) {
    const c2 = Math.cos(2 * sigma1 + sigma),
      ss = Math.sin(sigma),
      cs = Math.cos(sigma),
      delta =
        kb *
        ss *
        (c2 +
          (kb / 4) *
            (cs * (-1 + 2 * c2 * c2) - (kb / 6) * c2 * (-3 + 4 * ss * ss) * (-3 + 4 * c2 * c2)));
    let next = distance / (B * ka) + delta;
    if (Math.abs(next - sigma) < 1e-12) {
      sigma = next;
      break;
    }
    sigma = next;
  }
  const ss = Math.sin(sigma),
    cs = Math.cos(sigma),
    c2 = Math.cos(2 * sigma1 + sigma),
    tmp = sU1 * ss - cU1 * cs * cb;
  const lat = Math.atan2(
    sU1 * cs + cU1 * ss * cb,
    (1 - F) * Math.sqrt(sinAlpha * sinAlpha + tmp * tmp),
  );
  const lambda = Math.atan2(ss * sb, cU1 * cs - sU1 * ss * cb),
    kc = (F / 16) * cosSqAlpha * (4 + F * (4 - 3 * cosSqAlpha));
  const L =
    lambda - (1 - kc) * F * sinAlpha * (sigma + kc * ss * (c2 + kc * cs * (-1 + 2 * c2 * c2)));
  return { lon: wrapLongitude(origin.lon + L), lat };
}
/**
 * Samples a geodesic circle without duplicating the closing point.
 * @param {CircleShape} shape Circle geometry.
 * @param {number} [count=160] Number of equally spaced azimuth samples.
 * @returns {GeoPoint[]}
 */
export function circleRing(shape, count = 160) {
  return Array.from({ length: count }, (_, i) =>
    destination(shape.center, (i / count) * 2 * Math.PI, shape.radius),
  );
}
/**
 * Copies the vertex array and inserts after an edge start, including the closing edge.
 * @param {GeoPoint[]} vertices Original polygon vertices.
 * @param {number} edge Starting vertex index of the edge.
 * @param {GeoPoint} point New vertex.
 * @returns {GeoPoint[]} A new array; input is unchanged.
 */
export function insertVertex(vertices, edge, point) {
  const result = vertices.map((p) => ({ ...p }));
  result.splice(edge + 1, 0, { ...point });
  return result;
}
/**
 * Checks finite geographic coordinates before loading untrusted localStorage data.
 * @param {unknown} p Candidate coordinate record.
 * @returns {boolean}
 */
export function validPoint(p) {
  return (
    p &&
    Number.isFinite(p.lon) &&
    Number.isFinite(p.lat) &&
    Math.abs(p.lon) <= Math.PI &&
    Math.abs(p.lat) <= Math.PI / 2
  );
}
/** Trims names and removes control characters; empty names are rejected by UI. */
export const normalizeName = (name) =>
  typeof name === 'string'
    ? name
        .replace(/[\u0000-\u001f\u007f-\u009f]/g, '')
        .trim()
        .slice(0, 80)
    : '';
/**
 * Validates a versioned save, discards malformed/duplicate shapes and copies geometry. Synthetic handles and transient interaction state are never restored.
 * @param {unknown} raw Parsed JSON save record.
 * @returns {Shape[]} Up to 200 valid shapes, each polygon at most 500 vertices.
 */
export function restoreShapes(raw) {
  if (!raw || raw.version !== 1 || !Array.isArray(raw.shapes)) return [];
  const ids = new Set();
  return raw.shapes
    .slice(0, 200)
    .filter((s) => {
      if (!s || typeof s.id !== 'string' || ids.has(s.id)) return false;
      const okay =
        s.type === 'circle'
          ? validPoint(s.center) &&
            Number.isFinite(s.radius) &&
            s.radius >= MIN_RADIUS &&
            s.radius <= MAX_RADIUS
          : s.type === 'polygon' &&
            Array.isArray(s.vertices) &&
            s.vertices.length >= 3 &&
            s.vertices.length <= 500 &&
            s.vertices.every(validPoint);
      if (okay) ids.add(s.id);
      return okay;
    })
    .map((s) => ({
      ...(normalizeName(s.name) ? { name: normalizeName(s.name) } : {}),
      ...(s.type === 'circle'
        ? {
            id: s.id,
            type: s.type,
            center: { ...s.center },
            radius: s.radius,
            bearing: Number.isFinite(s.bearing) ? s.bearing : Math.PI / 2,
          }
        : { id: s.id, type: s.type, vertices: s.vertices.map((p) => ({ ...p })) }),
    }));
}

// Rotate geodetic unit directions together, then project back to WGS84 at height 0.
// Unlike adding lon/lat offsets, this stays well-behaved at poles and the dateline.
/**
 * @param {GeoPoint} p Geographic position.
 * @returns {number[]} Geodetic unit direction.
 */
const unit = (p) => [
  Math.cos(p.lat) * Math.cos(p.lon),
  Math.cos(p.lat) * Math.sin(p.lon),
  Math.sin(p.lat),
];
/**
 * @param {number[]} a Vector.
 * @param {number[]} b Vector.
 * @returns {number} Dot product.
 */
const dot = (a, b) => a.reduce((sum, x, i) => sum + x * b[i], 0);
/**
 * @param {number[]} a Vector.
 * @param {number[]} b Vector.
 * @returns {number[]} Cross product.
 */
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
/**
 * Applies one Rodrigues rotation to all geographic unit vectors. Preserves angular shape across the poles/dateline; ellipsoidal metre lengths can vary slightly with latitude.
 * @param {GeoPoint[]} vertices Original vertices captured at drag start.
 * @param {GeoPoint} from Original pointer anchor.
 * @param {GeoPoint} to Current pointer surface position.
 * @returns {GeoPoint[]} Fresh vertices projected back onto the ellipsoid at height zero.
 */
export function rotatePolygon(vertices, from, to) {
  const a = unit(from),
    b = unit(to),
    v = cross(a, b),
    s = Math.hypot(...v),
    c = Math.max(-1, Math.min(1, dot(a, b)));
  if (s < 1e-12 && c > 0) return vertices.map((p) => ({ ...p }));
  let axis = s < 1e-12 ? cross(a, Math.abs(a[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]) : v;
  const len = Math.hypot(...axis);
  axis = axis.map((x) => x / len);
  return vertices.map((p) => {
    const u = unit(p),
      k = cross(axis, u),
      d = dot(axis, u);
    const r = u.map((x, i) => x * c + k[i] * s + axis[i] * d * (1 - c));
    return {
      lon: wrapLongitude(Math.atan2(r[1], r[0])),
      lat: Math.atan2(r[2], Math.hypot(r[0], r[1])),
    };
  });
}
/**
 * Deduplicates fill/outline/handle hits while preserving their pick order.
 * @param {Array<{id:string}|null>} hits Registered pick metadata.
 * @param {Shape[]} shapes Current completed shapes.
 * @returns {string[]} Unique live shape IDs.
 */
export function selectionCandidates(hits, shapes) {
  const allowed = new Set(shapes.map((s) => s.id)),
    seen = new Set();
  const result = [];
  for (const hit of hits) {
    if (!hit || !allowed.has(hit.id) || seen.has(hit.id)) continue;
    seen.add(hit.id);
    result.push(hit.id);
  }
  return result;
}

/**
 * Finds a display-only move handle near the middle of a simple polygon.
 * Uses a local gnomonic projection to handle the dateline and poles safely.
 * Prefers the area centroid. For concave polygons, scans interior intervals
 * and chooses a point away from edges. This is not a geographic centre of mass.
 * Polygons outside the projection's hemisphere fall back to the vector mean.
 * @param {GeoPoint[]} vertices Ordered vertices without a repeated closing vertex.
 * @returns {GeoPoint} Handle location, never added to the polygon's vertices.
 */
export function polygonMovePoint(vertices) {
  if (!vertices.length) throw new RangeError('A move handle needs polygon vertices.');
  const vectors = vertices.map(unit);
  let normal = vectors.reduce((sum, v) => sum.map((x, i) => x + v[i]), [0, 0, 0]);
  const length = Math.hypot(...normal);
  if (length < 1e-10) return { ...vertices[0] };
  normal = normal.map((x) => x / length);
  const mean = {
    lon: Math.atan2(normal[1], normal[0]),
    lat: Math.atan2(normal[2], Math.hypot(normal[0], normal[1])),
  };
  const east = [-Math.sin(mean.lon), Math.cos(mean.lon), 0],
    north = cross(normal, east);
  if (vectors.some((v) => dot(v, normal) <= 1e-6)) return mean;
  const points = vectors.map((v) => ({
    x: dot(v, east) / dot(v, normal),
    y: dot(v, north) / dot(v, normal),
  }));
  const inside = (p) => {
    let result = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const a = points[i],
        b = points[j];
      if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x)
        result = !result;
    }
    return result;
  };
  const unproject = (p) => {
    const v = normal.map((x, i) => x + p.x * east[i] + p.y * north[i]);
    return {
      lon: wrapLongitude(Math.atan2(v[1], v[0])),
      lat: Math.atan2(v[2], Math.hypot(v[0], v[1])),
    };
  };
  let twiceArea = 0,
    cx = 0,
    cy = 0;
  points.forEach((a, i) => {
    const b = points[(i + 1) % points.length],
      weight = a.x * b.y - b.x * a.y;
    twiceArea += weight;
    cx += (a.x + b.x) * weight;
    cy += (a.y + b.y) * weight;
  });
  if (Math.abs(twiceArea) > 1e-14) {
    const centroid = { x: cx / (3 * twiceArea), y: cy / (3 * twiceArea) };
    if (inside(centroid)) return unproject(centroid);
  }
  let best = null,
    bestClearance = -1;
  const ys = points.map((p) => p.y).sort((a, b) => a - b);
  // Between vertex latitudes, edge intersections form inside/outside pairs.
  for (let row = 0; row < ys.length - 1; row++) {
    const y = (ys[row] + ys[row + 1]) / 2,
      intersections = [];
    points.forEach((a, i) => {
      const b = points[(i + 1) % points.length];
      if (a.y > y !== b.y > y) intersections.push(a.x + ((y - a.y) * (b.x - a.x)) / (b.y - a.y));
    });
    intersections.sort((a, b) => a - b);
    for (let i = 0; i + 1 < intersections.length; i += 2) {
      const candidate = { x: (intersections[i] + intersections[i + 1]) / 2, y };
      let clearance = Infinity;
      points.forEach((a, j) => {
        const b = points[(j + 1) % points.length],
          dx = b.x - a.x,
          dy = b.y - a.y,
          t = Math.max(
            0,
            Math.min(
              1,
              ((candidate.x - a.x) * dx + (candidate.y - a.y) * dy) / (dx * dx + dy * dy || 1),
            ),
          );
        clearance = Math.min(
          clearance,
          Math.hypot(candidate.x - a.x - t * dx, candidate.y - a.y - t * dy),
        );
      });
      if (clearance > bestClearance) {
        best = candidate;
        bestClearance = clearance;
      }
    }
  }
  return best ? unproject(best) : mean;
}
