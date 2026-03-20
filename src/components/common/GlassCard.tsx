import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, hoverable = false }) => {
  return (
    <div className={cn(
      "glass-card p-6 border-white/10",
      hoverable && "hover:border-primary/30 hover:shadow-primary/5 cursor-pointer hover:-translate-y-1",
      className
    )}>
      {children}
    </div>
  );
};
