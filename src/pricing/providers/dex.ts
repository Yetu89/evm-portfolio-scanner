// ===================================
// DEX Provider Inventory
// ===================================

import { DexProviderConfig } from "../types";

// ════════════════════════════════════════════════════════════════
// PRIORITY 1 - DEX Utama pada chain masing-masing
// ════════════════════════════════════════════════════════════════

export const uniswapV3Provider: DexProviderConfig = {
  id: "uniswap-v3",
  name: "Uniswap V3",
  category: "dex",
  ammType: "concentrated-liquidity",
  version: "V3",
  supportedChains: [1, 8453, 42161, 10, 137, 56, 43114, 59144, 534352, 5000, 1868, 324, 81457, 34443, 80094, 130, 57073, 4663],
  positionManagerAddress: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
  factoryAddress: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  description: "Leading concentrated liquidity AMM",
  documentation: "https://docs.uniswap.org/contracts/v3/",
  status: "stable",
  priority: 1,
};

export const uniswapV4Provider: DexProviderConfig = {
  id: "uniswap-v4",
  name: "Uniswap V4",
  category: "dex",
  ammType: "concentrated-liquidity",
  version: "V4",
  supportedChains: [4663],
  positionManagerAddress: "0x58daec3116aae6d93017baaea7749052e8a04fa7",
  factoryAddress: "0x0000000000000000000000000000000000000020",
  description: "Next-gen AMM with hooks",
  documentation: "https://docs.uniswap.org/contracts/v4/",
  status: "beta",
  notes: "Testnet di Robinhood Chain",
  priority: 1,
};

export const aerodromeProvider: DexProviderConfig = {
  id: "aerodrome",
  name: "Aerodrome",
  category: "dex",
  ammType: "concentrated-liquidity",
  version: "V1",
  supportedChains: [8453],
  positionManagerAddress: "0x827922686190790b37229fd060973282d2aad1",
  factoryAddress: "0x420DD381b31aEf6683db6B902084cB0FFEC4085",
  description: "Leading DEX on Base",
  documentation: "https://docs.aerodrome.finance/",
  status: "stable",
  priority: 1,
};

export const velodromeProvider: DexProviderConfig = {
  id: "velodrome",
  name: "Velodrome V2",
  category: "dex",
  ammType: "concentrated-liquidity",
  version: "V2",
  supportedChains: [10],
  positionManagerAddress: "0x827922686190790b37229fd060973282d2aad1",
  factoryAddress: "0xF1046053aa5682b4F9a81b548139B1a32",
  description: "Leading AMM on Optimism",
  documentation: "https://docs.velodrome.finance/",
  status: "stable",
  priority: 1,
};

export const camelotV3Provider: DexProviderConfig = {
  id: "camelot-v3",
  name: "Camelot V3",
  category: "dex",
  ammType: "concentrated-liquidity",
  version: "V3",
  supportedChains: [42161],
  positionManagerAddress: "0xc7dd547b547d90a1e1a7e4d5e7e8ab4f1f6f6f6f",
  factoryAddress: "0x6EC",
  description: "Native DEX on Arbitrum",
  documentation: "https://docs.camelot.exchange/",
  status: "stable",
  priority: 1,
};

export const quickSwapV3Provider: DexProviderConfig = {
  id: "quickswap-v3",
  name: "QuickSwap V3",
  category: "dex",
  ammType: "concentrated-liquidity",
  version: "V3",
  supportedChains: [137],
  positionManagerAddress: "0x8eF88e4c7C2baDB30887e82BB2a1825D1fA23fC5",
  factoryAddress: "0x4d1c05F044d9a840",
  description: "Leading DEX on Polygon",
  documentation: "https://docs.quickswap.exchange/",
  status: "stable",
  priority: 1,
};

export const traderJoeV2Provider: DexProviderConfig = {
  id: "trader-joe-v2",
  name: "Trader Joe V2",
  category: "dex",
  ammType: "concentrated-liquidity",
  version: "V2",
  supportedChains: [43114],
  factoryAddress: "0x6B",
  description: "Leading DEX on Avalanche",
  documentation: "https://docs.traderjoexyz.com/",
  status: "stable",
  priority: 1,
};

export const thenaV3Provider: DexProviderConfig = {
  id: "thena-v3",
  name: "THENA V3",
  category: "dex",
  ammType: "concentrated-liquidity",
  version: "V3",
  supportedChains: [56],
  positionManagerAddress: "0x51d682a3f0c2B3EDA1e9D4D5a3f0AfBf0fDb3DCA",
  factoryAddress: "0xafE9",
  description: "Leading DEX on BNB Chain",
  documentation: "https://docs.thena.fi/",
  status: "stable",
  priority: 1,
};

// ════════════════════════════════════════════════════════════════
// PRIORITY 2
// ════════════════════════════════════════════════════════════════

export const sushiSwapV2Provider: DexProviderConfig = {
  id: "sushiswap-v2",
  name: "SushiSwap V2",
  category: "dex",
  ammType: "constant-product",
  version: "V2",
  supportedChains: [1, 8453, 42161, 137, 56, 43114],
  factoryAddress: "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac",
  description: "Community-driven multi-chain DEX",
  documentation: "https://docs.sushi.com/",
  status: "stable",
  priority: 2,
};

export const balancerV2Provider: DexProviderConfig = {
  id: "balancer-v2",
  name: "Balancer V2",
  category: "dex",
  ammType: "hybrid",
  version: "V2",
  supportedChains: [1, 8453, 42161, 137],
  factoryAddress: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
  description: "Multi-asset AMM",
  notes: "factoryAddress stores Balancer Vault address",
  documentation: "https://docs.balancer.fi/",
  status: "stable",
  priority: 2,
};

