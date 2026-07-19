"use client";

import { useState } from "react";

interface Position {
  wallet: string;
  chain: string;
  tokenId: string;
  protocol: string;
}

interface ScanResult {
  wallets: string[];
  positions: Position[];
  invalidAddresses?: string[];
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
        `/api/wallet?wallet=${encodeURIComponent(walletInput.trim())}`
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
          {loading ? "Scanning..." : "Scan"}
        </button>
      </div>

      {error && (
        <div className="mb-8 rounded-xl bg-red-900/50 border border-red-700 p-6">
          <h2 className="text-xl font-semibold mb-2 text-red-400">Error</h2>
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {result?.invalidAddresses && result.invalidAddresses.length > 0 && (
        <div className="mb-8 rounded-xl bg-yellow-900/50 border border-yellow-700 p-6">
          <h2 className="text-xl font-semibold mb-2 text-yellow-400">
            Invalid Addresses
          </h2>
          <p className="text-yellow-300">
            {result.invalidAddresses.join(", ")}
          </p>
        </div>
      )}

      {result && (
        <div className="rounded-xl bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold mb-2">
            Scanned {result.wallets.length} wallet(s)
          </h2>

          {result.positions.length === 0 ? (
            <p className="text-zinc-500">No LP positions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="py-2 pr-4 text-zinc-400">Wallet</th>
                    <th className="py-2 pr-4 text-zinc-400">Chain</th>
                    <th className="py-2 pr-4 text-zinc-400">Protocol</th>
                    <th className="py-2 text-zinc-400">Token ID</th>
                  </tr>
                </thead>
                <tbody>
                  {result.positions.map((position, i) => (
                    <tr
                      key={`${position.wallet}-${position.chain}-${position.protocol}-${position.tokenId}-${i}`}
                      className="border-b border-zinc-800"
                    >
                      <td className="py-2 pr-4 font-mono text-xs">
                        {position.wallet.slice(0, 6)}...{position.wallet.slice(-4)}
                      </td>
                      <td className="py-2 pr-4">{position.chain}</td>
                      <td className="py-2 pr-4">{position.protocol}</td>
                      <td className="py-2 font-mono">{position.tokenId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
