// Shared link-target contracts.
//
// Sprint #1 only defines the contract + placeholder rendering.
// Actual href resolution (explorer base per chain, internal routes, etc.)
// is implemented in a later sprint. Keeping the contract here means every
// component that shows addresses / ids / hashes can already be wired to
// navigate (internal route or external explorer) without a UI redesign.

export type LinkKind =
  | "wallet"
  | "token"
  | "protocol"
  | "pool"
  | "transaction"
  | "nft"
  | "block"
  | "external";

export interface LinkTarget {
  /** What kind of entity this link points to */
  kind: LinkKind;
  /** Raw value: address, token id, tx hash, pool id, etc. */
  value: string;
  /** Chain id when relevant (for explorer base resolution later) */
  chainId?: number;
  /** Optional human label; falls back to truncated value */
  label?: string;
  /** Explicit href if known; otherwise resolved later */
  href?: string;
  /** Force external (new tab) vs internal route */
  external?: boolean;
}

export function truncateValue(value: string, lead = 6, tail = 4): string {
  if (!value) return "-";
  if (value.length <= lead + tail + 1) return value;
  return `${value.slice(0, lead)}…${value.slice(-tail)}`;
}
