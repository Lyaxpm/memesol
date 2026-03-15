import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExaClient } from "../src/llm/exaClient.js";
import type { Env } from "../src/config/env.js";

const baseEnv: Env = {
  SOLANA_RPC_URL: "https://api.mainnet-beta.solana.com",
  HELIUS_API_KEY: "",
  JUPITER_API_KEY: "",
  BOT_PRIVATE_KEY: "",
  EXA_API_KEY: "token",
  EXA_BASE_URL: "https://api.exa.ai",
  EXA_MODEL: "exa",
  EXA_SEARCH_TYPE: "auto",
  LIVE_TRADING: false,
  PAPER_TRADING: true,
  KILL_SWITCH: false,
  TOTAL_CAPITAL_USD: 10,
  MAX_OPEN_POSITIONS: 1,
  MAX_POSITION_USD: 2,
  MAX_DAILY_LOSS_USD: 1,
  RESERVE_SOL_MIN: 0.02,
  MIN_LIQUIDITY_USD: 25000,
  MIN_VOLUME_5M_USD: 1500,
  MAX_SLIPPAGE_BPS: 300,
  WALLET_SCORE_THRESHOLD: 60,
  COIN_SCORE_THRESHOLD: 60,
  AGENT_MIN_CONFIDENCE: 0.65,
  HARD_STOP_PCT: 0.12,
  TAKE_PROFIT_PCT: 0.18,
  TRAILING_STOP_PCT: 0.1,
  MAX_HOLD_MINUTES: 90,
  SCAN_INTERVAL_SECONDS: 60,
  LOG_LEVEL: "info",
  LOG_FORMAT: "pretty"
};

describe("ExaClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("falls back to SKIP when auth fails", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response("unauthorized", { status: 401 }));

    const client = new ExaClient(baseEnv);
    const res = await client.complete({
      systemPrompt: "system",
      userPrompt: "user",
      timeoutMs: 200
    });

    expect(res.model).toBe("fallback");
    expect(res.text).toContain("SKIP");
    expect(res.text).toContain("authentication failed");
  });

  it("throws on non-auth http errors", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response("server blew up", { status: 500 }));

    const client = new ExaClient(baseEnv);

    await expect(
      client.complete({
        systemPrompt: "system",
        userPrompt: "user",
        timeoutMs: 200
      })
    ).rejects.toThrow("Exa error: 500");
  });

  it("sends x-api-key header and strips Bearer prefix", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      return new Response(JSON.stringify({ answer: '{"action":"HOLD","confidence":0.8,"reasons":["monitoring"],"warnings":[],"notes":"ok"}' }), { status: 200 });
    });

    const client = new ExaClient({
      ...baseEnv,
      EXA_API_KEY: "Bearer quoted-token"
    });

    await client.complete({
      systemPrompt: "system",
      userPrompt: "user",
      timeoutMs: 200
    });

    const call = fetchSpy.mock.calls[0];
    expect(call?.[1]?.headers).toMatchObject({
      "x-api-key": "quoted-token"
    });
  });

  it("coerces unstructured answer into valid fallback JSON decision", async () => {
    const client = new ExaClient(baseEnv);
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      return new Response(JSON.stringify({ answer: "Market sentiment is mixed today" }), { status: 200 });
    });

    const res = await client.complete({
      systemPrompt: "system",
      userPrompt: "user",
      timeoutMs: 200
    });

    const parsed = JSON.parse(res.text);
    expect(parsed.action).toBe("SKIP");
    expect(parsed.reasons).toContain("invalid model response");
  });
});
