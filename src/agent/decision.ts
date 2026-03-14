import { LLM_TIMEOUT_MS } from "../config/constants.js";
import { SYSTEM_PROMPT, decisionPrompt } from "../llm/prompts.js";
import { parseDecision } from "../llm/parser.js";
import type { LlmProvider } from "../llm/types.js";
import type { AgentDecision } from "../types/domain.js";

export async function requestAgentDecision(provider: LlmProvider, ctx: unknown): Promise<AgentDecision> {
  const res = await provider.complete({ systemPrompt: SYSTEM_PROMPT, userPrompt: decisionPrompt(JSON.stringify(ctx)), timeoutMs: LLM_TIMEOUT_MS });
  const parsed = parseDecision(res.text);
  if (!parsed) {
    return {
      action: "SKIP",
      confidence: 0.2,
      reasons: ["invalid model response"],
      warnings: ["failed output parsing"],
      notes: "Fallback SKIP due to parser failure"
    };
  }
  return parsed;
}
