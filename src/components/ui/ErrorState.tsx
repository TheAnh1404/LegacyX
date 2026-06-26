import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GradientButton } from './GradientButton';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Transaction Encountered an Error",
  message,
  onRetry
}) => {
  return (
    <GlassCard className="border-red-500/20 bg-red-500/5 p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between w-full">
      <div className="flex gap-3 items-start">
        <div className="text-red-400 p-2 bg-red-500/10 rounded-lg shrink-0 mt-0.5">
          <AlertCircle size={20} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-red-200">
            {title}
          </span>
          <span className="text-xs text-red-200/70 font-mono">
            {message}
          </span>
        </div>
      </div>
      
      {onRetry && (
        <GradientButton
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="text-red-300 border-red-500/25 hover:bg-red-500/10 hover:border-red-500/40"
        >
          <RefreshCw size={14} />
          Retry Signature
        </GradientButton>
      )}
    </GlassCard>
  );
};
