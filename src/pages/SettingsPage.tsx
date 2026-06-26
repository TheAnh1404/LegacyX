import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  User, 
  Bell, 
  RefreshCw, 
  Smartphone, 
  Check
} from 'lucide-react';
import { useAppState } from '../mock/store';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';

export const SettingsPage: React.FC = () => {
  const { 
    walletAddress, 
    isConnected, 
    disconnectWallet, 
    connectWallet,
    profile, 
    updateProfile,
    resetMockData
  } = useAppState();

  // Profile Inputs
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [email, setEmail] = useState(profile.email);
  const [emailNotifications, setEmailNotifications] = useState(profile.emailNotifications);

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(displayName, email, emailNotifications);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const containerVariants: any = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
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
      className="max-w-2xl mx-auto py-6 md:py-10 flex flex-col gap-6 text-left"
    >
      <div className="flex items-center gap-2 mb-2">
        <Settings size={22} className="text-[#22d3ee] glow-text-cyan" />
        <h1 className="text-3xl font-extrabold text-white tracking-tight">System Settings</h1>
      </div>

      {/* 1. Profile settings */}
      <motion.div variants={itemVariants}>
        <GlassCard hover={false} className="p-6 flex flex-col gap-5 border-white/5 shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <User size={18} className="text-[#22d3ee]" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Owner Profile</h2>
          </div>

          <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
            <div className="form-group">
              <label className="form-label text-xs">Display Name</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="form-input text-xs"
              />
            </div>

            <div className="form-group">
              <label className="form-label text-xs">Email Address</label>
              <input
                type="email"
                placeholder="e.g. name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input text-xs"
              />
              <span className="text-[10px] text-white/40 leading-relaxed font-medium">
                Email is stored off-chain strictly for heartbeat notification triggers. It is never exposed in smart contract records.
              </span>
            </div>

            {email && (
              <label className="flex items-start gap-3 p-3 bg-white/5 border border-white/5 rounded-lg cursor-pointer hover:bg-white/10 select-none">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="mt-1 accent-[#8b5cf6] cursor-pointer"
                />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-white flex items-center gap-1">
                    <Bell size={12} className="text-[#22d3ee]" />
                    Enable Email Heartbeat Reminders
                  </span>
                  <span className="text-[10px] text-white/50">
                    Notify me 3 days prior to will expiration date.
                  </span>
                </div>
              </label>
            )}

            <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
              {saveSuccess ? (
                <span className="text-xs text-[#22c55e] font-semibold flex items-center gap-1">
                  <Check size={14} />
                  Profile Settings Saved!
                </span>
              ) : (
                <span />
              )}
              <GradientButton variant="primary" size="sm" type="submit">
                Save Profile
              </GradientButton>
            </div>
          </form>
        </GlassCard>
      </motion.div>

      {/* 2. Wallet settings */}
      <motion.div variants={itemVariants}>
        <GlassCard hover={false} className="p-6 flex flex-col gap-5 border-white/5 shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Smartphone size={18} className="text-[#22d3ee]" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Wallet Connection</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-3 text-left w-full sm:w-auto">
              <div className="bg-white/5 border border-white/10 p-2.5 rounded-lg text-white">
                <Smartphone size={20} />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-bold text-white">Freighter Wallet</span>
                <span className="text-xs text-white/50 truncate font-mono">
                  {isConnected && walletAddress ? walletAddress : 'Not Connected'}
                </span>
              </div>
            </div>

            <div className="w-full sm:w-auto">
              {isConnected ? (
                <GradientButton variant="outline" size="sm" fullWidth onClick={disconnectWallet}>
                  Disconnect Wallet
                </GradientButton>
              ) : (
                <GradientButton variant="primary" size="sm" fullWidth onClick={connectWallet}>
                  Connect Wallet
                </GradientButton>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* 3. Demo Controls / Dev Mode */}
      <motion.div variants={itemVariants}>
        <GlassCard hover={false} className="p-6 border-yellow-500/10 bg-yellow-500/[0.005] flex flex-col gap-5 shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <RefreshCw size={18} className="text-yellow-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Demo Control Panel</h2>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs text-white/50 leading-relaxed font-medium">
              Resetting mock data clears all your local changes and restores the initial set of active contracts, transactions, and alert messages. This is extremely useful when testing the claim flow several times during product reviews or presentations.
            </p>
            <div className="flex justify-start">
              <GradientButton 
                variant="outline" 
                size="sm" 
                onClick={resetMockData}
                className="border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/5 hover:border-yellow-500/40"
              >
                Reset Mock Data State
              </GradientButton>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};
