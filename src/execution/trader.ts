import type { AgentDecision } from "../types/domain.js";
import type { Broker } from "./broker.js";

export async function executeDecision(decision: AgentDecision, broker: Broker) {
  if (decision.action === "BUY" && decision.positionUsd && decision.tokenAddress && decision.tokenSymbol) {
    return broker.placeBuy({ symbol: decision.tokenSymbol, tokenAddress: decision.tokenAddress, usd: decision.positionUsd });
  }
  if (decision.action === "SELL" && decision.tokenAddress && decision.tokenSymbol) {
    return broker.placeSell({ symbol: decision.tokenSymbol, tokenAddress: decision.tokenAddress });
  }
  return { ok: true, action: decision.action, reason: "No trade execution needed" };
}
