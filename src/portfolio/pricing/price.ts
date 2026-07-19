/**
 * @deprecated Legacy pricing path.
 * All valuation now goes through `@/pricing` (Pricing Engine).
 * This wrapper remains only for backward compatibility and will be removed later.
 */
import { getTokenPrice } from "@/pricing";

/**
 * @deprecated Use `getTokenPrice({ address, chainId })` from `@/pricing` instead.
 * Symbol-only lookup is intentionally weak — prefer address + chain.
 */
export async function getTokenPriceUsd(symbol: string): Promise<number | null> {
  console.warn(
    `[DEPRECATED] getTokenPriceUsd(symbol="${symbol}") called. ` +
      `Use Pricing Engine getTokenPrice({ address, chainId }) instead.`
  );

  // Last-resort: DexScreener search by symbol (no address available in this legacy API)
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(symbol)}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      pairs?: Array<{ priceUsd?: string; liquidity?: { usd?: number } }>;
    };
    const pairs = (data.pairs ?? []).sort(
      (a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0)
    );
    const price = parseFloat(pairs[0]?.priceUsd || "0");
    return Number.isFinite(price) && price > 0 ? price : null;
  } catch {
    return null;
  }
}
