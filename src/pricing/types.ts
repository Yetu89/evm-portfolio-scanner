// Pricing Engine Types

// Provider categories
export type ProviderCategory = "dex" | "dex-aggregator" | "market-aggregator";

// AMM types for DEX providers
export type AMMType = 
  | "constant-product"      // Uniswap V2 style
  | "stable"               // Curve style
  | "concentrated-liquidity" // Uniswap V3/V4 style
  | "hybrid"               // Maverick, Balancer V3
  | "unknown";

// Provider implementation status
export type ImplementationStatus = 
  | "not-implemented"
  | "planning"
  | "in-progress"
  | "beta"
  | "stable";

// Chain IDs supported by the system
export type SupportedChainId = 
  | 1      // Ethereum
  | 8453   // Base
  | 42161  // Arbitrum
  | 10     // Optimism
  | 137    // Polygon
  | 56     // BNB Chain
  | 43114  // Avalanche
  | 59144  // Linea
  | 534352 // Scroll
  | 5000   // Mantle
  | 146    // Sonic
  | 1868   // Soneium
  | 5031   // Somnia
  | 324    // zkSync Era
  | 81457  // Blast
  | 34443  // Mode
  | 80094  // Berachain
  | 130    // Unichain
  | 57073  // Ink
  | 4663;  // Robinhood

// DEX Provider Configuration
export interface DexProviderConfig {
  id: string;
  name: string;
  category: "dex";
  ammType: AMMType;
  supportedChains: SupportedChainId[];
  version?: string; // e.g., "V2", "V3", "V4"
  positionManagerAddress?: string; // For V3/V4 DEXes
  factoryAddress?: string; // For V2 DEXes
  description?: string;
  documentation?: string;
  status: ImplementationStatus;
  notes?: string;
  priority: number;
}

// DEX Aggregator Provider Configuration
export interface DexAggregatorConfig {
  id: string;
  name: string;
  category: "dex-aggregator";
  supportedChains: SupportedChainId[];
  apiEndpoint?: string;
  documentation?: string;
  status: ImplementationStatus;
  notes?: string;
  priority: number;
}

// Market Aggregator Provider Configuration
export interface MarketAggregatorConfig {
  id: string;
  name: string;
  category: "market-aggregator";
  supportedChains: SupportedChainId[];
  apiEndpoint?: string;
  documentation?: string;
  status: ImplementationStatus;
  notes?: string;
  priority: number;
}

// Union type for all provider configurations
export type ProviderConfig = 
  | DexProviderConfig 
  | DexAggregatorConfig 
  | MarketAggregatorConfig;

// Token metadata for pricing
export interface TokenMetadata {
  address: string;
  chainId: number;
  symbol: string;
  name: string;
  decimals: number;
  coingeckoId?: string;
  isNative?: boolean;
}

// Price data structure
export interface PriceData {
  priceUsd: number;
  timestamp: number;
  volume24hUsd?: number;
  liquidityUsd?: number;
  source: string;
}

// Price quote for trading
export interface PriceQuote {
  tokenIn: string;
  tokenOut: string;
  amountIn: bigint;
  amountOut: bigint;
  price: number;
  slippage?: number;
  path?: string[];
  provider: string;
  timestamp: number;
}
