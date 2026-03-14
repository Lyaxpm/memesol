export function signalSummary(walletScore: number, coinScore: number): string {
  if (walletScore > 75 && coinScore > 75) return "strong";
  if (walletScore > 60 && coinScore > 60) return "moderate";
  return "weak";
}
