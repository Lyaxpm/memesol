import { describe, expect, it } from "vitest";
import { buildCandidateContexts } from "../src/discovery/candidateBuilder.js";

describe("candidate builder", () => {
  it("pairs token with wallet sourced from top-token holder flow", () => {
    const tokens = [
      {
        symbol: "AAA",
        address: "TokenA",
        liquidityUsd: 50000,
        volume5mUsd: 2000,
        volume1hUsd: 10000,
        ageMinutes: 120,
        volatility: 0.4,
        slippageBps: 120,
        suspiciousFlags: [],
        lastUpdatedMs: Date.now()
      }
    ];

    const wallets = [
      {
        address: "SmartX",
        sourceTokenAddress: "TokenA",
        observedTrades: 18,
        winRateProxy: 0.61,
        realizedPnlProxyUsd: 120,
        medianRoiProxy: 0.1,
        avgHoldMinutes: 30,
        drawdownProxy: 0.2,
        recencyScore: 0.9
      }
    ];

    const coinScores = [{ address: "TokenA", symbol: "AAA", score: 80, reasons: ["ok"] }];
    const walletScores = [{ address: "SmartX", score: 84, reasons: ["ok"] }];

    const result = buildCandidateContexts(tokens, wallets, coinScores, walletScores);

    expect(result).toHaveLength(1);
    expect(result[0]?.wallet?.address).toBe("SmartX");
    expect(result[0]?.walletScore?.address).toBe("SmartX");
  });
});
