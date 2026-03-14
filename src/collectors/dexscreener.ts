import type { TokenCandidate } from "../types/domain.js";

const DEX_BASE_URL = "https://api.dexscreener.com";
const TOKEN_PROFILES_URL = `${DEX_BASE_URL}/token-profiles/latest/v1`;
const MAX_PROFILE_SCAN = 20;
const MAX_CANDIDATES = 8;

interface DexPair {
  chainId?: string;
  baseToken?: { symbol?: string; address?: string };
  liquidity?: { usd?: number };
  volume?: { m5?: number; h1?: number };
  pairCreatedAt?: number;
  priceChange?: { m5?: number };
}

function numberOr(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toCandidate(pair: DexPair, now: number): TokenCandidate | null {
  const symbol = pair.baseToken?.symbol?.trim();
  const address = pair.baseToken?.address?.trim();

  if (!symbol || !address) return null;

  const liquidityUsd = numberOr(pair.liquidity?.usd);
  const volume5mUsd = numberOr(pair.volume?.m5);
  const volume1hUsd = numberOr(pair.volume?.h1);

  const createdAt = numberOr(pair.pairCreatedAt, now);
  const ageMinutes = Math.max(0, Math.floor((now - createdAt) / 60_000));

  const m5MovePct = Math.abs(numberOr(pair.priceChange?.m5));
  const volatility = Math.min(1, m5MovePct / 10);
  const slippageBps = liquidityUsd > 0 ? Math.min(500, Math.max(25, Math.round((10_000 / liquidityUsd) * 30))) : 500;

  const suspiciousFlags: string[] = [];
  if (liquidityUsd < 25_000) suspiciousFlags.push("thin_liquidity");
  if (volume5mUsd < 1_500) suspiciousFlags.push("weak_momentum");

  return {
    symbol,
    address,
    liquidityUsd,
    volume5mUsd,
    volume1hUsd,
    ageMinutes,
    volatility,
    slippageBps,
    suspiciousFlags,
    lastUpdatedMs: now
  };
}

async function fetchTokenPairs(address: string): Promise<DexPair[]> {
  const res = await fetch(`${DEX_BASE_URL}/latest/dex/tokens/${address}`);
  if (!res.ok) throw new Error(`dex token pairs request failed: ${res.status}`);
  const json = (await res.json()) as { pairs?: DexPair[] };
  return Array.isArray(json.pairs) ? json.pairs : [];
}

export async function fetchTrendingPairs(): Promise<TokenCandidate[]> {
  const now = Date.now();

  try {
    const profileRes = await fetch(TOKEN_PROFILES_URL);
    if (!profileRes.ok) throw new Error(`dex token profile request failed: ${profileRes.status}`);
    const profiles = (await profileRes.json()) as Array<{ chainId?: string; tokenAddress?: string }>;

    const solanaAddresses = Array.from(
      new Set(
        profiles
          .filter((p) => p.chainId === "solana" && typeof p.tokenAddress === "string" && p.tokenAddress.length > 0)
          .slice(0, MAX_PROFILE_SCAN)
          .map((p) => p.tokenAddress as string)
      )
    );

    const candidates: TokenCandidate[] = [];

    for (const address of solanaAddresses) {
      const pairs = await fetchTokenPairs(address);
      const bestPair = pairs
        .filter((pair) => pair.chainId === "solana")
        .sort((a, b) => numberOr(b.volume?.m5) - numberOr(a.volume?.m5))[0];

      if (!bestPair) continue;
      const candidate = toCandidate(bestPair, now);
      if (!candidate) continue;
      candidates.push(candidate);
      if (candidates.length >= MAX_CANDIDATES) break;
    }

    return candidates;
  } catch {
    return [];
  }
}
