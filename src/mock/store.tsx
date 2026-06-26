import React, { createContext, useContext, useState, useEffect } from 'react';
import { connectFreighterTestnet, isFreighterInstalled, signWithFreighter, MOCK_STELLAR_ADDRESS, truncateAddress } from '../lib/freighter';
import { getWalletBalance } from '../lib/stellar';
import {
  createWillOnChain,
  sendHeartbeatOnChain,
  claimInheritanceOnChain,
  cancelWillOnChain,
  changeBeneficiaryOnChain,
  type OnChainResult,
} from '../lib/soroban';
import {
  apiCreateProfile,
  apiGetMe,
  apiUpdateProfile,
  apiCreateWill,
  apiGetWillsByOwner,
  apiGetWillsByBeneficiary,
  apiUpdateWillHeartbeat,
  apiUpdateWillClaim,
  apiUpdateWillCancel,
  apiUpdateWillBeneficiary,
  apiCreateTransaction,
  apiGetTransactionsByWallet,
} from '../lib/api';


export interface Will {
  id: string;
  title: string;
  owner: string;
  beneficiary: string;
  amount: number;
  asset: 'XLM' | 'USDC' | 'yXLM' | 'AQUA';
  heartbeatInterval: number; // in days
  lastHeartbeat: string; // ISO string
  unlockTime: string; // ISO string
  status: 'ACTIVE' | 'CLAIMED' | 'CANCELLED';
  txHash: string;
  onchainWillId?: number;
}

export interface Transaction {
  hash: string;
  type: 'CREATE_WILL' | 'HEARTBEAT' | 'CANCEL_WILL' | 'CLAIM_WILL' | 'CHANGE_BENEFICIARY';
  willTitle: string;
  timestamp: string; // ISO string
  status: 'SUCCESS' | 'FAILED';
  amount?: number;
  asset?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  timestamp: string; // ISO string
  read: boolean;
}

interface UserProfile {
  displayName: string;
  email: string;
  emailNotifications: boolean;
}

interface AppStateContextType {
  // Wallet state
  isInstalled: boolean;
  isConnected: boolean;
  walletAddress: string | null;
  walletError: string | null;
  isConnecting: boolean;
  isSigning: boolean;
  network: 'TESTNET' | 'PUBLIC';
  walletBalance: string;
  isRealWallet: boolean;
  
  // Profile
  profile: UserProfile;
  
