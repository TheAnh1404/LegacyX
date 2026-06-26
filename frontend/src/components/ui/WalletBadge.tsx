import React from 'react';
import { Wallet, LogOut, Disc } from 'lucide-react';
import { truncateAddress } from '../../lib/freighter';

interface WalletBadgeProps {
  address: string;
  network?: string;
  onDisconnect?: () => void;
}

export const WalletBadge: React.FC<WalletBadgeProps> = ({
  address,
  network = 'TESTNET',
  onDisconnect
}) => {
  return (
    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-2 px-3">
      <div className="flex items-center gap-2">
        <div className="bg-[#8b5cf6]/20 p-1.5 rounded-md text-[#22d3ee]">
          <Wallet size={16} />
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-xs font-semibold text-white tracking-wide">
            {truncateAddress(address)}
          </span>
          <span className="text-[10px] text-white/50 flex items-center gap-1 font-semibold">
            <Disc size={8} className="text-[#22c55e] animate-pulse" />
            {network}
          </span>
        </div>
      </div>
      
      {onDisconnect && (
        <button
          onClick={onDisconnect}
          className="text-white/40 hover:text-red-400 p-1.5 hover:bg-white/5 rounded-md transition-colors cursor-pointer"
          title="Disconnect Wallet"
        >
          <LogOut size={14} />
        </button>
      )}
    </div>
  );
};
