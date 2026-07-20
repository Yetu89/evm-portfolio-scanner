"use client";

import { useRouter } from "next/navigation";
import { LinkableValue } from "@/components/ui/LinkableValue";
import type { LinkTarget } from "@/components/links";

/**
 * Top navigation: search bar, wallet selector (link-ready), right-side icons.
 *
 * Search bar submits via form → navigates to /wallet/{address}.
 * No secondary search box lives in the dashboard.
 */
export function TopNav({
  wallet,
}: {
  wallet?: string;
}) {
  const router = useRouter();

  const walletTarget: LinkTarget | undefined = wallet
    ? { kind: "wallet", value: wallet, label: `${wallet.slice(0, 6)}…${wallet.slice(-4)}` }
    : undefined;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-zinc-800 bg-zinc-950/95 px-4 backdrop-blur">
      {/* Search — primary entry point */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const q = String(fd.get("q") ?? "").trim();
          if (q) router.push(`/wallet/${q}`);
        }}
        className="flex flex-1 items-center"
      >
        <input
          name="q"
          type="search"
          placeholder="Search wallet, ENS, token, pool, tx hash…"
          className="w-full max-w-xl rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-blue-600 transition-colors"
          aria-label="Search wallet, ENS, token, pool, or transaction"
          autoComplete="off"
        />
      </form>

      {/* Wallet selector / address (link-ready) */}
      <div className="flex items-center gap-2">
        {walletTarget ? (
          <LinkableValue
            target={walletTarget}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-xs"
          />
        ) : (
          <span className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-500">
            No wallet connected
          </span>
        )}
      </div>

      {/* Right-side icon placeholders */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          aria-label="Notifications"
        >
          ◔
        </button>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          aria-label="Account"
        >
          ★
        </button>
      </div>
    </header>
  );
}
