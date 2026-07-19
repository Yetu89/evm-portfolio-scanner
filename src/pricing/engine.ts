import {
  dexAggregatorProviders,
  marketAggregatorProviders,
} from "./providers";
import type { DexAggregatorConfig, MarketAggregatorConfig, PriceData } from "./types";
import {
  COINGECKO_PLATFORM,
  DEXSCREENER_CHAIN_SLUG,
  GECKOTERMINAL_NETWORK,
  getChainIdByName,
} from "./chain-map";

export interface TokenPriceRequest {
  /** Token contract address (lowercase preferred) */
  address: string;
  /** Numeric chain id when known */
  chainId?: number | null;
  /** Chain display name from Position.chain (fallback to resolve chainId) */
  chainName?: string;
  /** Optional symbol — used only as last-resort fallback, never alone when address exists */
  symbol?: string;
}

export interface TokenPriceResult {
  priceUsd: number | null;
  source: string | null;
  attempted: string[];
  chainId: number | null;
  address: string;
}

const PRICE_CACHE = new Map<
  string,
  { result: TokenPriceResult; timestamp: number }
>();
const CACHE_TTL_MS = 60_000;

function cacheKey(req: TokenPriceRequest, chainId: number | null): string {
  return `${chainId ?? "unknown"}:${req.address.toLowerCase()}`;
}

function sortByPriority<T extends { priority: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.priority - b.priority);
}

function isValidPrice(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

// ─── DexScreener ─────────────────────────────────────────────────

async function fetchDexScreener(
  address: string,
  chainId: number | null
): Promise<number | null> {
  // Prefer chain-scoped endpoint when we know the slug
  const slug = chainId != null ? DEXSCREENER_CHAIN_SLUG[chainId] : undefined;

  const urls: string[] = [];
  if (slug && slug !== "robinhood") {
    urls.push(
      `https://api.dexscreener.com/latest/dex/tokens/${address}`
    );
  } else {
    // Address lookup works across chains; filter by chainId if present
    urls.push(
      `https://api.dexscreener.com/latest/dex/tokens/${address}`
    );
  }

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        next: { revalidate: 60 },
      });
      if (!res.ok) continue;

      const data = (await res.json()) as {
        pairs?: Array<{
          chainId?: string;
          priceUsd?: string;
          liquidity?: { usd?: number };
          liquidityUsd?: string | number;
        }>;
      };

      let pairs = data.pairs ?? [];
      if (pairs.length === 0) continue;

      // Filter by chain when possible
      if (chainId != null && slug) {
        const filtered = pairs.filter(
          (p) => (p.chainId || "").toLowerCase() === slug.toLowerCase()
        );
        if (filtered.length > 0) pairs = filtered;
      }

      pairs = pairs.sort((a, b) => {
        const liqA =
          typeof a.liquidity?.usd === "number"
            ? a.liquidity.usd
            : parseFloat(String(a.liquidityUsd ?? 0));
        const liqB =
          typeof b.liquidity?.usd === "number"
            ? b.liquidity.usd
            : parseFloat(String(b.liquidityUsd ?? 0));
        return liqB - liqA;
      });

      const price = parseFloat(pairs[0]?.priceUsd || "0");
      if (isValidPrice(price)) return price;
    } catch (err) {
      console.error(`[Pricing] DexScreener error for ${address}:`, err);
    }
  }
  return null;
}

// ─── GeckoTerminal ───────────────────────────────────────────────

async function fetchGeckoTerminal(
  address: string,
  chainId: number | null
): Promise<number | null> {
  if (chainId == null) return null;
  const network = GECKOTERMINAL_NETWORK[chainId];
  if (!network) return null;

  try {
    const url = `https://api.geckoterminal.com/api/v2/networks/${network}/tokens/${address.toLowerCase()}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      data?: {
        attributes?: {
          price_usd?: string | null;
        };
      };
    };

    const price = parseFloat(data.data?.attributes?.price_usd || "0");
    if (isValidPrice(price)) return price;
  } catch (err) {
    console.error(`[Pricing] GeckoTerminal error for ${address}:`, err);
  }
  return null;
}

// ─── DEXTools (requires API key — skip if unavailable) ───────────

async function fetchDexTools(
  _address: string,
  _chainId: number | null
): Promise<number | null> {
  // DEXTools public API requires an API key. Without key, treat as unavailable.
  if (!process.env.DEXTOOLS_API_KEY) {
    return null;
  }
  // Future: implement authenticated DEXTools lookup
  return null;
}

// ─── CoinGecko ───────────────────────────────────────────────────

async function fetchCoinGecko(
  address: string,
  chainId: number | null
): Promise<number | null> {
  if (chainId == null) return null;
  const platform = COINGECKO_PLATFORM[chainId];
  if (!platform) return null;

  try {
    const url =
      `https://api.coingecko.com/api/v3/simple/token_price/${platform}` +
      `?contract_addresses=${address.toLowerCase()}&vs_currencies=usd`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        ...(process.env.COINGECKO_API_KEY
          ? { "x-cg-pro-api-key": process.env.COINGECKO_API_KEY }
          : {}),
      },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as Record<
      string,
      { usd?: number } | undefined
    >;
    const entry = data[address.toLowerCase()];
    const price = entry?.usd;
    if (isValidPrice(price)) return price;
  } catch (err) {
    console.error(`[Pricing] CoinGecko error for ${address}:`, err);
  }
  return null;
}

