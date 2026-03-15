import { afterEach, describe, expect, it } from "vitest";
import { loadEnv } from "../src/config/env.js";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("loadEnv", () => {
  it("accepts AGENTROUTER_TOKEN alias when AGENT_ROUTER_TOKEN is missing", () => {
    delete process.env.AGENT_ROUTER_TOKEN;
    process.env.AGENTROUTER_TOKEN = "alias-token";

    const env = loadEnv();

    expect(env.AGENT_ROUTER_TOKEN).toBe("alias-token");
  });

  it("accepts AGENT_ROUTER_BASE_URL alias", () => {
    delete process.env.AGENTROUTER_BASE_URL;
    process.env.AGENT_ROUTER_BASE_URL = "https://example.com/v1";

    const env = loadEnv();

    expect(env.AGENTROUTER_BASE_URL).toBe("https://example.com/v1");
  });
});
