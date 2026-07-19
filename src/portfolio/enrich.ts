import { Address } from "viem";
import { createRpcClient } from "@/lib/client";
import { POSITION_MANAGER_V3_ABI, POOL_V3_ABI } from "./abis/v3";
import { getTokenMetadata } from "./pricing/tokens";
import { getSqrtRatioAtTick, getAmount0ForLiquidity, getAmount1ForLiquidity } from "./math";

export async function enrichV3Position(
  rpcUrl: string,
  positionManager: Address,
  tokenId: string
): Promise<{
  pool: string;
  token0: string;
  token1: string;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: string;
  tokensOwed0: string;
  tokensOwed1: string;
  amount0: string;
  amount1: string;
  inRange: boolean;
  currentTick: number;
  token0Symbol?: string;
  token1Symbol?: string;
  token0Decimals?: number;
  token1Decimals?: number;
}> {
  const client = createRpcClient(rpcUrl);

  // Get position details from position manager
  let position;
  try {
    position = await client.readContract({
      address: positionManager,
      abi: POSITION_MANAGER_V3_ABI,
      functionName: "positions",
      args: [BigInt(tokenId)],
    });
  } catch (error) {
    console.error(`[ENRICH] Failed to call positions() for tokenId ${tokenId}:`, error);
    return {
      pool: "",
      token0: "",
      token1: "",
      fee: 0,
      tickLower: 0,
      tickUpper: 0,
      liquidity: "0",
      tokensOwed0: "0",
      tokensOwed1: "0",
      amount0: "0",
      amount1: "0",
      inRange: false,
      currentTick: 0,
      token0Symbol: undefined,
      token1Symbol: undefined,
      token0Decimals: undefined,
      token1Decimals: undefined,
    };
  }

  // The result from viem is returned as a readonly tuple; widen via unknown
  const posArray = position as unknown as unknown[];
  if (posArray.length >= 12) {
    // Convert array to object
    const typedPosition = {
      nonce: posArray[0] as bigint,
      operator: posArray[1] as Address,
      token0: posArray[2] as Address,
      token1: posArray[3] as Address,
      fee: posArray[4] as number,
      tickLower: posArray[5] as number,
      tickUpper: posArray[6] as number,
      liquidity: posArray[7] as bigint,
      feeGrowthInside0LastX128: posArray[8] as bigint,
      feeGrowthInside1LastX128: posArray[9] as bigint,
      tokensOwed0: posArray[10] as bigint,
      tokensOwed1: posArray[11] as bigint,
    };

    const {
      token0,
      token1,
      fee,
      tickLower,
      tickUpper,
      liquidity,
      tokensOwed0,
      tokensOwed1,
    } = typedPosition;

    // Log for debugging
    console.log(`[ENRICH] Position ${tokenId} from ${positionManager}: token0=${token0}, token1=${token1}, fee=${fee}`);

    // Validate required fields
    if (!token0 || !token1) {
      console.error(`Position ${tokenId} on ${rpcUrl.slice(0, 30)}... returned null token addresses`);
      // Return default empty position instead of throwing
      return {
        pool: "",
        token0: "",
        token1: "",
        fee: 0,
        tickLower: 0,
        tickUpper: 0,
        liquidity: "0",
        tokensOwed0: "0",
        tokensOwed1: "0",
        amount0: "0",
        amount1: "0",
        inRange: false,
        currentTick: 0,
        token0Symbol: undefined,
        token1Symbol: undefined,
        token0Decimals: undefined,
        token1Decimals: undefined,
      };
    }

    // Get token metadata in parallel
    const [token0Meta, token1Meta] = await Promise.all([
      getTokenMetadata(rpcUrl, token0 as Address | undefined),
      getTokenMetadata(rpcUrl, token1 as Address | undefined),
    ]);

    // Pool identifier: deterministic from token0, token1, fee
    const pool = computePoolId(token0, token1, fee);

    // Get pool current tick via slot0
    let currentTick = 0;
    let inRange = false;

    try {
      const slot0 = await client.readContract({
        address: pool as Address,
        abi: POOL_V3_ABI,
        functionName: "slot0",
      }) as [bigint, number, number, number, number, number, boolean];

      currentTick = slot0[1];
      inRange = currentTick >= tickLower && currentTick <= tickUpper;
    } catch {
      // Pool might not be deployed or accessible
      inRange = false;
    }

    // Calculate amounts from liquidity + ticks
    let amount0 = "0";
    let amount1 = "0";

    if (liquidity > BigInt(0)) {
      const sqrtRatioAX96 = getSqrtRatioAtTick(tickLower);
      const sqrtRatioBX96 = getSqrtRatioAtTick(tickUpper);

      amount0 = getAmount0ForLiquidity(sqrtRatioAX96, sqrtRatioBX96, liquidity).toString();
      amount1 = getAmount1ForLiquidity(sqrtRatioAX96, sqrtRatioBX96, liquidity).toString();
    }

    return {
      pool: pool as unknown as string,
      token0: token0.toLowerCase(),
      token1: token1.toLowerCase(),
      fee,
      tickLower,
      tickUpper,
      liquidity: liquidity.toString(),
      tokensOwed0: tokensOwed0.toString(),
      tokensOwed1: tokensOwed1.toString(),
      amount0,
      amount1,
      inRange,
      currentTick,
      token0Symbol: token0Meta.symbol,
      token1Symbol: token1Meta.symbol,
      token0Decimals: token0Meta.decimals,
      token1Decimals: token1Meta.decimals,
    };
  }

  // Fallback: return empty position if result is not an array of expected length
  console.error(`[ENRICH] Unexpected position format for tokenId ${tokenId}: expected array of length >= 12, got ${posArray.length}`);
  return {
    pool: "",
    token0: "",
    token1: "",
    fee: 0,
    tickLower: 0,
    tickUpper: 0,
    liquidity: "0",
    tokensOwed0: "0",
    tokensOwed1: "0",
    amount0: "0",
    amount1: "0",
    inRange: false,
    currentTick: 0,
    token0Symbol: undefined,
    token1Symbol: undefined,
    token0Decimals: undefined,
    token1Decimals: undefined,
  };
}

function computePoolId(token0: Address, token1: Address, fee: number): string {
  // Deterministic pool identifier.
  // In a later step this can be replaced with a real pool address lookup.
  const sorted =
    token0.toLowerCase() < token1.toLowerCase()
      ? [token0, token1]
      : [token1, token0];

  const raw = `${sorted[0].toLowerCase()}-${sorted[1].toLowerCase()}-${fee}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
  }
  const padded = Math.abs(hash).toString(16).padStart(40, "0");
  return `0x${padded}`;
}
