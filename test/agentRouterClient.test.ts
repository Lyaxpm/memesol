import { beforeEach, describe, expect, it, vi } from "vitest";
import { AgentRouterClient } from "../src/llm/agentRouterClient.js";
import type { Env } from "../src/config/env.js";

const baseEnv: Env = {
  SOLANA_RPC_URL: "https://api.mainnet-beta.solana.com",
  HELIUS_API_KEY: "",
  JUPITER_API_KEY: "",
  BOT_PRIVATE_KEY: "",
  AGENT_ROUTER_TOKEN: "token",
  AGENTROUTER_BASE_URL: "https://agentrouter.org/v1",
  AGENT_MODEL: "gpt-5",
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

describe("AgentRouterClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("falls back to SKIP when auth fails", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response("unauthorized", { status: 401 }));

    const client = new AgentRouterClient(baseEnv);
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

    const client = new AgentRouterClient(baseEnv);

    await expect(
      client.complete({
        systemPrompt: "system",
        userPrompt: "user",
        timeoutMs: 200
      })
    ).rejects.toThrow("AgentRouter error: 500");
  });

  it("tries api hostname fallback and sends x-api-key", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const url = String(input);
      const headers = init?.headers as Record<string, string>;

      expect(headers["x-api-key"]).toBe("token");
      if (url.includes("https://agentrouter.org/v1/chat/completions")) {
        return new Response("unauthorized", { status: 401 });
      }
      if (url.includes("https://api.agentrouter.org/v1/chat/completions")) {
        return new Response(JSON.stringify({ choices: [{ message: { content: "ok" } }] }), { status: 200 });
      }
      return new Response("not found", { status: 404 });
    });

    const client = new AgentRouterClient({ ...baseEnv, AGENTROUTER_BASE_URL: "https://agentrouter.org/v1" });

    const res = await client.complete({
      systemPrompt: "system",
      userPrompt: "user",
      timeoutMs: 200
    });

    expect(fetchMock).toHaveBeenCalled();
    expect(res.model).toBe("gpt-5");
    expect(res.text).toBe("ok");
  });
});
