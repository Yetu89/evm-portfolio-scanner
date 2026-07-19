// ===================================
// Pricing Engine - Provider Index
// ===================================
// 
// Centralized export untuk semua provider inventory.
// Pricing Engine hanya perlu import dari sini.
// 
// Untuk menambahkan provider baru:
// 1. Buat provider config di file yang sesuai (dex.ts, dex-aggregator.ts, market-aggregator.ts)
// 2. Tambahkan ke array export list di file tersebut
// 3. Tidak perlu mengubah file ini
// ===================================

import { dexProviders } from "./dex";
import { dexAggregatorProviders } from "./dex-aggregator";
import { marketAggregatorProviders } from "./market-aggregator";
import type {
  ProviderConfig,
  ProviderCategory,
} from "../types";

export { dexProviders } from "./dex";
export { dexAggregatorProviders } from "./dex-aggregator";
export { marketAggregatorProviders } from "./market-aggregator";

// Re-export types
export type {
  ProviderConfig,
  DexProviderConfig,
  DexAggregatorConfig,
  MarketAggregatorConfig,
  ProviderCategory,
  AMMType,
  ImplementationStatus,
  SupportedChainId,
  TokenMetadata,
  PriceData,
  PriceQuote,
} from "../types";

// Utility: Filter providers by category
export function getProvidersByCategory(category: ProviderCategory) {
  switch (category) {
    case "dex":
      return dexProviders;
    case "dex-aggregator":
      return dexAggregatorProviders;
    case "market-aggregator":
      return marketAggregatorProviders;
    default:
      return [];
  }
}

// Utility: Get all providers
export function getAllProviders(): ProviderConfig[] {
  return [
    ...dexProviders,
    ...dexAggregatorProviders,
    ...marketAggregatorProviders,
  ];
}
