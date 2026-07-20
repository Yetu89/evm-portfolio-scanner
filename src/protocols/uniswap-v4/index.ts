import { Address } from "viem";
import { Position, Protocol } from "@/protocols";
import { ChainConfig, ProtocolConfig } from "@/chains/config";
import { getOwnedTokenIds } from "@/scanner/erc721";
import { enrichV4Position } from "@/portfolio/enrich-v4";

export const UniswapV4: Protocol = {
  id: "uniswap-v4",
  name: "Uniswap V4",
  type: "v4",

  async scan(
    wallet,
    chainConfig: ChainConfig,
    protocolConfig: ProtocolConfig
  ): Promise<Position[]> {
    console.log(`[V4-SCAN] Starting scan for wallet=${wallet} on ${chainConfig.name}, manager=${protocolConfig.positionManager}`);

    const tokenIds = await getOwnedTokenIds(
      chainConfig.rpcUrl,
      protocolConfig.positionManager as Address,
      wallet,
      chainConfig.blockscoutUrl
    );

    console.log(`[V4-SCAN] Found ${tokenIds.length} V4 token IDs: ${tokenIds.join(', ')}`);

    const positions: Position[] = [];
    for (const tokenId of tokenIds) {
      try {
        const portfolioData = await enrichV4Position(
          chainConfig.rpcUrl,
          protocolConfig.positionManager as Address,
          tokenId,
          protocolConfig.stateView as Address | undefined
        );

        // Skip inactive positions (enrichV4Position returns null if liquidity=0)
        if (!portfolioData) {
          console.log(`[V4-SCAN] Position ${tokenId} skipped (inactive/empty)`);
          continue;
        }

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

    console.log(`[V4-SCAN] Result: ${positions.length} active positions`);
    return positions;
  },
};
