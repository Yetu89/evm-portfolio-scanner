"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";

// ── Types ──────────────────────────────────────────────────────────

interface FungibleAsset {
  type: "native-coin" | "token";
  chainId: number;
  chainName: string;
  symbol?: string;
  address?: string;
  balance?: string;
  decimals?: number;
  priceUsd?: number | null;
  valueUsd: number;
}

// ── Helpers ────────────────────────────────────────────────────────

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  if (value === 0) return "$0.00";
  if (value < 0.01) return "<$0.01";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: string, decimals?: number): string {
  if (!value || value === "0") return "0";
  const num = parseFloat(value);
  if (isNaN(num)) return "0";
  const divisor = Math.pow(10, decimals || 18);
  const formatted = num / divisor;
  if (formatted < 0.0001) return "<0.0001";
  return formatted.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

// ── Tokens Page ────────────────────────────────────────────────────

export default function TokensPage() {
  const params = useParams();
  const router = useRouter();
  const address = params.address as string;

  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<FungibleAsset[]>([]);

  useEffect(() => {
    if (!address) return;

    async function fetchTokens() {
      setLoading(true);
      try {
        const res = await fetch(`/api/wallet/${encodeURIComponent(address)}`);
        if (!res.ok) return;
        const data = await res.json();
        // Filter only fungible assets — native coins + tokens, no LP positions
        const fungible = (data.assets || []).filter(
          (a: any) => a.type === "native-coin" || a.type === "token"
        );
        setTokens(fungible);
      } catch {
        setTokens([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTokens();
  }, [address]);

  const totalValue = tokens.reduce((sum, t) => sum + (t.valueUsd || 0), 0);

  return (
    <DashboardShell wallet={address}>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tokens</h1>
          <p className="mt-1 text-sm text-zinc-500 font-mono">{address}</p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/wallet/${address}`)}
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-400 hover:border-zinc-600 hover:text-white transition-colors"
        >
          ← Back to Portfolio
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
          <span className="text-zinc-300 text-sm">Loading tokens…</span>
        </div>
      )}

      {/* Summary */}
      {!loading && (
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-4 flex items-center justify-between">
          <span className="text-zinc-400 text-sm">
            {tokens.length} fungible asset{tokens.length !== 1 ? "s" : ""}
          </span>
          <span className="text-emerald-400 font-semibold text-sm">
            Total: {formatCurrency(totalValue)}
          </span>
        </div>
      )}

      {/* Tokens Table */}
      {!loading && tokens.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/50">
                  <th className="py-4 pr-4 pl-6 text-zinc-400 font-medium text-xs uppercase tracking-wider">Type</th>
                  <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Chain</th>
                  <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Token</th>
                  <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Balance</th>
                  <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Price</th>
                  <th className="py-4 pr-6 text-zinc-400 font-medium text-xs uppercase tracking-wider">Value (USD)</th>
                </tr>
              </thead>
              <tbody>
                {tokens
                  .sort((a, b) => Math.abs(b.valueUsd) - Math.abs(a.valueUsd))
                  .map((asset, i) => {
                    const key = `${asset.type}-${asset.chainId}-${asset.symbol}-${asset.address || ""}-${i}`;
                    return (
                      <tr
                        key={key}
                        className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="py-4 pr-4 pl-6">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            asset.type === "native-coin"
                              ? "border-emerald-800/30 text-emerald-400 bg-emerald-900/10"
                              : "border-blue-800/30 text-blue-400 bg-blue-900/10"
                          }`}>
                            {asset.type === "native-coin" ? "Native" : "Token"}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span className="text-zinc-300">{asset.chainName}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="text-zinc-300 font-medium">{asset.symbol}</div>
                          {asset.type === "token" && asset.address && (
                            <div className="text-xs text-zinc-500 font-mono">
                              {asset.address.slice(0, 6)}…{asset.address.slice(-4)}
                            </div>
                          )}
                        </td>
                        <td className="py-4 pr-4 font-mono text-zinc-300">
                          {formatNumber(
                            (asset.balance || "0").toString(),
                            asset.decimals
                          )}
                        </td>
                        <td className="py-4 pr-4 text-zinc-400">
                          {asset.priceUsd ? formatCurrency(asset.priceUsd) : "-"}
                        </td>
                        <td className="py-4 pr-6 font-semibold text-emerald-400">
                          {formatCurrency(asset.valueUsd)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && tokens.length === 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-12 text-center">
          <div className="text-4xl mb-4">🪙</div>
          <div className="text-zinc-400 text-lg font-medium">No fungible assets found.</div>
          <div className="text-zinc-600 text-sm mt-2">
            This wallet may not hold any meaningful tokens on supported chains.
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
