export interface RpcConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
}

export const config: { rpcs: RpcConfig[] } = {
  rpcs: [],
};

export function registerRpc(
  name: string,
  chainId: number,
  rpcUrl: string
) {
  config.rpcs.push({
    name,
    chainId,
    rpcUrl,
  });
}
