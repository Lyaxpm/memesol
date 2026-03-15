import type { Env } from "../config/env.js";
import type { LlmProvider, LlmRequest, LlmResponse } from "./types.js";
import { withRetry } from "../utils/retry.js";

class HttpError extends Error {
  constructor(
    public status: number,
    public body: string,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

function normalizeToken(value: string): string {
  const trimmed = value.trim().replace(/^['\"]|['\"]$/g, "");
  return trimmed.replace(/^Bearer\s+/i, "");
}

function shortBody(body: string): string {
  return body.replace(/\s+/g, " ").trim().slice(0, 120);
}

export class AgentRouterClient implements LlmProvider {
  constructor(private env: Env) {}

  private resolveToken(): string {
    const raw = this.env.AGENT_ROUTER_TOKEN || this.env.AGENTROUTER_API_KEY || this.env.OPENAI_API_KEY;
    return normalizeToken(raw ?? "");
  }

  async complete(req: LlmRequest): Promise<LlmResponse> {
    const token = this.resolveToken();
    if (!token) {
      return { text: '{"action":"SKIP","confidence":0.4,"reasons":["AgentRouter token missing"],"warnings":["observation-only fallback"],"notes":"No LLM token configured"}', model: "fallback" };
    }
    const baseUrl = this.env.AGENTROUTER_BASE_URL.replace(/\/+$/, "");
    const url = `${baseUrl}/chat/completions`;
    const run = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), req.timeoutMs);
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-api-key": token
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
          throw new HttpError(res.status, body, `AgentRouter error: ${res.status}${body ? ` - ${body.slice(0, 200)}` : ""}`);
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
        const reason = err.status === 401 ? "AgentRouter authentication failed" : "AgentRouter authorization failed";
        const bodyHint = shortBody(err.body);
        const notes = [
          "Check AGENT_ROUTER_TOKEN/AGENTROUTER_API_KEY",
          "Check AGENTROUTER_BASE_URL",
          `Check AGENT_MODEL (${this.env.AGENT_MODEL}) is allowed by your AgentRouter account`
        ];
        if (bodyHint) {
          notes.push(`AgentRouter response: ${bodyHint}`);
        }
        return {
          text: JSON.stringify({
            action: "SKIP",
            confidence: 0.4,
            reasons: [reason],
            warnings: ["observation-only fallback"],
            notes: notes.join(". ")
          }),
          model: "fallback"
        };
      }
      throw err;
    }
  }
}
