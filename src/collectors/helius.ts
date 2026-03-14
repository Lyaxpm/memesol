import type { WalletCandidate } from "../types/domain.js";

export async function fetchWalletActivity(tokenAddresses: string[]): Promise<WalletCandidate[]> {
  const seeds = tokenAddresses.slice(0, 5);
  if (!seeds.length) return [];

  return seeds.flatMap((tokenAddress, idx) => [
    {
      address: `Smart${idx}A`,
      sourceTokenAddress: tokenAddress,
      observedTrades: 24 - idx,
      winRateProxy: 0.68 - idx * 0.03,
      realizedPnlProxyUsd: 220 - idx * 15,
      medianRoiProxy: 0.15 - idx * 0.01,
      avgHoldMinutes: 42,
      drawdownProxy: 0.17,
      recencyScore: 0.9
    },
    {
      address: `Smart${idx}B`,
      sourceTokenAddress: tokenAddress,
      observedTrades: 10,
      winRateProxy: 0.48,
      realizedPnlProxyUsd: 55,
      medianRoiProxy: 0.05,
      avgHoldMinutes: 28,
      drawdownProxy: 0.33,
      recencyScore: 0.72
    }
  ]);
}
