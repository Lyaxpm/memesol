import { z } from "zod";
import type { AgentDecision } from "../types/domain.js";

export const decisionSchema = z.object({
  action: z.enum(["BUY", "SELL", "HOLD", "SKIP"]),
  confidence: z.number().min(0).max(1),
  tokenSymbol: z.string().optional(),
  tokenAddress: z.string().optional(),
  sourceWallet: z.string().optional(),
  positionUsd: z.number().positive().optional(),
  reasons: z.array(z.string()).min(1),
  warnings: z.array(z.string()).default([]),
  notes: z.string().default(""),
  sellReasonCategory: z.enum(["TAKE_PROFIT", "STOP_LOSS", "MIRROR_EXIT", "RISK_EXIT", "TIME_EXIT"]).optional()
});

function extractJsonPayload(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return text;
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  if (firstBrace === -1) {
    return trimmed;
  }

  let depth = 0;
  let inString = false;
  let isEscaped = false;
  for (let i = firstBrace; i < trimmed.length; i += 1) {
    const char = trimmed[i];
    if (inString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (char === "\\") {
        isEscaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return trimmed.slice(firstBrace, i + 1);
      }
    }
  }

  return trimmed;
}

export function parseDecision(text: string): AgentDecision | null {
  try {
    const maybe = JSON.parse(extractJsonPayload(text));
    return decisionSchema.parse(maybe);
  } catch {
    return null;
  }
}
