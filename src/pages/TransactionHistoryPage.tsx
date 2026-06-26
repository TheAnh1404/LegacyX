import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search 
} from 'lucide-react';
import { useAppState } from '../mock/store';
import { GlassCard } from '../components/ui/GlassCard';
import { TransactionCard } from '../components/ui/TransactionCard';

export const TransactionHistoryPage: React.FC = () => {
  const { transactions } = useAppState();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getLabel = (type: string) => {
    switch (type) {
      case 'CREATE_WILL':
        return 'Wills Created';
      case 'HEARTBEAT':
        return 'Heartbeats Signed';
      case 'CANCEL_WILL':
        return 'Revoked Locks';
      case 'CLAIM_WILL':
        return 'Claim Withdrawals';
      default:
        return type;
    }
  };

  const filteredTxs = transactions.filter(tx => {
    const matchesFilter = filterType === 'ALL' || tx.type === filterType;
    const matchesSearch = tx.willTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tx.hash.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const containerVariants: any = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } }
  };

  return (
    <div className="flex flex-col gap-8 pb-10 text-left">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Transactions Log</h1>
        <p className="text-sm text-white/50 font-medium">Historical audit ledger of contracts deployed, heartbeats signed, and withdrawals verified on Stellar.</p>
      </div>

      {/* Filters & search panel */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {['ALL', 'CREATE_WILL', 'HEARTBEAT', 'CANCEL_WILL', 'CLAIM_WILL'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                filterType === type 
                  ? 'bg-white/10 border-white/20 text-[#22d3ee]' 
                  : 'bg-white/5 border-transparent text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              {type === 'ALL' ? 'All Transactions' : getLabel(type)}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-[260px]">
          <input
            type="text"
            placeholder="Search by will name or hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input text-xs pl-8 py-2.5"
          />
          <Search size={13} className="absolute left-3 top-3.5 text-white/30" />
        </div>
      </div>

      {/* Transactions List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filterType + searchQuery}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-3"
        >
          {filteredTxs.length === 0 ? (
            <GlassCard hover={false} className="text-center text-white/40 py-16 text-sm border-white/5 bg-white/[0.005]">
              No transaction records match your filters.
            </GlassCard>
          ) : (
            filteredTxs.map((tx, idx) => (
              <TransactionCard key={idx} {...tx} />
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
