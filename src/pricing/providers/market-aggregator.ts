// ===================================
// Market Aggregator Provider Inventory
// ===================================

import { MarketAggregatorConfig } from "../types";

// ════════════════════════════════════════════════════════════════
// COINGECKO
// ════════════════════════════════════════════════════════════════

export const coinGeckoProvider: MarketAggregatorConfig = {
  id: "coin-gecko",
  name: "CoinGecko",
  category: "market-aggregator",
  supportedChains: [
    1, 8453, 42161, 10, 137, 56, 43114, 59144, 534352,
    5000, 1868, 324, 81457, 34443, 80094, 130, 57073, 4663
  ],
  apiEndpoint: "https://api.coingecko.com/api/v3/simple/price",
  documentation: "https://docs.coingecko.com/reference/coingecko-api",
  status: "stable",
  notes: "Market aggregator fallback. Lookup by platform + contract address",
  priority: 1,
};

// ════════════════════════════════════════════════════════════════
// COINMARKETCAP
// ════════════════════════════════════════════════════════════════

export const coinMarketCapProvider: MarketAggregatorConfig = {
  id: "coin-market-cap",
  name: "CoinMarketCap",
  category: "market-aggregator",
  supportedChains: [
    1, 8453, 42161, 10, 137, 56, 43114, 59144, 534352,
    5000, 1868, 324, 81457, 34443, 80094, 130, 57073, 4663
  ],
  apiEndpoint: "https://pro-api.coinmarketcap.com/v1",
  documentation: "https://coinmarketcap.com/api/documentation/v1/",
  status: "not-implemented",
  notes: "Requires COINMARKETCAP_API_KEY env. Skipped when key missing.",
  priority: 2,
};

// ════════════════════════════════════════════════════════════════
// EXPORT LIST
// ════════════════════════════════════════════════════════════════

export const marketAggregatorProviders: MarketAggregatorConfig[] = [
  coinGeckoProvider,
  coinMarketCapProvider,
];
