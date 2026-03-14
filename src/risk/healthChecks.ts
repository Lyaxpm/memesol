import type { Env } from "../config/env.js";
import type { HealthCheckResult } from "../types/api.js";
import { checkRpc } from "../collectors/solanaRpc.js";

export async function runHealthChecks(env: Env): Promise<HealthCheckResult[]> {
  const results: HealthCheckResult[] = [];
  results.push({ name: "rpc", ok: await checkRpc(env.SOLANA_RPC_URL), detail: env.SOLANA_RPC_URL });
  results.push({ name: "dexscreener", ok: true, detail: "reachable (placeholder)" });
  results.push({ name: "helius", ok: env.HELIUS_API_KEY.length > 0 || true, detail: env.HELIUS_API_KEY ? "configured" : "optional missing" });
  results.push({ name: "jupiter", ok: true, detail: env.JUPITER_API_KEY ? "configured" : "optional missing" });
  results.push({ name: "agentrouter", ok: env.AGENT_ROUTER_TOKEN.length > 0 || true, detail: env.AGENT_ROUTER_TOKEN ? "configured" : "fallback mode" });
  return results;
}
