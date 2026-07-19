// ===================================
// DEX Aggregator Provider Inventory
// ===================================

import { DexAggregatorConfig } from "../types";

// ════════════════════════════════════════════════════════════════
// DEX SCREENER
// ════════════════════════════════════════════════════════════════

export const dexScreenerProvider: DexAggregatorConfig = {
  id: "dex-screener",
  name: "DexScreener",
  category: "dex-aggregator",
  supportedChains: [
    1, 8453, 42161, 10, 137, 56, 43114, 59144, 534352,
    5000, 1868, 324, 81457, 34443, 80094, 130, 57073, 4663
  ],
  apiEndpoint: "https://api.dexscreener.com/latest/dex/tokens/{address}",
  documentation: "https://docs.dexscreener.com/api/reference",
  status: "stable",
  notes: "Primary DEX aggregator. Lookup by token address via /latest/dex/tokens/{address}",
  priority: 1,
};

// ════════════════════════════════════════════════════════════════
// GECKO TERMINAL
// ════════════════════════════════════════════════════════════════

export const geckoTerminalProvider: DexAggregatorConfig = {
  id: "gecko-terminal",
  name: "GeckoTerminal",
  category: "dex-aggregator",
  supportedChains: [
    1, 8453, 42161, 10, 137, 56, 43114, 59144, 534352,
    5000, 1868, 324, 81457, 34443, 80094, 130, 57073, 4663
  ],
  apiEndpoint: "https://api.geckoterminal.com/api/v2",
  documentation: "https://docs.geckoterminal.com/",
  status: "stable",
  notes: "Secondary DEX aggregator. Lookup by network + token address",
  priority: 2,
};

// ════════════════════════════════════════════════════════════════
// DEX TOOLS
// ════════════════════════════════════════════════════════════════

export const dexToolsProvider: DexAggregatorConfig = {
  id: "dex-tools",
  name: "DEXTools",
  category: "dex-aggregator",
  supportedChains: [
    1, 8453, 42161, 10, 137, 56, 43114, 59144, 534352,
    5000, 1868, 324, 81457, 34443, 80094, 130, 57073, 4663
  ],
  apiEndpoint: "https://api.dextools.io/v1",
  documentation: "https://www.dextools.io/api",
  status: "not-implemented",
  notes: "Requires DEXTOOLS_API_KEY env. Skipped when key missing.",
  priority: 3,
};

// ════════════════════════════════════════════════════════════════
// EXPORT LIST
// ════════════════════════════════════════════════════════════════

export const dexAggregatorProviders: DexAggregatorConfig[] = [
  dexScreenerProvider,
  geckoTerminalProvider,
  dexToolsProvider,
];
