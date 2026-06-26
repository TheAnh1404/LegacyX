import React, { useEffect } from 'react';
import { Shield, Smartphone, Disc, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { useAppState } from '../mock/store';

interface ConnectWalletPageProps {
  onNavigate: (page: string) => void;
}

export const ConnectWalletPage: React.FC<ConnectWalletPageProps> = ({ onNavigate }) => {
  const { 
    isConnected, 
    isConnecting, 
    isInstalled, 
    walletAddress, 
    walletError, 
    connectWallet,
    network
  } = useAppState();

  // Redirect to onboarding or dashboard once connected
  useEffect(() => {
    if (isConnected) {
      const timer = setTimeout(() => {
        onNavigate('onboarding');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, onNavigate]);

  return (
    <div className="flex justify-center items-center py-10 md:py-16 min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-[460px] flex flex-col gap-6">
        <GlassCard accent className="text-center p-8 flex flex-col gap-6">
          <div className="flex justify-center">
            <div className="bg-[#8b5cf6]/20 p-4 rounded-2xl text-[#22d3ee] shadow-[0_0_20px_rgba(139,92,246,0.2)]">
              <Shield size={32} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-white">Connect Your Wallet</h2>
            <p className="text-sm text-white/60">
              LegacyX requires a Stellar wallet to lock assets and sign contract heartbeats.
            </p>
          </div>

          {/* Wallet Options Card */}
          <div className="flex flex-col gap-4 mt-2">
            <div 
              onClick={!isConnected && !isConnecting ? connectWallet : undefined}
              className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all select-none ${
                isConnected 
                  ? 'border-[#22c55e]/30 bg-[#22c55e]/5' 
                  : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2.5 rounded-lg text-white">
                  <Smartphone size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-white">Freighter Wallet</span>
                  <span className="text-xs text-white/50">Stellar Chrome Extension</span>
                </div>
              </div>
              
              {isConnected ? (
                <div className="w-6 h-6 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e]">
                  <Check size={12} strokeWidth={3} />
                </div>
              ) : isConnecting ? (
                <div className="w-5 h-5 rounded-full border-2 border-t-transparent border-[#22d3ee] animate-spin" />
              ) : (
                <ChevronRightIcon />
              )}
            </div>
          </div>

          {/* Error States */}
          {walletError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-left flex gap-2 items-start text-xs text-red-400 font-mono">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{walletError}</span>
            </div>
          )}

          {!isInstalled && !isConnected && (
            <div className="p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg text-left flex gap-2 items-start text-xs text-yellow-400">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>
                Freighter wallet was not detected. Please install the Freighter extension or proceed to use simulated mock wallet mode for demo.
              </span>
            </div>
          )}

          {/* Network Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-white/40 border-t border-white/5 pt-4">
            <Disc size={10} className="text-[#22c55e] animate-pulse" />
            <span>Target Network:</span>
            <span className="font-mono font-bold text-white/80">{network}</span>
          </div>

          {/* Connected Success state */}
          {isConnected && (
            <div className="flex flex-col gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-300 font-mono text-center">
              <span>WALLET CONNECTED SUCCESS</span>
              <span className="text-white/60 truncate">{walletAddress}</span>
            </div>
          )}

          {/* Action Triggers */}
          {!isConnected ? (
            <GradientButton 
              variant="primary" 
              size="md" 
              fullWidth 
              onClick={connectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting to Freighter..." : "Connect Freighter Wallet"}
              {!isConnecting && <ArrowRight size={16} />}
            </GradientButton>
          ) : (
            <GradientButton 
              variant="secondary" 
              size="md" 
              fullWidth 
              onClick={() => onNavigate('onboarding')}
            >
              Proceed to Onboarding
              <ArrowRight size={16} />
            </GradientButton>
          )}
        </GlassCard>

        {/* Back Link */}
        <button 
          onClick={() => onNavigate('landing')}
          className="text-xs text-white/40 hover:text-white/60 transition-colors mx-auto underline cursor-pointer"
        >
          Cancel and return to home page
        </button>
      </div>
    </div>
  );
};

// Internal chevron icon
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 text-white/40">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);
