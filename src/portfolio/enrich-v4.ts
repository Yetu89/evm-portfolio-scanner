import { Address, encodeAbiParameters, keccak256, parseAbiParameters } from "viem";
import { createRpcClient } from "@/lib/client";
import { POSITION_MANAGER_V4_ABI, STATE_VIEW_V4_ABI } from "./abis/v4";
import { getTokenMetadata } from "./pricing/tokens";
import {
  getSqrtRatioAtTick,
  getAmountsForLiquidity,
} from "./math";

/**
 * Official Uniswap V4 PositionInfo layout (from PositionInfoLibrary.sol):
 *
 *   bits 0-7:    hasSubscriber (uint8)
 *   bits 8-31:   tickLower     (int24)
 *   bits 32-55:  tickUpper     (int24)
 *   bits 56-255: poolId truncated (uint200)
 *
 * Liquidity is NOT packed here — read via getPositionLiquidity(tokenId).
 */
function toInt24(raw: bigint): number {
  let n = Number(raw & BigInt(0xffffff));
  if (n >= 0x800000) n -= 0x1000000;
  return n;
}

function decodeV4PositionInfo(packedInfo: bigint): {
  tickLower: number;
  tickUpper: number;
} {
  const tickLower = toInt24(packedInfo >> BigInt(8));
  const tickUpper = toInt24(packedInfo >> BigInt(32));

  console.log(
    `[V4-DECODE] packed=${packedInfo.toString()} → tickLower=${tickLower}, tickUpper=${tickUpper}`
  );

  return { tickLower, tickUpper };
}

/**
 * Compute V4 PoolId = keccak256(abi.encode(PoolKey))
 */
function computePoolId(poolKey: {
  currency0: Address;
  currency1: Address;
  fee: number;
  tickSpacing: number;
  hooks: Address;
}): `0x${string}` {
  return keccak256(
    encodeAbiParameters(
      parseAbiParameters(
        "address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks"
      ),
      [
        poolKey.currency0,
        poolKey.currency1,
        poolKey.fee,
        poolKey.tickSpacing,
        poolKey.hooks,
      ]
    )
  );
}

