/**
 * A stylised Georgia for the radius map: its border as a coarse polygon
 * (lon, lat), projected to map units (100 per degree of latitude, longitude
 * scaled by cos of the mid latitude so circles stay round), and the land as a
 * dot matrix. Illustrative only: no tiles, no roads.
 */
const BORDER: [number, number][] = [
  [-85.605, 35.0], [-84.32, 34.99], [-83.11, 35.0], [-83.35, 34.73], [-82.9, 34.48], [-82.47, 33.98], [-82.2, 33.63],
  [-81.93, 33.35], [-81.75, 33.16], [-81.49, 33.01], [-81.43, 32.72], [-81.18, 32.46], [-80.88, 32.03], [-81.08, 31.7],
  [-81.17, 31.31], [-81.4, 30.98], [-81.45, 30.71], [-81.73, 30.75], [-82.05, 30.36], [-82.22, 30.57], [-83.13, 30.62],
  [-84.86, 30.71], [-84.93, 31.24], [-85.05, 31.55], [-85.12, 31.78], [-85.0, 32.03], [-84.96, 32.35], [-85.18, 32.86],
];

const LON0 = -85.75;
const LAT1 = 35.12;
const K = Math.cos((32.7 * Math.PI) / 180);
export const UNIT = 100;

export const project = (lon: number, lat: number): [number, number] => [(lon - LON0) * K * UNIT, (LAT1 - lat) * UNIT];

const POLY = BORDER.map(([lon, lat]) => project(lon, lat));
export const VIEW = { w: Math.ceil((-80.7 - LON0) * K * UNIT), h: Math.ceil((LAT1 - 30.22) * UNIT) };

function inside(x: number, y: number) {
  let hit = false;
  for (let i = 0, j = POLY.length - 1; i < POLY.length; j = i++) {
    const [xi, yi] = POLY[i];
    const [xj, yj] = POLY[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/** Fayetteville, GA, and a 30-mile radius in map units (30 mi ≈ 0.4346° of latitude). */
export const PIN = project(-84.455, 33.448);
export const RADIUS = 0.4346 * UNIT;

/** The land as round dots: one path of zero-length segments (stroke-linecap: round). */
function dots(step: number, near: boolean) {
  let d = "";
  for (let y = step / 2; y < VIEW.h; y += step) {
    for (let x = step / 2; x < VIEW.w; x += step) {
      if (!inside(x, y)) continue;
      const isNear = Math.hypot(x - PIN[0], y - PIN[1]) <= RADIUS;
      if (isNear !== near) continue;
      d += `M${x.toFixed(1)} ${y.toFixed(1)}h0`;
    }
  }
  return d;
}

export const LAND = dots(8, false);
export const NEAR = dots(8, true);
export const OUTLINE = `M${POLY.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}Z`;
