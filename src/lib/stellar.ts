/**
 * Stellar SDK integration helpers for LegacyX.
 * Connects to Stellar Testnet Horizon and provides balance queries.
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import { rpc } from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const RPC_URL =
  import.meta.env.VITE_STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE =
  import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE ||
  'Test SDF Network ; September 2015';

/**
 * Get a Horizon server instance (Testnet).
 */
export function getHorizonServer(): StellarSdk.Horizon.Server {
  return new StellarSdk.Horizon.Server(HORIZON_URL);
}

/**
 * Get a Soroban RPC server instance (Testnet).
 */
export function getSorobanServer(): rpc.Server {
  return new rpc.Server(RPC_URL);
}

/**
 * Get the network passphrase.
 */
export function getNetworkPassphrase(): string {
  return NETWORK_PASSPHRASE;
}

/**
 * Get the XLM balance for a Stellar address.
 * Returns the native balance as a string, or "0" if account not found.
 */
export async function getWalletBalance(publicKey: string): Promise<string> {
  try {
    const server = getHorizonServer();
    const account = await server.loadAccount(publicKey);
    const nativeBalance = account.balances.find(
      (b: any) => b.asset_type === 'native'
    );
    return nativeBalance ? nativeBalance.balance : '0';
  } catch (err: any) {
    if (err?.response?.status === 404) {
      // Account not found / not funded
      return '0';
    }
    console.error('Failed to fetch wallet balance:', err);
    return '0';
  }
}

/**
 * Get all balances for a Stellar address.
 */
export async function getWalletBalances(
  publicKey: string
): Promise<Array<{ asset: string; balance: string }>> {
  try {
    const server = getHorizonServer();
    const account = await server.loadAccount(publicKey);
    return account.balances.map((b: any) => ({
      asset: b.asset_type === 'native' ? 'XLM' : `${b.asset_code}`,
      balance: b.balance,
    }));
  } catch {
    return [{ asset: 'XLM', balance: '0' }];
  }
}

/**
 * Send a small XLM payment (for Level 1 proof-of-transaction).
 * Returns the transaction hash.
 */
export async function sendTestPayment(
  sourcePublicKey: string,
  signTransaction: (xdr: string, opts: any) => Promise<string>
): Promise<{ txHash: string }> {
  const server = getHorizonServer();
  const account = await server.loadAccount(sourcePublicKey);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: sourcePublicKey, // self-payment for minimal test
        asset: StellarSdk.Asset.native(),
        amount: '0.01',
      })
    )
    .setTimeout(30)
    .build();

  const xdr = tx.toXDR();

  // Sign with Freighter
  const signedXdr = await signTransaction(xdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  const signedTx = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    NETWORK_PASSPHRASE
  );

  const result = await server.submitTransaction(
    signedTx as StellarSdk.Transaction
  );

  return { txHash: (result as any).hash };
}
