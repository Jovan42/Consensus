'use client';

import React from 'react';
import { useVoteCounts } from '../../hooks/useVoteCounts';
import { cn } from '../../lib/utils';

interface VoteProgressProps {
  roundId: string;
  members: any[];
  votes?: any[];
  className?: string;
  showNumbers?: boolean;
  showProgressBar?: boolean;
}

export function VoteProgress({ 
  roundId, 
  members, 
  votes = [], 
  className,
  showNumbers = true,
  showProgressBar = true 
}: VoteProgressProps) {
  const { voteCounts, updateVoteCounts, getVoteProgress } = useVoteCounts(roundId, members);

  // Update counts when votes data changes
  React.useEffect(() => {
    updateVoteCounts(votes);
  }, [votes, updateVoteCounts]);

  const progress = getVoteProgress();
  const votedCount = voteCounts.totalVotes;
  const totalMembers = members.length;

  return (
    <div className={cn('space-y-2', className)}>
      {showNumbers && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Votes: <span className="font-medium text-foreground">{votedCount}</span> / {totalMembers}
          </span>
          <span className="text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
      )}
      
      {showProgressBar && (
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
