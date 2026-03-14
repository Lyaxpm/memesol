import type { Position, TradeResult } from "../types/domain.js";

export interface Broker {
  placeBuy(input: { symbol: string; tokenAddress: string; usd: number }): Promise<TradeResult>;
  placeSell(input: { symbol: string; tokenAddress: string; quantity?: number }): Promise<TradeResult>;
  getPositions(): Promise<Position[]>;
  getBalance(): Promise<number>;
  getOpenOrders(): Promise<number>;
}
