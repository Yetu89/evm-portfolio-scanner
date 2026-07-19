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

export async function getOwnedTokenIds(
  rpcUrl: string,
  contract: Address,
  owner: Address,
  blockscoutUrl?: string
): Promise<string[]> {
  const walletLower = owner.toLowerCase();
  const zeroAddressLower = ZERO_ADDRESS.toLowerCase();

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

    const client = createRpcClient(rpcUrl);
    const ownedTokenIds: string[] = [];

    for (const tokenId of candidateIds) {
      try {
        const currentOwner = await client.readContract({
          address: contract,
          abi: ERC721_ABI,
          functionName: "ownerOf",
          args: [BigInt(tokenId)],
        });

        if (currentOwner.toLowerCase() === walletLower) {
          ownedTokenIds.push(tokenId);
        }
      } catch (error) {
        if (tokenId === "0" || walletLower === zeroAddressLower) {
          throw error;
        }
      }
    }

    return ownedTokenIds;
  }

  const client = createRpcClient(rpcUrl);

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
