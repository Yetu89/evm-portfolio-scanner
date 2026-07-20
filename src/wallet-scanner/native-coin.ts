import { createRpcClient } from "@/lib/client";

/**
 * Fetch native coin balance for a wallet on a given RPC URL.
 * Returns balance in wei (raw units).
 */
export async function getNativeCoinBalance(
  rpcUrl: string,
  wallet: `0x${string}`
): Promise<bigint> {
  const client = createRpcClient(rpcUrl);
  const balance = await client.getBalance({ address: wallet });
  return balance;
}
