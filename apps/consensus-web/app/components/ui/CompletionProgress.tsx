'use client';

import React from 'react';
import { useCompletionCounts } from '../../hooks/useCompletionCounts';
import { cn } from '../../lib/utils';

interface CompletionProgressProps {
  roundId: string;
  members: any[];
  completions?: any[];
  className?: string;
  showNumbers?: boolean;
  showProgressBar?: boolean;
}

export function CompletionProgress({ 
  roundId, 
  members, 
  completions = [], 
  className,
  showNumbers = true,
  showProgressBar = true 
}: CompletionProgressProps) {
  const { completionCounts, updateCompletionCounts, getCompletionProgress } = useCompletionCounts(roundId, members);

  // Update counts when completions data changes
  React.useEffect(() => {
    updateCompletionCounts(completions);
  }, [completions, updateCompletionCounts]);

  const progress = getCompletionProgress();
  const completedCount = completionCounts.totalCompletions;
  const totalMembers = members.length;

  return (
    <div className={cn('space-y-2', className)}>
      {showNumbers && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Completed: <span className="font-medium text-foreground">{completedCount}</span> / {totalMembers}
          </span>
          <span className="text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
      )}
      
      {showProgressBar && (
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
