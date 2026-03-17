import type { Env } from "../config/env.js";
import type { AgentDecision, PortfolioState } from "../types/domain.js";

export function applyGuardrails(decision: AgentDecision, env: Env, portfolio: PortfolioState): { allowed: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (env.KILL_SWITCH) reasons.push("kill switch enabled");
  if (portfolio.dailyPnlUsd <= -Math.abs(env.MAX_DAILY_LOSS_USD)) reasons.push("daily max loss reached");
  const requiresConfidence = decision.action === "BUY" || decision.action === "SELL";
  if (requiresConfidence && decision.confidence < env.AGENT_MIN_CONFIDENCE) reasons.push("agent confidence below threshold");
  if (decision.action === "BUY") {
    if ((decision.positionUsd ?? 0) > env.MAX_POSITION_USD) reasons.push("position above max position usd");
    if (portfolio.openPositions.length >= env.MAX_OPEN_POSITIONS) reasons.push("max open positions reached");
    if (portfolio.balanceUsd < (decision.positionUsd ?? 0) + 0.05) reasons.push("insufficient balance for fees");
    if (portfolio.reserveSol < env.RESERVE_SOL_MIN) reasons.push("reserve SOL too low");
  }
  return { allowed: reasons.length === 0, reasons };
}
