"use client";

import { createContext, useContext, type RefObject } from "react";
import PointCloud, { type PointCloudHandle } from "./PointCloud";
import { CLOUD_DENSITY, CLOUD_SHAPES } from "./clouds";

export const CloudContext = createContext<RefObject<PointCloudHandle | null> | null>(null);

/** The story's one morphing cloud; DrugStage drives it through the context's handle. */
export default function MorphCloud() {
  const ref = useContext(CloudContext);
  return <PointCloud ref={ref ?? undefined} shapes={CLOUD_SHAPES} density={CLOUD_DENSITY} initial={0} mode="morph" className="ds-cloud" />;
}
