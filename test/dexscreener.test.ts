import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchTrendingPairs } from "../src/collectors/dexscreener.js";

describe("dexscreener collector", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches solana symbols dynamically from dexscreener", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);

      if (url.endsWith("/token-profiles/latest/v1")) {
        return new Response(
          JSON.stringify([
            { chainId: "solana", tokenAddress: "TokenA" },
            { chainId: "ethereum", tokenAddress: "EthToken" }
          ]),
          { status: 200 }
        );
      }

      if (url.endsWith("/latest/dex/tokens/TokenA")) {
        return new Response(
          JSON.stringify({
            pairs: [
              {
                chainId: "solana",
                baseToken: { symbol: "AUTO", address: "TokenA" },
                liquidity: { usd: 50000 },
                volume: { m5: 3000, h1: 14000 },
                pairCreatedAt: Date.now() - 120_000,
                priceChange: { m5: 1.2 }
              }
            ]
          }),
          { status: 200 }
        );
      }

      return new Response("not found", { status: 404 });
    });

    const res = await fetchTrendingPairs();

    expect(fetchMock).toHaveBeenCalled();
    expect(res).toHaveLength(1);
    expect(res[0]?.symbol).toBe("AUTO");
    expect(res[0]?.address).toBe("TokenA");
    expect(res[0]?.volume5mUsd).toBe(3000);
  });

  it("returns empty list when upstream fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("bad", { status: 500 }));

    const res = await fetchTrendingPairs();

    expect(res).toEqual([]);
  });
});
