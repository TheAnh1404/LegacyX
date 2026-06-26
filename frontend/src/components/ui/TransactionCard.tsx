import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusCircle, 
  Heart, 
  Trash2, 
  Send, 
  UserCheck, 
  ExternalLink, 
  Copy, 
  Check, 
  Clock 
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { formatDate } from '../../lib/utils';

export interface TransactionCardProps {
  hash: string;
  type: 'CREATE_WILL' | 'HEARTBEAT' | 'CANCEL_WILL' | 'CLAIM_WILL' | 'CHANGE_BENEFICIARY';
  willTitle: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED';
  amount?: number;
  asset?: string;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  hash,
  type,
  willTitle,
  timestamp,
  amount,
  asset
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getIcon = () => {
    switch (type) {
      case 'CREATE_WILL':
        return <PlusCircle size={15} className="text-[#22c55e]" />;
      case 'HEARTBEAT':
        return <Heart size={15} className="text-[#ef4444] animate-pulse" />;
      case 'CANCEL_WILL':
        return <Trash2 size={15} className="text-[#ef4444]" />;
      case 'CLAIM_WILL':
        return <Send size={15} className="text-[#22d3ee]" />;
      case 'CHANGE_BENEFICIARY':
        return <UserCheck size={15} className="text-[#8b5cf6]" />;
      default:
        return <Clock size={15} className="text-white/60" />;
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'CREATE_WILL':
        return 'Inheritance Plan Created';
      case 'HEARTBEAT':
        return 'Heartbeat Verification';
      case 'CANCEL_WILL':
        return 'Contract Revoked';
      case 'CLAIM_WILL':
        return 'Legacy Withdrawn';
      case 'CHANGE_BENEFICIARY':
        return 'Beneficiary Changed';
      default:
        return type;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard className="p-4 border-white/5 bg-white/[0.01] hover:border-white/12 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl flex items-center justify-center shrink-0">
            {getIcon()}
          </div>
          <div className="flex flex-col gap-0.5 truncate">
            <span className="text-xs font-bold text-white tracking-wide">
              {getLabel()}
            </span>
            <span className="text-[10px] text-white/50 font-medium truncate max-w-[180px] sm:max-w-none">
              {willTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Amount locked/unlocked */}
          {amount ? (
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-[9px] text-white/40 font-mono tracking-wider">VALUE</span>
              <span className="text-xs font-bold text-white font-mono">
                {amount} <span className="text-[#22d3ee]">{asset}</span>
              </span>
            </div>
          ) : null}

          {/* Date */}
          <div className="flex flex-col text-right">
            <span className="text-[9px] text-white/40 font-mono tracking-wider hidden sm:block">DATETIME</span>
            <span className="text-xs text-white/60 font-mono font-medium">{formatDate(timestamp).split(',')[0]}</span>
          </div>

          {/* Copy hash & Link */}
          <div className="flex items-center gap-2 border-l border-white/5 pl-4 shrink-0">
            <button
              onClick={handleCopy}
              className="text-white/30 hover:text-white p-1 hover:bg-white/5 rounded transition-colors cursor-pointer"
              title="Copy Hash"
            >
              {copied ? <Check size={12} className="text-[#22c55e]" /> : <Copy size={12} />}
            </button>
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-[#22d3ee] p-1 hover:bg-white/5 rounded transition-colors"
              title="View on Stellar Expert"
            >
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};
