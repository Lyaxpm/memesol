import type { TokenCandidate, WalletCandidate } from "../types/domain.js";

export function walletFeatureVector(w: WalletCandidate) {
  return {
    pnl: w.realizedPnlProxyUsd,
    win: w.winRateProxy,
    trades: w.observedTrades,
    roi: w.medianRoiProxy,
    hold: w.avgHoldMinutes,
    dd: w.drawdownProxy,
    recency: w.recencyScore
  };
}

export function coinFeatureVector(t: TokenCandidate) {
  return {
    liq: t.liquidityUsd,
    v5: t.volume5mUsd,
    v1h: t.volume1hUsd,
    age: t.ageMinutes,
    vol: t.volatility,
    slip: t.slippageBps,
    flags: t.suspiciousFlags.length
  };
}
