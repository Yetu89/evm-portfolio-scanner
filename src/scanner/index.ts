import { Address } from "viem";
import { Position, protocols } from "@/protocols";
import { chains, ChainConfig } from "@/chains/config";

const DEFAULT_CONCURRENCY = 4;

async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<T[]> {
  const results: T[] = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const taskIndex = index++;
      try {
        results[taskIndex] = await tasks[taskIndex]();
      } catch (error) {
        console.error(`Task ${taskIndex} failed:`, error);
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, tasks.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

function scanChainForWallet(
  wallet: `0x${string}`,
  chain: ChainConfig
): Promise<Position[]> {
  const tasks = chain.protocols.map((protocolConfig) => {
    return async (): Promise<Position[]> => {
      const protocol = protocols.find((p) => p.id === protocolConfig.id);
      if (!protocol) {
        console.error(`Protocol ${protocolConfig.id} not found`);
        return [];
      }

      try {
        return await protocol.scan(wallet, chain, protocolConfig);
      } catch (error) {
        console.error(
          `Failed to scan ${protocolConfig.name} on ${chain.name} for ${wallet}:`,
          error
        );
        return [];
      }
    };
  });

  return Promise.all(tasks.map((t) => t())).then((r) => r.flat());
}

export async function scanWalletsAcrossChains(
  wallets: string[],
  concurrency: number = DEFAULT_CONCURRENCY
): Promise<Position[]> {
  const tasks: (() => Promise<Position[]>)[] = [];

  for (const wallet of wallets) {
    for (const chain of chains) {
      tasks.push(() =>
        scanChainForWallet(wallet as `0x${string}`, chain)
      );
    }
  }

  const results = await runWithConcurrency(tasks, concurrency);
  return results.flat();
}

export async function scanWallet(wallet: Address): Promise<Position[]> {
  return scanWalletsAcrossChains([wallet]);
}
