import { ChainConfig, ProtocolConfig } from "@/chains/config";

export interface Position {
  wallet: string;
  chain: string;
  tokenId: string;
  protocol: string;
}

export interface Protocol {
  id: string;
  name: string;
  type: "v2" | "v3" | "v4";
  scan(
    wallet: `0x${string}`,
    chainConfig: ChainConfig,
    protocolConfig: ProtocolConfig
  ): Promise<Position[]>;
}

import { UniswapV3 } from "./uniswap-v3";
import { UniswapV4 } from "./uniswap-v4";
import { createGenericV3Adapter } from "./generic-v3";

export const protocols: Protocol[] = [
  UniswapV3,
  UniswapV4,

  // Uniswap V3 forks — same ABI, different contract addresses per chain
  createGenericV3Adapter("sushiswap-v3", "SushiSwap V3"),
  createGenericV3Adapter("pancakeswap-v3", "PancakeSwap V3"),
  createGenericV3Adapter("aerodrome", "Aerodrome"),
  createGenericV3Adapter("velodrome", "Velodrome"),
  createGenericV3Adapter("camelot-v3", "Camelot V3"),
  createGenericV3Adapter("quickswap-v3", "QuickSwap V3"),
  createGenericV3Adapter("thena-v3", "THENA V3"),
];
