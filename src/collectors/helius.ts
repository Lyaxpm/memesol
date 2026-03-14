import type { WalletCandidate } from "../types/domain.js";

export async function fetchWalletActivity(_tokenAddresses: string[]): Promise<WalletCandidate[]> {
  return [
    { address: "Wa11etAAA", observedTrades: 22, winRateProxy: 0.62, realizedPnlProxyUsd: 180, medianRoiProxy: 0.14, avgHoldMinutes: 35, drawdownProxy: 0.18, recencyScore: 0.88 },
    { address: "Wa11etBBB", observedTrades: 7, winRateProxy: 0.39, realizedPnlProxyUsd: 30, medianRoiProxy: 0.04, avgHoldMinutes: 20, drawdownProxy: 0.44, recencyScore: 0.5 }
  ];
}
