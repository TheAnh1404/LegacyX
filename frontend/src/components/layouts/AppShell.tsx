import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Settings, 
  Users, 
  Bell, 
  Menu, 
  X, 
  ExternalLink,
  ChevronRight,
  Disc
} from 'lucide-react';
import { useAppState } from '../../mock/store';
import { WalletBadge } from '../ui/WalletBadge';
import { GradientButton } from '../ui/GradientButton';
import { formatDate } from '../../lib/utils';

interface AppShellProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string, targetId?: string) => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  currentPage,
  onNavigate
}) => {
  const { 
    isConnected, 
    walletAddress, 
    connectWallet, 
    disconnectWallet, 
    notifications,
    markNotificationAsRead,
    clearNotifications,
    profile
  } = useAppState();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Owner Dashboard', icon: LayoutDashboard },
    { id: 'beneficiary', label: 'Beneficiary Claims', icon: Users },
    { id: 'history', label: 'Transactions', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-container bg-grid-dots">
      {/* Background Floating Orbs */}
      <div className="glow-orb orb-primary" />
      <div className="glow-orb orb-accent" />

      {/* Desktop Sidebar (Left) */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-[#050816]/60 backdrop-blur-xl border-r border-white/5 p-6 shrink-0 relative z-30 justify-between">
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div 
            onClick={() => onNavigate('landing')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="bg-[#8b5cf6] p-2 rounded-xl text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all duration-300 group-hover:scale-105">
              <Shield size={16} />
            </div>
            <span className="font-bold text-base tracking-wider bg-gradient-brand-text -webkit-background-clip-text -webkit-text-fill-color-transparent">
              LegacyX
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {isConnected && (
              <GradientButton
                variant="primary"
                size="sm"
                className="justify-start py-2.5 px-4 mb-4"
                onClick={() => onNavigate('create-will')}
              >
                <PlusCircle size={15} />
                Create Legacy Plan
              </GradientButton>
            )}

            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  disabled={!isConnected && item.id !== 'landing'}
                  className={`flex items-center gap-3 py-3 px-4 rounded-xl font-medium text-xs transition-all text-left cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                    isActive 
                      ? 'bg-white/5 border border-white/10 text-[#22d3ee] shadow-[0_0_15px_rgba(34,211,238,0.01)]' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={15} className={isActive ? 'text-[#22d3ee]' : 'text-white/50'} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile brief & status */}
        <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
          <a 
            href="https://stellar.expert" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between text-[10px] text-white/40 hover:text-white/70 px-1 transition-colors"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Disc size={10} className="text-[#22c55e] animate-pulse" />
              Stellar Testnet Node
            </span>
            <ExternalLink size={10} />
          </a>

          {isConnected && profile.displayName && (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center text-xs font-bold text-[#22d3ee]">
                {profile.displayName.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col truncate text-left">
                <span className="text-xs font-bold text-white/90 truncate">{profile.displayName}</span>
                <span className="text-[10px] text-white/40 truncate">{profile.email || "No Email"}</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Global Top Navbar & Main View Panel */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10 overflow-hidden">
        <header className="flex items-center justify-between h-[70px] bg-[#050816]/60 backdrop-blur-xl border-b border-white/5 px-6 relative z-20">
          {/* Mobile menu toggle */}
          <button 
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="lg:hidden text-white/70 hover:text-white p-2 bg-white/5 border border-white/5 rounded-lg cursor-pointer"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

          {/* Left spacer / Title for Desktop */}
          <div className="hidden lg:flex items-center gap-2 text-white/40 text-[10px] font-semibold uppercase tracking-wider">
            <span>Stellar Journey Demo</span>
            <ChevronRight size={10} />
            <span className="text-white/70 font-bold capitalize">{currentPage === 'landing' ? 'Intro' : currentPage}</span>
          </div>

          <div className="flex lg:hidden items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
            <Shield size={15} className="text-[#8b5cf6]" />
            <span className="font-bold text-sm tracking-wider bg-gradient-brand-text -webkit-background-clip-text -webkit-text-fill-color-transparent">
              LegacyX
            </span>
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-3">
            {/* Notification trigger */}
            <button 
              onClick={() => setNotifDrawerOpen(true)}
              className="relative p-2.5 bg-white/5 border border-white/5 hover:border-white/10 rounded-lg text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <Bell size={15} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white font-mono text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Wallet Connector */}
            {isConnected && walletAddress ? (
              <WalletBadge address={walletAddress} onDisconnect={disconnectWallet} />
            ) : (
              <GradientButton 
                variant="primary" 
                size="sm" 
                onClick={connectWallet}
              >
                Connect Wallet
              </GradientButton>
            )}
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 top-[70px] bg-[#050816]/95 backdrop-blur-xl z-30 flex flex-col p-6 border-t border-white/5"
            >
              <nav className="flex flex-col gap-2 mb-6">
                {isConnected && (
                  <GradientButton
                    variant="primary"
                    size="md"
                    className="py-3 px-4 mb-2 w-full"
                    onClick={() => handleNavClick('create-will')}
                  >
                    <PlusCircle size={16} />
                    Create Legacy Plan
                  </GradientButton>
                )}
                
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      disabled={!isConnected && item.id !== 'landing'}
                      className={`flex items-center gap-3 py-3.5 px-4 rounded-xl font-semibold text-sm text-left disabled:opacity-30 ${
                        isActive 
                          ? 'bg-white/5 border border-white/10 text-[#22d3ee]' 
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <Icon size={16} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
              <div className="border-t border-white/5 pt-4 mt-auto">
                <span className="text-xs text-white/30">LegacyX v1.0.0 (Stellar Smart Wills)</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notifications Drawer (Slide-out Right Panel) */}
        <AnimatePresence>
          {notifDrawerOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={() => setNotifDrawerOpen(false)}
              />
              
              {/* Drawer Container */}
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="fixed right-0 top-0 bottom-0 w-full sm:w-[380px] bg-[#0c0e1b]/95 backdrop-blur-xl border-l border-white/5 p-6 z-50 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)]"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-[#22d3ee]" />
                    <span className="font-bold text-sm text-white uppercase tracking-wider">Inbox Notifications</span>
                  </div>
                  <button 
                    onClick={() => setNotifDrawerOpen(false)}
                    className="text-white/40 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto flex flex-col gap-3 py-2">
                  {notifications.length === 0 ? (
                    <div className="text-center text-white/40 py-16 text-xs">
                      No active alerts.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-4 rounded-xl border text-left transition-all relative group cursor-pointer ${
                          n.read 
                            ? 'bg-white/[0.005] border-white/5 opacity-50' 
                            : 'bg-white/[0.02] border-white/8 hover:border-white/15'
                        }`}
                      >
                        {!n.read && (
                          <span className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-[#22d3ee]" />
                        )}
                        <div className="flex flex-col gap-1 pr-4">
                          <span className={`text-xs font-bold uppercase tracking-wider ${
                            n.type === 'danger' ? 'text-red-400' :
                            n.type === 'warning' ? 'text-yellow-400' :
                            n.type === 'success' ? 'text-green-400' : 'text-blue-400'
                          }`}>
                            {n.title}
                          </span>
                          <span className="text-xs text-white/70 leading-relaxed font-medium">{n.message}</span>
                          <span className="text-[9px] text-white/30 font-mono mt-1.5">{formatDate(n.timestamp)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="border-t border-white/5 pt-4 mt-auto">
                    <GradientButton 
                      variant="outline" 
                      size="sm" 
                      fullWidth 
                      onClick={clearNotifications}
                    >
                      Clear All Notifications
                    </GradientButton>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Inner page content */}
        <main className="main-content page-transition">
          {children}
        </main>
      </div>
    </div>
  );
};
