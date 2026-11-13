import { drugScreens, type ShapeKey } from "@/lib/content/site";

/** The shapes in test order, and their densities ("coming soon" at half): stable references for the clouds. */
export const CLOUD_SHAPES: ShapeKey[] = drugScreens.tests.map(t => t.shape);
export const CLOUD_DENSITY: number[] = drugScreens.tests.map(t => (t.soon ? 0.5 : 1));
