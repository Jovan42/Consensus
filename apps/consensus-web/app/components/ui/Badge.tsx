'use client';

import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  size?: 'sm' | 'default' | 'lg';
}

const badgeVariants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/80',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
  outline: 'border border-border text-foreground',
  success: 'bg-green-500 text-white hover:bg-green-600',
  warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
};

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  default: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-base',
};

export function Badge({ 
  className, 
  variant = 'default', 
  size = 'default',
  ...props 
}: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
      {...props}
    />
  );
}
