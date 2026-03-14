import { describe, it, expect } from "vitest";
import { scoreCoin } from "../src/scoring/coinScore.js";

describe("coin score", () => {
  it("penalizes suspicious token", () => {
    const good = scoreCoin({ symbol: "G", address: "1", liquidityUsd: 100000, volume5mUsd: 5000, volume1hUsd: 25000, ageMinutes: 300, volatility: 0.4, slippageBps: 120, suspiciousFlags: [], lastUpdatedMs: Date.now() });
    const bad = scoreCoin({ symbol: "B", address: "2", liquidityUsd: 12000, volume5mUsd: 500, volume1hUsd: 3000, ageMinutes: 20, volatility: 0.9, slippageBps: 450, suspiciousFlags: ["honeypot"], lastUpdatedMs: Date.now() });
    expect(good.score).toBeGreaterThan(bad.score);
  });
});
