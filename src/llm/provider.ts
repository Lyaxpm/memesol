import type { LlmProvider } from "./types.js";
import { AgentRouterClient } from "./agentRouterClient.js";
import type { Env } from "../config/env.js";

export function createLlmProvider(env: Env): LlmProvider {
  return new AgentRouterClient(env);
}
