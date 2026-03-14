export interface HealthCheckResult {
  name: string;
  ok: boolean;
  detail: string;
}

export interface DexPair {
  baseToken: { symbol: string; address: string };
  liquidityUsd?: number;
  volume?: { m5?: number; h1?: number; h24?: number };
  pairCreatedAt?: number;
  fdv?: number;
}
