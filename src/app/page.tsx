"use client";

import { useState, useCallback } from "react";
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

// ── Storage ────────────────────────────────────────────────────────

const STORAGE_KEY = "wallet-portfolio-recent";

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as string[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveRecent(wallet: string) {
  const list = loadRecent().filter(
    (w) => w.toLowerCase() !== wallet.toLowerCase()
  );
  list.unshift(wallet);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 10)));
  } catch {
    // quota — silently ignore
  }
}

// ── Chain list with logos ──────────────────────────────────────────

const CHAIN_INFO = [
  { name: "Ethereum", chainId: 1, color: "#627EEA", logo: "Ξ" },
  { name: "Base", chainId: 8453, color: "#0052FF", logo: "●" },
  { name: "Arbitrum", chainId: 42161, color: "#28A0F0", logo: "◉" },
  { name: "Optimism", chainId: 10, color: "#FF0420", logo: "◎" },
  { name: "Polygon", chainId: 137, color: "#8247E5", logo: "⬡" },
  { name: "BNB Chain", chainId: 56, color: "#F0B90B", logo: "◈" },
  { name: "Avalanche", chainId: 43114, color: "#E84142", logo: "▲" },
  { name: "Linea", chainId: 59144, color: "#000", logo: "∿" },
  { name: "Scroll", chainId: 534352, color: "#FEFF00", logo: "⊞" },
  { name: "Mantle", chainId: 5000, color: "#000", logo: "◆" },
  { name: "Sonic", chainId: 146, color: "#000", logo: "⚡" },
  { name: "Soneium", chainId: 1868, color: "#000", logo: "☀" },
  { name: "zkSync Era", chainId: 324, color: "#000", logo: "⊕" },
  { name: "Blast", chainId: 81457, color: "#FFDD00", logo: "⚡" },
  { name: "Mode", chainId: 34443, color: "#000", logo: "◐" },
  { name: "Berachain", chainId: 80094, color: "#000", logo: "🐻" },
  { name: "Unichain", chainId: 130, color: "#000", logo: "🦄" },
  { name: "Ink", chainId: 57073, color: "#000", logo: "✒" },
  { name: "Robinhood", chainId: 4663, color: "#000", logo: "📈" },
];

// ── Icon Components ────────────────────────────────────────────────

function SparklineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 8L5 4L9 7L13 2L17 6L21 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrendUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M12 7l-5 5 1.41 1.41L11 9.83V17h2V9.83l2.59 2.58L14 12l-5-5z" clipRule="evenodd" />
    </svg>
  );
}

function TrendDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M12 13l-5-5 1.41-1.41L11 10.17V3h2v7.17l2.59-2.58L14 8l-5 5z" clipRule="evenodd" />
    </svg>
  );
}

