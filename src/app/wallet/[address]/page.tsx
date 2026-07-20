"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { setActiveWallet } from "@/components/active-wallet";

// ── Types ──────────────────────────────────────────────────────────

interface WalletAsset {
  type: "native-coin" | "token" | "lp-position";
  chainId: number;
  chainName: string;
  symbol?: string;
  address?: string;
  balance?: string;
  decimals?: number;
  protocol?: string;
  pool?: string;
  token0?: string;
  token1?: string;
  token0Symbol?: string;
  token1Symbol?: string;
  token0Decimals?: number;
  token1Decimals?: number;
  fee?: number;
  tokenId?: string;
  liquidity?: string;
  amount0?: string;
  amount1?: string;
  token0PriceUsd?: number | null;
  token1PriceUsd?: number | null;
  priceUsd?: number | null;
  inRange?: boolean;
  valueUsd: number;
}

interface ChainBreakdown {
  chainId: number;
  chainName: string;
  totalValueUsd: number;
  assetCount: number;
}

interface WalletPortfolio {
  wallet: string;
  chainCount: number;
  nativeCoinCount: number;
  tokenCount: number;
  lpPositionCount: number;
  totalAssets: number;
  totalValueUsd: number;
  assets: WalletAsset[];
  chainBreakdown: ChainBreakdown[];
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

// ── Summary Card ───────────────────────────────────────────────────

function SummaryCard({
  title,
  value,
  icon,
  color,
  onClick,
}: {
  title: string;
  value: string;
  icon: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 p-6 ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div
        className={`absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-10 blur-xl group-hover:opacity-20 transition-opacity`}
        style={{ backgroundColor: color }}
      />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">{icon}</span>
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">{title}</span>
        </div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
      </div>
    </div>
  );
}

// ── Wallet Portfolio Page ──────────────────────────────────────────

export default function WalletPortfolioPage() {
  const params = useParams();
  const router = useRouter();
  const address = params.address as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<WalletPortfolio | null>(null);

  useEffect(() => {
    if (!address) return;

    async function fetchPortfolio() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/wallet/${encodeURIComponent(address)}`);
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || `HTTP ${res.status}`);
        }
        const data: WalletPortfolio = await res.json();
        setPortfolio(data);
        setActiveWallet(address);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Scan failed");
      } finally {
        setLoading(false);
      }
    }

    fetchPortfolio();
  }, [address]);

  // ── Render ───────────────────────────────────────────────────────

  return (
    <DashboardShell wallet={address}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Wallet Portfolio</h1>
          <p className="mt-1 text-sm text-zinc-500 font-mono">{address}</p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-400 hover:border-zinc-600 hover:text-white transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* ── Loading ─────────────────────────────────────────────── */}
      {loading && (
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
          <span className="text-zinc-300 text-sm">
            Scanning wallet across all supported chains…
          </span>
        </div>
      )}

      {/* ── Error ───────────────────────────────────────────────── */}
      {error && !loading && (
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-red-900/30 to-transparent border border-red-800/50 p-6">
          <h2 className="text-xl font-semibold mb-2 text-red-400">Error</h2>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────── */}
      {portfolio && (
        <>
          {/* Summary Cards */}
          <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard
              title="Total Value"
              value={formatCurrency(portfolio.totalValueUsd)}
              icon="💰"
              color="#10b981"
            />
            <SummaryCard
              title="Assets"
              value={portfolio.totalAssets.toString()}
              icon="🧩"
              color="#3b82f6"
              onClick={() => router.push(`/wallet/${address}/tokens`)}
            />
            <SummaryCard
              title="Chains"
              value={portfolio.chainCount.toString()}
              icon="🌐"
              color="#8b5cf6"
            />
            <SummaryCard
              title="LP Positions"
              value={portfolio.lpPositionCount.toString()}
              icon="📈"
              color="#f59e0b"
              onClick={() => router.push(`/wallet/${address}/positions`)}
            />
          </div>

          {/* Chain Breakdown */}
          <div className="mb-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {portfolio.chainBreakdown.map((chain) => (
              <div
                key={chain.chainId}
                className="rounded-xl bg-zinc-900 p-4 border border-zinc-800"
              >
                <div className="text-zinc-400 text-xs uppercase tracking-wider mb-1">
                  {chain.chainName}
                </div>
                <div className="text-lg font-bold text-white">
                  {formatCurrency(chain.totalValueUsd)}
                </div>
                <div className="text-xs text-zinc-500">
                  {chain.assetCount} asset{chain.assetCount > 1 ? "s" : ""}
                </div>
              </div>
            ))}
          </div>

          {/* Assets Table */}
          {portfolio.assets.length > 0 && (
            <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 overflow-hidden">
              <div className="p-6 border-b border-zinc-800">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  All Assets
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                  {portfolio.assets.length} asset{portfolio.assets.length > 1 ? "s" : ""} across{" "}
                  {portfolio.chainCount} chain{portfolio.chainCount > 1 ? "s" : ""}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-950/50">
                      <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Type</th>
                      <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Chain</th>
                      <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Asset</th>
                      <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Balance</th>
                      <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Value (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.assets
                      .sort((a, b) => Math.abs(b.valueUsd) - Math.abs(a.valueUsd))
                      .map((asset, i) => {
                        const key = `${asset.type}-${asset.chainId}-${asset.tokenId || asset.address || asset.symbol}-${i}`;
                        return (
                          <tr
                            key={key}
                            className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                          >
                            <td className="py-4 pr-4">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border"
                                style={{
                                  backgroundColor:
                                    asset.type === "native-coin"
                                      ? "rgba(16, 185, 129, 0.1)"
                                      : asset.type === "token"
                                        ? "rgba(59, 130, 246, 0.1)"
                                        : "rgba(139, 92, 246, 0.1)",
                                  borderColor:
                                    asset.type === "native-coin"
                                      ? "rgba(16, 185, 129, 0.3)"
                                      : asset.type === "token"
                                        ? "rgba(59, 130, 246, 0.3)"
                                        : "rgba(139, 92, 246, 0.3)",
                                  color:
                                    asset.type === "native-coin"
                                      ? "#34d399"
                                      : asset.type === "token"
                                        ? "#60a5fa"
                                        : "#a78bfa",
                                }}
                              >
                                {asset.type === "native-coin"
                                  ? "Native"
                                  : asset.type === "token"
                                    ? "Token"
                                    : "LP"}
                              </span>
                            </td>
                            <td className="py-4 pr-4">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                <span className="text-zinc-300">{asset.chainName}</span>
                              </div>
                            </td>
                            <td className="py-4 pr-4">
                              <div className="text-zinc-300">
                                {asset.type === "lp-position"
                                  ? `${asset.token0Symbol || "?"} / ${asset.token1Symbol || "?"}`
                                  : asset.symbol || "?"}
                              </div>
                              {asset.type === "lp-position" && (
                                <div className="text-xs text-zinc-500">
                                  {asset.protocol} • ID {asset.tokenId}
                                </div>
                              )}
                              {asset.type === "token" && asset.address && (
                                <div className="text-xs text-zinc-500 font-mono">
                                  {asset.address.slice(0, 6)}…{asset.address.slice(-4)}
                                </div>
                              )}
                            </td>
                            <td className="py-4 pr-4">
                              <div className="text-zinc-300">
                                {asset.type === "lp-position"
                                  ? `${formatNumber(asset.amount0 || "0", asset.token0Decimals)} ${asset.token0Symbol} / ${formatNumber(asset.amount1 || "0", asset.token1Decimals)} ${asset.token1Symbol}`
                                  : formatNumber(
                                      (asset.balance || "0").toString(),
                                      asset.decimals
                                    ) + " " + (asset.symbol || "")}
                              </div>
                              {asset.type === "lp-position" && asset.pool && (
                                <div className="text-xs text-zinc-500 font-mono">
                                  Pool: {asset.pool.slice(0, 6)}…{asset.pool.slice(-4)}
                                </div>
                              )}
                            </td>
                            <td className="py-4 pr-4 font-semibold text-emerald-400">
                              {formatCurrency(asset.valueUsd)}
                              {asset.type === "lp-position" && asset.inRange !== undefined && (
                                <div className={`text-xs font-medium ${asset.inRange ? "text-green-400" : "text-red-400"}`}>
                                  {asset.inRange ? "● In Range" : "● Out of Range"}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty state */}
          {portfolio.assets.length === 0 && (
            <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-12 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <div className="text-zinc-400 text-lg font-medium">No assets found.</div>
              <div className="text-zinc-600 text-sm mt-2 max-w-md mx-auto">
                This wallet may not have any meaningful assets on supported chains.
              </div>
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}
