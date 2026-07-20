"use client";

import { type ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

/**
 * DashboardShell — layout foundation.
 *
 * Structure:
 *   [ Sidebar (fixed, collapsible) ] [ TopNav (sticky) + ContentArea ]
 */
export function DashboardShell({
  children,
  wallet,
  onSearch,
}: {
  children: ReactNode;
  wallet?: string;
  onSearch?: (q: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      {/* Offset for fixed sidebar */}
      <div
        className={`flex min-h-screen flex-col transition-all duration-200 ${
          collapsed ? "lg:pl-16" : "lg:pl-60"
        }`}
      >
        <TopNav wallet={wallet} />

        {/* Main Content Area */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