export async function enrichV4Position(
  rpcUrl: string,
  positionManager: Address,
  tokenId: string,
  stateViewAddress?: Address
): Promise<{ pool: string; token0: string; token1: string; fee: number; tickLower: number; tickUpper: number; liquidity: string; tokensOwed0: string; tokensOwed1: string; amount0: string; amount1: string; inRange: boolean; currentTick: number; token0Symbol?: string; token1Symbol?: string; token0Decimals?: number; token1Decimals?: number; } | null> {
  console.log(
    `[V4-ENRICH] Starting enrichment for tokenId=${tokenId}, manager=${positionManager}`
  );

  const client = createRpcClient(rpcUrl);

  const empty = {
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
    token0Symbol: undefined as string | undefined,
    token1Symbol: undefined as string | undefined,
    token0Decimals: undefined as number | undefined,
    token1Decimals: undefined as number | undefined,
  };

  // ── 1. Read poolKey + packed PositionInfo ──────────────────────
  let poolResult;
  try {
    poolResult = await client.readContract({
      address: positionManager,
      abi: POSITION_MANAGER_V4_ABI,
      functionName: "getPoolAndPositionInfo",
      args: [BigInt(tokenId)],
    });
  } catch (error) {
    console.error(
      `[V4-ENRICH] Failed getPoolAndPositionInfo for tokenId ${tokenId}:`,
      error
    );
    return empty;
  }

  const poolResultTuple = poolResult as unknown as readonly [unknown, bigint];
  const poolKeyRaw = poolResultTuple[0];
  const packedPositionInfo = poolResultTuple[1];

  let currency0: Address | undefined;
  let currency1: Address | undefined;
  let fee = 0;
  let tickSpacing = 0;
  let hooks: Address = "0x0000000000000000000000000000000000000000";

  if (Array.isArray(poolKeyRaw)) {
    currency0 = poolKeyRaw[0] as Address;
    currency1 = poolKeyRaw[1] as Address;
    fee = poolKeyRaw[2] as number;
    tickSpacing = poolKeyRaw[3] as number;
    hooks = poolKeyRaw[4] as Address;
  } else if (typeof poolKeyRaw === "object" && poolKeyRaw !== null) {
    const pk = poolKeyRaw as {
      currency0: Address;
      currency1: Address;
      fee: number;
      tickSpacing: number;
      hooks: Address;
    };
    currency0 = pk.currency0;
    currency1 = pk.currency1;
    fee = pk.fee;
    tickSpacing = pk.tickSpacing;
    hooks = pk.hooks;
  }

  if (!currency0 || !currency1) {
    console.error(
      `[V4-ENRICH] Position ${tokenId}: missing token addresses from poolKey`
    );
    return empty;
  }

  // ── 2. Decode ticks from packed PositionInfo ───────────────────
  const { tickLower, tickUpper } = decodeV4PositionInfo(packedPositionInfo);

  // ── 3. Read real liquidity via getPositionLiquidity ────────────
  let liquidity = BigInt(0);
  try {
    liquidity = (await client.readContract({
      address: positionManager,
      abi: POSITION_MANAGER_V4_ABI,
      functionName: "getPositionLiquidity",
      args: [BigInt(tokenId)],
    })) as bigint;
    console.log(`[V4-ENRICH] getPositionLiquidity(${tokenId}) = ${liquidity}`);
  } catch (error) {
    console.error(
      `[V4-ENRICH] Failed getPositionLiquidity for tokenId ${tokenId}:`,
      error
    );
  }

  // ── 4. Token metadata ──────────────────────────────────────────
  const [token0Meta, token1Meta] = await Promise.all([
    getTokenMetadata(rpcUrl, currency0),
    getTokenMetadata(rpcUrl, currency1),
  ]);

  // ── 5. Compute poolId and read current price from StateView ────
  const poolKey = {
    currency0,
    currency1,
    fee,
    tickSpacing,
    hooks,
  };
  const poolId = computePoolId(poolKey);

  let currentTick = 0;
  let sqrtPriceX96 = BigInt(0);
  let inRange = false;

  if (stateViewAddress) {
    try {
      const slot0 = (await client.readContract({
        address: stateViewAddress,
        abi: STATE_VIEW_V4_ABI,
        functionName: "getSlot0",
        args: [poolId],
      })) as [bigint, number, number, number];

      sqrtPriceX96 = slot0[0];
      currentTick = slot0[1];
      // V4: position is active when tickLower <= currentTick < tickUpper
      inRange = currentTick >= tickLower && currentTick < tickUpper;

      console.log(
        `[V4-ENRICH] StateView slot0: sqrtPriceX96=${sqrtPriceX96}, tick=${currentTick}, inRange=${inRange}`
      );
    } catch (err) {
      console.log(
        `[V4-ENRICH] Failed StateView.getSlot0 for poolId ${poolId}:`,
        err
      );
    }
  } else {
    console.log(
      `[V4-ENRICH] No stateView configured — amounts will use range-only estimate`
    );
  }

  // ── 6. Compute amounts (all BigInt) ────────────────────────────
  // amount0 / amount1 are stored as raw token units (not human-readable).
  // Decimal conversion happens only at display/pricing time.
  let amount0 = BigInt(0);
  let amount1 = BigInt(0);

  if (liquidity > BigInt(0)) {
    try {
      const sqrtRatioAX96 = getSqrtRatioAtTick(tickLower);
      const sqrtRatioBX96 = getSqrtRatioAtTick(tickUpper);

      if (sqrtPriceX96 > BigInt(0)) {
        // Correct: use current price relative to range
        const amounts = getAmountsForLiquidity(
          sqrtPriceX96,
          sqrtRatioAX96,
          sqrtRatioBX96,
          liquidity
        );
        amount0 = amounts.amount0;
        amount1 = amounts.amount1;
      } else {
        // Fallback when StateView unavailable: treat as full-range amounts
        // (overestimates if position is out of range, but better than 0)
        amount0 = BigInt(0);
        amount1 = BigInt(0);
        console.log(
          `[V4-ENRICH] No sqrtPriceX96 available — amounts set to 0 for tokenId ${tokenId}`
        );
      }
    } catch (err) {
      console.error(
        `[V4-ENRICH] Amount calculation failed for tokenId ${tokenId}:`,
        err
      );
    }
  }

  // Skip inactive positions (liquidity=0 means closed/empty)
  if (liquidity === BigInt(0)) {
    console.log(`[V4-ENRICH] Position ${tokenId} inactive (liquidity=0) — skipping`);
    return null;
  }

  console.log(
    `[V4-ENRICH] Final result for tokenId ${tokenId}:`,
    JSON.stringify({
      pool: poolId,
      token0: currency0,
      token1: currency1,
      fee,
      tickLower,
      tickUpper,
      liquidity: liquidity.toString(),
      amount0: amount0.toString(),
      amount1: amount1.toString(),
      inRange,
      currentTick,
      token0Symbol: token0Meta.symbol,
      token1Symbol: token1Meta.symbol,
      token0Decimals: token0Meta.decimals,
      token1Decimals: token1Meta.decimals,
    })
  );

  return {
    pool: poolId,
    token0: currency0.toLowerCase(),
    token1: currency1.toLowerCase(),
    fee,
    tickLower,
    tickUpper,
    liquidity: liquidity.toString(),
    tokensOwed0: "0",
    tokensOwed1: "0",
    amount0: amount0.toString(),
    amount1: amount1.toString(),
    inRange,
    currentTick,
    token0Symbol: token0Meta.symbol,
    token1Symbol: token1Meta.symbol,
    token0Decimals: token0Meta.decimals,
    token1Decimals: token1Meta.decimals,
  };
}
