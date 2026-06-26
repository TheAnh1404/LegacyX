/**
 * Stellar Expert URL helpers for LegacyX.
 */

const STELLAR_EXPERT_TX_BASE =
  import.meta.env.VITE_STELLAR_EXPERT_TX_URL ||
  'https://stellar.expert/explorer/testnet/tx';

const STELLAR_EXPERT_CONTRACT_BASE =
  'https://stellar.expert/explorer/testnet/contract';

/**
 * Build a Stellar Expert transaction URL from a transaction hash.
 */
export function getTxUrl(txHash: string): string {
  return `${STELLAR_EXPERT_TX_BASE}/${txHash}`;
}

/**
 * Build a Stellar Expert contract URL from a contract ID.
 */
export function getContractUrl(contractId: string): string {
  return `${STELLAR_EXPERT_CONTRACT_BASE}/${contractId}`;
}
