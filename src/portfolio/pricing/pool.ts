import { Address } from "viem";
import { createRpcClient } from "@/lib/client";
import { POOL_V3_ABI } from "../abis/v3";

export async function getV3PoolData(
  rpcUrl: string,
  poolAddress: Address
): Promise<{
  currentTick: number;
  sqrtPriceX96: bigint;
  token0: Address;
  token1: Address;
  fee: number;
}> {
  const client = createRpcClient(rpcUrl);

  const [slot0, token0, token1, fee] = await Promise.all([
    client.readContract({
      address: poolAddress,
      abi: POOL_V3_ABI,
      functionName: "slot0",
    }) as Promise<[bigint, number, number, number, number, number, boolean]>,
    client.readContract({
      address: poolAddress,
      abi: POOL_V3_ABI,
      functionName: "token0",
    }) as Promise<Address>,
    client.readContract({
      address: poolAddress,
      abi: POOL_V3_ABI,
      functionName: "token1",
    }) as Promise<Address>,
    client.readContract({
      address: poolAddress,
      abi: POOL_V3_ABI,
      functionName: "fee",
    }) as Promise<number>,
  ]);

  const [sqrtPriceX96, tick] = slot0;

  return {
    currentTick: tick,
    sqrtPriceX96,
    token0,
    token1,
    fee,
  };
}
