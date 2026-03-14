import type { Position } from "../types/domain.js";

export function shouldExit(position: Position, now: number, hardStopPct: number, takeProfitPct: number, maxHoldMins: number): string | null {
  const ret = (position.currentPriceUsd - position.entryPriceUsd) / position.entryPriceUsd;
  if (ret <= -hardStopPct) return "STOP_LOSS";
  if (ret >= takeProfitPct) return "TAKE_PROFIT";
  if ((now - position.openedAtMs) / 60000 > maxHoldMins) return "TIME_EXIT";
  return null;
}
