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

export function parseDecision(text: string): AgentDecision | null {
  try {
    const maybe = JSON.parse(text);
    return decisionSchema.parse(maybe);
  } catch {
    return null;
  }
}
