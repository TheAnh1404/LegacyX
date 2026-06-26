import React from 'react';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: 'ACTIVE' | 'CLAIMED' | 'CANCELLED' | 'PENDING' | 'EXPIRED';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getColors = () => {
    switch (status) {
      case 'ACTIVE':
        return 'text-[#22d3ee] bg-[#22d3ee]/10 border border-[#22d3ee]/20';
      case 'CLAIMED':
        return 'text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20';
      case 'CANCELLED':
        return 'text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20';
      case 'PENDING':
        return 'text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20';
      case 'EXPIRED':
        return 'text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20';
      default:
        return 'text-white/60 bg-white/5 border border-white/10';
    }
  };

  return (
    <span
      className={cn(
        'px-2.5 py-1 text-xs font-mono font-semibold rounded-full uppercase tracking-wider inline-flex items-center gap-1.5',
        getColors(),
        className
      )}
    >
      <span className={cn(
        'w-1.5 h-1.5 rounded-full inline-block',
        status === 'ACTIVE' && 'bg-[#22d3ee]',
        status === 'CLAIMED' && 'bg-[#22c55e]',
        status === 'CANCELLED' && 'bg-[#ef4444]',
        status === 'PENDING' && 'bg-[#f59e0b]',
        status === 'EXPIRED' && 'bg-[#ef4444]'
      )} />
      {status}
    </span>
  );
};