// ─── CoinMarketCap (requires API key) ────────────────────────────

async function fetchCoinMarketCap(
  _address: string,
  _chainId: number | null
): Promise<number | null> {
  if (!process.env.COINMARKETCAP_API_KEY) {
    return null;
  }
  // Future: implement CMC contract address lookup
  return null;
}

// ─── Provider dispatch ───────────────────────────────────────────

type PriceFetcher = (
  address: string,
  chainId: number | null
) => Promise<number | null>;

const AGGREGATOR_FETCHERS: Record<string, PriceFetcher> = {
  "dex-screener": fetchDexScreener,
  "gecko-terminal": fetchGeckoTerminal,
  "dex-tools": fetchDexTools,
  "coin-gecko": fetchCoinGecko,
  "coin-market-cap": fetchCoinMarketCap,
};

/**
 * Resolve token USD price using Pricing Engine inventory + priority fallback.
 *
 * Order:
 *  1. DEX Aggregators sorted by priority (DexScreener → GeckoTerminal → DEXTools)
 *  2. Market Aggregators sorted by priority (CoinGecko → CoinMarketCap)
 *
 * Lookup is always by (chainId, token address). Symbol is never used as primary key.
 */
export async function getTokenPrice(
  req: TokenPriceRequest
): Promise<TokenPriceResult> {
  const address = req.address.toLowerCase();
  let chainId: number | null =
    req.chainId != null && req.chainId > 0
      ? req.chainId
      : req.chainName
        ? getChainIdByName(req.chainName)
        : null;

  const key = cacheKey(req, chainId);
  const cached = PRICE_CACHE.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.result;
  }

  const attempted: string[] = [];
  let priceUsd: number | null = null;
  let source: string | null = null;

  // DEX aggregators first (on-chain / pool prices — better for long-tail tokens)
  const dexAggs = sortByPriority(dexAggregatorProviders).filter((p) =>
    chainId == null ? true : p.supportedChains.includes(chainId as never)
  );

  for (const provider of dexAggs) {
    const fetcher = AGGREGATOR_FETCHERS[provider.id];
    if (!fetcher) {
      attempted.push(`${provider.id}:no-fetcher`);
      continue;
    }
    attempted.push(provider.id);
    const price = await fetcher(address, chainId);
    if (isValidPrice(price)) {
      priceUsd = price;
      source = provider.id;
      break;
    }
  }

  // Market aggregators as fallback
  if (priceUsd == null) {
    const marketAggs = sortByPriority(marketAggregatorProviders).filter((p) =>
      chainId == null ? true : p.supportedChains.includes(chainId as never)
    );

    for (const provider of marketAggs) {
      const fetcher = AGGREGATOR_FETCHERS[provider.id];
      if (!fetcher) {
        attempted.push(`${provider.id}:no-fetcher`);
        continue;
      }
      attempted.push(provider.id);
      const price = await fetcher(address, chainId);
      if (isValidPrice(price)) {
        priceUsd = price;
        source = provider.id;
        break;
      }
    }
  }

  const result: TokenPriceResult = {
    priceUsd,
    source,
    attempted,
    chainId,
    address,
  };

  PRICE_CACHE.set(key, { result, timestamp: Date.now() });

  console.log(
    `[Pricing] ${address} chain=${chainId} → price=${priceUsd} source=${source} attempted=[${attempted.join(", ")}]`
  );

  return result;
}

/**
 * Batch price lookup keyed by "chainId:address"
 */
export async function getTokenPrices(
  requests: TokenPriceRequest[]
): Promise<Map<string, TokenPriceResult>> {
  const unique = new Map<string, TokenPriceRequest>();
  for (const req of requests) {
    const chainId =
      req.chainId != null && req.chainId > 0
        ? req.chainId
        : req.chainName
          ? getChainIdByName(req.chainName)
          : null;
    const k = `${chainId ?? "unknown"}:${req.address.toLowerCase()}`;
    if (!unique.has(k)) unique.set(k, req);
  }

  const entries = await Promise.all(
    Array.from(unique.entries()).map(async ([k, req]) => {
      const result = await getTokenPrice(req);
      return [k, result] as const;
    })
  );

  return new Map(entries);
}

export function priceMapKey(chainId: number | null, address: string): string {
  return `${chainId ?? "unknown"}:${address.toLowerCase()}`;
}

/** Convert PriceData-compatible result for consumers that need it */
export function toPriceData(result: TokenPriceResult): PriceData | null {
  if (result.priceUsd == null || result.source == null) return null;
  return {
    priceUsd: result.priceUsd,
    timestamp: Date.now(),
    source: result.source,
  };
}
