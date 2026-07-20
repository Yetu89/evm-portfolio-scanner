import { chains } from "@/chains/config";
import { createRpcClient } from "@/lib/client";
import { getNativeCoinBalance } from "./native-coin";
import { getTokenBalances } from "./tokens";
import type {
  WalletAsset,
  WalletPortfolio,
  NativeCoinAsset,
  TokenAsset,
} from "./types";

// ── Native coin metadata per chain ─────────────────────────────────

const NATIVE_COINS: Record<number, { symbol: string; decimals: number }> = {
  1: { symbol: "ETH", decimals: 18 },
  8453: { symbol: "ETH", decimals: 18 },
  42161: { symbol: "ETH", decimals: 18 },
  10: { symbol: "ETH", decimals: 18 },
  137: { symbol: "MATIC", decimals: 18 },
  56: { symbol: "BNB", decimals: 18 },
  43114: { symbol: "AVAX", decimals: 18 },
  59144: { symbol: "ETH", decimals: 18 },
  534352: { symbol: "ETH", decimals: 18 },
  5000: { symbol: "MNT", decimals: 18 },
  146: { symbol: "S", decimals: 18 },
  1868: { symbol: "ETH", decimals: 18 },
  5031: { symbol: "SOMI", decimals: 18 },
  324: { symbol: "ETH", decimals: 18 },
  81457: { symbol: "ETH", decimals: 18 },
  34443: { symbol: "ETH", decimals: 18 },
  80094: { symbol: "BERA", decimals: 18 },
  130: { symbol: "ETH", decimals: 18 },
  57073: { symbol: "ETH", decimals: 18 },
  4663: { symbol: "ETH", decimals: 18 },
};

// ── Token price placeholder (will be replaced by Pricing Engine) ───

async function resolveTokenPrice(
  symbol: string,
  chainId: number,
  address?: string
): Promise<number | null> {
  try {
    const { getTokenPrice } = await import("@/pricing");
    const result = await getTokenPrice({
      address: address || "",
      chainId,
      symbol,
    });
    return result.priceUsd;
  } catch {
    return null;
  }
}

// ── Scan one chain ─────────────────────────────────────────────────

async function scanChain(
  wallet: `0x${string}`,
  chainId: number
): Promise<WalletAsset[]> {
  const chainConfig = chains.find((c) => c.chainId === chainId);
  if (!chainConfig) return [];

  const rpcUrl = chainConfig.rpcUrl;
  const assets: WalletAsset[] = [];

  // 1. Native coin
  const native = NATIVE_COINS[chainId];
  if (native) {
    try {
      const balance = await getNativeCoinBalance(rpcUrl, wallet);
      if (balance > BigInt(0)) {
        const price = await resolveTokenPrice(native.symbol, chainId);
        const amount = Number(balance) / Math.pow(10, native.decimals);
        assets.push({
          type: "native-coin",
          chainId,
          chainName: chainConfig.name,
          symbol: native.symbol,
          decimals: native.decimals,
          balance,
          priceUsd: price,
          valueUsd: amount * (price || 0),
        });
      }
    } catch (err) {
      console.error(`[Scanner] Native coin failed on ${chainConfig.name}:`, err);
    }
  }

  // 2. ERC20 tokens
  try {
    const tokenBalances = await getTokenBalances(rpcUrl, wallet, chainId);
    for (const { token, balance } of tokenBalances) {
      const price = await resolveTokenPrice(token.symbol, chainId, token.address);
      const amount = Number(balance) / Math.pow(10, token.decimals);
      assets.push({
        type: "token",
        chainId,
        chainName: chainConfig.name,
        address: token.address,
        symbol: token.symbol,
        decimals: token.decimals,
        balance,
        priceUsd: price,
        valueUsd: amount * (price || 0),
      });
    }
  } catch (err) {
    console.error(`[Scanner] Token scan failed on ${chainConfig.name}:`, err);
  }

  return assets;
}

// ── Main scan function ─────────────────────────────────────────────

export async function scanWalletPortfolio(
  wallet: string
): Promise<WalletPortfolio> {
  const walletLower = wallet.toLowerCase() as `0x${string}`;
  const allAssets: WalletAsset[] = [];

  // Scan all chains in parallel with concurrency limit
  const CONCURRENCY = 4;
  const chainIds = chains.filter((c) => c.rpcUrl).map((c) => c.chainId);
  let index = 0;

  async function worker() {
    while (index < chainIds.length) {
      const chainIndex = index++;
      const chainId = chainIds[chainIndex];
      try {
        const assets = await scanChain(walletLower, chainId);
        allAssets.push(...assets);
      } catch (err) {
        console.error(`[Scanner] Chain ${chainId} failed:`, err);
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(CONCURRENCY, chainIds.length) },
    () => worker()
  );
  await Promise.all(workers);

  // Aggregate stats
  const nativeCoins = allAssets.filter((a) => a.type === "native-coin");
  const tokens = allAssets.filter((a) => a.type === "token");
  const totalValue = allAssets.reduce((sum, a) => sum + (a.valueUsd || 0), 0);

  // Chain breakdown
  const chainMap = new Map<number, { chainName: string; totalValueUsd: number; assetCount: number }>();
  for (const asset of allAssets) {
    const existing = chainMap.get(asset.chainId);
    if (existing) {
      existing.totalValueUsd += asset.valueUsd || 0;
      existing.assetCount += 1;
    } else {
      chainMap.set(asset.chainId, {
        chainName: asset.chainName,
        totalValueUsd: asset.valueUsd || 0,
        assetCount: 1,
      });
    }
  }

  const chainBreakdown = Array.from(chainMap.entries())
    .map(([chainId, data]) => ({ chainId, ...data }))
    .sort((a, b) => b.totalValueUsd - a.totalValueUsd);

  return {
    wallet,
    chainCount: chainMap.size,
    nativeCoinCount: nativeCoins.length,
    tokenCount: tokens.length,
    lpPositionCount: 0,
    totalAssets: allAssets.length,
    totalValueUsd: totalValue,
    assets: allAssets,
    chainBreakdown,
  };
}
