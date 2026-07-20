"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";

// ── Types ──────────────────────────────────────────────────────────

interface LpPosition {
  wallet: string;
  chain: string;
  tokenId: string;
  protocol: string;
  pool: string;
  token0: string;
  token1: string;
  token0Symbol?: string;
  token1Symbol?: string;
  token0Decimals?: number;
  token1Decimals?: number;
  fee: number;
  liquidity: string;
  amount0: string;
  amount1: string;
  valueUsd?: number;
  inRange: boolean;
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

// ── Positions Page ─────────────────────────────────────────────────

export default function PositionsPage() {
  const params = useParams();
  const router = useRouter();
  const address = params.address as string;

  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState<LpPosition[]>([]);

  useEffect(() => {
    if (!address) return;

    async function fetchPositions() {
      setLoading(true);
      try {
        const res = await fetch(`/api/wallet/${encodeURIComponent(address)}`);
        if (!res.ok) return;
        const data = await res.json();
        // Filter only LP positions
        const lpPositions = (data.assets || []).filter(
          (a: any) => a.type === "lp-position"
        );
        setPositions(lpPositions);
      } catch {
        setPositions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPositions();
  }, [address]);

  return (
    <DashboardShell wallet={address}>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">LP Positions</h1>
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
          <span className="text-zinc-300 text-sm">Loading positions…</span>
        </div>
      )}

      {/* Summary */}
      {!loading && (
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-4 flex items-center justify-between">
          <span className="text-zinc-400 text-sm">
            {positions.length} active LP position{positions.length !== 1 ? "s" : ""}
          </span>
          <span className="text-emerald-400 font-semibold text-sm">
            Total: {formatCurrency(positions.reduce((s, p) => s + (p.valueUsd || 0), 0))}
          </span>
        </div>
      )}

      {/* Positions Table */}
      {!loading && positions.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/50">
                  <th className="py-4 pr-4 pl-6 text-zinc-400 font-medium text-xs uppercase tracking-wider">Chain</th>
                  <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Protocol</th>
                  <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Pool</th>
                  <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Token0 / Token1</th>
                  <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Fee</th>
                  <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Amount0</th>
                  <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Amount1</th>
                  <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Status</th>
                  <th className="py-4 pr-4 text-zinc-400 font-medium text-xs uppercase tracking-wider">Value (USD)</th>
                  <th className="py-4 pr-6 text-zinc-400 font-medium text-xs uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos, i) => (
                  <tr
                    key={`${pos.chain}-${pos.tokenId}-${i}`}
                    onClick={() => router.push(`/wallet/${address}/positions/${pos.tokenId}`)}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30 cursor-pointer transition-colors"
                  >
                    <td className="py-4 pr-4 pl-6">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="text-zinc-300">{pos.chain}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-zinc-300">{pos.protocol}</td>
                    <td className="py-4 pr-4 font-mono text-xs text-zinc-400">
                      {pos.pool ? `${pos.pool.slice(0, 6)}…${pos.pool.slice(-4)}` : "-"}
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-zinc-300">
                        {pos.token0Symbol || "?"} / {pos.token1Symbol || "?"}
                      </span>
                    </td>
                    <td className="py-4 pr-4 font-mono text-zinc-300">
                      {pos.fee / 10000}%
                    </td>
                    <td className="py-4 pr-4 font-mono text-zinc-300">
                      {formatNumber(pos.amount0, pos.token0Decimals)}
                      <span className="text-zinc-500 ml-1 text-xs">{pos.token0Symbol}</span>
                    </td>
                    <td className="py-4 pr-4 font-mono text-zinc-300">
                      {formatNumber(pos.amount1, pos.token1Decimals)}
                      <span className="text-zinc-500 ml-1 text-xs">{pos.token1Symbol}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        pos.inRange
                          ? "bg-emerald-900/50 text-emerald-400 border border-emerald-800/50"
                          : "bg-red-900/50 text-red-400 border border-red-800/50"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${pos.inRange ? "bg-emerald-400" : "bg-red-400"}`}></span>
                        {pos.inRange ? "In Range" : "Out of Range"}
                      </span>
                    </td>
                    <td className="py-4 pr-4 font-semibold text-emerald-400">
                      {formatCurrency(pos.valueUsd)}
                    </td>
                    <td className="py-4 pr-6 text-zinc-600">→</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && positions.length === 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-12 text-center">
          <div className="text-4xl mb-4">📭</div>
          <div className="text-zinc-400 text-lg font-medium">No LP positions found.</div>
          <div className="text-zinc-600 text-sm mt-2">
            This wallet may not have any active LP positions.
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
