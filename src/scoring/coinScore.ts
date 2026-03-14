import type { CoinScore, TokenCandidate } from "../types/domain.js";
import { clamp } from "../utils/math.js";

export function scoreCoin(t: TokenCandidate): CoinScore {
  const raw =
    Math.min(40, t.liquidityUsd / 2000) +
    Math.min(20, t.volume5mUsd / 250) +
    Math.min(15, t.volume1hUsd / 2000) +
    (1 - clamp(t.volatility, 0, 1)) * 10 +
    (1 - clamp(t.slippageBps / 500, 0, 1)) * 15 -
    t.suspiciousFlags.length * 8;
  const score = clamp(raw, 0, 100);
  return { address: t.address, symbol: t.symbol, score: Math.round(score), reasons: [`liq=${t.liquidityUsd}`, `slip=${t.slippageBps}`] };
}
