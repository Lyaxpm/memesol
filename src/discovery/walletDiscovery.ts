import type { WalletCandidate } from "../types/domain.js";

export function filterDiscoveredWallets(wallets: WalletCandidate[]): WalletCandidate[] {
  return wallets.filter((w) => w.observedTrades >= 8 && w.winRateProxy >= 0.45);
}
