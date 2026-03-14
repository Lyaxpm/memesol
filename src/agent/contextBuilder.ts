import type { CandidateContext } from "../discovery/candidateBuilder.js";
import type { PortfolioState } from "../types/domain.js";

export function buildAgentContext(candidate: CandidateContext, portfolio: PortfolioState, recentNotes: string[]) {
  return {
    candidate,
    portfolio,
    recentNotes
  };
}
