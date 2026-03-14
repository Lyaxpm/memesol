import { fetchTrendingPairs } from "../collectors/dexscreener.js";

export async function discoverTrendingTokens() {
  return fetchTrendingPairs();
}
