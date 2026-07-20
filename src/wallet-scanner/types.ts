// Wallet Portfolio Scanner Types — Phase 1

export interface NativeCoinAsset {
  type: "native-coin";
  chainId: number;
  chainName: string;
  symbol: string;
  decimals: number;
  balance: bigint;
  priceUsd: number | null;
  valueUsd: number;
}

export interface TokenAsset {
  type: "token";
  chainId: number;
  chainName: string;
  address: string;
  symbol: string;
  decimals: number;
  balance: bigint;
  priceUsd: number | null;
  valueUsd: number;
}

export interface LpPositionAsset {
  type: "lp-position";
  chainId: number;
  chainName: string;
  protocol: string;
  pool: string;
  token0: string;
  token1: string;
  token0Symbol: string;
  token1Symbol: string;
  token0Decimals: number;
  token1Decimals: number;
  fee: number;
  tokenId: string;
  liquidity: string;
  amount0: string;
  amount1: string;
  token0PriceUsd: number | null;
  token1PriceUsd: number | null;
  valueUsd: number;
  inRange: boolean;
}

export type WalletAsset = NativeCoinAsset | TokenAsset | LpPositionAsset;

export interface WalletPortfolio {
  wallet: string;
  chainCount: number;
  nativeCoinCount: number;
  tokenCount: number;
  lpPositionCount: number;
  totalAssets: number;
  totalValueUsd: number;
  assets: WalletAsset[];
  chainBreakdown: Array<{
    chainId: number;
    chainName: string;
    totalValueUsd: number;
    assetCount: number;
  }>;
}