export const curveProvider: DexProviderConfig = {
  id: "curve",
  name: "Curve Finance",
  category: "dex",
  ammType: "stable",
  version: "V1",
  supportedChains: [1, 8453, 42161, 10, 137, 43114],
  factoryAddress: "0xB9fC157394Af804a3578134A6585",
  description: "Leading stableswap AMM",
  documentation: "https://docs.curve.fi/",
  status: "stable",
  priority: 2,
};

export const maverickProvider: DexProviderConfig = {
  id: "maverick",
  name: "Maverick Protocol",
  category: "dex",
  ammType: "hybrid",
  version: "V2",
  supportedChains: [8453, 56],
  description: "Dynamic AMM with moving liquidity",
  documentation: "https://docs.maverick.finance/",
  status: "beta",
  priority: 2,
};

export const pangolinProvider: DexProviderConfig = {
  id: "pangolin",
  name: "Pangolin",
  category: "dex",
  ammType: "constant-product",
  version: "V2",
  supportedChains: [43114],
  factoryAddress: "0xefa94DE7a4656D78",
  description: "Community DEX on Avalanche",
  documentation: "https://docs.pangolin.finance/",
  status: "stable",
  priority: 2,
};

export const alienBaseProvider: DexProviderConfig = {
  id: "alien-base",
  name: "Alien Base",
  category: "dex",
  ammType: "constant-product",
  version: "V2",
  supportedChains: [8453],
  factoryAddress: "0x827922",
  description: "Composable AMM on Base",
  documentation: "https://docs.alienbase.xyz/",
  status: "beta",
  priority: 2,
};

export const baseSwapProvider: DexProviderConfig = {
  id: "baseswap",
  name: "BaseSwap",
  category: "dex",
  ammType: "constant-product",
  version: "V2",
  supportedChains: [8453],
  factoryAddress: "0x38",
  description: "Original DEX on Base",
  documentation: "https://docs.baseswap.org/",
  status: "stable",
  priority: 2,
};

export const ramsesProvider: DexProviderConfig = {
  id: "ramses",
  name: "Ramses",
  category: "dex",
  ammType: "concentrated-liquidity",
  version: "V2",
  supportedChains: [42161],
  factoryAddress: "0x2d4e87399C2",
  description: "Native DEX on Arbitrum",
  documentation: "https://docs.ramses.exchange/",
  status: "stable",
  priority: 2,
};

export const shadowExchangeProvider: DexProviderConfig = {
  id: "shadow-exchange",
  name: "Shadow Exchange",
  category: "dex",
  ammType: "concentrated-liquidity",
  version: "V1",
  supportedChains: [146],
  factoryAddress: "0x",
  description: "Native DEX on Sonic",
  documentation: "https://docs.shadow.exchange/",
  status: "planning",
  priority: 2,
};

// ════════════════════════════════════════════════════════════════
// PRIORITY 3
// ════════════════════════════════════════════════════════════════

export const biswapProvider: DexProviderConfig = {
  id: "biswap",
  name: "Biswap",
  category: "dex",
  ammType: "constant-product",
  version: "V2",
  supportedChains: [56],
  factoryAddress: "0x858E3312ed3A876947EA49",
  description: "Multi-type referral DEX",
  documentation: "https://docs.biswap.org/",
  status: "stable",
  priority: 3,
};

export const bexProvider: DexProviderConfig = {
  id: "bex",
  name: "BEX",
  category: "dex",
  ammType: "constant-product",
  version: "V2",
  supportedChains: [81457],
  factoryAddress: "0x",
  description: "Native DEX on Blast",
  documentation: "https://docs.bex.fi/",
  status: "beta",
  priority: 3,
};

export const kodiakProvider: DexProviderConfig = {
  id: "kodiak",
  name: "Kodiak Finance",
  category: "dex",
  ammType: "concentrated-liquidity",
  version: "V3",
  supportedChains: [81457],
  factoryAddress: "0x",
  description: "Multi-amm DEX on Blast",
  documentation: "https://docs.kodiak.finance/",
  status: "beta",
  priority: 3,
};

export const honeypotFinanceProvider: DexProviderConfig = {
  id: "honeypot-finance",
  name: "Honeypot Finance",
  category: "dex",
  ammType: "constant-product",
  version: "V2",
  supportedChains: [81457],
  factoryAddress: "0x",
  description: "Community DEX on Blast",
  documentation: "https://docs.honeypot.finance/",
  status: "not-implemented",
  notes: "Verifikasi alamat kontrak diperlukan",
  priority: 3,
};

export const kyoFinanceProvider: DexProviderConfig = {
  id: "kyo-finance",
  name: "Kyo Finance",
  category: "dex",
  ammType: "concentrated-liquidity",
  version: "V3",
  supportedChains: [34443],
  factoryAddress: "0x",
  description: "Multi-chain DEX on Mode",
  documentation: "https://docs.kyo.finance/",
  status: "planning",
  priority: 3,
};

// ════════════════════════════════════════════════════════════════
// EXPORT LIST
// ════════════════════════════════════════════════════════════════

export const dexProviders: DexProviderConfig[] = [
  uniswapV3Provider,
  uniswapV4Provider,
  aerodromeProvider,
  velodromeProvider,
  camelotV3Provider,
  quickSwapV3Provider,
  traderJoeV2Provider,
  thenaV3Provider,
  sushiSwapV2Provider,
  balancerV2Provider,
  curveProvider,
  maverickProvider,
  pangolinProvider,
  alienBaseProvider,
  baseSwapProvider,
  ramsesProvider,
  shadowExchangeProvider,
  biswapProvider,
  bexProvider,
  kodiakProvider,
  honeypotFinanceProvider,
  kyoFinanceProvider,
];
