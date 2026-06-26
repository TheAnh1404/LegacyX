import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TimelineStep {
  title: string;
  description: string;
  status: 'upcoming' | 'current' | 'completed';
}

interface TimelineProps {
  steps: TimelineStep[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  steps,
  orientation = 'horizontal',
  className
}) => {
  if (orientation === 'vertical') {
    return (
      <div className={cn('flex flex-col gap-6 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10', className)}>
        {steps.map((step, idx) => (
          <div key={idx} className="flex gap-4 items-start relative">
            <div className={cn(
              'absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center border z-10',
              step.status === 'completed' && 'bg-[#8b5cf6] border-[#8b5cf6] text-white',
              step.status === 'current' && 'bg-[#050816] border-[#22d3ee] text-[#22d3ee] shadow-[0_0_8px_var(--accent)]',
              step.status === 'upcoming' && 'bg-[#050816] border-white/20 text-white/40'
            )}>
              {step.status === 'completed' ? (
                <Check size={10} strokeWidth={3} />
              ) : (
                <span className="text-[10px] font-bold font-mono">{idx + 1}</span>
              )}
            </div>
            
            <div className="flex flex-col gap-1">
              <span className={cn(
                'text-sm font-semibold',
                step.status === 'completed' && 'text-white/90',
                step.status === 'current' && 'text-[#22d3ee]',
                step.status === 'upcoming' && 'text-white/40'
              )}>
                {step.title}
              </span>
              <span className={cn(
                'text-xs',
                step.status === 'upcoming' ? 'text-white/20' : 'text-white/60'
              )}>
                {step.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Horizontal layout
  return (
    <div className={cn('flex items-center justify-between w-full relative before:absolute before:left-0 before:right-0 before:top-[18px] before:h-[2px] before:bg-white/10 before:-z-10', className)}>
      {steps.map((step, idx) => (
        <div key={idx} className="flex flex-col items-center flex-1 text-center relative z-10 px-2">
          <div className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300',
            step.status === 'completed' && 'bg-[#8b5cf6] border-[#8b5cf6] text-white',
            step.status === 'current' && 'bg-[#050816] border-[#22d3ee] text-[#22d3ee] shadow-[0_0_12px_rgba(34,211,238,0.25)]',
            step.status === 'upcoming' && 'bg-[#050816] border-white/10 text-white/40'
          )}>
            {step.status === 'completed' ? (
              <Check size={16} strokeWidth={2.5} />
            ) : (
              <span className="font-semibold text-sm font-mono">{idx + 1}</span>
            )}
          </div>
          <span className={cn(
            'text-xs font-semibold mt-2.5 max-w-[120px] truncate',
            step.status === 'completed' && 'text-white/90',
            step.status === 'current' && 'text-[#22d3ee]',
            step.status === 'upcoming' && 'text-white/40'
          )}>
            {step.title}
          </span>
          <span className="text-[10px] text-white/40 max-w-[100px] truncate hidden md:inline">
            {step.description}
          </span>
        </div>
      ))}
    </div>
  );
};
