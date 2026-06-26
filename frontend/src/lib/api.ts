/**
 * Backend API client for LegacyX.
 * Communicates with the NestJS backend for off-chain metadata storage.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API Error ${response.status}: ${errorBody}`);
  }

  return response.json();
}

// ========================
// Health
// ========================

export const apiHealth = () => request<{ status: string }>('/health');

// ========================
// Users
// ========================

export const apiCreateProfile = (data: {
  walletAddress: string;
  displayName?: string;
  email?: string;
}) => request('/users/profile', { method: 'POST', body: JSON.stringify(data) });

export const apiGetMe = (walletAddress: string) =>
  request(`/users/me?walletAddress=${walletAddress}`);

export const apiUpdateProfile = (
  walletAddress: string,
  data: { displayName?: string; email?: string }
) =>
  request(`/users/me?walletAddress=${walletAddress}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

// ========================
// Wallets
// ========================

export const apiLinkWallet = (data: {
  userId: string;
  walletAddress: string;
  isPrimary?: boolean;
}) =>
  request('/wallets/link', { method: 'POST', body: JSON.stringify(data) });

export const apiGetWallet = (walletAddress: string) =>
  request(`/wallets/${walletAddress}`);

// ========================
// Wills
// ========================

export const apiCreateWill = (data: {
  ownerWallet: string;
  beneficiaryWallet: string;
  asset: string;
  amount: string;
  unlockTime: string;
  heartbeatInterval: number;
  createTxHash?: string;
  onchainWillId?: number;
}) => request('/wills', { method: 'POST', body: JSON.stringify(data) });

export const apiGetWills = () => request('/wills');

export const apiGetWill = (id: string) => request(`/wills/${id}`);

export const apiGetWillsByOwner = (walletAddress: string) =>
  request(`/wills/owner/${walletAddress}`);

export const apiGetWillsByBeneficiary = (walletAddress: string) =>
  request(`/wills/beneficiary/${walletAddress}`);

export const apiUpdateWillOnchain = (
  id: string,
  data: { onchainWillId: number; createTxHash: string }
) =>
  request(`/wills/${id}/onchain`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const apiUpdateWillHeartbeat = (
  id: string,
  data: { heartbeatTxHash: string }
) =>
  request(`/wills/${id}/heartbeat`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const apiUpdateWillClaim = (
  id: string,
  data: { claimTxHash: string }
) =>
  request(`/wills/${id}/claim`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const apiUpdateWillCancel = (
  id: string,
  data: { cancelTxHash: string }
) =>
  request(`/wills/${id}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const apiUpdateWillBeneficiary = (
  id: string,
  data: { newBeneficiaryWallet: string; changeBeneficiaryTxHash: string }
) =>
  request(`/wills/${id}/beneficiary`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

// ========================
// Transactions
// ========================

export const apiCreateTransaction = (data: {
  userId?: string;
  willId?: string;
  walletAddress: string;
  type: string;
  txHash: string;
  status?: string;
}) =>
  request('/transactions', { method: 'POST', body: JSON.stringify(data) });

export const apiGetTransactionsByWallet = (walletAddress: string) =>
  request(`/transactions/wallet/${walletAddress}`);

export const apiGetTransactionsByWill = (willId: string) =>
  request(`/transactions/will/${willId}`);

// ========================
// Reminders
// ========================

export const apiCreateReminder = (data: {
  userId?: string;
  willId: string;
  email: string;
  reminderTime: string;
}) =>
  request('/reminders', { method: 'POST', body: JSON.stringify(data) });

export const apiGetRemindersByWallet = (walletAddress: string) =>
  request(`/reminders/wallet/${walletAddress}`);
