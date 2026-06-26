// Freighter wallet utility helpers
// Updated to support real @stellar/freighter-api v6.0.0+ object response types with mock fallback

import {
  isConnected as freighterIsConnected,
  getAddress as freighterGetAddress,
  signTransaction as freighterSignTransaction,
  getNetwork as freighterGetNetwork,
  isAllowed as freighterIsAllowed,
  requestAccess as freighterRequestAccess,
} from '@stellar/freighter-api';

export interface FreighterWalletState {
  isInstalled: boolean;
  isConnected: boolean;
  publicKey: string | null;
  network: 'TESTNET' | 'PUBLIC' | null;
  status: 'not_installed' | 'disconnected' | 'connecting' | 'connected' | 'wrong_network';
  error: string | null;
}

// Mock public key for development fallback
export const MOCK_STELLAR_ADDRESS = "GCSWJMLLHI3P6Z74CSTHG6I2X2I4T5TMTQ2T4WLUZSSQL26W5G45ABCD";

/**
 * Checks if Freighter extension is installed in the browser.
 */
export async function isFreighterInstalled(): Promise<boolean> {
  try {
    const result = await freighterIsConnected();
    return !!(typeof result === 'boolean' ? result : result?.isConnected);
  } catch {
    // Fallback: check window object
    const win = window as any;
    return !!(win.stellarKeys || win.freighterApi);
  }
}

/**
 * Connect to Freighter on Testnet.
 * Verifies Freighter is installed, requests access, checks network is TESTNET.
 * Returns the real public key from Freighter, or mock address if not installed.
 */
export async function connectFreighterTestnet(useMockFallback: boolean = true): Promise<{
  publicKey: string;
  network: 'TESTNET' | 'PUBLIC';
  isReal: boolean;
}> {
  try {
    const connectedResult = await freighterIsConnected();
    const isInstalled = !!(typeof connectedResult === 'boolean' ? connectedResult : connectedResult?.isConnected);

    if (!isInstalled) {
      if (useMockFallback) {
        await new Promise(resolve => setTimeout(resolve, 800));
        return { publicKey: MOCK_STELLAR_ADDRESS, network: 'TESTNET', isReal: false };
      }
      throw new Error('Freighter wallet is not installed');
    }

    // Request access if not already allowed
    const allowedResult = await freighterIsAllowed();
    const allowed = !!(typeof allowedResult === 'boolean' ? allowedResult : allowedResult?.isAllowed);
    if (!allowed) {
      const accessResult = await freighterRequestAccess();
      if (accessResult?.error) {
        throw new Error(`Freighter access request failed: ${accessResult.error}`);
      }
    }

    // Get and verify network
    const networkDetails = await freighterGetNetwork();
    if (networkDetails?.error) {
      throw new Error(`Failed to get network: ${networkDetails.error}`);
    }
    const networkName = networkDetails?.network || '';

    if (networkName.toUpperCase() !== 'TESTNET') {
      throw new Error(
        `Wrong network: ${networkName}. Please switch Freighter to Stellar Testnet.`
      );
    }

    // Get public key
    const addressResult = await freighterGetAddress();
    if (addressResult?.error) {
      throw new Error(`Failed to get address: ${addressResult.error}`);
    }
    const publicKey = typeof addressResult === 'string'
      ? addressResult
      : addressResult?.address;

    if (!publicKey) {
      throw new Error('Failed to retrieve public key from Freighter');
    }

    return { publicKey, network: 'TESTNET', isReal: true };
  } catch (err: any) {
    const errorMsg = err?.message || '';
    const isInstallationError = errorMsg.includes('not installed') || errorMsg.includes('isNotInstalled') || !(window as any).stellarKeys;

    if (useMockFallback && (isInstallationError || errorMsg === '')) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return { publicKey: MOCK_STELLAR_ADDRESS, network: 'TESTNET', isReal: false };
    }
    throw err;
  }
}

/**
 * Retrieves the connected public key from Freighter.
 * Falls back to mock address if requested or if extension is missing (for demo purposes).
 */
export async function getFreighterPublicKey(useMockFallback: boolean = true): Promise<string> {
  try {
    const connectedResult = await freighterIsConnected();
    const connected = !!(typeof connectedResult === 'boolean' ? connectedResult : connectedResult?.isConnected);
    if (connected) {
      const addressResult = await freighterGetAddress();
      const publicKey = typeof addressResult === 'string'
        ? addressResult
        : addressResult?.address;
      if (publicKey) return publicKey;
    }
  } catch (err) {
    console.warn("Freighter extension found but failed to fetch public key:", err);
  }

  if (useMockFallback) {
    // Return mock key after a brief simulated delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return MOCK_STELLAR_ADDRESS;
  }

  throw new Error("Freighter not connected");
}

/**
 * Signs a transaction XDR with Freighter.
 * Falls back to simulated signature if requested.
 */
export async function signWithFreighter(
  txXdr: string,
  _network: string = 'TESTNET',
  useMockFallback: boolean = true
): Promise<string> {
  try {
    const connectedResult = await freighterIsConnected();
    const connected = !!(typeof connectedResult === 'boolean' ? connectedResult : connectedResult?.isConnected);
    if (connected) {
      const result = await freighterSignTransaction(txXdr, {
        networkPassphrase: 'Test SDF Network ; September 2015',
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      const signedTx = typeof result === 'string' ? result : result?.signedTxXdr;
      if (signedTx) return signedTx;
    }
  } catch (err) {
    console.error("Freighter signing failed:", err);
    if (!useMockFallback) throw err;
  }

  if (useMockFallback) {
    // Simulate signature delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return "signed_mock_xdr_" + Math.random().toString(36).substr(2, 9);
  }

  throw new Error("Freighter not available for signing");
}

/**
 * Formats a Stellar public key for display.
 * E.g., GCSW...ABCD
 */
export function truncateAddress(address: string | null): string {
  if (!address) return "";
  if (address.length <= 12) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`;
}
