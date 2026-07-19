import { createPublicClient, http, PublicClient } from "viem";

const clients = new Map<string, PublicClient>();

export function createRpcClient(rpcUrl: string): PublicClient {
  let client = clients.get(rpcUrl);

  if (!client) {
    client = createPublicClient({
      transport: http(rpcUrl),
    });

    clients.set(rpcUrl, client);
  }

  return client;
}
