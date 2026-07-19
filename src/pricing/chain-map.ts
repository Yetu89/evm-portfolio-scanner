import { chains } from "@/chains/config";
import type { SupportedChainId } from "./types";

/** Map chain display name (Position.chain) → chainId */
export function getChainIdByName(chainName: string): number | null {
  const found = chains.find(
    (c) => c.name.toLowerCase() === chainName.toLowerCase()
  );
  return found?.chainId ?? null;
}

/** DexScreener chainId string for a numeric chain id */
export const DEXSCREENER_CHAIN_SLUG: Partial<Record<number, string>> = {
  1: "ethereum",
  8453: "base",
  42161: "arbitrum",
  10: "optimism",
  137: "polygon",
  56: "bsc",
  43114: "avalanche",
  59144: "linea",
  534352: "scroll",
  5000: "mantle",
  324: "zksync",
  81457: "blast",
  34443: "mode",
  80094: "berachain",
  130: "unichain",
  57073: "ink",
  // Robinhood may not be on DexScreener; still attempt by address
  4663: "robinhood",
};

/** GeckoTerminal network slug */
export const GECKOTERMINAL_NETWORK: Partial<Record<number, string>> = {
  1: "eth",
  8453: "base",
  42161: "arbitrum",
  10: "optimism",
  137: "polygon_pos",
  56: "bsc",
  43114: "avax",
  59144: "linea",
  534352: "scroll",
  5000: "mantle",
  324: "zksync",
  81457: "blast",
  34443: "mode",
  80094: "berachain",
  130: "unichain",
  4663: "robinhood-chain",
};

/** CoinGecko asset platform id */
export const COINGECKO_PLATFORM: Partial<Record<number, string>> = {
  1: "ethereum",
  8453: "base",
  42161: "arbitrum-one",
  10: "optimistic-ethereum",
  137: "polygon-pos",
  56: "binance-smart-chain",
  43114: "avalanche",
  59144: "linea",
  534352: "scroll",
  5000: "mantle",
  324: "zksync",
  81457: "blast",
  34443: "mode",
  80094: "berachain",
  130: "unichain",
};

export function isSupportedChainId(id: number): id is SupportedChainId {
  return chains.some((c) => c.chainId === id);
}
