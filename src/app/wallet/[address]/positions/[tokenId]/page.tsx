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
  tickLower?: number;
  tickUpper?: number;
  currentTick?: number;
  token0PriceUsd?: number;
  token1PriceUsd?: number;
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

// ── Detail Section Component ───────────────────────────────────────

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-zinc-800/50 last:border-0">
      <span className="text-zinc-500 text-sm">{label}</span>
      <span className={`text-zinc-200 text-sm ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

// ── Position Detail Page ───────────────────────────────────────────

export default function PositionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const address = params.address as string;
  const tokenId = params.tokenId as string;

  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState<LpPosition | null>(null);

  useEffect(() => {
    if (!address || !tokenId) return;

    async function fetchPosition() {
      setLoading(true);
      try {
        const res = await fetch(`/api/wallet/${encodeURIComponent(address)}`);
        if (!res.ok) return;
        const data = await res.json();
        const found = (data.assets || []).find(
          (a: any) => a.type === "lp-position" && a.tokenId === tokenId
        );
        setPosition(found || null);
      } catch {
        setPosition(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPosition();
  }, [address, tokenId]);

  return (
    <DashboardShell wallet={address}>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Position Detail</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Token ID: <span className="font-mono text-zinc-300">{tokenId}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/wallet/${address}/positions`)}
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-400 hover:border-zinc-600 hover:text-white transition-colors"
        >
          ← Back to Positions
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
          <span className="text-zinc-300 text-sm">Loading position…</span>
        </div>
      )}

      {/* Position Detail */}
      {!loading && position && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overview Card */}
          <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {position.token0Symbol?.slice(0, 2) || "LP"}
              </div>
              <div>
                <div className="text-lg font-semibold text-white">
                  {position.token0Symbol} / {position.token1Symbol}
                </div>
                <div className="text-sm text-zinc-500">{position.protocol} • {position.chain}</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-3xl font-bold text-emerald-400">
                {formatCurrency(position.valueUsd)}
              </div>
              <div className="text-sm text-zinc-500 mt-1">Total Value</div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                position.inRange
                  ? "bg-emerald-900/50 text-emerald-400 border border-emerald-800/50"
                  : "bg-red-900/50 text-red-400 border border-red-800/50"
              }`}>
                <span className={`w-2 h-2 rounded-full ${position.inRange ? "bg-emerald-400" : "bg-red-400"}`}></span>
                {position.inRange ? "In Range" : "Out of Range"}
              </span>
              <span className="text-zinc-600 text-sm">•</span>
              <span className="text-zinc-400 text-sm">Fee: {position.fee / 10000}%</span>
            </div>
          </div>

          {/* Token Details Card */}
          <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">Token Details</h3>

            <DetailRow
              label={`${position.token0Symbol} Amount`}
              value={`${formatNumber(position.amount0, position.token0Decimals)} ${position.token0Symbol}`}
              mono
            />
            <DetailRow
              label={`${position.token0Symbol} Value`}
              value={formatCurrency(
                (parseFloat(position.amount0) / Math.pow(10, position.token0Decimals || 18)) * (position.token0PriceUsd || 0)
              )}
            />
            <DetailRow
              label={`${position.token1Symbol} Amount`}
              value={`${formatNumber(position.amount1, position.token1Decimals)} ${position.token1Symbol}`}
              mono
            />
            <DetailRow
              label={`${position.token1Symbol} Value`}
              value={formatCurrency(
                (parseFloat(position.amount1) / Math.pow(10, position.token1Decimals || 18)) * (position.token1PriceUsd || 0)
              )}
            />
          </div>

          {/* Position Info Card */}
          <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">Position Info</h3>

            <DetailRow label="Token ID" value={position.tokenId} mono />
            <DetailRow label="Chain" value={position.chain} />
            <DetailRow label="Protocol" value={position.protocol} />
            <DetailRow label="Pool" value={position.pool ? `${position.pool.slice(0, 10)}…${position.pool.slice(-6)}` : "-"} mono />
            <DetailRow label="Liquidity" value={position.liquidity} mono />
            {position.tickLower !== undefined && (
              <DetailRow label="Tick Range" value={`${position.tickLower} → ${position.tickUpper}`} mono />
            )}
            {position.currentTick !== undefined && (
              <DetailRow label="Current Tick" value={String(position.currentTick)} mono />
            )}
          </div>

          {/* Addresses Card */}
          <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">Addresses</h3>

            <DetailRow label="Token0" value={position.token0 ? `${position.token0.slice(0, 10)}…${position.token0.slice(-6)}` : "-"} mono />
            <DetailRow label="Token1" value={position.token1 ? `${position.token1.slice(0, 10)}…${position.token1.slice(-6)}` : "-"} mono />
            <DetailRow label="Pool" value={position.pool ? `${position.pool.slice(0, 10)}…${position.pool.slice(-6)}` : "-"} mono />
            <DetailRow label="Wallet" value={position.wallet ? `${position.wallet.slice(0, 10)}…${position.wallet.slice(-6)}` : "-"} mono />
          </div>
        </div>
      )}

      {/* Not found */}
      {!loading && !position && (
        <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-12 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <div className="text-zinc-400 text-lg font-medium">Position not found.</div>
          <div className="text-zinc-600 text-sm mt-2">
            This position may not exist or may have been closed.
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
