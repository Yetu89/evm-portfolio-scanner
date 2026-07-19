import { Address } from "viem";
import { Protocol, Position } from "../";
import { ChainConfig, ProtocolConfig } from "@/chains/config";
import { getOwnedTokenIds } from "@/scanner/erc721";

export const UniswapV3: Protocol = {
  id: "uniswap-v3",
  name: "Uniswap V3",
  type: "v3",

  async scan(
    wallet,
    chainConfig: ChainConfig,
    protocolConfig: ProtocolConfig
  ): Promise<Position[]> {
    const tokenIds = await getOwnedTokenIds(
      chainConfig.rpcUrl,
      protocolConfig.positionManager as Address,
      wallet,
      chainConfig.blockscoutUrl
    );

    return tokenIds.map((tokenId) => ({
      wallet,
      chain: chainConfig.name,
      tokenId,
      protocol: protocolConfig.name,
    }));
  },
};
