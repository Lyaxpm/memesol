import type { PortfolioState } from "../types/domain.js";

export function defaultPortfolio(capitalUsd: number): PortfolioState {
  return { balanceUsd: capitalUsd, reserveSol: 0.1, openPositions: [], realizedPnlUsd: 0, dailyPnlUsd: 0 };
}
