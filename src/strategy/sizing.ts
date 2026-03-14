import { clamp } from "../utils/math.js";

export function sizePosition(maxPositionUsd: number, confidence: number, balanceUsd: number): number {
  const sized = maxPositionUsd * clamp(confidence, 0.2, 1);
  return Math.max(0, Math.min(sized, balanceUsd * 0.3));
}
