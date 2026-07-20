"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";

// ── Types ──────────────────────────────────────────────────────────

interface Position {
  wallet: string;
  chain: string;
  tokenId: string;
  protocol: string;
  pool: string;
  token0: string;
  token1: string;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: string;
  tokensOwed0: string;
  tokensOwed1: string;
  amount0: string;
  amount1: string;
  valueUsd?: number;
  inRange: boolean;
  currentTick?: number;
  token0Symbol?: string;
  token1Symbol?: string;
  token0Decimals?: number;
  token1Decimals?: number;
  token0PriceUsd?: number;
  token1PriceUsd?: number;
}

interface PortfolioSummary {
  totalValue: number | null;
  totalUnclaimedFees: number;
  totalPositions: number;
  totalChains: number;
  totalProtocols: number;
}

interface ScanResult {
  wallets: string[];
  positions: Position[];
  summary: PortfolioSummary;
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
  return formatted.toLocaleString("en-US", {
    maximumFractionDigits: 6,
  });
}

// ── Icon Components ────────────────────────────────────────────────

function TrendUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M12 7l-5 5 1.41 1.41L11 9.83V17h2V9.83l2.59 2.58L14 9.83L12 7z" clipRule="evenodd" />
    </svg>
  );
}

function SparklineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 8L5 4L9 7L13 2L17 6L21 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Summary Card Component ─────────────────────────────────────────

function SummaryCard({
  title,
  value,
  icon,
  trend,
  color,
}: {
  title: string;
  value: string;
  icon: string;
  trend?: "up" | "down";
  color: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 p-6">
      <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-10 blur-xl group-hover:opacity-20 transition-opacity`} style={{ backgroundColor: color }} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">{title}</span>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
              {trend === "up" ? <TrendUpIcon className="w-3 h-3" /> : null}
              <SparklineIcon className="w-6 h-3" />
            </div>
          )}
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
  const [result, setResult] = useState<ScanResult | null>(null);

  useEffect(() => {
    if (!address) return;

    async function fetchWallet() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/portfolio?wallet=${encodeURIComponent(address)}`);
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || `HTTP ${res.status}`);
        }
        const data: ScanResult = await res.json();
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Scan failed");
      } finally {
        setLoading(false);
      }
    }

    fetchWallet();
  }, [address]);

  // ── Render ───────────────────────────────────────────────────────

  return (
    <DashboardShell wallet={result?.wallets[0]} onSearch={(q) => router.push(`/wallet/${q.trim()}`)}>
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
          <span className="text-zinc-300 text-sm">Scanning across all supported chains…</span>
        </div>
      )}

      {/* ── Error ───────────────────────────────────────────────── */}
      {error && !loading && (
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-red-900/30 to-transparent border border-red-800/50 p-6">
          <h2 className="text-xl font-semibold mb-2 text-red-400">Error</h2>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* ── Summary Cards ───────────────────────────────────────── */}
      {result && result.summary && (
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            title="Total LP Value"
            value={formatCurrency(result.summary.totalValue)}
            icon="💰"
            trend="up"
            color="#10b981"
          />
          <SummaryCard
            title="Unclaimed Fees"
            value={formatCurrency(result.summary.totalUnclaimedFees)}
            icon="📊"
            trend={result.summary.totalUnclaimedFees > 0 ? "up" : undefined}
            color="#3b82f6"
          />
          <SummaryCard
            title="Total Positions"
            value={result.summary.totalPositions.toString()}
            icon="🎯"
            color="#8b5cf6"
          />
          <SummaryCard
            title="Chains"
            value={result.summary.totalChains.toString()}
            icon="🌐"
            color="#f59e0b"
          />
        </div>
      )}

      {/* ── LP Positions Table ──────────────────────────────────── */}
      {result && result.positions.length > 0 && (
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 overflow-hidden">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="text-2xl">📈</span>
              LP Positions
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              {result.positions.length} position{result.positions.length > 1 ? "s" : ""} across {result.summary.totalChains} chain{result.summary.totalChains > 1 ? "s" : ""}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/50">
                  <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Chain</th>
                  <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Protocol</th>
                  <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Pool</th>
                  <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Token0</th>
                  <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Token1</th>
                  <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Fee</th>
                  <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Token ID</th>
                  <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Status</th>
                  <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Amount0</th>
                  <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Amount1</th>
                  <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Value (USD)</th>
                </tr>
              </thead>
              <tbody>
                {result.positions.map((position, i) => (
                  <tr
                    key={`${position.wallet}-${position.chain}-${position.protocol}-${position.tokenId}-${i}`}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="text-zinc-300">{position.chain}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-zinc-300">{position.protocol}</td>
                    <td className="py-4 pr-4 font-mono text-xs text-zinc-400">
                      {position.pool ? `${position.pool.slice(0, 6)}…${position.pool.slice(-4)}` : "-"}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="font-mono text-xs text-zinc-400">
                        {position.token0 ? `${position.token0.slice(0, 6)}…${position.token0.slice(-4)}` : "-"}
                      </div>
                      {position.token0Symbol && (
                        <div className="text-zinc-500 text-xs">{position.token0Symbol}</div>
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="font-mono text-xs text-zinc-400">
                        {position.token1 ? `${position.token1.slice(0, 6)}…${position.token1.slice(-4)}` : "-"}
                      </div>
                      {position.token1Symbol && (
                        <div className="text-zinc-500 text-xs">{position.token1Symbol}</div>
                      )}
                    </td>
                    <td className="py-4 pr-4 font-mono text-zinc-300">{position.fee / 10000}%</td>
                    <td className="py-4 pr-4 font-mono text-zinc-300">{position.tokenId}</td>
                    <td className="py-4 pr-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        position.inRange
                          ? "bg-emerald-900/50 text-emerald-400 border border-emerald-800/50"
                          : "bg-red-900/50 text-red-400 border border-red-800/50"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${position.inRange ? "bg-emerald-400" : "bg-red-400"}`}></span>
                        {position.inRange ? "In Range" : "Out of Range"}
                      </span>
                    </td>
                    <td className="py-4 pr-4 font-mono text-zinc-300">{formatNumber(position.amount0, position.token0Decimals)}</td>
                    <td className="py-4 pr-4 font-mono text-zinc-300">{formatNumber(position.amount1, position.token1Decimals)}</td>
                    <td className="py-4 pr-4 font-semibold text-emerald-400">{formatCurrency(position.valueUsd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Empty positions ─────────────────────────────────────── */}
      {result && result.positions.length === 0 && (
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-12 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <div className="text-zinc-400 text-lg font-medium">No LP positions found.</div>
          <div className="text-zinc-600 text-sm mt-2 max-w-md mx-auto">
            The wallet may not have any active positions on supported chains. Try searching a different wallet.
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
