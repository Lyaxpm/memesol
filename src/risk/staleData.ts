import type { TokenCandidate } from "../types/domain.js";

export function isStaleToken(token: TokenCandidate, maxAgeMs = 5 * 60_000) {
  return Date.now() - token.lastUpdatedMs > maxAgeMs;
}
