import React from 'react';
import { GlassCard } from './GlassCard';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action
}) => {
  return (
    <GlassCard className="flex flex-col items-center justify-center text-center p-8 md:p-12 w-full">
      <div className="bg-white/5 border border-white/10 p-4 rounded-full text-white/50 mb-4 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/60 max-w-sm mb-6">{description}</p>
      {action && <div className="flex justify-center">{action}</div>}
    </GlassCard>
  );
};
