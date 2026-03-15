import type { LlmProvider } from "./types.js";
import { ExaClient } from "./exaClient.js";
import type { Env } from "../config/env.js";

export function createLlmProvider(env: Env): LlmProvider {
  return new ExaClient(env);
}
