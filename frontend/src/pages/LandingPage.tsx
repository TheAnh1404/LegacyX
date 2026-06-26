import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Key, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Sparkles,
  Disc
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { useAppState } from '../mock/store';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { isConnected } = useAppState();

  const handleCTAClick = () => {
    if (isConnected) {
      onNavigate('dashboard');
    } else {
      onNavigate('connect-wallet');
    }
  };

  const containerVariants: any = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const features = [
    {
      icon: <Lock size={20} className="text-[#22d3ee] glow-text-cyan" />,
      title: "Soroban Smart Locks",
      description: "Lock your Stellar assets in highly secure, non-custodial smart contracts. Only you can revoke or transfer authority."
    },
    {
      icon: <Clock size={20} className="text-[#8b5cf6]" />,
      title: "Heartbeat Activity checks",
      description: "Confirm you are active with a single gasless click. If your heartbeat expires, the contract unlock state begins automatically."
    },
    {
      icon: <Key size={20} className="text-[#22c55e]" />,
      title: "Trustless Withdrawals",
      description: "Heirs can claim and withdraw assets directly from the contract once the heartbeat window has expired. Zero third-party risk."
    }
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col gap-24 pb-20 relative bg-grid-dots"
    >
      {/* 1. Hero Section */}
      <section className="flex flex-col lg:flex-row items-center gap-16 pt-8 lg:pt-16">
        <motion.div variants={itemVariants} className="flex-1 flex flex-col gap-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/[0.03] border border-white/5 rounded-full w-fit">
            <Sparkles size={11} className="text-[#22d3ee]" />
            <span className="text-[10px] font-bold font-mono text-white/80 uppercase tracking-widest">
              Stellar Soroban Mainnet Beta
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-white">
            Secure your digital assets for the <span className="gradient-brand-text">future</span>.
          </h1>

          <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-xl font-medium">
            Create a Stellar-based inheritance plan, lock assets inside a Soroban smart contract, and ensure your beneficiaries receive access only when predefined conditions are met.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <GradientButton 
              variant="primary" 
              size="lg"
              onClick={handleCTAClick}
            >
              {isConnected ? "Go to Dashboard" : "Connect Wallet"}
              <ArrowRight size={18} />
            </GradientButton>
            <GradientButton 
              variant="outline" 
              size="lg"
              onClick={() => onNavigate('onboarding')}
            >
              How It Works
            </GradientButton>
          </div>
        </motion.div>

        {/* Hero Interactive Card Mockup */}
        <motion.div 
          variants={itemVariants} 
          className="flex-1 w-full flex justify-center items-center relative"
        >
          <div className="absolute w-[300px] h-[300px] bg-[#8b5cf6]/10 rounded-full blur-[80px] pointer-events-none -z-10" />
          <div className="w-full max-w-[420px] floating-mock">
            <GlassCard accent className="flex flex-col gap-6 p-6 border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <Shield className="text-[#22d3ee]" size={16} />
                  <span className="font-mono text-[10px] font-bold text-white/80">Soroban Contract #22D3</span>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20 rounded">
                  ACTIVE
                </span>
              </div>

              <div className="flex flex-col gap-1 text-left">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">LOCKED INHERITANCE ASSETS</span>
                <span className="text-3xl font-mono font-bold text-white tracking-tight">15,000.00 <span className="text-[#22d3ee] text-lg font-sans">XLM</span></span>
              </div>

              <div className="flex flex-col gap-3 bg-black/40 rounded-xl p-3.5 border border-white/5 text-left">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white/40">Heartbeat Interval:</span>
                  <span className="text-white/80 font-mono">30 Days</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white/40">Remaining Time:</span>
                  <span className="text-[#22d3ee] font-mono">25d 14h 02m</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1 mt-1 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#8b5cf6] to-[#22d3ee] h-full rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-white/40 border-t border-white/5 pt-4">
                <span className="truncate max-w-[170px] font-mono font-semibold">Heir: GDB2F54J...1234</span>
                <span className="flex items-center gap-1">
                  <Disc size={8} className="text-[#22c55e] animate-pulse" />
                  Stellar Testnet
                </span>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </section>

      {/* 2. Problem Section */}
      <motion.section variants={itemVariants} className="flex flex-col gap-6 text-center">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Inheritance for the Digital Age
        </h2>
        <p className="text-sm sm:text-base text-white/50 max-w-2xl mx-auto leading-relaxed font-medium">
          In Web3, estate planning is broken. If private keys are misplaced or accounts remain idle, your digital assets can be locked permanently, leaving heirs with zero recourse.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <GlassCard className="text-left border-red-500/10 bg-red-500/[0.005] p-6 flex flex-col gap-3">
            <span className="font-bold text-red-400 text-xs tracking-wider uppercase">THE SEED PHRASE DILEMMA</span>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              Writing down your seed phrase on paper or sharing it with relatives compromises your immediate wallet security. Relatives may lose it, or it may be stolen long before it is needed.
            </p>
          </GlassCard>
          <GlassCard className="text-left border-red-500/10 bg-red-500/[0.005] p-6 flex flex-col gap-3">
            <span className="font-bold text-red-400 text-xs tracking-wider uppercase">CUSTODIAL & LEGAL RED TAPE</span>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              Traditional wills require court processes, probate lawyers, and administrative hurdles that can freeze custody of digital accounts for months or years.
            </p>
          </GlassCard>
        </div>
      </motion.section>

      {/* 3. How It Works Section */}
      <motion.section variants={itemVariants} className="flex flex-col gap-12">
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-3xl font-bold text-white tracking-tight">How it Works</h2>
          <p className="text-sm text-white/50">Establish trustless legacy protection in three steps.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <GlassCard key={idx} className="text-left flex flex-col gap-5 p-6 glass-card-hover border-white/5">
              <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-center shrink-0">
                {feature.icon}
              </div>
              <h3 className="text-base font-bold text-white">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-medium">{feature.description}</p>
            </GlassCard>
          ))}
        </div>
      </motion.section>

      {/* 4. Security Model Comparison */}
      <motion.section variants={itemVariants} className="flex flex-col gap-8 bg-white/[0.005] border border-white/5 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col gap-1.5 text-left">
          <span className="text-xs text-[#22d3ee] font-bold tracking-wider uppercase font-mono">Decentralized Protection</span>
          <h2 className="text-2xl font-bold text-white tracking-tight">Trustless Security Model</h2>
        </div>

        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Security Feature</th>
                <th>Standard Multi-Sig</th>
                <th>LegacyX Smart Lock</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-semibold text-white/80">Asset Custody</td>
                <td className="text-white/50">Shared keys (requires active guardians)</td>
                <td className="text-white/90 font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-[#22c55e]" />
                  Non-custodial (direct smart lock)
                </td>
              </tr>
              <tr>
                <td className="font-semibold text-white/80">Access Revocation</td>
                <td className="text-white/50">Difficult to modify after setup</td>
                <td className="text-white/90 font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-[#22c55e]" />
                  Instant cancellation by owner
                </td>
              </tr>
              <tr>
                <td className="font-semibold text-white/80">Privacy Status</td>
                <td className="text-white/50">Guardians have details on key shares</td>
                <td className="text-white/90 font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-[#22c55e]" />
                  Zero knowledge of assets until claim
                </td>
              </tr>
              <tr>
                <td className="font-semibold text-white/80">Gas Fees</td>
                <td className="text-white/50">High (multi-tx signatures)</td>
                <td className="text-white/90 font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-[#22c55e]" />
                  Micro-cents on Stellar network
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* 5. Roadmap Section */}
      <motion.section variants={itemVariants} className="flex flex-col gap-10">
        <h2 className="text-3xl font-bold text-center text-white tracking-tight">Platform Roadmap</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <GlassCard className="p-5 text-left border-white/5 hover:border-white/10">
            <span className="font-mono text-xs text-[#22d3ee] font-bold uppercase tracking-wider">Q1 2026</span>
            <h4 className="text-sm font-bold text-white mt-1">Soroban Prototype</h4>
            <p className="text-xs text-white/50 mt-1 leading-relaxed">Stellar Testnet smart contract and freighter integration validation.</p>
          </GlassCard>
          <GlassCard className="p-5 text-left border-white/5 hover:border-white/10">
            <span className="font-mono text-xs text-[#22d3ee] font-bold uppercase tracking-wider">Q2 2026</span>
            <h4 className="text-sm font-bold text-white mt-1">Beta Mainnet Launch</h4>
            <p className="text-xs text-white/50 mt-1 leading-relaxed">Public release supporting locking XLM, USDC, and fee sponsorship.</p>
          </GlassCard>
          <GlassCard className="p-5 text-left border-white/5 hover:border-white/10">
            <span className="font-mono text-xs text-white/30 font-bold uppercase tracking-wider">Q3 2026</span>
            <h4 className="text-sm font-bold text-white mt-1">Email Heartbeats</h4>
            <p className="text-xs text-white/50 mt-1 leading-relaxed">Automatic off-chain notifications and heartbeat prompts via email.</p>
          </GlassCard>
          <GlassCard className="p-5 text-left border-white/5 hover:border-white/10">
            <span className="font-mono text-xs text-white/30 font-bold uppercase tracking-wider">Q4 2026</span>
            <h4 className="text-sm font-bold text-white mt-1">Multi-asset Wills</h4>
            <p className="text-xs text-white/50 mt-1 leading-relaxed">Simultaneous locking of NFTs and diverse liquidity pool tokens.</p>
          </GlassCard>
        </div>
      </motion.section>

      {/* 6. Final CTA Section */}
      <motion.section variants={itemVariants} className="text-center relative">
        <div className="absolute w-[200px] h-[200px] bg-[#22d3ee]/10 rounded-full blur-[60px] pointer-events-none -z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        <GlassCard accent className="p-8 md:p-12 max-w-3xl mx-auto border-white/10 flex flex-col gap-6 items-center shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Ready to secure your legacy?
          </h2>
          <p className="text-sm sm:text-base text-white/60 max-w-lg leading-relaxed font-medium">
            Ensure your digital wealth passes safely to those you love. Create your non-custodial smart lock inheritance plan today.
          </p>
          <GradientButton 
            variant="primary" 
            size="lg" 
            className="px-8 mt-2"
            onClick={handleCTAClick}
          >
            Create Your Legacy Plan
            <ArrowRight size={18} />
          </GradientButton>
        </GlassCard>
      </motion.section>
    </motion.div>
  );
};
