import React from 'react';
import { motion } from 'framer-motion';
import { 
  PlusCircle, 
  Activity, 
  Clock, 
  DollarSign, 
  ChevronRight, 
  UserCheck, 
  Heart,
  Inbox,
  AlertCircle
} from 'lucide-react';
import { useAppState } from '../mock/store';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { TransactionCard } from '../components/ui/TransactionCard';
import { formatAmount, getRemainingDaysText } from '../lib/utils';

interface DashboardPageProps {
  onNavigate: (page: string, targetId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { wills, transactions, walletAddress, sendHeartbeat, isSigning } = useAppState();

  // Filter wills owned by user vs wills where user is beneficiary
  const myWills = wills.filter(w => w.owner === walletAddress);
  const beneficiaryWills = wills.filter(w => w.beneficiary === walletAddress);

  // Compute metrics
  const activeWillsCount = myWills.filter(w => w.status === 'ACTIVE').length;
  
  // Sum locked assets (group by asset code for accuracy, but aggregate for main counter)
  const totalLockedAssets = myWills
    .filter(w => w.status === 'ACTIVE')
    .reduce((sum, w) => sum + (w.asset === 'USDC' ? w.amount : w.amount * 0.12), 0); // Convert XLM equivalent roughly for counter

  // Next heartbeat due date
  const activeWills = myWills.filter(w => w.status === 'ACTIVE');
  const nextHeartbeatWill = activeWills.length > 0 
    ? [...activeWills].sort((a, b) => new Date(a.unlockTime).getTime() - new Date(b.unlockTime).getTime())[0]
    : null;

  // Claimable wills (where user is beneficiary AND unlockTime has passed)
  const claimableWillsCount = beneficiaryWills.filter(w => 
    w.status === 'ACTIVE' && new Date(w.unlockTime).getTime() <= Date.now()
  ).length;

  const handleHeartbeatClick = async (e: React.MouseEvent, willId: string) => {
    e.stopPropagation(); // prevent card click navigation
    await sendHeartbeat(willId);
  };

  const containerVariants: any = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col gap-8 pb-10 text-left"
    >
      {/* 1. Header welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Owner Dashboard</h1>
          <p className="text-sm text-white/50 font-medium">Manage your smart wills, submit heartbeat confirmations, and monitor claim states.</p>
        </div>
        <GradientButton 
          variant="primary" 
          size="md"
          onClick={() => onNavigate('create-will')}
        >
          <PlusCircle size={15} />
          Create New Smart Will
        </GradientButton>
      </div>

      {/* 2. Top Metrics Grid */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <GlassCard hover={false} className="flex items-center gap-4 py-5 px-5 border-white/5">
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-[#22d3ee] shrink-0">
            <Activity size={18} />
          </div>
          <div className="flex flex-col truncate">
            <span className="text-[10px] font-bold text-white/40 tracking-wider uppercase font-mono">Active Wills</span>
            <span className="text-2xl font-bold text-white mt-0.5 font-mono">
              <AnimatedCounter value={activeWillsCount} />
            </span>
          </div>
        </GlassCard>

        {/* Metric 2 */}
        <GlassCard hover={false} className="flex items-center gap-4 py-5 px-5 border-white/5">
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-[#8b5cf6] shrink-0">
            <DollarSign size={18} />
          </div>
          <div className="flex flex-col truncate">
            <span className="text-[10px] font-bold text-white/40 tracking-wider uppercase font-mono">Est. Value Locked</span>
            <span className="text-2xl font-bold text-white mt-0.5 font-mono">
              <AnimatedCounter value={totalLockedAssets} prefix="$" decimals={2} />
            </span>
          </div>
        </GlassCard>

        {/* Metric 3 */}
        <GlassCard hover={false} className="flex items-center gap-4 py-5 px-5 border-white/5">
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-yellow-400 shrink-0">
            <Clock size={18} />
          </div>
          <div className="flex flex-col truncate">
            <span className="text-[10px] font-bold text-white/40 tracking-wider uppercase font-mono">Next Heartbeat Due</span>
            <span className="text-sm font-bold text-white mt-1.5 truncate">
              {nextHeartbeatWill ? (
                <span className="text-[#22d3ee] font-mono font-semibold">
                  {getRemainingDaysText(nextHeartbeatWill.unlockTime)}
                </span>
              ) : (
                "No active locks"
              )}
            </span>
          </div>
        </GlassCard>

        {/* Metric 4 */}
        <GlassCard hover={false} className="flex items-center gap-4 py-5 px-5 border-white/5">
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-green-400 shrink-0">
            <UserCheck size={18} />
          </div>
          <div className="flex flex-col truncate">
            <span className="text-[10px] font-bold text-white/40 tracking-wider uppercase font-mono">Claimable Wills</span>
            <span className="text-2xl font-bold text-white mt-0.5 font-mono">
              <AnimatedCounter value={claimableWillsCount} />
            </span>
          </div>
        </GlassCard>
      </motion.section>

      {/* 3. Main Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: My Wills */}
        <motion.div variants={itemVariants} className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">My Active Inheritance Plans</h2>
            {myWills.length > 0 && (
              <button 
                onClick={() => onNavigate('history')}
                className="text-xs text-[#22d3ee] hover:underline flex items-center gap-0.5 font-semibold"
              >
                View History
                <ChevronRight size={12} />
              </button>
            )}
          </div>

          {myWills.length === 0 ? (
            <EmptyState
              icon={<Inbox size={28} />}
              title="No Wills Created Yet"
              description="Deploy your first Soroban smart contract to lock your Stellar assets and define your beneficiary heir."
              action={
                <GradientButton 
                  variant="primary" 
                  size="sm"
                  onClick={() => onNavigate('create-will')}
                >
                  <PlusCircle size={14} />
                  Create Will Now
                </GradientButton>
              }
            />
          ) : (
            <div className="flex flex-col gap-4">
              {myWills.map(will => {
                // calculate progress towards heartbeat limit
                const lastMs = new Date(will.lastHeartbeat).getTime();
                const totalMs = will.heartbeatInterval * 24 * 60 * 60 * 1000;
                const passedMs = Date.now() - lastMs;
                const progressPct = Math.max(0, Math.min(100, 100 - (passedMs / totalMs) * 100));

                return (
                  <GlassCard 
                    key={will.id} 
                    onClick={() => onNavigate('will-details', will.id)}
                    className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-white/5 hover:border-white/12 cursor-pointer glass-card-hover text-left"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-white text-base">{will.title}</span>
                        <StatusBadge status={will.status} />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50 font-mono">
                        <span>Beneficiary: {will.beneficiary.substring(0, 6)}...{will.beneficiary.substring(will.beneficiary.length - 6)}</span>
                        <span>•</span>
                        <span>Next Due: {new Date(will.unlockTime).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-white/5 pt-3.5 sm:pt-0">
                      <div className="flex flex-col text-left sm:text-right">
                        <span className="text-[9px] text-white/40 font-mono tracking-wider">LOCKED BALANCE</span>
                        <span className="text-base font-bold text-white font-mono">
                          {formatAmount(will.amount)} <span className="text-[#22d3ee]">{will.asset}</span>
                        </span>
                      </div>
                      
                      {will.status === 'ACTIVE' && (
                        <div className="flex items-center gap-3">
                          {/* Mini Progress bar */}
                          <div className="w-12 bg-white/5 rounded-full h-1 hidden md:block overflow-hidden" title={`${Math.round(progressPct)}% remaining`}>
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                progressPct < 25 ? 'bg-red-500' : progressPct < 50 ? 'bg-yellow-500' : 'bg-green-500'
                              }`} 
                              style={{ width: `${progressPct}%` }} 
                            />
                          </div>

                          <GradientButton
                            variant="outline"
                            size="sm"
                            disabled={isSigning}
                            onClick={(e) => handleHeartbeatClick(e, will.id)}
                            className="h-9 font-semibold text-xs border-[#22d3ee]/20 hover:border-[#22d3ee]/40 text-[#22d3ee] hover:bg-[#22d3ee]/5 shrink-0"
                          >
                            <Heart size={12} className="pulse-node text-[#22d3ee]" />
                            I'm Alive
                          </GradientButton>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Right column: Recent Activity & Reminders */}
        <motion.div variants={itemVariants} className="flex flex-col gap-6">
          {/* Heartbeat Warning banner if active will is expiring */}
          {nextHeartbeatWill && (
            <GlassCard hover={false} className="border-yellow-500/20 bg-yellow-500/5 p-5 flex gap-3 items-start text-left shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)]">
              <AlertCircle size={18} className="text-yellow-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-yellow-300">Action Required</span>
                <span className="text-xs text-white/70 leading-relaxed font-medium">
                  Your smart lock <strong>{nextHeartbeatWill.title}</strong> is due for a heartbeat check-in in {getRemainingDaysText(nextHeartbeatWill.unlockTime)}.
                </span>
                <button 
                  onClick={() => onNavigate('will-details', nextHeartbeatWill.id)}
                  className="text-xs text-[#22d3ee] hover:underline font-bold mt-1 flex items-center gap-0.5 text-left"
                >
                  Confirm Heartbeat Verification
                  <ChevronRight size={12} />
                </button>
              </div>
            </GlassCard>
          )}

          {/* Activity Section */}
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider px-1">Recent Activity</h2>
            
            <div className="flex flex-col gap-3">
              {transactions.length === 0 ? (
                <GlassCard hover={false} className="text-center text-white/40 py-8 text-xs border-white/5">
                  No transactions recorded yet.
                </GlassCard>
              ) : (
                <>
                  {transactions.slice(0, 4).map((tx, idx) => (
                    <TransactionCard key={idx} {...tx} />
                  ))}
                  
                  {transactions.length > 4 && (
                    <button 
                      onClick={() => onNavigate('history')}
                      className="text-xs text-[#22d3ee] hover:underline font-bold text-center py-2"
                    >
                      View All Transactions
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};
