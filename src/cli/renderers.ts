import Table from "cli-table3";
import type { CoinScore, WalletScore } from "../types/domain.js";

export function renderScores(wallets: WalletScore[], coins: CoinScore[]) {
  const wt = new Table({ head: ["Wallet", "Score"] });
  wallets.slice(0, 5).forEach((w) => wt.push([w.address.slice(0, 8), w.score]));
  console.log(wt.toString());

  const ct = new Table({ head: ["Token", "Score"] });
  coins.slice(0, 5).forEach((c) => ct.push([c.symbol, c.score]));
  console.log(ct.toString());
}
