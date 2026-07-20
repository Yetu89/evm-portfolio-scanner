import { Address } from "viem";
import { ERC721_ABI } from "@/abi/erc721";
import { createRpcClient } from "@/lib/client";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

interface BlockscoutTransfer {
  type: string;
  total: { token_id: string | null };
  from: { hash: string };
  to: { hash: string };
}

async function fetchAllTokenTransfers(
  wallet: string,
  contract: string,
  blockscoutUrl: string
): Promise<BlockscoutTransfer[]> {
  const transfers: BlockscoutTransfer[] = [];
  let nextPage: Record<string, string> | null = null;

  for (let page = 0; page < 500; page++) {
    const params = new URLSearchParams({ token: contract });
    if (nextPage) {
      for (const [key, value] of Object.entries(nextPage)) {
        params.set(key, value);
      }
    }

    const url =
      `${blockscoutUrl}/api/v2/addresses/${wallet}/token-transfers?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Blockscout API error: ${response.status} ${response.statusText}`);
      break;
    }

    const data = await response.json() as {
      items: BlockscoutTransfer[];
      next_page_params: Record<string, string> | null;
    };

    transfers.push(...data.items);
    nextPage = data.next_page_params;

    if (!nextPage) {
      break;
    }
  }

  return transfers;
}

/**
 * Check if a Position NFT is still active (has liquidity > 0 and not burnt).
 * This filters out:
 * - Closed positions (liquidity = 0)
 * - Burnt tokens (ownerOf reverts)
 * - Positions with zero liquidity in positionInfo
 */
async function isPositionActive(
  client: ReturnType<typeof createRpcClient>,
  contract: Address,
  tokenId: string
): Promise<boolean> {
  try {
    // Check 1: Is token still owned by anyone? (ownerOf must succeed)
    const owner = await client.readContract({
      address: contract,
      abi: ERC721_ABI,
      functionName: "ownerOf",
      args: [BigInt(tokenId)],
    });
    if (!owner || owner === ZERO_ADDRESS) {
      return false; // Burnt / transferred to zero
    }

    // Check 2: Does position have liquidity? (V4-specific via getPositionLiquidity)
    // Try V4 getPositionLiquidity first
    try {
      const liquidity = await client.readContract({
        address: contract,
        abi: [
          {
            type: "function",
            stateMutability: "view",
            name: "getPositionLiquidity",
            inputs: [{ name: "tokenId", type: "uint256" }],
            outputs: [{ name: "liquidity", type: "uint128" }],
          },
        ],
        functionName: "getPositionLiquidity",
        args: [BigInt(tokenId)],
      }) as bigint;
      if (liquidity === BigInt(0)) {
        return false; // Closed / empty position
      }
    } catch {
      // Fallback: check if contract supports V3-style position data
      // Try positions() for V3 or positionInfo for V4
      try {
        const pos = await client.readContract({
          address: contract,
          abi: [
            {
              type: "function",
              stateMutability: "view",
              name: "positionInfo",
              inputs: [{ name: "tokenId", type: "uint256" }],
              outputs: [{ name: "", type: "uint256" }],
            },
          ],
          functionName: "positionInfo",
          args: [BigInt(tokenId)],
        }) as bigint;
        // V4: liquidity is bits 56-255, extract and check
        const liq = Number(pos >> BigInt(56));
        if (liq === 0) {
          return false; // No liquidity
        }
      } catch {
        // Can't verify liquidity — assume active if ownerOf succeeded
        // This is fallback for contracts without liquidity query
      }
    }

    return true; // Position is active
  } catch {
    return false; // Token doesn't exist or is invalid
  }
}

export async function getOwnedTokenIds(
  rpcUrl: string,
  contract: Address,
  owner: Address,
  blockscoutUrl?: string
): Promise<string[]> {
  const walletLower = owner.toLowerCase();
  const zeroAddressLower = ZERO_ADDRESS.toLowerCase();

  const client = createRpcClient(rpcUrl);

  if (blockscoutUrl) {
    const candidateIds = new Set<string>();
    const transfers = await fetchAllTokenTransfers(
      walletLower,
      contract.toLowerCase(),
      blockscoutUrl
    );

    for (const transfer of transfers) {
      const tokenId = transfer.total.token_id;
      if (!tokenId) continue;

      const fromLower = transfer.from.hash.toLowerCase();
      const toLower = transfer.to.hash.toLowerCase();

      if (toLower === walletLower) {
        candidateIds.add(tokenId);
      }
      if (fromLower === walletLower) {
        candidateIds.delete(tokenId);
      }
    }

    if (candidateIds.size === 0) {
      return [];
    }

    // Filter candidates: only keep if still owned AND active (liquidity > 0)
    const ownedTokenIds: string[] = [];

    for (const tokenId of candidateIds) {
      const isActive = await isPositionActive(client, contract, tokenId);
      if (isActive) {
        ownedTokenIds.push(tokenId);
      }
    }

    return ownedTokenIds;
  }

  // Fallback: enumerable ERC721 (no support for liquidity check at this layer)
  // Enrich layer will handle liquidity filtering
  const enumerableAbi = [
    {
      type: "function",
      stateMutability: "view",
      name: "balanceOf",
      inputs: [{ name: "owner", type: "address" }],
      outputs: [{ name: "", type: "uint256" }],
    },
    {
      type: "function",
      stateMutability: "view",
      name: "tokenOfOwnerByIndex",
      inputs: [
        { name: "owner", type: "address" },
        { name: "index", type: "uint256" },
      ],
      outputs: [{ name: "", type: "uint256" }],
    },
  ] as const;

  const balance = (await client.readContract({
    address: contract,
    abi: enumerableAbi,
    functionName: "balanceOf",
    args: [owner],
  })) as bigint;

  if (balance === BigInt(0)) {
    return [];
  }

  const ownedTokenIds: string[] = [];
  for (let i = BigInt(0); i < balance; i++) {
    try {
      const tokenId = (await client.readContract({
        address: contract,
        abi: enumerableAbi,
        functionName: "tokenOfOwnerByIndex",
        args: [owner, i],
      })) as bigint;
      ownedTokenIds.push(tokenId.toString());
    } catch {
      break;
    }
  }

  return ownedTokenIds;
}
