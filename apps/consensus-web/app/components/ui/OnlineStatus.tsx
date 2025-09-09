'use client';

import React from 'react';
import { useOnlineUsers, OnlineUser } from '../../hooks/useOnlineUsers';
import { Card, CardContent, CardHeader } from './Card';
import { Badge } from './Badge';
import { Tooltip } from './Tooltip';
import { Users, Wifi, WifiOff } from 'lucide-react';
import { cn } from '../../lib/utils';

interface OnlineStatusProps {
  clubId: string;
  className?: string;
  showCount?: boolean;
  showList?: boolean;
  compact?: boolean;
}

export function OnlineStatus({ 
  clubId, 
  className, 
  showCount = true, 
  showList = false,
  compact = false 
}: OnlineStatusProps) {
  const { onlineUsers, count, isLoading, error } = useOnlineUsers(clubId);

  if (isLoading) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <div className="w-2 h-2 bg-muted rounded-full animate-pulse" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <WifiOff className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Status unavailable</span>
      </div>
    );
  }

  if (compact) {
    const tooltipContent = count > 0 ? (
      <div className="space-y-1">
        <div className="text-xs font-medium text-muted-foreground mb-1">Online Members</div>
        {onlineUsers.map((user) => (
          <div key={user.userId} className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs">{user.userName}</span>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-xs text-muted-foreground">No members online</div>
    );

    return (
      <Tooltip content={tooltipContent} side="bottom">
        <div className={cn('flex items-center space-x-2 cursor-pointer', className)}>
          <div className="relative">
            <Wifi className="h-4 w-4 text-green-500" />
            {count > 0 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
          {showCount && (
            <span className="text-sm font-medium text-foreground">{count}</span>
          )}
        </div>
      </Tooltip>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">Online Members</h3>
          </div>
          {showCount && (
            <Badge variant="secondary" className="text-xs">
              {count} online
            </Badge>
          )}
        </div>
      </CardHeader>
      
      {showList && (
        <CardContent className="pt-0">
          {count === 0 ? (
            <div className="text-center py-4">
              <WifiOff className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No members online</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {onlineUsers.map((user) => (
                <OnlineUserItem key={user.userId} user={user} />
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function OnlineUserItem({ user }: { user: OnlineUser }) {
  return (
    <div className="flex items-center space-x-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="relative">
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xs font-medium text-primary">
            {user.userName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-background" />
      </div>
      <p className="text-sm font-medium text-foreground truncate">
        {user.userName}
      </p>
    </div>
  );
}
