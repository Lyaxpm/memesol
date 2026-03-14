import { fetchWalletActivity } from "../collectors/helius.js";

export async function discoverWalletActivity(tokenAddresses: string[]) {
  return fetchWalletActivity(tokenAddresses);
}
