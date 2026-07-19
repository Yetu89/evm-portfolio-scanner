import { Address } from "viem";
import { createRpcClient } from "@/lib/client";
import { ERC20_ABI } from "../abis/erc20";

const METADATA_CACHE = new Map<string, { symbol: string; decimals: number }>();

export async function getTokenMetadata(
  rpcUrl: string,
  address: Address | undefined
): Promise<{ symbol: string; decimals: number }> {
  if (!address) {
    return { symbol: "Unknown", decimals: 18 };
  }

  const addrLower = address.toLowerCase();
  const key = `${rpcUrl}:${addrLower}`;
  const cached = METADATA_CACHE.get(key);
  if (cached) return cached;

  const client = createRpcClient(rpcUrl);
  try {
    const [symbol, decimals] = await Promise.all([
      client.readContract({
        address,
        abi: ERC20_ABI,
        functionName: "symbol",
      }) as Promise<string>,
      client.readContract({
        address,
        abi: ERC20_ABI,
        functionName: "decimals",
      }) as Promise<number>,
    ]);

    const result = { symbol, decimals };
    METADATA_CACHE.set(key, result);
    return result;
  } catch {
    return { symbol: "Unknown", decimals: 18 };
  }
}
