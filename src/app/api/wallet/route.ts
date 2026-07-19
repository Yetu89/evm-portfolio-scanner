import { NextRequest, NextResponse } from "next/server";
import { scanWalletsAcrossChains } from "@/scanner";

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

function parseWallets(raw: string): string[] {
  return raw
    .split(/[,\n\r\s]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
}

function validateWallets(wallets: string[]): { valid: string[]; invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const w of wallets) {
    if (ADDRESS_RE.test(w)) {
      valid.push(w);
    } else {
      invalid.push(w);
    }
  }

  return { valid, invalid };
}

export async function GET(request: NextRequest) {
  const walletParam = request.nextUrl.searchParams.get("wallet");

  if (!walletParam) {
    return NextResponse.json(
      { error: "wallet is required" },
      { status: 400 }
    );
  }

  const wallets = parseWallets(walletParam);

  if (wallets.length === 0) {
    return NextResponse.json(
      { error: "no valid wallet addresses provided" },
      { status: 400 }
    );
  }

  const { valid, invalid } = validateWallets(wallets);

  if (valid.length === 0) {
    return NextResponse.json(
      { error: "all wallet addresses are invalid", invalid },
      { status: 400 }
    );
  }

  const positions = await scanWalletsAcrossChains(valid);

  return NextResponse.json({
    wallets: valid,
    positions,
    ...(invalid.length > 0 ? { invalidAddresses: invalid } : {}),
  });
}
