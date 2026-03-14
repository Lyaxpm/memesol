import type { Env } from "../config/env.js";
import type { LlmProvider, LlmRequest, LlmResponse } from "./types.js";
import { withRetry } from "../utils/retry.js";

class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

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
          const body = await res.text();
          throw new HttpError(res.status, `AgentRouter error: ${res.status}${body ? ` - ${body.slice(0, 200)}` : ""}`);
        }
        const json = await res.json() as any;
        const text = json?.choices?.[0]?.message?.content ?? "";
        return { text, model: this.env.AGENT_MODEL };
      } finally {
        clearTimeout(timeout);
      }
    };

    try {
      return await withRetry(run, 2);
    } catch (err) {
      if (err instanceof HttpError && (err.status === 401 || err.status === 403)) {
        return {
          text: '{"action":"SKIP","confidence":0.4,"reasons":["AgentRouter authentication failed"],"warnings":["observation-only fallback"],"notes":"Check AGENT_ROUTER_TOKEN and AGENTROUTER_BASE_URL"}',
          model: "fallback"
        };
      }
      throw err;
    }
  }
}
