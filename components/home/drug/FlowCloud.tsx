"use client";

import PointCloud from "./PointCloud";
import { CLOUD_DENSITY, CLOUD_SHAPES } from "./clouds";

/** One test's still cloud, for the flow layout (drawn once it nears the viewport). */
export default function FlowCloud({ index }: { index: number }) {
  return <PointCloud shapes={CLOUD_SHAPES} density={CLOUD_DENSITY} initial={index} mode="static" count={Math.round(2400 * CLOUD_DENSITY[index])} className="ds-cloud" />;
}
