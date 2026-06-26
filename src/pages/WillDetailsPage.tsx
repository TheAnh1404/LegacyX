import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Heart, 
  UserPlus, 
  Trash2, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  AlertTriangle,
  Send,
  User,
  AlertCircle
} from 'lucide-react';
import { useAppState } from '../mock/store';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { CountdownTimer } from '../components/ui/CountdownTimer';
import { StatusBadge } from '../components/ui/StatusBadge';
import { truncateAddress } from '../lib/freighter';
import { formatDate, formatAmount } from '../lib/utils';

interface WillDetailsPageProps {
  willId: string;
  onNavigate: (page: string) => void;
}

export const WillDetailsPage: React.FC<WillDetailsPageProps> = ({ willId, onNavigate }) => {
  const { 
    wills, 
    walletAddress, 
    sendHeartbeat, 
    cancelWill, 
    claimWill, 
    changeBeneficiary, 
    isSigning 
  } = useAppState();

  const will = wills.find(w => w.id === willId);

  // States for actions
  const [newBeneficiary, setNewBeneficiary] = useState('');
  const [isChangingBen, setIsChangingBen] = useState(false);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

  if (!will) {
    return (
      <div className="flex flex-col gap-6 text-center py-12 max-w-md mx-auto">
        <AlertCircle size={40} className="text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Will Plan Not Found</h2>
        <p className="text-sm text-white/50">The contract identifier requested does not exist or has been removed.</p>
        <GradientButton variant="primary" size="sm" onClick={() => onNavigate('dashboard')}>
          Back to Dashboard
        </GradientButton>
      </div>
    );
  }

  const isOwner = will.owner === walletAddress;
  const isBeneficiary = will.beneficiary === walletAddress;
  const isUnlockTimePassed = new Date(will.unlockTime).getTime() <= Date.now();
  const canClaim = isBeneficiary && will.status === 'ACTIVE' && isUnlockTimePassed;

  const handleHeartbeat = async () => {
    await sendHeartbeat(will.id);
  };

  const handleCancel = async () => {
    const success = await cancelWill(will.id);
    if (success) {
      setIsConfirmingCancel(false);
    }
  };

  const handleClaim = async () => {
    await claimWill(will.id);
  };

  const handleChangeBenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBeneficiary.trim() || !/^G[A-Z2-7]{55}$/.test(newBeneficiary.trim())) {
      alert("Please enter a valid Stellar G public key address.");
      return;
    }
    const success = await changeBeneficiary(will.id, newBeneficiary.trim());
    if (success) {
      setIsChangingBen(false);
      setNewBeneficiary('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 md:py-10 flex flex-col gap-6 text-left relative">
      {/* Header Nav */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => onNavigate('dashboard')}
          className="text-white/40 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{will.title}</h1>
          <p className="text-xs text-white/50 font-medium">Soroban Smart Lockbox details and administration console.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Core details, timers, waveforms */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <GlassCard hover={false} className="p-6 flex flex-col gap-6 border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-[10px] text-white/40 font-mono font-bold tracking-wider">CONTRACT STATE</span>
              <StatusBadge status={will.status} />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">LOCKED VALUE IN escrow</span>
              <span className="text-4xl font-extrabold font-mono text-white tracking-tight">
                {formatAmount(will.amount)} <span className="text-[#22d3ee] font-sans text-xl">{will.asset}</span>
              </span>
            </div>

            {/* Pulse monitor visual waveform */}
            {will.status === 'ACTIVE' && (
              <div className="h-16 bg-black/40 border border-white/5 rounded-xl flex items-center justify-center p-3 overflow-hidden relative">
                <svg className="waveform-svg w-full h-8" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path 
                    d="M0,10 L30,10 L33,2 L37,18 L40,10 L68,10 L71,2 L75,18 L78,10 L100,10" 
                    fill="none" 
                    stroke="#22d3ee" 
                    strokeWidth="1.5" 
                  />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#22d3ee]/5 to-transparent pointer-events-none animate-pulse" />
              </div>
            )}

            <div className="flex flex-col gap-3 bg-black/30 p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 text-[10px] text-white/40 font-bold tracking-wider uppercase mb-1">
                <Clock size={12} className="text-[#22d3ee]" />
                <span>UNCLAIMABLE UNTIL TIMEOUT EXPIRATION</span>
              </div>
              {will.status === 'ACTIVE' ? (
                <CountdownTimer targetDate={will.unlockTime} />
              ) : (
                <div className="text-center py-2 text-white/40 font-mono text-xs uppercase font-semibold">
                  This smart lock is no longer active ({will.status.toLowerCase()}).
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Owner Account</span>
                <span className="text-xs text-white font-mono" title={will.owner}>
                  {truncateAddress(will.owner)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Designated Heir</span>
                <span className="text-xs text-[#22d3ee] font-mono font-semibold" title={will.beneficiary}>
                  {truncateAddress(will.beneficiary)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Last Heartbeat Signal</span>
                <span className="text-xs text-white font-medium">
                  {formatDate(will.lastHeartbeat)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Safety Interval</span>
                <span className="text-xs text-white font-medium">
                  Every {will.heartbeatInterval} Days
                </span>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 flex flex-wrap gap-4 text-xs text-white/40">
              <span className="truncate max-w-[200px] font-mono">Contract Hash: {will.txHash}</span>
              <a 
                href={`https://stellar.expert/explorer/testnet/tx/${will.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white flex items-center gap-1 ml-auto font-semibold text-[#22d3ee]"
              >
                Stellar Expert
                <ExternalLink size={12} />
              </a>
            </div>
          </GlassCard>

          {/* Action Modals/Transitions using AnimatePresence */}
          <AnimatePresence>
            {isChangingBen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard hover={false} className="p-5 border-[#8b5cf6]/20 bg-[#8b5cf6]/5">
                  <form onSubmit={handleChangeBenSubmit} className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                      <UserPlus size={15} className="text-[#22d3ee]" />
                      <span className="text-sm font-semibold text-white">Change Designated Heir Account</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label text-xs">New Heir Public Address (Starts with 'G')</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. GCSW..."
                        value={newBeneficiary}
                        onChange={(e) => setNewBeneficiary(e.target.value)}
                        className="form-input font-mono text-xs"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <GradientButton variant="ghost" size="sm" type="button" onClick={() => setIsChangingBen(false)}>
                        Cancel
                      </GradientButton>
                      <GradientButton variant="primary" size="sm" type="submit" disabled={isSigning}>
                        {isSigning ? "Updating..." : "Confirm Heir Change"}
                      </GradientButton>
                    </div>
                  </form>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isConfirmingCancel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard hover={false} className="p-5 border-red-500/20 bg-red-500/5 flex flex-col gap-4">
                  <div className="flex items-start gap-2.5 text-left">
                    <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1.5 text-xs">
                      <span className="font-bold text-red-200 uppercase tracking-wider">Confirm Revocation & Withdraw Capital?</span>
                      <span className="text-white/70 leading-relaxed font-medium">
                        Revoking this contract will instantly dissolve the trust lock. All locked funds ({will.amount} {will.asset}) will be returned immediately to your connected Stellar wallet.
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-1">
                    <GradientButton variant="ghost" size="sm" onClick={() => setIsConfirmingCancel(false)}>
                      Dismiss
                    </GradientButton>
                    <GradientButton variant="danger" size="sm" onClick={handleCancel} disabled={isSigning}>
                      {isSigning ? "Signing Revocation..." : "Revoke Will & Withdraw"}
                    </GradientButton>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Actions Pane */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider px-1">Control Operations</h3>

          <GlassCard hover={false} className="p-5 flex flex-col gap-4 border-white/5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)]">
            {/* Heartbeat pulse check */}
            {isOwner && will.status === 'ACTIVE' && (
              <div className="flex flex-col gap-4">
                <span className="text-xs text-white/50 leading-relaxed font-medium">
                  Trigger heartbeat proof-of-life to reset lock expiration and extend the safety timer for {will.heartbeatInterval} days.
                </span>
                <div className="relative">
                  <GradientButton 
                    variant="primary" 
                    size="md" 
                    fullWidth 
                    onClick={handleHeartbeat}
                    disabled={isSigning}
                    className="relative z-10 py-3.5"
                  >
                    <Heart size={16} className="pulse-node text-white fill-white" />
                    I'm Alive (Sign Heartbeat)
                  </GradientButton>
                  <div className="absolute inset-0 bg-[#22d3ee]/20 pulse-node z-0 -m-1" />
                </div>
              </div>
            )}

            {/* Claim assets button */}
            {canClaim && (
              <div className="flex flex-col gap-3">
                <div className="p-3.5 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-300 flex gap-2">
                  <ShieldCheck size={16} className="shrink-0" />
                  <span>Lock period has elapsed. You can claim these funds now.</span>
                </div>
                <GradientButton
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={handleClaim}
                  disabled={isSigning}
                >
                  <Send size={15} />
                  Claim Heritage Escrow
                </GradientButton>
              </div>
            )}

            {/* Beneficiary locked info */}
            {isBeneficiary && will.status === 'ACTIVE' && !isUnlockTimePassed && (
              <div className="text-center p-4 bg-white/[0.01] rounded-xl border border-white/5 text-xs text-white/50 leading-relaxed">
                <User size={24} className="mx-auto mb-2 text-[#22d3ee] glow-text-cyan" />
                <span className="font-semibold block text-white/80 mb-1">Designated Beneficiary Account</span>
                Locked assets are scheduled to release automatically to your account if no owner heartbeats are signed before the timer expires.
              </div>
            )}

            {/* Owner settings options */}
            {isOwner && will.status === 'ACTIVE' && (
              <div className="flex flex-col gap-2 border-t border-white/5 pt-4 mt-2">
                <GradientButton 
                  variant="outline" 
                  size="sm" 
                  fullWidth
                  onClick={() => {
                    setIsChangingBen(true);
                    setIsConfirmingCancel(false);
                  }}
                  disabled={isSigning}
                >
                  <UserPlus size={14} />
                  Change Heir Account
                </GradientButton>

                <GradientButton 
                  variant="danger" 
                  size="sm" 
                  fullWidth
                  onClick={() => {
                    setIsConfirmingCancel(true);
                    setIsChangingBen(false);
                  }}
                  disabled={isSigning}
                >
                  <Trash2 size={14} />
                  Revoke & Cancel Contract
                </GradientButton>
              </div>
            )}

            {will.status !== 'ACTIVE' && (
              <div className="text-center py-6 text-xs text-white/40 font-semibold uppercase font-mono">
                Will is no longer active ({will.status})
              </div>
            )}
          </GlassCard>
        </div>

      </div>
    </div>
  );
};
