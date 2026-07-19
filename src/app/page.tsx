"use client";

import { useState } from "react";

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

export default function Home() {
  const [walletInput, setWalletInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  async function handleScan() {
    if (!walletInput.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(
        `/api/portfolio?wallet=${encodeURIComponent(walletInput.trim())}`
      );

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

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">LP Portfolio Tracker</h1>

      <div className="mb-4">
        <textarea
          className="w-full rounded-lg bg-zinc-900 p-4 outline-none resize-none font-mono text-sm"
          placeholder="Wallet addresses (comma or newline separated)&#10;0xabc...&#10;0xdef..."
          rows={4}
          value={walletInput}
          onChange={(e) => setWalletInput(e.target.value)}
        />
      </div>

      <div className="mb-8">
        <button
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          onClick={handleScan}
          disabled={loading || !walletInput.trim()}
        >
          {loading ? "Scanning..." : "Scan Portfolio"}
        </button>
      </div>

      {error && (
        <div className="mb-8 rounded-xl bg-red-900/50 border border-red-700 p-6">
          <h2 className="text-xl font-semibold mb-2 text-red-400">Error</h2>
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {result && result.summary && (
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl bg-zinc-900 p-6 border border-zinc-800">
            <div className="text-zinc-400 text-sm mb-1">Total LP Value</div>
            <div className="text-2xl font-bold">
              {formatCurrency(result.summary.totalValue)}
            </div>
          </div>
          <div className="rounded-xl bg-zinc-900 p-6 border border-zinc-800">
            <div className="text-zinc-400 text-sm mb-1">Unclaimed Fees</div>
            <div className="text-2xl font-bold">
              {formatCurrency(result.summary.totalUnclaimedFees)}
            </div>
          </div>
          <div className="rounded-xl bg-zinc-900 p-6 border border-zinc-800">
            <div className="text-zinc-400 text-sm mb-1">Total Positions</div>
            <div className="text-2xl font-bold">
              {result.summary.totalPositions}
            </div>
          </div>
          <div className="rounded-xl bg-zinc-900 p-6 border border-zinc-800">
            <div className="text-zinc-400 text-sm mb-1">Chains</div>
            <div className="text-2xl font-bold">
              {result.summary.totalChains}
            </div>
          </div>
        </div>
      )}

      {result && result.positions.length > 0 && (
        <div className="rounded-xl bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold mb-4">LP Positions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="py-3 pr-4 text-zinc-400">Chain</th>
                  <th className="py-3 pr-4 text-zinc-400">Protocol</th>
                  <th className="py-3 pr-4 text-zinc-400">Pool</th>
                  <th className="py-3 pr-4 text-zinc-400">Token0</th>
                  <th className="py-3 pr-4 text-zinc-400">Token1</th>
                  <th className="py-3 pr-4 text-zinc-400">Fee</th>
                  <th className="py-3 pr-4 text-zinc-400">Token ID</th>
                  <th className="py-3 pr-4 text-zinc-400">Status</th>
                  <th className="py-3 pr-4 text-zinc-400">Amount0</th>
                  <th className="py-3 pr-4 text-zinc-400">Amount1</th>
                  <th className="py-3 pr-4 text-zinc-400">Value (USD)</th>
                </tr>
              </thead>
              <tbody>
                {result.positions.map((position, i) => (
                  <tr
                    key={`${position.wallet}-${position.chain}-${position.protocol}-${position.tokenId}-${i}`}
                    className="border-b border-zinc-800 hover:bg-zinc-800/50"
                  >
                    <td className="py-3 pr-4">{position.chain}</td>
                    <td className="py-3 pr-4">{position.protocol}</td>
                    <td className="py-3 pr-4 font-mono text-xs">
                      {position.pool ? `${position.pool.slice(0, 6)}...${position.pool.slice(-4)}` : "-"}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="font-mono text-xs">
                        {position.token0 ? `${position.token0.slice(0, 6)}...${position.token0.slice(-4)}` : "-"}
                      </div>
                      {position.token0Symbol && (
                        <div className="text-zinc-500 text-xs">{position.token0Symbol}</div>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="font-mono text-xs">
                        {position.token1 ? `${position.token1.slice(0, 6)}...${position.token1.slice(-4)}` : "-"}
                      </div>
                      {position.token1Symbol && (
                        <div className="text-zinc-500 text-xs">{position.token1Symbol}</div>
                      )}
                    </td>
                    <td className="py-3 pr-4 font-mono">{position.fee / 10000}%</td>
                    <td className="py-3 pr-4 font-mono">{position.tokenId}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-1 rounded text-xs ${position.inRange ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"}`}>
                        {position.inRange ? "In Range" : "Out of Range"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs">
                      {formatNumber(position.amount0, position.token0Decimals)}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs">
                      {formatNumber(position.amount1, position.token1Decimals)}
                    </td>
                    <td className="py-3 pr-4 font-semibold">
                      {formatCurrency(position.valueUsd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && result.positions.length === 0 && (
        <div className="rounded-xl bg-zinc-900 p-6 text-center text-zinc-500">
          No LP positions found.
        </div>
      )}
    </main>
  );
}
