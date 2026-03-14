import type { LlmProvider } from "../llm/types.js";
import { buildAgentContext } from "./contextBuilder.js";
import { selectPrimaryCandidate } from "./planner.js";
import { requestAgentDecision } from "./decision.js";
import type { AgentMemory } from "./memory.js";
import type { CandidateContext } from "../discovery/candidateBuilder.js";
import type { PortfolioState } from "../types/domain.js";

export class AgentRuntime {
  constructor(private provider: LlmProvider, private memory: AgentMemory) {}

  async decide(candidates: CandidateContext[], portfolio: PortfolioState) {
    const primary = selectPrimaryCandidate(candidates);
    if (!primary) {
      return { action: "SKIP", confidence: 0.1, reasons: ["no candidate"], warnings: [], notes: "No tokens discovered" } as const;
    }
    const ctx = buildAgentContext(primary, portfolio, this.memory.recentNotes());
    return requestAgentDecision(this.provider, ctx);
  }
}
