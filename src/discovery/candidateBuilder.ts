import type { CoinScore, TokenCandidate, WalletCandidate, WalletScore } from "../types/domain.js";

export interface CandidateContext {
  token: TokenCandidate;
  wallet?: WalletCandidate;
  coinScore?: CoinScore;
  walletScore?: WalletScore;
}

export function buildCandidateContexts(tokens: TokenCandidate[], wallets: WalletCandidate[], coinScores: CoinScore[], walletScores: WalletScore[]): CandidateContext[] {
  return tokens.map((token) => ({
    token,
    wallet: wallets[0],
    coinScore: coinScores.find((c) => c.address === token.address),
    walletScore: walletScores[0]
  }));
}
