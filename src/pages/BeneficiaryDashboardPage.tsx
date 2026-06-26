import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Send, 
  Hourglass, 
  CheckSquare, 
  Clock, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useAppState } from '../mock/store';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { EmptyState } from '../components/ui/EmptyState';
import { truncateAddress } from '../lib/freighter';
import { formatAmount, getRemainingDaysText } from '../lib/utils';

interface BeneficiaryDashboardPageProps {
  onNavigate: (page: string, targetId?: string) => void;
}

type TabType = 'claimable' | 'upcoming' | 'claimed';

export const BeneficiaryDashboardPage: React.FC<BeneficiaryDashboardPageProps> = ({ onNavigate }) => {
  const { wills, walletAddress, claimWill, isSigning } = useAppState();
  const [activeTab, setActiveTab] = useState<TabType>('claimable');

  // Filter wills where user is beneficiary
  const beneficiaryWills = wills.filter(w => w.beneficiary === walletAddress);

  // Group by status/unlock
  const claimable = beneficiaryWills.filter(w => 
    w.status === 'ACTIVE' && new Date(w.unlockTime).getTime() <= Date.now()
  );

  const upcoming = beneficiaryWills.filter(w => 
    w.status === 'ACTIVE' && new Date(w.unlockTime).getTime() > Date.now()
  );

  const claimed = beneficiaryWills.filter(w => w.status === 'CLAIMED');

  const handleClaim = async (e: React.MouseEvent, willId: string) => {
    e.stopPropagation();
    await claimWill(willId);
  };

  const containerVariants: any = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, scale: 0.98, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="flex flex-col gap-8 pb-10 text-left">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Beneficiary Claims</h1>
        <p className="text-sm text-white/50 font-medium">Claim digital legacies where you are designated as the beneficiary.</p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-white/5 gap-6">
        <button
          onClick={() => setActiveTab('claimable')}
          className={`pb-4 text-sm font-semibold relative transition-colors cursor-pointer ${
            activeTab === 'claimable' ? 'text-[#22d3ee]' : 'text-white/40 hover:text-white/70'
          }`}
        >
          <span className="flex items-center gap-2">
            <Send size={14} />
            Claimable Legacies
            {claimable.length > 0 && (
              <span className="bg-[#22d3ee] text-black font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {claimable.length}
              </span>
            )}
          </span>
          {activeTab === 'claimable' && (
            <motion.span layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#22d3ee] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-4 text-sm font-semibold relative transition-colors cursor-pointer ${
            activeTab === 'upcoming' ? 'text-[#22d3ee]' : 'text-white/40 hover:text-white/70'
          }`}
        >
          <span className="flex items-center gap-2">
            <Hourglass size={14} />
            Upcoming Locks
            {upcoming.length > 0 && (
              <span className="bg-white/10 text-white/70 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {upcoming.length}
              </span>
            )}
          </span>
          {activeTab === 'upcoming' && (
            <motion.span layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#22d3ee] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('claimed')}
          className={`pb-4 text-sm font-semibold relative transition-colors cursor-pointer ${
            activeTab === 'claimed' ? 'text-[#22d3ee]' : 'text-white/40 hover:text-white/70'
          }`}
        >
          <span className="flex items-center gap-2">
            <CheckSquare size={14} />
            Claimed History
            {claimed.length > 0 && (
              <span className="bg-white/10 text-white/70 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {claimed.length}
              </span>
            )}
          </span>
          {activeTab === 'claimed' && (
            <motion.span layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#22d3ee] rounded-full" />
          )}
        </button>
      </div>

      {/* Tabs View content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {activeTab === 'claimable' && (
            claimable.length === 0 ? (
              <EmptyState
                icon={<Users size={28} />}
                title="No Claimable Legacies"
                description="There are currently no active smart wills designated to you that have exceeded their heartbeat timeout window."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {claimable.map(will => (
                  <motion.div key={will.id} variants={itemVariants}>
                    <GlassCard
                      onClick={() => onNavigate('will-details', will.id)}
                      className="p-5 flex flex-col justify-between gap-5 border-white/5 hover:border-white/12 cursor-pointer glass-card-hover text-left"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white text-base">{will.title}</span>
                          <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded uppercase font-bold font-mono">
                            Unlocked
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5 text-xs text-white/50 font-mono">
                          <span>Owner Account: {truncateAddress(will.owner)}</span>
                          <span>Next Due: {new Date(will.unlockTime).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-end border-t border-white/5 pt-4">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-white/40 font-mono tracking-wider">CLAIMABLE AMOUNT</span>
                          <span className="text-xl font-bold text-white font-mono">
                            {formatAmount(will.amount)} <span className="text-[#22d3ee]">{will.asset}</span>
                          </span>
                        </div>

                        <GradientButton
                          variant="primary"
                          size="sm"
                          onClick={(e) => handleClaim(e, will.id)}
                          disabled={isSigning}
                        >
                          Claim Funds
                          <ArrowRight size={14} />
                        </GradientButton>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            )
          )}

          {activeTab === 'upcoming' && (
            upcoming.length === 0 ? (
              <EmptyState
                icon={<Clock size={28} />}
                title="No Upcoming Legacy Wills"
                description="You are not designated as a beneficiary for any currently active locks."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcoming.map(will => (
                  <motion.div key={will.id} variants={itemVariants}>
                    <GlassCard
                      onClick={() => onNavigate('will-details', will.id)}
                      className="p-5 flex flex-col justify-between gap-5 border-white/5 hover:border-white/12 cursor-pointer glass-card-hover text-left"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white text-base">{will.title}</span>
                          <span className="text-[9px] bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/20 px-2 py-0.5 rounded uppercase font-bold font-mono">
                            Locked
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5 text-xs text-white/50 font-mono">
                          <span>Owner Account: {truncateAddress(will.owner)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-end border-t border-white/5 pt-4">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-white/40 font-mono tracking-wider font-semibold">LOCKED BALANCE</span>
                          <span className="text-xl font-bold text-white font-mono">
                            {formatAmount(will.amount)} <span className="text-[#22d3ee]">{will.asset}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-mono font-semibold">
                          <Clock size={12} />
                          <span>{getRemainingDaysText(will.unlockTime)}</span>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            )
          )}

          {activeTab === 'claimed' && (
            claimed.length === 0 ? (
              <EmptyState
                icon={<CheckSquare size={28} />}
                title="No Claimed Legacies"
                description="You have not claimed any legacy withdrawals yet."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {claimed.map(will => (
                  <motion.div key={will.id} variants={itemVariants}>
                    <GlassCard
                      onClick={() => onNavigate('will-details', will.id)}
                      className="p-5 flex flex-col justify-between gap-5 border-white/5 hover:border-white/12 cursor-pointer glass-card-hover text-left opacity-70"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white/90 text-base">{will.title}</span>
                          <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded uppercase font-bold font-mono">
                            Claimed
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5 text-xs text-white/40 font-mono">
                          <span>Owner Account: {truncateAddress(will.owner)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-end border-t border-white/5 pt-4">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-white/40 font-mono tracking-wider">WITHDRAWN VOLUME</span>
                          <span className="text-base font-bold text-white font-mono">
                            {formatAmount(will.amount)} <span className="text-[#22d3ee]">{will.asset}</span>
                          </span>
                        </div>

                        <a
                          href={`https://stellar.expert/explorer/testnet/tx/${will.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-white/40 hover:text-white flex items-center gap-1 font-mono font-semibold"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Tx Receipt
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            )
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
