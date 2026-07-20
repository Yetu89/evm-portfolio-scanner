"use client";

import type { LinkTarget } from "@/components/links";
import { truncateValue } from "@/components/links";

/**
 * LinkableValue — renders an address / id / hash as a link-ready element.
 *
 * Sprint #1: renders as a styled, truncatable text node. The `target` prop
 * carries enough metadata (kind, chainId, value) so a later sprint can swap
 * the placeholder <span> for a real <a>/<Link> without touching call sites.
 *
 * Nothing is "dead text": any value that has a navigational purpose already
 * declares its LinkTarget here.
 */
export function LinkableValue({
  target,
  className = "",
  truncate = true,
}: {
  target: LinkTarget;
  className?: string;
  truncate?: boolean;
}) {
  const display = truncate
    ? target.label ?? truncateValue(target.value)
    : target.label ?? target.value;

  // Placeholder: real navigation added in a later sprint.
  return (
    <span
      data-link-kind={target.kind}
      data-link-value={target.value}
      data-link-chain={target.chainId}
      data-link-href={target.href}
      data-link-external={target.external ? "true" : undefined}
      title={target.value}
      className={`cursor-pointer text-zinc-300 hover:text-blue-400 transition-colors ${className}`}
    >
      {display}
    </span>
  );
}
