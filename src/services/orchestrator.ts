import type { Env } from "../config/env.js";
import type { Broker } from "../execution/broker.js";
import { discoverTrendingTokens } from "../discovery/trendingTokens.js";
import { discoverWalletActivity } from "../discovery/walletActivity.js";
import { filterDiscoveredWallets } from "../discovery/walletDiscovery.js";
import { scoreWallet } from "../scoring/walletScore.js";
import { scoreCoin } from "../scoring/coinScore.js";
import { buildCandidateContexts } from "../discovery/candidateBuilder.js";
import { applyGuardrails } from "../risk/guardrails.js";
import { executeDecision } from "../execution/trader.js";
import { reflectLoop } from "../agent/reflection.js";
import { printBlock } from "../cli/blocks.js";
import { renderScores } from "../cli/renderers.js";
import type { AgentRuntime } from "../agent/runtime.js";
import type { MemoryRepo } from "../db/repositories/memoryRepo.js";
import { defaultPortfolio } from "../strategy/portfolio.js";
import { sizePosition } from "../strategy/sizing.js";

export async function runLoop(env: Env, runtime: AgentRuntime, broker: Broker, repo: MemoryRepo) {
  const balance = await broker.getBalance();
  const openPositions = await broker.getPositions();
  const portfolio = defaultPortfolio(balance);
  portfolio.openPositions = openPositions;

  const tokens = await discoverTrendingTokens();
  tokens.forEach((t) => repo.upsertToken(t));
  const wallets = filterDiscoveredWallets(await discoverWalletActivity(tokens.map((t) => t.address)));
  wallets.forEach((w) => repo.upsertWallet(w));

  const walletScores = wallets.map(scoreWallet);
  walletScores.forEach((s) => repo.upsertWalletScore(s));
  const coinScores = tokens.map(scoreCoin);
  coinScores.forEach((s) => repo.upsertCoinScore(s));

  renderScores(walletScores, coinScores);

  const candidates = buildCandidateContexts(tokens, wallets, coinScores, walletScores);
  let decision = await runtime.decide(candidates, portfolio);

  if (decision.action === "BUY") {
    decision.positionUsd = sizePosition(env.MAX_POSITION_USD, decision.confidence, portfolio.balanceUsd);
  }

  repo.saveDecision(decision);

  printBlock("AGENT DECISION", [
    `Action: ${decision.action}`,
    `Confidence: ${decision.confidence.toFixed(2)}`,
    `Token: ${decision.tokenSymbol ?? "-"}`,
    `Reasons: ${decision.reasons.join("; ")}`,
    `Warnings: ${decision.warnings.join("; ") || "none"}`
  ]);

  const guard = applyGuardrails(decision, env, portfolio);
  if (!guard.allowed) {
    guard.reasons.forEach((r) => repo.saveRiskEvent(r));
    printBlock("RISK ENGINE", ["Decision denied", ...guard.reasons]);
    const reflection = reflectLoop(decision, guard.reasons);
    printBlock("REFLECTION", [reflection]);
    return;
  }

  const trade = await executeDecision(decision, broker);
  repo.saveTrade(trade);
  repo.setPositions(await broker.getPositions());
  printBlock("EXECUTION", [`ok=${trade.ok}`, `action=${trade.action}`, `symbol=${trade.symbol ?? "-"}`, `result=${trade.reason ?? trade.txId ?? "done"}`]);
  printBlock("REFLECTION", [reflectLoop(decision, [])]);
}
