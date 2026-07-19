// Uniswap V3/V4 math utilities
// Official TickMath + LiquidityAmounts (Q64.96 fixed-point)
// All operations use BigInt only — never convert to Number mid-calculation.

export const Q96 = BigInt(2) ** BigInt(96);
const MAX_UINT256 = (BigInt(1) << BigInt(256)) - BigInt(1);
const MIN_TICK = -887272;
const MAX_TICK = 887272;

function mulShift(val: bigint, mulBy: bigint): bigint {
  return (val * mulBy) >> BigInt(128);
}

/**
 * Official TickMath.getSqrtRatioAtTick
 * Returns sqrt(1.0001^tick) * 2^96 as a Q64.96 fixed-point number.
 */
export function getSqrtRatioAtTick(tick: number): bigint {
  if (tick < MIN_TICK || tick > MAX_TICK) {
    throw new Error(`Tick out of bounds: ${tick}`);
  }

  const absTick = tick < 0 ? -tick : tick;

  let ratio =
    (absTick & 0x1) !== 0
      ? BigInt("0xfffcb933bd6fad37aa2d928a8a2bb0bb")
      : BigInt("0x100000000000000000000000000000000");

  if ((absTick & 0x2) !== 0)
    ratio = mulShift(ratio, BigInt("0xfff97272373d413259a46990580e213a"));
  if ((absTick & 0x4) !== 0)
    ratio = mulShift(ratio, BigInt("0xfff2e50f5f656932ef12357cf3c7fdcc"));
  if ((absTick & 0x8) !== 0)
    ratio = mulShift(ratio, BigInt("0xffe5caca7e10e4e61c3624eaa0941cd0"));
  if ((absTick & 0x10) !== 0)
    ratio = mulShift(ratio, BigInt("0xffcb9843d60f6159c9db58835c926644"));
  if ((absTick & 0x20) !== 0)
    ratio = mulShift(ratio, BigInt("0xff973b41fa98c081472e6896dfb254c0"));
  if ((absTick & 0x40) !== 0)
    ratio = mulShift(ratio, BigInt("0xff2ea16466c96a3843ec78b326b52861"));
  if ((absTick & 0x80) !== 0)
    ratio = mulShift(ratio, BigInt("0xfe5dee046a99a2a811c461f1969c3053"));
  if ((absTick & 0x100) !== 0)
    ratio = mulShift(ratio, BigInt("0xfcbe86c7900a88aedcffc83b479aa3a4"));
  if ((absTick & 0x200) !== 0)
    ratio = mulShift(ratio, BigInt("0xf987a7253ac413176f2b074cf7815e54"));
  if ((absTick & 0x400) !== 0)
    ratio = mulShift(ratio, BigInt("0xf3392b0822b70005940c7a398e4b70f3"));
  if ((absTick & 0x800) !== 0)
    ratio = mulShift(ratio, BigInt("0xe7159475a2c29b7443b29c7fa6e889d9"));
  if ((absTick & 0x1000) !== 0)
    ratio = mulShift(ratio, BigInt("0xd097f3bdfd2022b8845ad8f792aa5825"));
  if ((absTick & 0x2000) !== 0)
    ratio = mulShift(ratio, BigInt("0xa9f746462d870fdf8a65dc1f90e061e5"));
  if ((absTick & 0x4000) !== 0)
    ratio = mulShift(ratio, BigInt("0x70d869a156d2a1b890bb3df62baf32f7"));
  if ((absTick & 0x8000) !== 0)
    ratio = mulShift(ratio, BigInt("0x31be135f97d08fd981231505542fcfa6"));
  if ((absTick & 0x10000) !== 0)
    ratio = mulShift(ratio, BigInt("0x9aa508b5b7a84e1c677de54f3e99bc9"));
  if ((absTick & 0x20000) !== 0)
    ratio = mulShift(ratio, BigInt("0x5d6af8dedb81196699c329225ee604"));
  if ((absTick & 0x40000) !== 0)
    ratio = mulShift(ratio, BigInt("0x2216e584f5fa1ea926041bedfe98"));
  if ((absTick & 0x80000) !== 0)
    ratio = mulShift(ratio, BigInt("0x48a170391f7dc42444e8fa2"));

  if (tick > 0) {
    ratio = MAX_UINT256 / ratio;
  }

  // Downcast to Q64.96, rounding up to match TickMath.sol
  const shift32 = BigInt(32);
  return (ratio >> shift32) + (ratio % (BigInt(1) << shift32) === BigInt(0) ? BigInt(0) : BigInt(1));
}

/**
 * LiquidityAmounts.getAmount0ForLiquidity
 * amount0 = L * (sqrt(upper) - sqrt(lower)) / (sqrt(upper) * sqrt(lower))
 */
export function getAmount0ForLiquidity(
  sqrtRatioAX96: bigint,
  sqrtRatioBX96: bigint,
  liquidity: bigint
): bigint {
  if (liquidity === BigInt(0)) return BigInt(0);
  if (sqrtRatioAX96 > sqrtRatioBX96) {
    [sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96];
  }
  if (sqrtRatioAX96 === BigInt(0) || sqrtRatioBX96 === BigInt(0)) return BigInt(0);

  const intermediate = (liquidity << BigInt(96)) / sqrtRatioBX96;
  return (intermediate * (sqrtRatioBX96 - sqrtRatioAX96)) / sqrtRatioAX96;
}

/**
 * LiquidityAmounts.getAmount1ForLiquidity
 * amount1 = L * (sqrt(upper) - sqrt(lower))
 */
export function getAmount1ForLiquidity(
  sqrtRatioAX96: bigint,
  sqrtRatioBX96: bigint,
  liquidity: bigint
): bigint {
  if (liquidity === BigInt(0)) return BigInt(0);
  if (sqrtRatioAX96 > sqrtRatioBX96) {
    [sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96];
  }

  return (liquidity * (sqrtRatioBX96 - sqrtRatioAX96)) / Q96;
}

/**
 * LiquidityAmounts.getAmountsForLiquidity
 * Computes token amounts based on current price relative to the position range.
 *
 * - price <= lower  → all token0
 * - lower < price < upper → mix of both
 * - price >= upper  → all token1
 */
export function getAmountsForLiquidity(
  sqrtRatioX96: bigint,
  sqrtRatioAX96: bigint,
  sqrtRatioBX96: bigint,
  liquidity: bigint
): { amount0: bigint; amount1: bigint } {
  if (liquidity === BigInt(0)) return { amount0: BigInt(0), amount1: BigInt(0) };

  if (sqrtRatioAX96 > sqrtRatioBX96) {
    [sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96];
  }

  if (sqrtRatioX96 <= sqrtRatioAX96) {
    return {
      amount0: getAmount0ForLiquidity(sqrtRatioAX96, sqrtRatioBX96, liquidity),
      amount1: BigInt(0),
    };
  }

  if (sqrtRatioX96 < sqrtRatioBX96) {
    return {
      amount0: getAmount0ForLiquidity(sqrtRatioX96, sqrtRatioBX96, liquidity),
      amount1: getAmount1ForLiquidity(sqrtRatioAX96, sqrtRatioX96, liquidity),
    };
  }

  return {
    amount0: BigInt(0),
    amount1: getAmount1ForLiquidity(sqrtRatioAX96, sqrtRatioBX96, liquidity),
  };
}
