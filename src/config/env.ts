import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const bool = z
  .union([z.boolean(), z.string()])
  .transform((v) => (typeof v === "boolean" ? v : v.toLowerCase() === "true"));

export const envSchema = z.object({
  SOLANA_RPC_URL: z.string().url().default("https://api.mainnet-beta.solana.com"),
  HELIUS_API_KEY: z.string().optional().default(""),
  JUPITER_API_KEY: z.string().optional().default(""),
  BOT_PRIVATE_KEY: z.string().optional().default(""),
  AGENT_ROUTER_TOKEN: z.string().optional().default(""),
  AGENTROUTER_API_KEY: z.string().optional().default(""),
  OPENAI_API_KEY: z.string().optional().default(""),
  AGENTROUTER_BASE_URL: z.string().url().default("https://agentrouter.org/v1"),
  AGENT_MODEL: z.string().default("gpt-5"),
  LIVE_TRADING: bool.default(false),
  PAPER_TRADING: bool.default(true),
  KILL_SWITCH: bool.default(false),
  TOTAL_CAPITAL_USD: z.coerce.number().default(10),
  MAX_OPEN_POSITIONS: z.coerce.number().default(1),
  MAX_POSITION_USD: z.coerce.number().default(2),
  MAX_DAILY_LOSS_USD: z.coerce.number().default(1),
  RESERVE_SOL_MIN: z.coerce.number().default(0.02),
  MIN_LIQUIDITY_USD: z.coerce.number().default(25000),
  MIN_VOLUME_5M_USD: z.coerce.number().default(1500),
  MAX_SLIPPAGE_BPS: z.coerce.number().default(300),
  WALLET_SCORE_THRESHOLD: z.coerce.number().default(60),
  COIN_SCORE_THRESHOLD: z.coerce.number().default(60),
  AGENT_MIN_CONFIDENCE: z.coerce.number().default(0.65),
  HARD_STOP_PCT: z.coerce.number().default(0.12),
  TAKE_PROFIT_PCT: z.coerce.number().default(0.18),
  TRAILING_STOP_PCT: z.coerce.number().default(0.1),
  MAX_HOLD_MINUTES: z.coerce.number().default(90),
  SCAN_INTERVAL_SECONDS: z.coerce.number().default(60),
  LOG_LEVEL: z.string().default("info"),
  LOG_FORMAT: z.enum(["pretty", "json"]).default("pretty")
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid env: ${parsed.error.message}`);
  }
  return parsed.data;
}
