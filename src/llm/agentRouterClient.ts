import { z } from "zod";
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

const completionSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z
          .object({
            content: z.union([z.string(), z.array(z.any()), z.null()]).optional()
          })
          .optional(),
        text: z.string().optional()
      })
    )
    .optional(),
  output_text: z.string().optional(),
  text: z.string().optional()
});

function normalizeToken(value: string): string {
  const trimmed = value.trim().replace(/^['\"]|['\"]$/g, "");
  return trimmed.replace(/^Bearer\s+/i, "");
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced?.[1]?.trim() ?? trimmed;
}

function extractTextFromContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";

  const flattened = content
    .map((part) => {
      if (typeof part === "string") return part;
      if (part && typeof part === "object" && "text" in part && typeof (part as { text?: unknown }).text === "string") {
        return (part as { text: string }).text;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");

  return flattened;
}

function extractProviderText(raw: unknown): string {
  const parsed = completionSchema.safeParse(raw);
  if (!parsed.success) {
    return "";
  }

  const json = parsed.data;
  const choice = json.choices?.[0];

  const fromMessage = extractTextFromContent(choice?.message?.content);
  if (fromMessage) return stripCodeFences(fromMessage);

  if (typeof choice?.text === "string" && choice.text.trim()) {
    return stripCodeFences(choice.text);
  }

  if (typeof json.output_text === "string" && json.output_text.trim()) {
    return stripCodeFences(json.output_text);
  }

  if (typeof json.text === "string" && json.text.trim()) {
    return stripCodeFences(json.text);
  }

  return "";
}

function fallbackText(reason: string, notes: string): string {
  return JSON.stringify({
    action: "SKIP",
    confidence: 0.2,
    reasons: [reason],
    warnings: ["observation-only fallback"],
    notes
  });
}

function debugPreview(raw: unknown): string {
  const serialized = typeof raw === "string" ? raw : JSON.stringify(raw);
  return serialized.replace(/\s+/g, " ").slice(0, 240);
}

async function callChatCompletions(env: Env, req: LlmRequest): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), req.timeoutMs);
  const url = `${env.AGENTROUTER_BASE_URL.replace(/\/+$/, "")}/chat/completions`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${normalizeToken(env.AGENT_ROUTER_TOKEN)}`
      },
      body: JSON.stringify({
        model: env.AGENT_MODEL,
        temperature: 0.1,
        stream: false,
        messages: [
          { role: "system", content: req.systemPrompt },
          { role: "user", content: req.userPrompt }
        ]
      }),
      signal: controller.signal
    });

    if (!res.ok) {
      const body = await res.text();
      throw new HttpError(res.status, `AgentRouter error: ${res.status}${body ? ` - ${body.slice(0, 200)}` : ""}`);
    }

    return (await res.json()) as unknown;
  } finally {
    clearTimeout(timeout);
  }
}

export async function checkAgentRouterHealth(env: Env): Promise<{ ok: boolean; detail: string }> {
  if (!env.AGENT_ROUTER_TOKEN) {
    return { ok: true, detail: "fallback mode (token missing)" };
  }

  if (!env.AGENTROUTER_BASE_URL) {
    return { ok: true, detail: "fallback mode (base URL missing)" };
  }

  try {
    const raw = await callChatCompletions(env, {
      systemPrompt: "Return a short text response.",
      userPrompt: "ping",
      timeoutMs: 4000
    });
    const text = extractProviderText(raw);
    if (!text) {
      return { ok: false, detail: "reachable but response shape invalid" };
    }
    return { ok: true, detail: "configured, reachable, response shape valid" };
  } catch {
    return { ok: true, detail: "configured but unreachable (safe fallback enabled)" };
  }
}

export class AgentRouterClient implements LlmProvider {
  constructor(private env: Env) {}

  async complete(req: LlmRequest): Promise<LlmResponse> {
    if (!this.env.AGENT_ROUTER_TOKEN) {
      return {
        text: fallbackText("AgentRouter token missing", "Set AGENT_ROUTER_TOKEN to enable autonomous AI decisions"),
        model: "fallback"
      };
    }

    const run = async () => {
      const raw = await callChatCompletions(this.env, req);
      const text = extractProviderText(raw);
      if (!text) {
        if (this.env.LOG_LEVEL === "debug") {
          console.debug("agentrouter invalid response preview:", debugPreview(raw));
        }
        return {
          text: fallbackText("AgentRouter invalid response shape", "Provider output could not be parsed; staying in safe observation mode"),
          model: this.env.AGENT_MODEL
        };
      }

      return { text, model: this.env.AGENT_MODEL };
    };

    try {
      return await withRetry(run, 2);
    } catch (err) {
      if (err instanceof HttpError && (err.status === 401 || err.status === 403)) {
        return {
          text: fallbackText("AgentRouter authentication failed", "Check AGENT_ROUTER_TOKEN and AGENTROUTER_BASE_URL"),
          model: "fallback"
        };
      }

      return {
        text: fallbackText("AgentRouter unavailable", "Request timed out or failed; continuing in observation-only mode"),
        model: "fallback"
      };
    }
  }
}
