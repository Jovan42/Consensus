'use client';

import React from 'react';
import { cn } from '../../lib/utils';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

export function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className,
  ...props
}: AlertProps) {
  const variants = {
    success: 'bg-success/10 border-success/20 text-success',
    error: 'bg-error/10 border-error/20 text-error',
    warning: 'bg-warning/10 border-warning/20 text-warning',
    info: 'bg-primary/10 border-primary/20 text-primary',
  };

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info,
  };

  const Icon = icons[variant];

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        variants[variant],
        className
      )}
      {...props}
    >
      <div className="flex items-start">
        <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
        <div className="flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">{title}</h3>
          )}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0 text-current opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
