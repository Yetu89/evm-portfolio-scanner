import { Address } from "viem";

export interface ProtocolConfig {
  id: string;
  name: string;
  type: "v3" | "v4";
  positionManager: Address;
}

export interface ChainConfig {
  chainId: number;
  name: string;
  shortName: string;
  rpcUrl: string;
  blockscoutUrl?: string;
  protocols: ProtocolConfig[];
}

export const chains: ChainConfig[] = [
  // ── Ethereum ──────────────────────────────────────────────
  {
    chainId: 1,
    name: "Ethereum",
    shortName: "eth",
    rpcUrl: "https://ethereum-rpc.publicnode.com",
    protocols: [
      {
        id: "uniswap-v3",
        name: "Uniswap V3",
        type: "v3",
        positionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
      },
      {
        id: "sushiswap-v3",
        name: "SushiSwap V3",
        type: "v3",
        positionManager: "0xe11252176CEDd4a493Aec9767192C06A04A6B04F",
      },
    ],
  },

  // ── Base ──────────────────────────────────────────────────
  {
    chainId: 8453,
    name: "Base",
    shortName: "base",
    rpcUrl: "https://mainnet.base.org",
    protocols: [
      {
        id: "uniswap-v3",
        name: "Uniswap V3",
        type: "v3",
        positionManager: "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1",
      },
      {
        id: "aerodrome",
        name: "Aerodrome",
        type: "v3",
        positionManager: "0x827922686190790b37229fd060973282D2aEAad1",
      },
    ],
  },

  // ── Arbitrum ──────────────────────────────────────────────
  {
    chainId: 42161,
    name: "Arbitrum",
    shortName: "arb",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    protocols: [
      {
        id: "uniswap-v3",
        name: "Uniswap V3",
        type: "v3",
        positionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
      },
      {
        id: "sushiswap-v3",
        name: "SushiSwap V3",
        type: "v3",
        positionManager: "0xe11252176CEDd4a493Aec9767192C06A04A6B04F",
      },
      {
        id: "camelot-v3",
        name: "Camelot V3",
        type: "v3",
        positionManager: "0xC7Dd547B547d90a1E1a7e4D5e7e8aB4F1F6F6F6F",
      },
      {
        id: "pancakeswap-v3",
        name: "PancakeSwap V3",
        type: "v3",
        positionManager: "0x0934d31b1182a40557b3d39DE2881e9b7b6d5c7e",
      },
    ],
  },

  // ── Optimism ──────────────────────────────────────────────
  {
    chainId: 10,
    name: "Optimism",
    shortName: "op",
    rpcUrl: "https://mainnet.optimism.io",
    protocols: [
      {
        id: "uniswap-v3",
        name: "Uniswap V3",
        type: "v3",
        positionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
      },
      {
        id: "velodrome",
        name: "Velodrome",
        type: "v3",
        positionManager: "0x827922686190790b37229fd060973282D2aEAad1",
      },
    ],
  },

  // ── Polygon ───────────────────────────────────────────────
  {
    chainId: 137,
    name: "Polygon",
    shortName: "polygon",
    rpcUrl: "https://polygon-bor-rpc.publicnode.com",
    protocols: [
      {
        id: "uniswap-v3",
        name: "Uniswap V3",
        type: "v3",
        positionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
      },
      {
        id: "quickswap-v3",
        name: "QuickSwap V3",
        type: "v3",
        positionManager: "0x8eF88e4c7C2baDB30887e82BB2a1825D1fA23fC5",
      },
      {
        id: "sushiswap-v3",
        name: "SushiSwap V3",
        type: "v3",
        positionManager: "0xe11252176CEDd4a493Aec9767192C06A04A6B04F",
      },
    ],
  },

  // ── BNB Chain ─────────────────────────────────────────────
  {
    chainId: 56,
    name: "BNB Chain",
    shortName: "bnb",
    rpcUrl: "https://bsc-dataseed1.binance.org",
    protocols: [
      {
        id: "pancakeswap-v3",
        name: "PancakeSwap V3",
        type: "v3",
        positionManager: "0x1b81D678ffb9C0263b24A97847620C99d213eB19",
      },
      {
        id: "sushiswap-v3",
        name: "SushiSwap V3",
        type: "v3",
        positionManager: "0xe11252176CEDd4a493Aec9767192C06A04A6B04F",
      },
      {
        id: "thena-v3",
        name: "THENA V3",
        type: "v3",
        positionManager: "0x51d682a3f0c2B3EDA1e9D4D5a3f0AfBf0fDb3DCA",
      },
    ],
  },

  // ── Avalanche ─────────────────────────────────────────────
  {
    chainId: 43114,
    name: "Avalanche",
    shortName: "avax",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    protocols: [
      {
        id: "uniswap-v3",
        name: "Uniswap V3",
        type: "v3",
        positionManager: "0x655C406EBFa14EE2006250925e54ec43AD184f8B",
      },
    ],
  },

  // ── Linea ─────────────────────────────────────────────────
  {
    chainId: 59144,
    name: "Linea",
    shortName: "linea",
    rpcUrl: "https://rpc.linea.build",
    protocols: [
      {
        id: "uniswap-v3",
        name: "Uniswap V3",
        type: "v3",
        positionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
      },
      {
        id: "pancakeswap-v3",
        name: "PancakeSwap V3",
        type: "v3",
        positionManager: "0x46A15B0b27311cedF172AB29E4f4766fbE7F4364",
      },
    ],
  },

  // ── Scroll ────────────────────────────────────────────────
  {
    chainId: 534352,
    name: "Scroll",
    shortName: "scroll",
    rpcUrl: "https://rpc.scroll.io",
    protocols: [
      {
        id: "uniswap-v3",
        name: "Uniswap V3",
        type: "v3",
        positionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
      },
    ],
  },

  // ── Mantle ────────────────────────────────────────────────
  {
    chainId: 5000,
    name: "Mantle",
    shortName: "mantle",
    rpcUrl: "https://rpc.mantle.xyz",
    protocols: [
      {
        id: "uniswap-v3",
        name: "Uniswap V3",
        type: "v3",
        positionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
      },
    ],
  },

  // ── Sonic ─────────────────────────────────────────────────
  {
    chainId: 146,
    name: "Sonic",
    shortName: "sonic",
    rpcUrl: "https://rpc.soniclabs.com",
    protocols: [
      {
        id: "uniswap-v3",
        name: "Uniswap V3",
        type: "v3",
        positionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
      },
    ],
  },

  // ── Soneium ───────────────────────────────────────────────
  {
    chainId: 1868,
    name: "Soneium",
    shortName: "soneium",
    rpcUrl: "https://rpc.soneium.org",
    protocols: [
      {
        id: "uniswap-v3",
        name: "Uniswap V3",
        type: "v3",
        positionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
      },
    ],
  },

  // ── Somnia ────────────────────────────────────────────────
  {
    chainId: 5031,
    name: "Somnia",
    shortName: "somnia",
    rpcUrl: "https://api.infra.mainnet.somnia.network",
    protocols: [],
  },

  // ── zkSync Era ────────────────────────────────────────────
  {
    chainId: 324,
    name: "zkSync Era",
    shortName: "zksync",
    rpcUrl: "https://mainnet.era.zksync.io",
    protocols: [
      {
        id: "uniswap-v3",
        name: "Uniswap V3",
        type: "v3",
        positionManager: "0x061624B6aBD5c7A4e877F288aFA5A0927c3e8888",
      },
    ],
  },

  // ── Blast ─────────────────────────────────────────────────
  {
    chainId: 81457,
    name: "Blast",
    shortName: "blast",
    rpcUrl: "https://rpc.blast.io",
    protocols: [
      {
        id: "uniswap-v3",
        name: "Uniswap V3",
        type: "v3",
        positionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
      },
    ],
  },

  // ── Mode ──────────────────────────────────────────────────
  {
    chainId: 34443,
    name: "Mode",
    shortName: "mode",
    rpcUrl: "https://mainnet.mode.network",
    protocols: [
      {
        id: "uniswap-v3",
        name: "Uniswap V3",
        type: "v3",
        positionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
      },
    ],
  },

  // ── Berachain ─────────────────────────────────────────────
  {
    chainId: 80094,
    name: "Berachain",
    shortName: "bera",
    rpcUrl: "https://rpc.berachain.com",
    protocols: [
      {
        id: "uniswap-v3",
        name: "Uniswap V3",
        type: "v3",
        positionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
      },
    ],
  },

  // ── Unichain ──────────────────────────────────────────────
  {
    chainId: 130,
    name: "Unichain",
    shortName: "unichain",
    rpcUrl: "https://mainnet.unichain.org",
    protocols: [
      {
        id: "uniswap-v3",
        name: "Uniswap V3",
        type: "v3",
        positionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
      },
    ],
  },

  // ── Ink ───────────────────────────────────────────────────
  {
    chainId: 57073,
    name: "Ink",
    shortName: "ink",
    rpcUrl: "https://rpc-gel.inkonchain.com",
    protocols: [
      {
        id: "uniswap-v3",
        name: "Uniswap V3",
        type: "v3",
        positionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
      },
    ],
  },

  // ── Robinhood ─────────────────────────────────────────────
  {
    chainId: 4663,
    name: "Robinhood",
    shortName: "rhood",
    rpcUrl: "https://rpc.mainnet.chain.robinhood.com",
    blockscoutUrl: "https://robinhoodchain.blockscout.com",
    protocols: [
      {
        id: "uniswap-v3",
        name: "Uniswap V3",
        type: "v3",
        positionManager: "0x73991a25c818bf1f1128deaab1492d45638de0d3",
      },
      {
        id: "uniswap-v4",
        name: "Uniswap V4",
        type: "v4",
        positionManager: "0x58daec3116aae6d93017baaea7749052e8a04fa7",
      },
    ],
  },
];
