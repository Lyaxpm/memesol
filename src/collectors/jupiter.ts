export async function getQuote(_fromMint: string, _toMint: string, amountUsd: number) {
  return { expectedOutUsd: amountUsd * 0.985, feeUsd: 0.02, slippageBps: 150 };
}
