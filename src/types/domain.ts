export type AgentAction = "BUY" | "SELL" | "HOLD" | "SKIP";

export interface TokenCandidate {
  symbol: string;
  address: string;
  liquidityUsd: number;
  volume5mUsd: number;
  volume1hUsd: number;
  ageMinutes: number;
  volatility: number;
  slippageBps: number;
  suspiciousFlags: string[];
  lastUpdatedMs: number;
}

export interface WalletCandidate {
  address: string;
  observedTrades: number;
  winRateProxy: number;
  realizedPnlProxyUsd: number;
  medianRoiProxy: number;
  avgHoldMinutes: number;
  drawdownProxy: number;
  recencyScore: number;
}

export interface WalletScore {
  address: string;
  score: number;
  reasons: string[];
}

export interface CoinScore {
  address: string;
  symbol: string;
  score: number;
  reasons: string[];
}

export interface Position {
  symbol: string;
  tokenAddress: string;
  quantity: number;
  entryPriceUsd: number;
  currentPriceUsd: number;
  openedAtMs: number;
}

export interface PortfolioState {
  balanceUsd: number;
  reserveSol: number;
  openPositions: Position[];
  realizedPnlUsd: number;
  dailyPnlUsd: number;
}

export interface AgentDecision {
  action: AgentAction;
  confidence: number;
  tokenSymbol?: string;
  tokenAddress?: string;
  sourceWallet?: string;
  positionUsd?: number;
  reasons: string[];
  warnings: string[];
  notes: string;
  sellReasonCategory?: "TAKE_PROFIT" | "STOP_LOSS" | "MIRROR_EXIT" | "RISK_EXIT" | "TIME_EXIT";
}

export interface TradeResult {
  ok: boolean;
  action: AgentAction;
  symbol?: string;
  usd?: number;
  txId?: string;
  reason?: string;
}
