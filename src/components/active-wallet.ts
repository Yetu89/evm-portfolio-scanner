/**
 * Active wallet state — persisted in localStorage.
 * Set whenever a wallet is successfully scanned.
 * Used by Sidebar to navigate Portfolio / Positions / Tokens.
 */

const STORAGE_KEY = "wallet-portfolio-active-wallet";

export function getActiveWallet(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setActiveWallet(wallet: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, wallet.toLowerCase());
  } catch {
    // quota — silently ignore
  }
}

export function clearActiveWallet(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
