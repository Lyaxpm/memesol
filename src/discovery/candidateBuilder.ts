import type { CoinScore, TokenCandidate, WalletCandidate, WalletScore } from "../types/domain.js";

export interface CandidateContext {
  token: TokenCandidate;
  wallet?: WalletCandidate;
  coinScore?: CoinScore;
  walletScore?: WalletScore;
}

export function buildCandidateContexts(tokens: TokenCandidate[], wallets: WalletCandidate[], coinScores: CoinScore[], walletScores: WalletScore[]): CandidateContext[] {
  const walletByToken = new Map(wallets.map((w) => [w.sourceTokenAddress, w]));
  const scoreByWalletAddress = new Map(walletScores.map((s) => [s.address, s]));

  return tokens.map((token) => ({
    token,
    wallet: walletByToken.get(token.address) ?? wallets[0],
    coinScore: coinScores.find((c) => c.address === token.address),
    walletScore: scoreByWalletAddress.get(walletByToken.get(token.address)?.address ?? "") ?? walletScores[0]
  }));
}
