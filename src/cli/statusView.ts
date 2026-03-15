import type { Env } from "../config/env.js";

export function printStartupStatus(env: Env) {
  console.log(`Mode: ${env.LIVE_TRADING ? "LIVE" : "PAPER"}`);
  console.log(`Capital: $${env.TOTAL_CAPITAL_USD} | Max Position: $${env.MAX_POSITION_USD} | Max Open: ${env.MAX_OPEN_POSITIONS}`);
  console.log(`Agent model: ${env.AGENT_MODEL}`);
}
