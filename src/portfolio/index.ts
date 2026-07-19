import { Position } from "@/protocols";
import {
  getTokenPrices,
  priceMapKey,
  getChainIdByName,
  type TokenPriceRequest,
} from "@/pricing";

function toNumber(value: string | number | bigint | undefined): number {
  if (value === undefined || value === null) return 0;
  const num =
    typeof value === "bigint" ? Number(value) : parseFloat(String(value));
  return isNaN(num) ? 0 : num;
}

/**
 * Enrich positions with USD prices from the Pricing Engine.
 *
 * Prices are resolved by (chainId, token address) with priority fallback:
 *   DEX Aggregators (DexScreener → GeckoTerminal → DEXTools)
 *   then Market Aggregators (CoinGecko → CoinMarketCap)
 *
 * Amount math is NOT modified — only valuation uses new pricing.
 */
export async function enrichPortfolio(
  positions: Position[]
): Promise<Position[]> {
  // Collect unique tokens by chain + address
  const requests: TokenPriceRequest[] = [];
  const seen = new Set<string>();

  for (const position of positions) {
    const chainId = getChainIdByName(position.chain);

    for (const address of [position.token0, position.token1]) {
      if (!address) continue;
      const key = priceMapKey(chainId, address);
      if (seen.has(key)) continue;
      seen.add(key);

      requests.push({
        address,
        chainId,
        chainName: position.chain,
      });
    }
  }

  const priceResults = await getTokenPrices(requests);

  const enrichedPositions: Position[] = [];

  for (const position of positions) {
    const chainId = getChainIdByName(position.chain);

    const token0Result = position.token0
      ? priceResults.get(priceMapKey(chainId, position.token0))
      : undefined;
    const token1Result = position.token1
      ? priceResults.get(priceMapKey(chainId, position.token1))
      : undefined;

    const token0Price = token0Result?.priceUsd ?? null;
    const token1Price = token1Result?.priceUsd ?? null;

    if (token0Result) {
      console.log(
        `[Portfolio] token0 ${position.token0} (${position.token0Symbol ?? "?"}) ` +
          `price=${token0Price} source=${token0Result.source} ` +
          `attempted=[${token0Result.attempted.join(", ")}]`
      );
    }
    if (token1Result) {
      console.log(
        `[Portfolio] token1 ${position.token1} (${position.token1Symbol ?? "?"}) ` +
          `price=${token1Price} source=${token1Result.source} ` +
          `attempted=[${token1Result.attempted.join(", ")}]`
      );
    }

    const token0Decimals = position.token0Decimals ?? 18;
    const token1Decimals = position.token1Decimals ?? 18;

    // amount* are raw on-chain units — convert once for valuation
    const amount0 = toNumber(position.amount0) / Math.pow(10, token0Decimals);
    const amount1 = toNumber(position.amount1) / Math.pow(10, token1Decimals);

    const token0ValueUsd = token0Price !== null ? amount0 * token0Price : 0;
    const token1ValueUsd = token1Price !== null ? amount1 * token1Price : 0;

    enrichedPositions.push({
      ...position,
      token0PriceUsd: token0Price ?? undefined,
      token1PriceUsd: token1Price ?? undefined,
      valueUsd: token0ValueUsd + token1ValueUsd,
      inRange: position.inRange ?? false,
    });
  }

  return enrichedPositions;
}

export function getPortfolioSummary(positions: Position[]) {
  return {
    totalValue: positions.reduce((sum, p) => sum + (p.valueUsd || 0), 0),
    totalUnclaimedFees: positions.reduce((sum, p) => {
      const token0Decimals = p.token0Decimals ?? 18;
      const token1Decimals = p.token1Decimals ?? 18;
      const tokensOwed0 =
        toNumber(p.tokensOwed0) / Math.pow(10, token0Decimals);
      const tokensOwed1 =
        toNumber(p.tokensOwed1) / Math.pow(10, token1Decimals);
      return (
        sum +
        tokensOwed0 * (p.token0PriceUsd || 0) +
        tokensOwed1 * (p.token1PriceUsd || 0)
      );
    }, 0),
    totalPositions: positions.length,
    totalChains: new Set(positions.map((p) => p.chain)).size,
    totalProtocols: new Set(positions.map((p) => p.protocol)).size,
  };
}
