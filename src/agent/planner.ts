import type { CandidateContext } from "../discovery/candidateBuilder.js";

export function selectPrimaryCandidate(candidates: CandidateContext[]): CandidateContext | null {
  if (!candidates.length) return null;
  return [...candidates].sort((a, b) => (b.coinScore?.score ?? 0) - (a.coinScore?.score ?? 0))[0];
}
