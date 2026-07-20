import { NextRequest, NextResponse } from "next/server";
import { scanWalletsAcrossChains } from "@/scanner";
import { scanWalletPortfolio } from "@/wallet-scanner";
import { enrichPortfolio, getPortfolioSummary } from "@/portfolio";
import type { WalletAsset } from "@/wallet-scanner";

/**
 * Recursively convert all BigInt values to strings for JSON serialization.
 * This ensures any BigInt in the response (native coin balances, token balances, etc.)
 * is safely serializable.
 */
function serializeBigInts(obj: unknown): unknown {
  if (typeof obj === "bigint") {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInts);
  }
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, serializeBigInts(value)])
    );
  }
  return obj;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  if (!address) {
    return NextResponse.json({ error: "address is required" }, { status: 400 });
  }

  const wallet = address.trim();
  if (!wallet.startsWith("0x") || wallet.length !== 42) {
    return NextResponse.json({ error: "invalid wallet address" }, { status: 400 });
  }

  try {
    // 1. Scan wallet portfolio (native coins + tokens)
    const portfolio = await scanWalletPortfolio(wallet);

    // 2. Scan LP positions (existing scanner)
    const lpPositions = await scanWalletsAcrossChains([wallet]);
    const enrichedLpPositions = await enrichPortfolio(lpPositions);
    const lpSummary = getPortfolioSummary(enrichedLpPositions);

    // 3. Merge LP assets into portfolio
    const lpAssets: WalletAsset[] = enrichedLpPositions
      .filter((p) => p.liquidity !== "0")
      .map((p) => ({
        type: "lp-position" as const,
        chainId: 0,
        chainName: p.chain,
        protocol: p.protocol,
        pool: p.pool,
        token0: p.token0,
        token1: p.token1,
        token0Symbol: p.token0Symbol || "",
        token1Symbol: p.token1Symbol || "",
        token0Decimals: p.token0Decimals || 18,
        token1Decimals: p.token1Decimals || 18,
        fee: p.fee,
        tokenId: p.tokenId,
        liquidity: p.liquidity,
        amount0: p.amount0,
        amount1: p.amount1,
        token0PriceUsd: p.token0PriceUsd ?? null,
        token1PriceUsd: p.token1PriceUsd ?? null,
        valueUsd: p.valueUsd || 0,
        inRange: p.inRange ?? false,
      }));

    portfolio.assets.push(...lpAssets);
    portfolio.lpPositionCount = lpAssets.length;
    portfolio.totalAssets += lpAssets.length;
    portfolio.totalValueUsd += lpSummary.totalValue || 0;

    for (const lp of lpAssets) {
      const existing = portfolio.chainBreakdown.find((c) => c.chainName === lp.chainName);
      if (existing) {
        existing.totalValueUsd += lp.valueUsd || 0;
        existing.assetCount += 1;
      } else {
        portfolio.chainBreakdown.push({
          chainId: lp.chainId,
          chainName: lp.chainName,
          totalValueUsd: lp.valueUsd || 0,
          assetCount: 1,
        });
      }
    }

    return NextResponse.json(serializeBigInts(portfolio));
  } catch (error) {
    console.error(`[API] Wallet scan failed for ${wallet}:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scan failed" },
      { status: 500 }
    );
  }
}
