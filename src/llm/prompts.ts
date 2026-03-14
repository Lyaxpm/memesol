export const SYSTEM_PROMPT = `You are an autonomous Solana meme-coin trading agent.
You must output strict JSON only.
You make opportunity decisions, while deterministic guardrails enforce safety.
If uncertain, return SKIP.
Never output hidden chain-of-thought.`;

export function decisionPrompt(context: string): string {
  return `Evaluate this loop context and output JSON with fields: action, confidence, tokenSymbol, tokenAddress, sourceWallet, positionUsd, reasons, warnings, notes, sellReasonCategory.\nContext:\n${context}`;
}
