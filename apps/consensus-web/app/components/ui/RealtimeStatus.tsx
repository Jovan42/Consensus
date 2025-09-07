'use client';

import React from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { Wifi, WifiOff } from 'lucide-react';

interface RealtimeStatusProps {
  className?: string;
  showText?: boolean;
  showForAdminsOnly?: boolean;
}

export function RealtimeStatus({ className = '', showText = true, showForAdminsOnly = false }: RealtimeStatusProps) {
  const { isConnected } = useSocket();
  const { hasRole } = useAuth();

  // If showForAdminsOnly is true, only show for admins
  if (showForAdminsOnly && !hasRole('admin')) {
    return null;
  }

  // Only show the status when disconnected
  if (isConnected) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <WifiOff className="h-4 w-4 text-red-500" />
      {showText && (
        <span className="text-sm text-red-500">
          Connection Lost
        </span>
      )}
    </div>
  );
}
