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
      <div 
        className="relative group cursor-help"
        title="Connection to server lost. Real-time updates may be delayed. Check your internet connection."
      >
        <WifiOff className="h-4 w-4 text-red-500" />
        {/* Tooltip */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 max-w-xs">
          Connection to server lost. Real-time updates may be delayed. Check your internet connection.
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
        </div>
      </div>
      {showText && (
        <span className="text-sm text-red-500">
          Connection Lost
        </span>
      )}
    </div>
  );
}
