import type { Broker } from "./broker.js";
import type { Position, TradeResult } from "../types/domain.js";

export class PaperBroker implements Broker {
  private balance: number;
  private positions: Position[] = [];
  constructor(startBalanceUsd: number) { this.balance = startBalanceUsd; }

  async placeBuy(input: { symbol: string; tokenAddress: string; usd: number }): Promise<TradeResult> {
    const fee = 0.02;
    const slippage = 0.01;
    const spend = input.usd + fee;
    if (spend > this.balance) return { ok: false, action: "BUY", reason: "insufficient paper balance" };
    this.balance -= spend;
    const qty = input.usd * (1 - slippage);
    this.positions.push({ symbol: input.symbol, tokenAddress: input.tokenAddress, quantity: qty, entryPriceUsd: 1, currentPriceUsd: 1, openedAtMs: Date.now() });
    return { ok: true, action: "BUY", symbol: input.symbol, usd: input.usd, txId: `paper-buy-${Date.now()}` };
  }

  async placeSell(input: { symbol: string; tokenAddress: string }): Promise<TradeResult> {
    const idx = this.positions.findIndex((p) => p.tokenAddress === input.tokenAddress);
    if (idx < 0) return { ok: false, action: "SELL", reason: "position missing" };
    const pos = this.positions[idx];
    this.positions.splice(idx, 1);
    const proceeds = pos.quantity * pos.currentPriceUsd * 0.99;
    this.balance += proceeds;
    return { ok: true, action: "SELL", symbol: input.symbol, usd: proceeds, txId: `paper-sell-${Date.now()}` };
  }

  async getPositions(): Promise<Position[]> { return this.positions; }
  async getBalance(): Promise<number> { return this.balance; }
  async getOpenOrders(): Promise<number> { return 0; }
}
