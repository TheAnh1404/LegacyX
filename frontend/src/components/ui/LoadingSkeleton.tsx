import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle' | 'card';
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  variant = 'text',
  count = 1
}) => {
  const items = Array.from({ length: count });

  const getStyle = () => {
    switch (variant) {
      case 'circle':
        return 'w-10 h-10 rounded-full';
      case 'rect':
        return 'w-full h-24 rounded-lg';
      case 'card':
        return 'w-full h-44 rounded-xl border border-white/5 bg-white/5 p-6';
      default:
        return 'w-full h-4 rounded';
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {items.map((_, i) => (
        <div
          key={i}
          className={cn(
            'skeleton',
            getStyle(),
            className
          )}
        />
      ))}
    </div>
  );
};
