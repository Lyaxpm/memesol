export const schemaSql = `
CREATE TABLE IF NOT EXISTS discovered_tokens (
  address TEXT PRIMARY KEY,
  symbol TEXT NOT NULL,
  payload TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS discovered_wallets (
  address TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS wallet_scores (
  address TEXT PRIMARY KEY,
  score REAL NOT NULL,
  reasons TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS coin_scores (
  address TEXT PRIMARY KEY,
  symbol TEXT NOT NULL,
  score REAL NOT NULL,
  reasons TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS agent_decisions (
  id TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS trades (
  id TEXT PRIMARY KEY,
  symbol TEXT,
  action TEXT,
  usd REAL,
  payload TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS positions (
  token_address TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS risk_events (
  id TEXT PRIMARY KEY,
  reason TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
`;
