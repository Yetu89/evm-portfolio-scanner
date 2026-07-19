import { createRpcClient } from "./client";
import { config } from "./config";

export function getRpcClient(name: string) {
  const rpc = config.rpcs.find((r) => r.name === name);

  if (!rpc) {
    throw new Error(`RPC "${name}" tidak ditemukan.`);
  }

  return createRpcClient(rpc.rpcUrl);
}
