/**
 * Soroban smart contract interaction helpers for LegacyX.
 * Builds, simulates, and submits Soroban transactions via Freighter.
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import { rpc } from '@stellar/stellar-sdk';
import { getSorobanServer, getHorizonServer, getNetworkPassphrase } from './stellar';
import { getTxUrl } from './stellarExpert';

const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || '';

export interface OnChainResult {
  txHash: string;
  stellarExpertUrl: string;
  onchainWillId?: number;
}

/**
 * Get the contract client address.
 */
function getContractAddress(): string {
  if (!CONTRACT_ID) {
    throw new Error(
      'VITE_CONTRACT_ID is not set. Deploy the contract first and set the env var.'
    );
  }
  return CONTRACT_ID;
}

/**
 * Build, simulate, sign via Freighter, and submit a Soroban contract invocation.
 */
async function invokeSorobanContract(
  callerPublicKey: string,
  functionName: string,
  args: StellarSdk.xdr.ScVal[],
  signTransaction: (xdr: string, opts: any) => Promise<string>
): Promise<OnChainResult> {
  const sorobanServer = getSorobanServer();
  const horizonServer = getHorizonServer();
  const networkPassphrase = getNetworkPassphrase();
  const contractAddress = getContractAddress();

  // Load account
  const account = await horizonServer.loadAccount(callerPublicKey);

  // Build the contract call transaction
  const contract = new StellarSdk.Contract(contractAddress);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: '1000000', // 0.1 XLM max fee for contract calls
    networkPassphrase,
  })
    .addOperation(contract.call(functionName, ...args))
    .setTimeout(60)
    .build();

  // Simulate the transaction
  const simResult = await sorobanServer.simulateTransaction(tx);

  if (rpc.Api.isSimulationError(simResult)) {
    throw new Error(`Simulation failed: ${(simResult as any).error}`);
  }

  // Assemble the transaction (adds resource fees, auth, etc.)
  const assembledTx = rpc.assembleTransaction(
    tx,
    simResult as rpc.Api.SimulateTransactionSuccessResponse
  ).build();

  const xdr = assembledTx.toXDR();

  // Sign with Freighter
  const signedXdr = await signTransaction(xdr, {
    networkPassphrase,
  });

  const signedTx = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    networkPassphrase
  );

  // Submit to network
  const sendResult = await sorobanServer.sendTransaction(
    signedTx as StellarSdk.Transaction
  );

  if (sendResult.status === 'ERROR') {
    throw new Error(`Transaction submission failed: ${sendResult.status}`);
  }

  // Poll for transaction completion
  let getResult: rpc.Api.GetTransactionResponse;
  const txHash = sendResult.hash;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    getResult = await sorobanServer.getTransaction(txHash);

    if (getResult.status !== rpc.Api.GetTransactionStatus.NOT_FOUND) {
      break;
    }

    // Wait 1 second before polling again
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  if (getResult.status === rpc.Api.GetTransactionStatus.FAILED) {
    throw new Error('Transaction failed on-chain');
  }

  // Extract return value if present
  let onchainWillId: number | undefined;
  if (
    getResult.status === rpc.Api.GetTransactionStatus.SUCCESS &&
    (getResult as any).returnValue
  ) {
    try {
      const returnVal = (getResult as any).returnValue;
      // u64 return value from create_will
      if (returnVal.switch && returnVal.switch().name === 'scvU64') {
        onchainWillId = Number(returnVal.u64());
      }
    } catch {
      // Not a u64 return value, that's fine
    }
  }

  return {
    txHash,
    stellarExpertUrl: getTxUrl(txHash),
    onchainWillId,
  };
}

/**
 * Create a will on-chain.
 */
export async function createWillOnChain(
  ownerPublicKey: string,
  beneficiaryPublicKey: string,
  assetContractId: string,
  amount: bigint,
  unlockTime: bigint,
  heartbeatInterval: bigint,
  signTransaction: (xdr: string, opts: any) => Promise<string>
): Promise<OnChainResult> {
  const args = [
    new StellarSdk.Address(ownerPublicKey).toScVal(),
    new StellarSdk.Address(beneficiaryPublicKey).toScVal(),
    new StellarSdk.Address(assetContractId).toScVal(),
    StellarSdk.nativeToScVal(amount, { type: 'i128' }),
    StellarSdk.nativeToScVal(unlockTime, { type: 'u64' }),
    StellarSdk.nativeToScVal(heartbeatInterval, { type: 'u64' }),
  ];

  return invokeSorobanContract(
    ownerPublicKey,
    'create_will',
    args,
    signTransaction
  );
}

/**
 * Send heartbeat on-chain.
 */
export async function sendHeartbeatOnChain(
  ownerPublicKey: string,
  willId: number,
  signTransaction: (xdr: string, opts: any) => Promise<string>
): Promise<OnChainResult> {
  const args = [
    new StellarSdk.Address(ownerPublicKey).toScVal(),
    StellarSdk.nativeToScVal(BigInt(willId), { type: 'u64' }),
  ];

  return invokeSorobanContract(
    ownerPublicKey,
    'heartbeat',
    args,
    signTransaction
  );
}

/**
 * Claim inheritance on-chain.
 */
export async function claimInheritanceOnChain(
  beneficiaryPublicKey: string,
  willId: number,
  signTransaction: (xdr: string, opts: any) => Promise<string>
): Promise<OnChainResult> {
  const args = [
    new StellarSdk.Address(beneficiaryPublicKey).toScVal(),
    StellarSdk.nativeToScVal(BigInt(willId), { type: 'u64' }),
  ];

  return invokeSorobanContract(
    beneficiaryPublicKey,
    'claim_inheritance',
    args,
    signTransaction
  );
}

/**
 * Cancel a will on-chain.
 */
export async function cancelWillOnChain(
  ownerPublicKey: string,
  willId: number,
  signTransaction: (xdr: string, opts: any) => Promise<string>
): Promise<OnChainResult> {
  const args = [
    new StellarSdk.Address(ownerPublicKey).toScVal(),
    StellarSdk.nativeToScVal(BigInt(willId), { type: 'u64' }),
  ];

  return invokeSorobanContract(
    ownerPublicKey,
    'cancel_will',
    args,
    signTransaction
  );
}

/**
 * Change beneficiary on-chain.
 */
export async function changeBeneficiaryOnChain(
  ownerPublicKey: string,
  willId: number,
  newBeneficiaryPublicKey: string,
  signTransaction: (xdr: string, opts: any) => Promise<string>
): Promise<OnChainResult> {
  const args = [
    new StellarSdk.Address(ownerPublicKey).toScVal(),
    StellarSdk.nativeToScVal(BigInt(willId), { type: 'u64' }),
    new StellarSdk.Address(newBeneficiaryPublicKey).toScVal(),
  ];

  return invokeSorobanContract(
    ownerPublicKey,
    'change_beneficiary',
    args,
    signTransaction
  );
}