// ── Summary Card Component ─────────────────────────────────────────

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  trend?: "up" | "down";
  color: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 p-6">
      {/* Glow effect */}
      <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-10 blur-xl group-hover:opacity-20 transition-opacity`} style={{ backgroundColor: color }} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">{title}</span>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
              {trend === "up" ? <TrendUpIcon className="w-3 h-3" /> : <TrendDownIcon className="w-3 h-3" />}
              <SparklineIcon className="w-6 h-3" />
            </div>
          )}
        </div>

        <div className="text-2xl font-bold text-white mb-1">{value}</div>

        {subtitle && (
          <div className="text-xs text-zinc-500">{subtitle}</div>
        )}
      </div>
    </div>
  );
}

// ── Main Page Component ────────────────────────────────────────────

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(loadRecent);

  const performScan = useCallback(async (wallet: string) => {
    const trimmed = wallet.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/portfolio?wallet=${encodeURIComponent(trimmed)}`
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `HTTP ${res.status}`);
      }
      const data: ScanResult = await res.json();
      setResult(data);
      saveRecent(trimmed);
      setRecentSearches(loadRecent());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback((q: string) => {
    performScan(q);
  }, [performScan]);

  // ── Render ───────────────────────────────────────────────────────

  return (
    <DashboardShell wallet={result?.wallets[0]} onSearch={handleSearch}>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          {result ? result.wallets[0] : "Wallet Portfolio Tracker"}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {result
            ? "Wallet overview — search a new wallet in the bar above"
            : "Search a wallet address, ENS, token, pool, or transaction hash in the bar above to begin."}
        </p>
      </div>

      {/* ── Loading / Error ──────────────────────────────────────── */}
      {loading && (
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
          <span className="text-zinc-300 text-sm">
            Scanning across all supported chains…
          </span>
        </div>
      )}

      {error && (
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-red-900/30 to-transparent border border-red-800/50 p-6">
          <h2 className="text-xl font-semibold mb-2 text-red-400">Error</h2>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* ── State B: After Scan ──────────────────────────────────── */}
      {result && (
        <>
          {/* Summary Cards — Modern Design */}
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

          {/* LP Positions Table — Enhanced */}
          {result.positions.length > 0 && (
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
                          {position.pool
                            ? `${position.pool.slice(0, 6)}…${position.pool.slice(-4)}`
                            : "-"}
                        </td>
                        <td className="py-4 pr-4">
                          <div className="font-mono text-xs text-zinc-400">
                            {position.token0
                              ? `${position.token0.slice(0, 6)}…${position.token0.slice(-4)}`
                              : "-"}
                          </div>
                          {position.token0Symbol && (
                            <div className="text-zinc-500 text-xs">{position.token0Symbol}</div>
                          )}
                        </td>
                        <td className="py-4 pr-4">
                          <div className="font-mono text-xs text-zinc-400">
                            {position.token1
                              ? `${position.token1.slice(0, 6)}…${position.token1.slice(-4)}`
                              : "-"}
                          </div>
                          {position.token1Symbol && (
                            <div className="text-zinc-500 text-xs">{position.token1Symbol}</div>
                          )}
                        </td>
                        <td className="py-4 pr-4 font-mono text-zinc-300">
                          {position.fee / 10000}%
                        </td>
                        <td className="py-4 pr-4 font-mono text-zinc-300">
                          {position.tokenId}
                        </td>
                        <td className="py-4 pr-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              position.inRange
                                ? "bg-emerald-900/50 text-emerald-400 border border-emerald-800/50"
                                : "bg-red-900/50 text-red-400 border border-red-800/50"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${position.inRange ? "bg-emerald-400" : "bg-red-400"}`}></span>
                            {position.inRange ? "In Range" : "Out of Range"}
                          </span>
                        </td>
                        <td className="py-4 pr-4 font-mono text-zinc-300">
                          {formatNumber(position.amount0, position.token0Decimals)}
                        </td>
                        <td className="py-4 pr-4 font-mono text-zinc-300">
                          {formatNumber(position.amount1, position.token1Decimals)}
                        </td>
                        <td className="py-4 pr-4 font-semibold text-emerald-400">
                          {formatCurrency(position.valueUsd)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty positions message — Enhanced */}
          {result.positions.length === 0 && (
            <div className="mb-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-12 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <div className="text-zinc-400 text-lg font-medium">No LP positions found.</div>
              <div className="text-zinc-600 text-sm mt-2 max-w-md mx-auto">
                The wallet may not have any active positions on supported chains. Try searching a different wallet.
              </div>
            </div>
          )}
        </>
      )}

      {/* ── State A: Empty Dashboard ─────────────────────────────── */}
      {!result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Supported Networks — Enhanced with logos */}
          <section className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-6 flex items-center gap-2">
              <span className="text-lg">🌐</span>
              Supported Networks
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CHAIN_INFO.map((chain) => (
                <div
                  key={chain.chainId}
                  className="group flex items-center gap-2 rounded-xl bg-zinc-950 px-3 py-2.5 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200 cursor-default"
                >
                  <div
                    className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-transform group-hover:scale-110"
                    style={{ backgroundColor: chain.color || "#333" }}
                  >
                    {chain.logo}
                  </div>
                  <span className="text-xs text-zinc-300 group-hover:text-white transition-colors">{chain.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Searches — Enhanced with avatars */}
          <section className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-6 flex items-center gap-2">
              <span className="text-lg">⏱️</span>
              Recent Searches
            </h2>
            {recentSearches.length === 0 ? (
              <div className="text-zinc-600 text-sm py-8 text-center">
                <div className="text-2xl mb-2">🔎</div>
                No recent searches
              </div>
            ) : (
              <ul className="space-y-2">
                {recentSearches.map((entry, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => performScan(entry)}
                      className="w-full group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800/50 hover:text-white transition-all duration-200"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs font-bold">
                        {entry.slice(2, 4)}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-mono text-sm truncate">{entry}</div>
                        <div className="text-xs text-zinc-500">Click to scan</div>
                      </div>
                      <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">→</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Watchlist — Enhanced empty state */}
          <section className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-6 flex items-center gap-2">
              <span className="text-lg">⭐</span>
              Watchlist
            </h2>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
                <span className="text-2xl">👁️</span>
              </div>
              <div className="text-zinc-400 font-medium mb-1">Watchlist coming soon</div>
              <div className="text-zinc-600 text-sm max-w-xs">
                Save wallets to monitor their portfolio activity and receive alerts.
              </div>
            </div>
          </section>

          {/* Getting Started — Enhanced */}
          <section className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-6 flex items-center gap-2">
              <span className="text-lg">🚀</span>
              Getting Started
            </h2>
            <ol className="space-y-4">
              {[
                {
                  step: 1,
                  title: "Search a wallet",
                  desc: "Enter a wallet address, ENS name, or token address in the search bar above.",
                },
                {
                  step: 2,
                  title: "Scan across chains",
                  desc: "The tracker scans across all supported chains for LP positions.",
                },
                {
                  step: 3,
                  title: "View your portfolio",
                  desc: "See positions, fees, and USD values organized by chain and protocol.",
                },
              ].map((item) => (
                <li key={item.step} className="flex gap-4">
                  <div className="shrink-0 flex flex-col items-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm font-bold">
                      {item.step}
                    </div>
                    {item.step < 3 && (
                      <div className="w-0.5 h-full bg-zinc-800 my-1"></div>
                    )}
                  </div>
                  <div>
                    <div className="text-zinc-200 font-medium text-sm mb-1">{item.title}</div>
                    <div className="text-zinc-500 text-sm">{item.desc}</div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      )}
    </DashboardShell>
  );
}
