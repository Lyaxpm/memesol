import { describe, it, expect } from "vitest";
import { scoreWallet } from "../src/scoring/walletScore.js";

describe("wallet score", () => {
  it("scores better wallet higher", () => {
    const a = scoreWallet({ address: "A", observedTrades: 20, winRateProxy: 0.7, realizedPnlProxyUsd: 200, medianRoiProxy: 0.2, avgHoldMinutes: 30, drawdownProxy: 0.1, recencyScore: 0.9 });
    const b = scoreWallet({ address: "B", observedTrades: 8, winRateProxy: 0.4, realizedPnlProxyUsd: 20, medianRoiProxy: 0.02, avgHoldMinutes: 20, drawdownProxy: 0.5, recencyScore: 0.4 });
    expect(a.score).toBeGreaterThan(b.score);
  });
});
