// Rebuild with npm run build:vendor. Only these exports enter the static bundle.
import clipping from 'polygon-clipping';
import geographic from 'geographiclib-geodesic';
export const union = clipping.union;
export const geodesic = geographic.Geodesic.WGS84;
