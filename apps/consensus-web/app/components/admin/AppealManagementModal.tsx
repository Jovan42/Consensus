'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { X, FileText, CheckCircle, Clock, User, Mail, Calendar } from 'lucide-react';
import { Appeal, updateAppealStatus } from '../../hooks/useAppeals';
import { useToast } from '../../hooks/useToast';

interface AppealManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  appeal: Appeal | null;
  onStatusUpdate: () => void;
}

export function AppealManagementModal({ 
  isOpen, 
  onClose, 
  appeal, 
  onStatusUpdate 
}: AppealManagementModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleStatusUpdate = async (isRead: boolean) => {
    if (!appeal) return;

    setIsUpdating(true);
    setError(null);

    try {
      await updateAppealStatus(appeal.id, isRead);
      toast({
        title: 'Status Updated',
        message: `Appeal marked as ${isRead ? 'read' : 'unread'}`,
        type: 'success'
      });
      onStatusUpdate();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update appeal status';
      setError(errorMessage);
      toast({
        title: 'Error',
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
      setError(null);
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !appeal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Ban Appeal</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isUpdating}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          {/* User Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">User Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">{appeal.user?.name}</p>
                  <p className="text-xs text-muted-foreground">Name</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">{appeal.user?.email}</p>
                  <p className="text-xs text-muted-foreground">Email</p>
                </div>
              </div>
            </div>
          </div>

          {/* Appeal Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Appeal Details</h3>
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Submitted</span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {formatDate(appeal.createdAt)}
                </span>
              </div>
              
              {appeal.isRead && appeal.readAt && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">Read by</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {appeal.readByUser?.name} ({formatDate(appeal.readAt)})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Appeal Message */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Appeal Message</h3>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {appeal.message}
              </p>
            </div>
          </div>

          {/* Status Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUpdating}
            >
              Close
            </Button>
            <Button
              type="button"
              variant={appeal.isRead ? "outline" : "primary"}
              onClick={() => handleStatusUpdate(!appeal.isRead)}
              loading={isUpdating}
              disabled={isUpdating}
            >
              {appeal.isRead ? (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Mark as Unread
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Read
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
