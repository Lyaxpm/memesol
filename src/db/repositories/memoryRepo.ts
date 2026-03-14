import type Database from "better-sqlite3";
import type { AgentDecision, CoinScore, Position, TokenCandidate, TradeResult, WalletCandidate, WalletScore } from "../../types/domain.js";
import { id } from "../../utils/ids.js";

export class MemoryRepo {
  constructor(private db: Database.Database) {}

  upsertToken(t: TokenCandidate) {
    this.db.prepare("INSERT INTO discovered_tokens(address,symbol,payload,updated_at) VALUES(?,?,?,?) ON CONFLICT(address) DO UPDATE SET symbol=excluded.symbol,payload=excluded.payload,updated_at=excluded.updated_at")
      .run(t.address, t.symbol, JSON.stringify(t), Date.now());
  }
  upsertWallet(w: WalletCandidate) {
    this.db.prepare("INSERT INTO discovered_wallets(address,payload,updated_at) VALUES(?,?,?) ON CONFLICT(address) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at")
      .run(w.address, JSON.stringify(w), Date.now());
  }
  upsertWalletScore(s: WalletScore) {
    this.db.prepare("INSERT INTO wallet_scores(address,score,reasons,updated_at) VALUES(?,?,?,?) ON CONFLICT(address) DO UPDATE SET score=excluded.score,reasons=excluded.reasons,updated_at=excluded.updated_at")
      .run(s.address, s.score, JSON.stringify(s.reasons), Date.now());
  }
  upsertCoinScore(s: CoinScore) {
    this.db.prepare("INSERT INTO coin_scores(address,symbol,score,reasons,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(address) DO UPDATE SET symbol=excluded.symbol,score=excluded.score,reasons=excluded.reasons,updated_at=excluded.updated_at")
      .run(s.address, s.symbol, s.score, JSON.stringify(s.reasons), Date.now());
  }
  saveDecision(d: AgentDecision) {
    this.db.prepare("INSERT INTO agent_decisions(id,payload,created_at) VALUES(?,?,?)").run(id("dec"), JSON.stringify(d), Date.now());
  }
  saveTrade(t: TradeResult) {
    this.db.prepare("INSERT INTO trades(id,symbol,action,usd,payload,created_at) VALUES(?,?,?,?,?,?)")
      .run(id("trd"), t.symbol ?? null, t.action, t.usd ?? null, JSON.stringify(t), Date.now());
  }
  saveRiskEvent(reason: string) {
    this.db.prepare("INSERT INTO risk_events(id,reason,created_at) VALUES(?,?,?)").run(id("risk"), reason, Date.now());
  }
  setPositions(positions: Position[]) {
    const del = this.db.prepare("DELETE FROM positions");
    del.run();
    const stmt = this.db.prepare("INSERT INTO positions(token_address,payload,updated_at) VALUES(?,?,?)");
    for (const p of positions) stmt.run(p.tokenAddress, JSON.stringify(p), Date.now());
  }
  recentDecisionNotes(limit = 5): string[] {
    const rows = this.db.prepare("SELECT payload FROM agent_decisions ORDER BY created_at DESC LIMIT ?").all(limit) as { payload: string }[];
    return rows.map((r) => JSON.parse(r.payload).notes as string);
  }
}
