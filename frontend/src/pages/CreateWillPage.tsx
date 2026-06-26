import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  Coins, 
  CheckCircle2, 
  ExternalLink, 
  FileText,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { Timeline } from '../components/ui/Timeline';
import { useAppState } from '../mock/store';
import { ErrorState } from '../components/ui/ErrorState';

interface CreateWillPageProps {
  onNavigate: (page: string) => void;
}

export const CreateWillPage: React.FC<CreateWillPageProps> = ({ onNavigate }) => {
  const { createWill, isSigning } = useAppState();
  const [currentStep, setCurrentStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form States
  const [title, setTitle] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [asset, setAsset] = useState<'XLM' | 'USDC' | 'yXLM' | 'AQUA'>('XLM');
  const [amount, setAmount] = useState<string>('');
  const [heartbeatInterval, setHeartbeatInterval] = useState<number>(30); // days

  // Success States
  const [successHash, setSuccessHash] = useState<string | null>(null);

  const validateStep = () => {
    setErrorMsg(null);

    if (currentStep === 1) {
      if (!title.trim()) {
        setErrorMsg("Please enter a name for this will plan.");
        return false;
      }
      if (!beneficiary.trim()) {
        setErrorMsg("Beneficiary address is required.");
        return false;
      }
      // Simple Stellar address validation: G... of length 56
      const stellarAddrRegex = /^G[A-Z2-7]{55}$/;
      if (!stellarAddrRegex.test(beneficiary.trim())) {
        setErrorMsg("Please enter a valid Stellar public key (starts with 'G', 56 characters).");
        return false;
      }
    }

    if (currentStep === 2) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        setErrorMsg("Please enter a valid amount greater than 0.");
        return false;
      }
    }

    if (currentStep === 3) {
      if (heartbeatInterval < 1) {
        setErrorMsg("Heartbeat interval must be at least 1 day.");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    setCurrentStep(prev => prev - 1);
  };

  const handleSign = async () => {
    const success = await createWill(
      title,
      beneficiary,
      parseFloat(amount),
      asset,
      heartbeatInterval
    );

    if (success) {
      setSuccessHash("0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""));
      setCurrentStep(5);
    }
  };

  const steps = [
    { title: "Plan Name & Heir", description: "Designate beneficiary", status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : 'upcoming' },
    { title: "Select Assets", description: "Define locking values", status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : 'upcoming' },
    { title: "Heartbeat Terms", description: "Set heartbeat periods", status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'current' : 'upcoming' },
    { title: "Review & Sign", description: "Deploy Soroban lock", status: currentStep === 4 ? 'current' : 'upcoming' }
  ] as const;

  const stepVariants: any = {
    initial: { opacity: 0, x: 20 },
    enter: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.25 } }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 md:py-10 flex flex-col gap-8 text-left">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => onNavigate('dashboard')}
          className="text-white/40 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Smart Will</h1>
          <p className="text-xs text-white/50">Setup a Soroban smart lock to secure your digital assets.</p>
        </div>
      </div>

      {currentStep <= 4 && (
        <Timeline steps={steps as any} orientation="horizontal" />
      )}

      {errorMsg && (
        <ErrorState message={errorMsg} />
      )}

      <div className="min-h-[300px] relative">
        <AnimatePresence mode="wait">
          {/* Step 1: Beneficiary */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="initial"
              animate="enter"
              exit="exit"
            >
              <GlassCard className="p-6 md:p-8 flex flex-col gap-6 w-full border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                  <FileText size={18} className="text-[#22d3ee] glow-text-cyan" />
                  <h2 className="text-base font-bold text-white uppercase tracking-wider">Will Details & Beneficiary</h2>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="form-group">
                    <label className="form-label">Will Plan Name</label>
                    <input
                      type="text"
                      placeholder="e.g. My Savings Vault, Family Inherit"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Beneficiary Stellar Address (G...)</label>
                    <input
                      type="text"
                      placeholder="GDBC..."
                      value={beneficiary}
                      onChange={(e) => setBeneficiary(e.target.value)}
                      className="form-input font-mono"
                    />
                    <span className="text-[10px] text-white/40 leading-relaxed font-medium">
                      Provide the recipient's public key. Only this address can claim the locked funds after expiration. Do NOT enter an exchange address.
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-white/5 pt-4 mt-4">
                  <GradientButton variant="primary" size="md" onClick={handleNext}>
                    Continue
                    <ArrowRight size={16} />
                  </GradientButton>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Step 2: Assets */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="initial"
              animate="enter"
              exit="exit"
            >
              <GlassCard className="p-6 md:p-8 flex flex-col gap-6 w-full border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                  <Coins size={18} className="text-[#22d3ee] glow-text-cyan" />
                  <h2 className="text-base font-bold text-white uppercase tracking-wider">Lock Asset & Amount</h2>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Asset Token</label>
                      <select 
                        value={asset} 
                        onChange={(e) => setAsset(e.target.value as any)}
                        className="form-input form-select font-semibold"
                      >
                        <option value="XLM">XLM (Stellar Native)</option>
                        <option value="USDC">USDC (Stablecoin)</option>
                        <option value="yXLM">yXLM (Yield XLM)</option>
                        <option value="AQUA">AQUA</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Locking Amount</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="form-input font-mono font-bold"
                      />
                    </div>
                  </div>
                  
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-white/50 leading-relaxed font-medium">
                    Ensure you have the required balance + a small reserve of XLM in your Freighter wallet to cover contract execution fees (usually less than 0.1 XLM).
                  </div>
                </div>

                <div className="flex justify-between border-t border-white/5 pt-4 mt-4">
                  <GradientButton variant="ghost" size="md" onClick={handleBack}>
                    <ArrowLeft size={16} />
                    Back
                  </GradientButton>
                  <GradientButton variant="primary" size="md" onClick={handleNext}>
                    Continue
                    <ArrowRight size={16} />
                  </GradientButton>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Step 3: Heartbeat terms */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="initial"
              animate="enter"
              exit="exit"
            >
              <GlassCard className="p-6 md:p-8 flex flex-col gap-6 w-full border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                  <Calendar size={18} className="text-[#22d3ee] glow-text-cyan" />
                  <h2 className="text-base font-bold text-white uppercase tracking-wider">Activity Heartbeat Intervals</h2>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="form-group">
                    <label className="form-label">Heartbeat Timeout Interval (Days)</label>
                    <input
                      type="number"
                      placeholder="30"
                      value={heartbeatInterval}
                      onChange={(e) => setHeartbeatInterval(parseInt(e.target.value) || 0)}
                      className="form-input font-mono font-bold"
                    />
                  </div>

                  <div className="p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/10 text-xs text-yellow-400/80 leading-relaxed flex gap-2 font-medium">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                    <span>
                      If you fail to trigger the <strong>"I'm Alive"</strong> heartbeat verification within {heartbeatInterval} days, the lockbox automatically enters the unlock window, permitting your beneficiary to withdraw the assets.
                    </span>
                  </div>
                </div>

                <div className="flex justify-between border-t border-white/5 pt-4 mt-4">
                  <GradientButton variant="ghost" size="md" onClick={handleBack}>
                    <ArrowLeft size={16} />
                    Back
                  </GradientButton>
                  <GradientButton variant="primary" size="md" onClick={handleNext}>
                    Continue
                    <ArrowRight size={16} />
                  </GradientButton>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Step 4: Review & Sign */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              variants={stepVariants}
              initial="initial"
              animate="enter"
              exit="exit"
            >
              <GlassCard className="p-6 md:p-8 flex flex-col gap-6 w-full border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                  <Lock size={18} className="text-[#22d3ee] glow-text-cyan" />
                  <h2 className="text-base font-bold text-white uppercase tracking-wider">Review and Deploy Smart Contract</h2>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/30 p-4 rounded-xl border border-white/5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Will Name</span>
                      <span className="text-sm font-bold text-white">{title}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Lock Value</span>
                      <span className="text-sm font-bold text-white font-mono">{amount} {asset}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 sm:col-span-2">
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Beneficiary Public Key</span>
                      <span className="text-xs text-white font-mono truncate">{beneficiary}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Required Heartbeat</span>
                      <span className="text-sm font-bold text-white">Every {heartbeatInterval} Days</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Network Domain</span>
                      <span className="text-sm font-bold text-green-400 font-mono">Stellar Testnet</span>
                    </div>
                  </div>

                  <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20 text-xs text-red-200/90 leading-relaxed flex gap-2 font-medium">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5 text-red-400" />
                    <span>
                      <strong>Caution:</strong> Assets will be locked in the Soroban contract immediately upon signing. Only you can revoke/cancel the contract while active. Beneficiaries can only claim after the heartbeat timeout expires.
                    </span>
                  </div>
                </div>

                <div className="flex justify-between border-t border-white/5 pt-4 mt-4">
                  <GradientButton variant="ghost" size="md" onClick={handleBack} disabled={isSigning}>
                    <ArrowLeft size={16} />
                    Back
                  </GradientButton>
                  <GradientButton 
                    variant="primary" 
                    size="md" 
                    onClick={handleSign}
                    disabled={isSigning}
                  >
                    {isSigning ? "Signing Transaction..." : "Deploy & Lock Assets"}
                    {!isSigning && <CheckCircle2 size={16} />}
                  </GradientButton>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Step 5: Success state */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <GlassCard accent className="p-8 text-center flex flex-col gap-6 w-full border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
                <div className="flex justify-center">
                  <div className="bg-[#22c55e]/20 p-4 rounded-full text-[#22c55e] shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                    <CheckCircle2 size={36} />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-bold text-white">Smart Will Successfully Deployed!</h2>
                  <p className="text-sm text-white/60 max-w-md mx-auto">
                    Your Soroban smart contract is successfully initialized on the Stellar Testnet. Your assets are locked securely.
                  </p>
                </div>

                <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-left max-w-md mx-auto w-full flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-white/40">Will ID:</span>
                    <span className="text-white font-mono">will_custom_0493</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-white/40">Amount Locked:</span>
                    <span className="text-white font-mono">{amount} {asset}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-xs border-t border-white/5 pt-2 mt-1">
                    <span className="text-white/40">Transaction Hash:</span>
                    <span className="text-[10px] text-white/70 font-mono truncate">{successHash}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto w-full">
                  <a 
                    href={`https://stellar.expert/explorer/testnet/tx/${successHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-[#22d3ee] hover:bg-white/5 border border-[#22d3ee]/20 hover:border-[#22d3ee]/45 rounded-lg transition-all"
                  >
                    View on Stellar Expert
                    <ExternalLink size={12} />
                  </a>
                </div>

                <div className="flex gap-4 justify-center border-t border-white/5 pt-6 mt-2 max-w-md mx-auto w-full">
                  <GradientButton 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setTitle('');
                      setBeneficiary('');
                      setAmount('');
                      setCurrentStep(1);
                      setSuccessHash(null);
                    }}
                  >
                    Create Another
                  </GradientButton>
                  <GradientButton 
                    variant="primary" 
                    size="sm" 
                    onClick={() => onNavigate('dashboard')}
                  >
                    Go to Dashboard
                  </GradientButton>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
