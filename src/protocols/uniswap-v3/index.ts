import { Address } from "viem";
import { Position, Protocol } from "@/protocols";
import { ChainConfig, ProtocolConfig } from "@/chains/config";
import { getOwnedTokenIds } from "@/scanner/erc721";
import { enrichV3Position } from "@/portfolio/enrich";

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

    const positions: Position[] = [];
    for (const tokenId of tokenIds) {
      try {
        const portfolioData = await enrichV3Position(
          chainConfig.rpcUrl,
          protocolConfig.positionManager as Address,
          tokenId
        );

        positions.push({
          wallet,
          chain: chainConfig.name,
          tokenId,
          protocol: protocolConfig.name,
          ...portfolioData,
        });
      } catch (error) {
        console.error(
          `Failed to enrich position ${tokenId} on ${chainConfig.name}:`,
          error
        );
        positions.push({
          wallet,
          chain: chainConfig.name,
          tokenId,
          protocol: protocolConfig.name,
          pool: "",
          token0: "",
          token1: "",
          fee: 0,
          tickLower: 0,
          tickUpper: 0,
          liquidity: "0",
          tokensOwed0: "0",
          tokensOwed1: "0",
          amount0: "0",
          amount1: "0",
        });
      }
    }

    return positions;
  },
};
