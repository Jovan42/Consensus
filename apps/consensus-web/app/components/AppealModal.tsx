'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Alert } from './ui/Alert';
import { X, FileText, Send } from 'lucide-react';
import { createAppeal } from '../hooks/useAppeals';
import { useToast } from '../hooks/useToast';

interface AppealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AppealModal({ isOpen, onClose, onSuccess }: AppealModalProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter your appeal message');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createAppeal(message.trim());
      toast({
        title: 'Appeal Submitted',
        message: 'Your appeal has been submitted successfully. We will review it soon.',
        type: 'success'
      });
      onSuccess();
      onClose();
      setMessage('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit appeal';
      setError(errorMessage);
      toast({
        title: 'Error',
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setMessage('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Appeal Ban</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="appeal-message" className="text-sm font-medium text-foreground">
              Appeal Message
            </label>
            <p className="text-sm text-muted-foreground">
              Please explain why you believe your ban should be lifted. Provide any relevant context or evidence.
            </p>
            <textarea
              id="appeal-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your appeal message here..."
              className="w-full min-h-[120px] p-3 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              disabled={isSubmitting}
              maxLength={1000}
            />
            <div className="text-xs text-muted-foreground text-right">
              {message.length}/1000 characters
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={!message.trim() || isSubmitting}
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Appeal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
