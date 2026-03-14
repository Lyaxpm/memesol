import type { Position } from "../types/domain.js";

export function summarizePositions(positions: Position[]): string {
  if (!positions.length) return "No open positions";
  return positions.map((p) => `${p.symbol}: qty=${p.quantity.toFixed(3)}`).join(" | ");
}
