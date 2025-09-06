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
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
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
