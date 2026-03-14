import type { WalletCandidate, WalletScore } from "../types/domain.js";
import { clamp } from "../utils/math.js";

export function scoreWallet(w: WalletCandidate): WalletScore {
  const raw =
    w.winRateProxy * 30 +
    Math.min(20, w.observedTrades) +
    clamp(w.medianRoiProxy, -0.2, 0.4) * 40 +
    clamp(w.recencyScore, 0, 1) * 20 -
    clamp(w.drawdownProxy, 0, 1) * 20;
  const score = clamp(raw, 0, 100);
  const reasons = [`winRate=${w.winRateProxy.toFixed(2)}`, `trades=${w.observedTrades}`, `drawdown=${w.drawdownProxy.toFixed(2)}`];
  return { address: w.address, score: Math.round(score), reasons };
}
