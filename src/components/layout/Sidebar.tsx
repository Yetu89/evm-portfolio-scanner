"use client";

import { usePathname, useRouter } from "next/navigation";
import { getActiveWallet } from "@/components/active-wallet";

export interface NavItem {
  key: string;
  label: string;
  icon?: string;
  href?: string;
}

// Menu order per spec.
export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "▦", href: "/" },
  { key: "portfolio", label: "Portfolio", icon: "◈", href: undefined },
  { key: "positions", label: "Positions", icon: "≣", href: undefined },
  { key: "tokens", label: "Tokens", icon: "●", href: undefined },
  { key: "nfts", label: "NFTs", icon: "▢", href: undefined },
  { key: "staking", label: "Staking", icon: "◬", href: undefined },
  { key: "lending", label: "Lending", icon: "⇄", href: undefined },
  { key: "history", label: "History", icon: "⟳", href: undefined },
  { key: "analytics", label: "Analytics", icon: "◔", href: undefined },
  { key: "alerts", label: "Alerts", icon: "⃠", href: undefined },
  { key: "watchlist", label: "Watchlist", icon: "★", href: undefined },
  { key: "settings", label: "Settings", icon: "⚙", href: undefined },
];

/**
 * Resolve navigation href for items that depend on an active wallet.
 */
function resolveItemHref(item: NavItem, activeWallet: string | null): string | null {
  if (item.href) return item.href; // static route (Dashboard)
  if (!activeWallet) return "/";   // no active wallet → Dashboard
  switch (item.key) {
    case "portfolio":
      return `/wallet/${activeWallet}`;
    case "positions":
      return `/wallet/${activeWallet}/positions`;
    case "tokens":
      return `/wallet/${activeWallet}/tokens`;
    default:
      return null; // no route yet
  }
}

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const activeWallet = getActiveWallet();

  return (
    <aside
      className={`fixed left-0 top-0 z-30 flex h-full flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-300 transition-all duration-200 ${
        collapsed ? "w-16" : "w-60"
      }`}
      aria-label="Primary navigation"
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-zinc-800 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
          WP
        </div>
        {!collapsed && (
          <div className="truncate">
            <div className="text-sm font-semibold text-white">
              Wallet Portfolio
            </div>
            <div className="text-xs text-zinc-500">Tracker</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const href = resolveItemHref(item, activeWallet);
            const isActive = href
              ? pathname === href || pathname.startsWith(href + "/")
              : pathname.includes("/positions") && item.key === "positions"
                ? true
                : pathname.includes("/tokens") && item.key === "tokens"
                  ? true
                  : false;

            return (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => {
                    if (href) router.push(href);
                  }}
                  data-nav-key={item.key}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`}
                  title={item.label}
                >
                  <span className="w-5 shrink-0 text-center text-base">
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-zinc-800 p-2">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="text-base">{collapsed ? "»" : "«"}</span>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