  // Data lists
  wills: Will[];
  transactions: Transaction[];
  notifications: NotificationItem[];
  
  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  updateProfile: (name: string, email: string, emailNotifications: boolean) => void;
  createWill: (title: string, beneficiary: string, amount: number, asset: 'XLM' | 'USDC' | 'yXLM' | 'AQUA', heartbeatInterval: number) => Promise<boolean>;
  sendHeartbeat: (willId: string) => Promise<boolean>;
  cancelWill: (willId: string) => Promise<boolean>;
  claimWill: (willId: string) => Promise<boolean>;
  changeBeneficiary: (willId: string, newBeneficiary: string) => Promise<boolean>;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  resetMockData: () => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

// Helper to generate transaction hashes (mock fallback)
const generateTxHash = () => "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

// Initial mock data to ensure the UI looks complete right away
const INITIAL_WILLS: Will[] = [
  {
    id: "will_1",
    title: "Primary Savings Lock",
    owner: MOCK_STELLAR_ADDRESS,
    beneficiary: "GDB2F54JSHJSHJSAHJSAHJSAGSCSCSCAHJSAGS123456",
    amount: 15000,
    asset: "XLM",
    heartbeatInterval: 30, // days
    lastHeartbeat: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    unlockTime: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days remaining
    status: "ACTIVE",
    txHash: "0x3f58a5f82a9c3365de0192aef34f19b88c886df444a1936c5dfd8a88bf2461ab"
  },
  {
    id: "will_2",
    title: "USDC Stable Reserve",
    owner: MOCK_STELLAR_ADDRESS,
    beneficiary: "GCABCDF54JSHJSHJSAHJSAHJSAGSCSCSCAHJSAGS55555",
    amount: 2500,
    asset: "USDC",
    heartbeatInterval: 90, // days
    lastHeartbeat: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), // 40 days ago
    unlockTime: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(), // 50 days remaining
    status: "ACTIVE",
    txHash: "0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
  },
  {
    id: "will_3",
    title: "Venture Liquidity",
    owner: "GDVEN54JSHJSHJSAHJSAHJSAGSCSCSCAHJSAGS654321", // User is beneficiary
    beneficiary: MOCK_STELLAR_ADDRESS, // Connected user
    amount: 12500,
    asset: "yXLM",
    heartbeatInterval: 14, // days
    // Last heartbeat was 16 days ago, interval was 14 days, so it is CLAIMABLE!
    lastHeartbeat: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    unlockTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Unlocked 2 days ago
    status: "ACTIVE",
    txHash: "0x88f2461ab3f58a5f82a9c3365de0192aef34f19b8c886df444a1936c5dfd8a88"
  },
  {
    id: "will_4",
    title: "AQUA Staking Allocation",
    owner: MOCK_STELLAR_ADDRESS,
    beneficiary: "GDB2F54JSHJSHJSAHJSAHJSAGSCSCSCAHJSAGS123456",
    amount: 80000,
    asset: "AQUA",
    heartbeatInterval: 180,
    lastHeartbeat: new Date(Date.now() - 175 * 24 * 60 * 60 * 1000).toISOString(),
    unlockTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "ACTIVE",
    txHash: "0xc8d8e9f0a1b2a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6"
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    hash: "0x3f58a5f82a9c3365de0192aef34f19b88c886df444a1936c5dfd8a88bf2461ab",
    type: "CREATE_WILL",
    willTitle: "Primary Savings Lock",
    timestamp: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    status: "SUCCESS",
    amount: 15000,
    asset: "XLM"
  },
  {
    hash: "0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
    type: "CREATE_WILL",
    willTitle: "USDC Stable Reserve",
    timestamp: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    status: "SUCCESS",
    amount: 2500,
    asset: "USDC"
  },
  {
    hash: "0x77ae62dfba5162ff8ab263e8a9f0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8",
    type: "HEARTBEAT",
    willTitle: "Primary Savings Lock",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "SUCCESS"
  }
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_1",
    title: "Heartbeat Reminder",
    message: "Your heartbeat confirmation for 'USDC Stable Reserve' is due in 10 days.",
    type: "warning",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    read: false
  },
  {
    id: "notif_2",
    title: "Claim Available!",
    message: "A will from GDVEN...4321 is now unlocked and claimable by you.",
    type: "success",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    read: false
  }
];

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [network] = useState<'TESTNET' | 'PUBLIC'>('TESTNET');
  const [walletBalance, setWalletBalance] = useState<string>('0');
  const [isRealWallet, setIsRealWallet] = useState(false);

  // Profile State
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('legacyx_profile');
    return saved ? JSON.parse(saved) : { displayName: "", email: "", emailNotifications: false };
  });

  // Data States
  const [wills, setWills] = useState<Will[]>(() => {
    const saved = localStorage.getItem('legacyx_wills');
    return saved ? JSON.parse(saved) : INITIAL_WILLS;
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('legacyx_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('legacyx_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Persist states
  useEffect(() => {
    localStorage.setItem('legacyx_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('legacyx_wills', JSON.stringify(wills));
  }, [wills]);

  useEffect(() => {
    localStorage.setItem('legacyx_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('legacyx_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Check Freighter installation on mount
  useEffect(() => {
    const checkInstallation = async () => {
      const installed = await isFreighterInstalled();
      setIsInstalled(installed);
    };
    checkInstallation();
  }, []);

  // Fetch balance when wallet changes
  useEffect(() => {
    if (walletAddress && isRealWallet) {
      getWalletBalance(walletAddress).then(setWalletBalance).catch(() => setWalletBalance('0'));
    }
  }, [walletAddress, isRealWallet]);

  // Load profile, wills, and transactions from backend when connected with real wallet
  useEffect(() => {
    const loadBackendData = async () => {
      if (walletAddress && isRealWallet) {
        try {
          // Fetch or create profile
          let userProfile;
          try {
            userProfile = await apiGetMe(walletAddress);
          } catch (e) {
            // Profile doesn't exist, create it
            userProfile = await apiCreateProfile({ walletAddress });
          }
          
          if (userProfile) {
            setProfile({
              displayName: userProfile.displayName || "",
              email: userProfile.email || "",
              emailNotifications: !!userProfile.email,
            });
          }

          // Fetch wills where user is owner or beneficiary
          const ownerWills = await apiGetWillsByOwner(walletAddress);
          const beneficiaryWills = await apiGetWillsByBeneficiary(walletAddress);
          
          // Map backend wills to frontend Will format
          const mappedOwnerWills = ownerWills.map((w: any) => ({
            id: w.id,
            title: `Will #${w.onchainWillId || 'Pending'}`,
            owner: w.ownerWallet,
            beneficiary: w.beneficiaryWallet,
            amount: parseFloat(w.amount),
            asset: w.asset as any,
            heartbeatInterval: w.heartbeatInterval,
            lastHeartbeat: w.lastHeartbeat || w.createdAt,
            unlockTime: w.unlockTime,
            status: w.status as any,
            txHash: w.createTxHash || "",
            onchainWillId: w.onchainWillId,
          }));

          const mappedBeneficiaryWills = beneficiaryWills.map((w: any) => ({
            id: w.id,
            title: `Will #${w.onchainWillId || 'Pending'} (Beneficiary)`,
            owner: w.ownerWallet,
            beneficiary: w.beneficiaryWallet,
            amount: parseFloat(w.amount),
            asset: w.asset as any,
            heartbeatInterval: w.heartbeatInterval,
            lastHeartbeat: w.lastHeartbeat || w.createdAt,
            unlockTime: w.unlockTime,
            status: w.status as any,
            txHash: w.createTxHash || "",
            onchainWillId: w.onchainWillId,
          }));

          // Combine and set wills
          const allWills = [...mappedOwnerWills, ...mappedBeneficiaryWills];
          if (allWills.length > 0) {
            setWills(allWills);
          }

          // Fetch transactions
          const txs = await apiGetTransactionsByWallet(walletAddress);
          const mappedTxs = txs.map((t: any) => ({
            hash: t.txHash,
            type: t.type as any,
            willTitle: t.will?.onchainWillId ? `Will #${t.will.onchainWillId}` : "Stellar Smart Lock",
            timestamp: t.createdAt,
            status: t.status as any,
          }));
          if (mappedTxs.length > 0) {
            setTransactions(mappedTxs);
          }
        } catch (err) {
          console.error("Failed to load backend data", err);
        }
      }
    };

    loadBackendData();
  }, [walletAddress, isRealWallet]);


  const connectWallet = async () => {
    setIsConnecting(true);
    setWalletError(null);
    try {
      // Connect to Freighter (will use mock address if extension not available)
      const result = await connectFreighterTestnet(true);
      setWalletAddress(result.publicKey);
      setIsConnected(true);
      setIsRealWallet(result.isReal);

      // Fetch balance for real wallets
      if (result.isReal) {
        const balance = await getWalletBalance(result.publicKey);
        setWalletBalance(balance);
      }
      
      // Add notification
      addNotification(
        "Wallet Connected",
        `Wallet ${truncateAddress(result.publicKey)} successfully connected on Stellar Testnet.${result.isReal ? ' (Real Freighter)' : ' (Demo Mode)'}`,
        "success"
      );
    } catch (err: any) {
      setWalletError(err.message || "Failed to connect to Freighter");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsConnected(false);
    setIsRealWallet(false);
    setWalletBalance('0');
    addNotification("Wallet Disconnected", "You have disconnected your Stellar wallet.", "info");
  };

  const updateProfile = async (name: string, email: string, emailNotifications: boolean) => {
    setProfile({
      displayName: name,
      email: email,
      emailNotifications: emailNotifications
    });
    if (walletAddress && isRealWallet) {
      try {
        await apiUpdateProfile(walletAddress, { displayName: name, email: email });
      } catch (err) {
        console.error("Failed to update profile on backend", err);
      }
    }
    addNotification("Profile Updated", "Your optional contact settings have been saved.", "success");
  };

  const addNotification = (title: string, message: string, type: 'info' | 'warning' | 'success' | 'danger') => {
    const newNotif: NotificationItem = {
      id: "notif_" + Math.random().toString(36).substr(2, 9),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  /**
   * Helper to sign a transaction XDR. Used as callback for Soroban helpers.
   */
  const signTx = async (xdr: string, opts: any): Promise<string> => {
    return signWithFreighter(xdr, opts?.network || 'TESTNET', !isRealWallet);
  };

  const createWill = async (
    title: string,
    beneficiary: string,
    amount: number,
    asset: 'XLM' | 'USDC' | 'yXLM' | 'AQUA',
    heartbeatInterval: number
  ): Promise<boolean> => {
    setIsSigning(true);
    try {
      let txHash: string;
      let onchainWillId: number | undefined;

      if (isRealWallet && import.meta.env.VITE_CONTRACT_ID) {
        // Real on-chain transaction
        const unlockTimestamp = BigInt(
          Math.floor(Date.now() / 1000) + heartbeatInterval * 24 * 60 * 60
        );
        const heartbeatIntervalSecs = BigInt(heartbeatInterval * 24 * 60 * 60);
        // Convert amount to stroops (7 decimals for SAC tokens)
        const amountStroops = BigInt(Math.floor(amount * 10_000_000));

        // For MVP, use native XLM wrapping or configured asset contract
        const assetContractId = import.meta.env.VITE_CONTRACT_ID; // TODO: map asset to contract

        const result: OnChainResult = await createWillOnChain(
          walletAddress!,
          beneficiary,
          assetContractId,
          amountStroops,
          unlockTimestamp,
          heartbeatIntervalSecs,
          signTx
        );
        txHash = result.txHash;
        onchainWillId = result.onchainWillId;
      } else {
        // Mock fallback
        const mockTx = "tx_create_will_" + Math.random().toString(36).substr(2, 9);
        await signWithFreighter(mockTx, 'TESTNET', true);
        txHash = generateTxHash();
      }

      const newWill: Will = {
        id: "will_" + Math.random().toString(36).substr(2, 9),
        title: title || "Asset Lockbox",
        owner: walletAddress || MOCK_STELLAR_ADDRESS,
        beneficiary,
        amount,
        asset,
        heartbeatInterval,
        lastHeartbeat: new Date().toISOString(),
        unlockTime: new Date(Date.now() + heartbeatInterval * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ACTIVE',
        txHash,
        onchainWillId,
      };

      const newTx: Transaction = {
        hash: txHash,
        type: 'CREATE_WILL',
        willTitle: newWill.title,
        timestamp: new Date().toISOString(),
        status: 'SUCCESS',
        amount,
        asset
      };

      setWills(prev => [newWill, ...prev]);
      setTransactions(prev => [newTx, ...prev]);

      if (walletAddress && isRealWallet) {
        try {
          const backendWill = await apiCreateWill({
            ownerWallet: walletAddress,
            beneficiaryWallet: beneficiary,
            asset: asset,
            amount: amount.toString(),
            unlockTime: new Date(Date.now() + heartbeatInterval * 24 * 60 * 60 * 1000).toISOString(),
            heartbeatInterval: heartbeatInterval,
            createTxHash: txHash,
            onchainWillId: onchainWillId,
          });

          await apiCreateTransaction({
            walletAddress: walletAddress,
            willId: backendWill.id,
            type: 'CREATE_WILL',
            txHash: txHash,
            status: 'SUCCESS',
          });
        } catch (err) {
          console.error("Failed to sync created will with backend", err);
        }
      }

      addNotification("Will Created Successfully", `Locked ${amount} ${asset} for beneficiary. ${isRealWallet ? `Tx: ${txHash.substring(0, 12)}...` : '(Demo mode)'}`, "success");
      
      return true;
    } catch (err) {
      console.error(err);
      addNotification("Contract Signing Failed", `The creation transaction was rejected: ${(err as any)?.message || 'Unknown error'}`, "danger");
      return false;
    } finally {
      setIsSigning(false);
    }
  };

  const sendHeartbeat = async (willId: string): Promise<boolean> => {
    setIsSigning(true);
    try {
      let txHash: string;
      const will = wills.find(w => w.id === willId);

      if (isRealWallet && import.meta.env.VITE_CONTRACT_ID && will?.onchainWillId) {
        const result = await sendHeartbeatOnChain(
          walletAddress!,
          will.onchainWillId,
          signTx
        );
        txHash = result.txHash;
      } else {
        const mockTx = "tx_heartbeat_" + Math.random().toString(36).substr(2, 9);
        await signWithFreighter(mockTx, 'TESTNET', true);
        txHash = generateTxHash();
      }

      let affectedWillTitle = "";

      setWills(prev => prev.map(w => {
        if (w.id === willId) {
          affectedWillTitle = w.title;
          return {
            ...w,
            lastHeartbeat: new Date().toISOString(),
            unlockTime: new Date(Date.now() + w.heartbeatInterval * 24 * 60 * 60 * 1000).toISOString()
          };
        }
        return w;
      }));

      const newTx: Transaction = {
        hash: txHash,
        type: 'HEARTBEAT',
        willTitle: affectedWillTitle || "Stellar Smart Lock",
        timestamp: new Date().toISOString(),
        status: 'SUCCESS'
      };

      setTransactions(prev => [newTx, ...prev]);

      if (walletAddress && isRealWallet && willId) {
        try {
          await apiUpdateWillHeartbeat(willId, { heartbeatTxHash: txHash });
          await apiCreateTransaction({
            walletAddress: walletAddress,
            willId: willId,
            type: 'HEARTBEAT',
            txHash: txHash,
            status: 'SUCCESS',
          });
        } catch (err) {
          console.error("Failed to sync heartbeat with backend", err);
        }
      }

      addNotification("Heartbeat Logged", `Updated contract activity state for '${affectedWillTitle}'.`, "success");
      return true;
    } catch (err) {
      console.error(err);
      addNotification("Heartbeat Failed", "Could not submit contract proof-of-life.", "danger");
      return false;
    } finally {
      setIsSigning(false);
    }
  };

  const cancelWill = async (willId: string): Promise<boolean> => {
    setIsSigning(true);
    try {
      let txHash: string;
      const will = wills.find(w => w.id === willId);

      if (isRealWallet && import.meta.env.VITE_CONTRACT_ID && will?.onchainWillId) {
        const result = await cancelWillOnChain(
          walletAddress!,
          will.onchainWillId,
          signTx
        );
        txHash = result.txHash;
      } else {
        const mockTx = "tx_cancel_" + Math.random().toString(36).substr(2, 9);
        await signWithFreighter(mockTx, 'TESTNET', true);
        txHash = generateTxHash();
      }

      let affectedWillTitle = "";
      let refundAmount = 0;
      let refundAsset = "";

      setWills(prev => prev.map(w => {
        if (w.id === willId) {
          affectedWillTitle = w.title;
          refundAmount = w.amount;
          refundAsset = w.asset;
          return { ...w, status: 'CANCELLED' };
        }
        return w;
      }));

      const newTx: Transaction = {
        hash: txHash,
        type: 'CANCEL_WILL',
        willTitle: affectedWillTitle || "Stellar Smart Lock",
        timestamp: new Date().toISOString(),
        status: 'SUCCESS',
        amount: refundAmount,
        asset: refundAsset
      };

      setTransactions(prev => [newTx, ...prev]);

      if (walletAddress && isRealWallet && willId) {
        try {
          await apiUpdateWillCancel(willId, { cancelTxHash: txHash });
          await apiCreateTransaction({
            walletAddress: walletAddress,
            willId: willId,
            type: 'CANCEL_WILL',
            txHash: txHash,
            status: 'SUCCESS',
          });
        } catch (err) {
          console.error("Failed to sync cancel with backend", err);
        }
      }

      addNotification("Contract Revoked", `Assets (${refundAmount} ${refundAsset}) unlocked and returned.`, "info");
      return true;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setIsSigning(false);
    }
  };

  const claimWill = async (willId: string): Promise<boolean> => {
    setIsSigning(true);
    try {
      let txHash: string;
      const will = wills.find(w => w.id === willId);

      if (isRealWallet && import.meta.env.VITE_CONTRACT_ID && will?.onchainWillId) {
        const result = await claimInheritanceOnChain(
          walletAddress!,
          will.onchainWillId,
          signTx
        );
        txHash = result.txHash;
      } else {
        const mockTx = "tx_claim_" + Math.random().toString(36).substr(2, 9);
        await signWithFreighter(mockTx, 'TESTNET', true);
        txHash = generateTxHash();
      }

      let affectedWillTitle = "";
      let claimAmount = 0;
      let claimAsset = "";

      setWills(prev => prev.map(w => {
        if (w.id === willId) {
          affectedWillTitle = w.title;
          claimAmount = w.amount;
          claimAsset = w.asset;
          return { ...w, status: 'CLAIMED' };
        }
        return w;
      }));

      const newTx: Transaction = {
        hash: txHash,
        type: 'CLAIM_WILL',
        willTitle: affectedWillTitle || "Stellar Smart Lock",
        timestamp: new Date().toISOString(),
        status: 'SUCCESS',
        amount: claimAmount,
        asset: claimAsset
      };

      setTransactions(prev => [newTx, ...prev]);

      if (walletAddress && isRealWallet && willId) {
        try {
          await apiUpdateWillClaim(willId, { claimTxHash: txHash });
          await apiCreateTransaction({
            walletAddress: walletAddress,
            willId: willId,
            type: 'CLAIM_WILL',
            txHash: txHash,
            status: 'SUCCESS',
          });
        } catch (err) {
          console.error("Failed to sync claim with backend", err);
        }
      }

      addNotification("Legacy Claimed!", `Successfully withdrew ${claimAmount} ${claimAsset} to your wallet.`, "success");
      return true;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setIsSigning(false);
    }
  };

  const changeBeneficiary = async (willId: string, newBeneficiary: string): Promise<boolean> => {
    setIsSigning(true);
    try {
      let txHash: string;
      const will = wills.find(w => w.id === willId);

      if (isRealWallet && import.meta.env.VITE_CONTRACT_ID && will?.onchainWillId) {
        const result = await changeBeneficiaryOnChain(
          walletAddress!,
          will.onchainWillId,
          newBeneficiary,
          signTx
        );
        txHash = result.txHash;
      } else {
        const mockTx = "tx_beneficiary_" + Math.random().toString(36).substr(2, 9);
        await signWithFreighter(mockTx, 'TESTNET', true);
        txHash = generateTxHash();
      }

      let affectedWillTitle = "";

      setWills(prev => prev.map(w => {
        if (w.id === willId) {
          affectedWillTitle = w.title;
          return { ...w, beneficiary: newBeneficiary };
        }
        return w;
      }));

      const newTx: Transaction = {
        hash: txHash,
        type: 'CHANGE_BENEFICIARY',
        willTitle: affectedWillTitle || "Stellar Smart Lock",
        timestamp: new Date().toISOString(),
        status: 'SUCCESS'
      };

      setTransactions(prev => [newTx, ...prev]);

      if (walletAddress && isRealWallet && willId) {
        try {
          await apiUpdateWillBeneficiary(willId, {
            newBeneficiaryWallet: newBeneficiary,
            changeBeneficiaryTxHash: txHash,
          });
          await apiCreateTransaction({
            walletAddress: walletAddress,
            willId: willId,
            type: 'CHANGE_BENEFICIARY',
            txHash: txHash,
            status: 'SUCCESS',
          });
        } catch (err) {
          console.error("Failed to sync beneficiary change with backend", err);
        }
      }

      addNotification("Beneficiary Updated", `Smart contract updated with new beneficiary address.`, "success");
      return true;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setIsSigning(false);
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const resetMockData = () => {
    localStorage.removeItem('legacyx_wills');
    localStorage.removeItem('legacyx_transactions');
    localStorage.removeItem('legacyx_notifications');
    setWills(INITIAL_WILLS);
    setTransactions(INITIAL_TRANSACTIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    addNotification("Reset Complete", "Demo state reset to default mock values.", "info");
  };

  return (
    <AppStateContext.Provider value={{
      isInstalled,
      isConnected,
      walletAddress,
      walletError,
      isConnecting,
      isSigning,
      network,
      walletBalance,
      isRealWallet,
      profile,
      wills,
      transactions,
      notifications,
      connectWallet,
      disconnectWallet,
      updateProfile,
      createWill,
      sendHeartbeat,
      cancelWill,
      claimWill,
      changeBeneficiary,
      markNotificationAsRead,
      clearNotifications,
      resetMockData
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
