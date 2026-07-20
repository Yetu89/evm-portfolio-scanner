"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";

// ── Types ──────────────────────────────────────────────────────────

interface PortfolioSummary {
  totalValue: number | null;
  totalUnclaimedFees: number;
  totalPositions: number;
  totalChains: number;
  totalProtocols: number;
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

// ── Dashboard Page ─────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [recentSearches, setRecentSearches] = useState<string[]>(loadRecent);

  const handleSearch = useCallback((q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    saveRecent(trimmed);
    setRecentSearches(loadRecent());
    router.push(`/wallet/${trimmed}`);
  }, [router]);

  const handleRecentClick = useCallback((entry: string) => {
    saveRecent(entry);
    setRecentSearches(loadRecent());
    router.push(`/wallet/${entry}`);
  }, [router]);

  return (
    <DashboardShell onSearch={handleSearch}>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Wallet Portfolio Tracker</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Search a wallet address, ENS, token, pool, or transaction hash in the bar above to begin.
        </p>
      </div>

      {/* ── Empty Dashboard ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supported Networks */}
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

        {/* Recent Searches */}
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
                    onClick={() => handleRecentClick(entry)}
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

        {/* Watchlist */}
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

        {/* Getting Started */}
        <section className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-6 flex items-center gap-2">
            <span className="text-lg">🚀</span>
            Getting Started
          </h2>
          <ol className="space-y-4">
            {[
              { step: 1, title: "Search a wallet", desc: "Enter a wallet address, ENS name, or token address in the search bar above." },
              { step: 2, title: "Scan across chains", desc: "The tracker scans across all supported chains for LP positions." },
              { step: 3, title: "View your portfolio", desc: "See positions, fees, and USD values organized by chain and protocol." },
            ].map((item) => (
              <li key={item.step} className="flex gap-4">
                <div className="shrink-0 flex flex-col items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm font-bold">
                    {item.step}
                  </div>
                  {item.step < 3 && <div className="w-0.5 h-full bg-zinc-800 my-1"></div>}
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
    </DashboardShell>
  );
}
