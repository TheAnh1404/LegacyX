import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  accent?: boolean;
  hover?: boolean;
  delay?: number; // entry delay
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  accent = false,
  hover = true,
  delay = 0,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={cn(
        'glass-card',
        hover && 'glass-card-hover',
        accent && 'glass-card-accent',
        className
      )}
      {...props as any}
    >
      {children}
    </motion.div>
  );
};
