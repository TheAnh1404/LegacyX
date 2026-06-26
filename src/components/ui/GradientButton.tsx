import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  ...props
}) => {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none outline-none',
        // Sizes
        size === 'sm' && 'text-xs py-2 px-4',
        size === 'md' && 'text-sm py-2.5 px-5',
        size === 'lg' && 'text-base py-3 px-7',
        
        // Width
        fullWidth ? 'w-full' : 'w-auto',
        
        // Variants
        variant === 'primary' && 'text-white border-0 bg-gradient-brand-text shadow-[0_0_20px_-3px_rgba(139,92,246,0.3)] hover:brightness-110 hover:shadow-[0_0_25px_-1px_rgba(139,92,246,0.4)] active:brightness-95',
        variant === 'secondary' && 'bg-white/5 text-white border border-white/5 hover:bg-white/10 active:bg-white/12',
        variant === 'outline' && 'bg-transparent text-white border border-white/10 hover:border-white/20 hover:bg-white/5',
        variant === 'ghost' && 'bg-transparent text-white/60 hover:text-white hover:bg-white/5',
        variant === 'danger' && 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30',
        className
      )}
      {...props as any}
    >
      {children}
    </motion.button>
  );
};
