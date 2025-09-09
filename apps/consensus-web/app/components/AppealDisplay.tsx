'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Badge } from './ui/Badge';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Appeal } from '../hooks/useAppeals';

interface AppealDisplayProps {
  appeal: Appeal;
}

export function AppealDisplay({ appeal }: AppealDisplayProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Ban Appeal
            </h3>
          </div>
          <Badge 
            variant={appeal.isRead ? "secondary" : "default"}
            className={appeal.isRead ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"}
          >
            {appeal.isRead ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Read
              </>
            ) : (
              <>
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
              Your Message:
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-md">
              {appeal.message}
            </p>
          </div>
          
          <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
            <p>
              <strong>Submitted:</strong> {formatDate(appeal.createdAt)}
            </p>
            {appeal.isRead && appeal.readAt && (
              <p>
                <strong>Read by admin:</strong> {formatDate(appeal.readAt)}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
