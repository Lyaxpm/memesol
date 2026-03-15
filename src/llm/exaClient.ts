import type { Env } from "../config/env.js";
import { parseDecision } from "./parser.js";
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

function normalizeToken(value: string): string {
  const trimmed = value.trim().replace(/^['\"]|['\"]$/g, "");
  return trimmed.replace(/^Bearer\s+/i, "");
}

function extractAnswer(json: any): string {
  if (typeof json?.answer === "string") return json.answer;
  if (typeof json?.result === "string") return json.result;
  if (typeof json?.text === "string") return json.text;
  return "";
}

function fallbackDecision(reason: string, notes: string): string {
  return JSON.stringify({
    action: "SKIP",
    confidence: 0.25,
    reasons: [reason],
    warnings: ["observation-only fallback"],
    notes
  });
}

function coerceToDecisionJson(raw: string): string {
  const direct = parseDecision(raw);
  if (direct) return JSON.stringify(direct);

  const fencedJson = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1];
  if (fencedJson) {
    const parsedFenced = parseDecision(fencedJson);
    if (parsedFenced) return JSON.stringify(parsedFenced);
  }

  return fallbackDecision("invalid model response", "Exa response was not valid decision JSON");
}

export class ExaClient implements LlmProvider {
  constructor(private env: Env) {}

  async complete(req: LlmRequest): Promise<LlmResponse> {
    const token = normalizeToken(this.env.EXA_API_KEY);
    if (!token) {
      return { text: fallbackDecision("Exa API key missing", "Set EXA_API_KEY before running autonomous decisions"), model: "fallback" };
    }

    const url = `${this.env.EXA_BASE_URL.replace(/\/+$/, "")}/answer`;
    const run = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), req.timeoutMs);
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": token
          },
          body: JSON.stringify({
            query: `${req.systemPrompt}\n\n${req.userPrompt}`,
            text: false,
            model: this.env.EXA_MODEL,
            search: {
              type: this.env.EXA_SEARCH_TYPE,
              numResults: 10
            }
          }),
          signal: controller.signal
        });
        if (!res.ok) {
          const body = await res.text();
          throw new HttpError(res.status, `Exa error: ${res.status}${body ? ` - ${body.slice(0, 200)}` : ""}`);
        }

        const json = (await res.json()) as any;
        return { text: coerceToDecisionJson(extractAnswer(json)), model: this.env.EXA_MODEL };
      } finally {
        clearTimeout(timeout);
      }
    };

    try {
      return await withRetry(run, 2);
    } catch (err) {
      if (err instanceof HttpError && (err.status === 401 || err.status === 403)) {
        return {
          text: fallbackDecision("Exa authentication failed", "Check EXA_API_KEY and EXA_BASE_URL"),
          model: "fallback"
        };
      }
      throw err;
    }
  }
}
