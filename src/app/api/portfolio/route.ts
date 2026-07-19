import { NextRequest, NextResponse } from "next/server";
import { scanWalletsAcrossChains } from "@/scanner";
import { enrichPortfolio, getPortfolioSummary } from "@/portfolio";

export async function GET(request: NextRequest) {
  const walletParam = request.nextUrl.searchParams.get("wallet");

  if (!walletParam) {
    return NextResponse.json(
      { error: "wallet is required" },
      { status: 400 }
    );
  }

  const wallets = walletParam
    .split(/[,\n\r\s]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);

  if (wallets.length === 0) {
    return NextResponse.json(
      { error: "no valid wallet addresses provided" },
      { status: 400 }
    );
  }

  const positions = await scanWalletsAcrossChains(wallets);
  const enrichedPositions = await enrichPortfolio(positions);
  const summary = getPortfolioSummary(enrichedPositions);

  return NextResponse.json({
    wallets,
    positions: enrichedPositions,
    summary,
  });
}
