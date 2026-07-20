"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export interface NavItem {
  key: string;
  label: string;
  icon?: string;
  href?: string;
}

// Menu order per spec. Dashboard = "/", Wallet Portfolio = "/wallet/[address]".
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

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

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
            const isActive = item.href
              ? pathname === item.href
              : pathname.startsWith("/wallet/") && item.key === "portfolio";
            return (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => {
                    if (item.href) {
                      router.push(item.href);
                    }
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
