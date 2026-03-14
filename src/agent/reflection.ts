import type { AgentDecision } from "../types/domain.js";

export function reflectLoop(decision: AgentDecision, guardReasons: string[]): string {
  if (guardReasons.length) return `Guardrails blocked ${decision.action}: ${guardReasons.join(", ")}`;
  return `Agent chose ${decision.action} with confidence ${decision.confidence.toFixed(2)}`;
}
