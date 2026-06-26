import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  User, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  Smartphone,
  PlusCircle,
  CheckCircle2,
  BellRing
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { Timeline } from '../components/ui/Timeline';
import { useAppState } from '../mock/store';

interface OnboardingPageProps {
  onNavigate: (page: string) => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onNavigate }) => {
  const { isConnected, walletAddress, connectWallet, profile, updateProfile } = useAppState();
  const [step, setStep] = useState(1);

  // Profile Inputs
  const [nameInput, setNameInput] = useState(profile.displayName);
  const [emailInput, setEmailInput] = useState(profile.email);
  const [emailNotifications, setEmailNotifications] = useState(profile.emailNotifications);

  // Automatically skip connect step if already connected
  useEffect(() => {
    if (step === 2 && isConnected) {
      setStep(3);
    }
  }, [isConnected, step]);

  const handleNextStep = () => {
    if (step === 3) {
      // Save profile details
      updateProfile(nameInput, emailInput, emailNotifications);
      setStep(4);
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  const timelineSteps = [
    { title: "Introduction", description: "Learn about smart inheritance locks", status: step > 1 ? 'completed' : step === 1 ? 'current' : 'upcoming' },
    { title: "Connect Wallet", description: "Freighter wallet verification", status: step > 2 ? 'completed' : step === 2 ? 'current' : 'upcoming' },
    { title: "Set Profile", description: "Optional notification settings", status: step > 3 ? 'completed' : step === 3 ? 'current' : 'upcoming' },
    { title: "Begin Legacy", description: "Deploy your first contract", status: step === 4 ? 'current' : 'upcoming' }
  ] as const;

  return (
    <div className="max-w-2xl mx-auto py-6 md:py-10 flex flex-col gap-10">
      {/* 1. Header Timeline */}
      <Timeline steps={timelineSteps as any} orientation="horizontal" />

      {/* 2. Step Panel Content */}
      <div className="min-h-[380px] flex items-center justify-center">
        {step === 1 && (
          <GlassCard className="p-8 text-center flex flex-col gap-6 w-full">
            <div className="flex justify-center">
              <div className="bg-[#8b5cf6]/20 p-4 rounded-full text-[#22d3ee] shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                <Shield size={32} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-white">Welcome to LegacyX</h2>
              <p className="text-sm text-white/60 leading-relaxed max-w-md mx-auto">
                LegacyX is a non-custodial smart inheritance platform. We empower you to lock digital wealth on Stellar to ensure it transitions to your loved ones, securely and automatically.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto w-full mt-2">
              <div className="flex gap-2 items-start text-xs text-white/70">
                <CheckCircle2 size={16} className="text-[#22d3ee] shrink-0" />
                <span>No legal contracts or complex paperwork required.</span>
              </div>
              <div className="flex gap-2 items-start text-xs text-white/70">
                <CheckCircle2 size={16} className="text-[#22d3ee] shrink-0" />
                <span>Completely trustless and secured by Soroban.</span>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <GradientButton variant="primary" size="md" onClick={handleNextStep}>
                Get Started
                <ArrowRight size={16} />
              </GradientButton>
            </div>
          </GlassCard>
        )}

        {step === 2 && (
          <GlassCard className="p-8 text-center flex flex-col gap-6 w-full">
            <div className="flex justify-center">
              <div className="bg-[#8b5cf6]/20 p-4 rounded-full text-[#22d3ee]">
                <Smartphone size={32} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-white">Link Your Wallet</h2>
              <p className="text-sm text-white/60 leading-relaxed max-w-md mx-auto">
                Connecting Freighter is the first action to verify your identity. Wallet address serves as the primary identifier on LegacyX.
              </p>
            </div>
            <div className="max-w-xs mx-auto w-full mt-4">
              <GradientButton 
                variant="primary" 
                size="md" 
                fullWidth 
                onClick={connectWallet}
              >
                Connect Freighter Wallet
                <ArrowRight size={16} />
              </GradientButton>
            </div>
            <div className="flex justify-between mt-4 border-t border-white/5 pt-4">
              <GradientButton variant="ghost" size="sm" onClick={handlePrevStep}>
                <ArrowLeft size={16} />
                Back
              </GradientButton>
            </div>
          </GlassCard>
        )}

        {step === 3 && (
          <GlassCard className="p-6 md:p-8 text-left flex flex-col gap-6 w-full">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <User className="text-[#22d3ee]" size={20} />
              <h2 className="text-xl font-bold text-white">Create Your Profile (Optional)</h2>
            </div>
            
            <p className="text-xs sm:text-sm text-white/60">
              Provide a name and email if you would like to receive automated notifications regarding your active smart locks.
            </p>

            <div className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label">
                  <span>Display Name <span className="text-white/30">(Optional)</span></span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Email Address <span className="text-white/30">(Optional)</span></span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. name@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="form-input"
                />
              </div>

              {emailInput && (
                <label className="flex items-start gap-3 p-3 bg-white/5 border border-white/5 rounded-lg cursor-pointer hover:bg-white/10 select-none">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="mt-1 accent-[#8b5cf6] cursor-pointer"
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-white flex items-center gap-1">
                      <BellRing size={12} className="text-[#22d3ee]" />
                      Enable Email Heartbeat Reminders
                    </span>
                    <span className="text-[10px] text-white/50 leading-relaxed">
                      We will email you 3 days before any heartbeat lock expires. Email is strictly used for notifications.
                    </span>
                  </div>
                </label>
              )}
            </div>

            <div className="flex justify-between mt-4 border-t border-white/5 pt-4">
              <GradientButton variant="ghost" size="sm" onClick={handlePrevStep}>
                <ArrowLeft size={16} />
                Back
              </GradientButton>
              <GradientButton variant="primary" size="md" onClick={handleNextStep}>
                Save Profile
                <ArrowRight size={16} />
              </GradientButton>
            </div>
          </GlassCard>
        )}

        {step === 4 && (
          <GlassCard className="p-8 text-center flex flex-col gap-6 w-full">
            <div className="flex justify-center">
              <div className="bg-[#22c55e]/20 p-4 rounded-full text-[#22c55e] animate-bounce">
                <Sparkles size={32} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-white">Setup is Complete!</h2>
              <p className="text-sm text-white/60 leading-relaxed max-w-md mx-auto">
                Your Freighter wallet is connected, and your profile is loaded. Now you are ready to construct your first digital will on the Stellar blockchain.
              </p>
            </div>
            
            {/* Quick Summary card */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left max-w-md mx-auto w-full flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Verified Wallet:</span>
                <span className="text-white font-mono">{walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 6)}` : "Mock Mode"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Profile Status:</span>
                <span className="text-white">{nameInput ? nameInput : "Anonymous Owner"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Heartbeat Alerts:</span>
                <span className={emailNotifications ? "text-green-400 font-semibold" : "text-white/40"}>
                  {emailNotifications ? "ENABLED" : "DISABLED"}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto w-full mt-4">
              <GradientButton 
                variant="outline" 
                size="md" 
                onClick={() => onNavigate('dashboard')}
              >
                Go to Dashboard
              </GradientButton>
              <GradientButton 
                variant="primary" 
                size="md" 
                onClick={() => onNavigate('create-will')}
              >
                <PlusCircle size={16} />
                Create First Will
              </GradientButton>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};
