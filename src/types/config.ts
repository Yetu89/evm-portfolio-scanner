export interface RpcConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
}

export interface AppConfig {
  rpcs: RpcConfig[];
}
