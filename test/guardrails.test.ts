import { describe, it, expect } from "vitest";
import { applyGuardrails } from "../src/risk/guardrails.js";
import { loadEnv } from "../src/config/env.js";

describe("guardrails", () => {
  it("rejects low confidence buy", () => {
    const env = loadEnv();
    const res = applyGuardrails({ action: "BUY", confidence: 0.1, positionUsd: 1, reasons: ["x"], warnings: [], notes: "n" }, env, { balanceUsd: 10, reserveSol: 1, openPositions: [], realizedPnlUsd: 0, dailyPnlUsd: 0 });
    expect(res.allowed).toBe(false);
  });
});
