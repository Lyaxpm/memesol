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

  private buildCandidateUrls(): string[] {
    const base = this.env.AGENTROUTER_BASE_URL.replace(/\/+$/, "");
    const urls = [
      `${base}/chat/completions`,
      `${base.replace("https://agentrouter.org", "https://api.agentrouter.org")}/chat/completions`
    ];
    return Array.from(new Set(urls));
  }

  async complete(req: LlmRequest): Promise<LlmResponse> {
    if (!this.env.AGENT_ROUTER_TOKEN) {
      return { text: '{"action":"SKIP","confidence":0.4,"reasons":["AgentRouter token missing"],"warnings":["observation-only fallback"],"notes":"No LLM token configured"}', model: "fallback" };
    }
    const run = async (url: string) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), req.timeoutMs);
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.env.AGENT_ROUTER_TOKEN}`,
            "x-api-key": this.env.AGENT_ROUTER_TOKEN
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

    const urls = this.buildCandidateUrls();
    let lastAuthError: HttpError | null = null;

    for (const url of urls) {
      try {
        return await withRetry(() => run(url), 2);
      } catch (err) {
        if (err instanceof HttpError && (err.status === 401 || err.status === 403)) {
          lastAuthError = err;
          continue;
        }
        throw err;
      }
    }

    if (lastAuthError) {
      return {
        text: '{"action":"SKIP","confidence":0.4,"reasons":["AgentRouter authentication failed"],"warnings":["observation-only fallback"],"notes":"Check AGENT_ROUTER_TOKEN and AGENTROUTER_BASE_URL (prefer https://api.agentrouter.org/v1)"}',
        model: "fallback"
      };
    }

    throw new Error("AgentRouter request failed before authentication check");
  }
}
