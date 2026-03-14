import type { TokenCandidate } from "../types/domain.js";

export async function fetchTrendingPairs(): Promise<TokenCandidate[]> {
  // Placeholder mock-friendly discovery; replace with real DEX Screener endpoint integration.
  const now = Date.now();
  return [
    { symbol: "FROGGY", address: "FROG111", liquidityUsd: 60000, volume5mUsd: 4500, volume1hUsd: 22000, ageMinutes: 240, volatility: 0.55, slippageBps: 220, suspiciousFlags: [], lastUpdatedMs: now },
    { symbol: "DOGEZ", address: "DOGE222", liquidityUsd: 18000, volume5mUsd: 1000, volume1hUsd: 6000, ageMinutes: 90, volatility: 0.8, slippageBps: 420, suspiciousFlags: ["thin_liquidity"], lastUpdatedMs: now }
  ];
}
