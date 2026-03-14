import type { Env } from "../config/env.js";
import type { LlmProvider, LlmRequest, LlmResponse } from "./types.js";
import { withRetry } from "../utils/retry.js";

export class AgentRouterClient implements LlmProvider {
  constructor(private env: Env) {}

  async complete(req: LlmRequest): Promise<LlmResponse> {
    if (!this.env.AGENT_ROUTER_TOKEN) {
      return { text: '{"action":"SKIP","confidence":0.4,"reasons":["AgentRouter token missing"],"warnings":["observation-only fallback"],"notes":"No LLM token configured"}', model: "fallback" };
    }
    const url = `${this.env.AGENTROUTER_BASE_URL}/chat/completions`;
    const run = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), req.timeoutMs);
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.env.AGENT_ROUTER_TOKEN}`
          },
          body: JSON.stringify({
            model: this.env.AGENT_MODEL,
            messages: [
              { role: "system", content: req.systemPrompt },
              { role: "user", content: req.userPrompt }
            ],
            temperature: 0.2
          }),
          signal: controller.signal
        });
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            return {
              text: '{"action":"SKIP","confidence":0.2,"reasons":["AgentRouter auth failed"],"warnings":["invalid AGENT_ROUTER_TOKEN or AGENT_MODEL access"],"notes":"Auth failure fallback"}',
              model: "fallback"
            };
          }
          throw new Error(`AgentRouter error: ${res.status}`);
        }
        const json = await res.json() as any;
        const text = json?.choices?.[0]?.message?.content ?? "";
        return { text, model: this.env.AGENT_MODEL };
      } finally {
        clearTimeout(timeout);
      }
    };
    return withRetry(run, 2);
  }
}
