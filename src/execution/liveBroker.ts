import type { Broker } from "./broker.js";
import type { Env } from "../config/env.js";
import type { Position, TradeResult } from "../types/domain.js";

export class LiveBroker implements Broker {
  constructor(private env: Env) {
    if (!env.LIVE_TRADING) throw new Error("LiveBroker cannot run when LIVE_TRADING is false");
    if (!env.BOT_PRIVATE_KEY) throw new Error("BOT_PRIVATE_KEY required for live mode");
  }
  async placeBuy(input: { symbol: string; tokenAddress: string; usd: number }): Promise<TradeResult> {
    return { ok: false, action: "BUY", symbol: input.symbol, reason: "Live execution TODO via Jupiter adapter" };
  }
  async placeSell(input: { symbol: string; tokenAddress: string }): Promise<TradeResult> {
    return { ok: false, action: "SELL", symbol: input.symbol, reason: "Live execution TODO via Jupiter adapter" };
  }
  async getPositions(): Promise<Position[]> { return []; }
  async getBalance(): Promise<number> { return this.env.TOTAL_CAPITAL_USD; }
  async getOpenOrders(): Promise<number> { return 0; }
}
