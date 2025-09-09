'use client';

import React, { useState } from 'react';
import { User } from '../hooks/useUsers';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/Dialog';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/Alert';

interface DeleteUserModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteUserModal({ user, isOpen, onClose, onConfirm }: DeleteUserModalProps) {
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const isConfirmationValid = confirmationText === user.email;

  const handleDelete = async () => {
    if (!isConfirmationValid) return;

    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setConfirmationText('');
    setIsDeleting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            <span>Delete User</span>
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the user account and all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Deleting this user will remove all their:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Club memberships</li>
                <li>Votes and recommendations</li>
                <li>Settings and preferences</li>
                <li>All associated data</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="confirmation">
              To confirm deletion, type the user's email address:
            </Label>
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">
                {user.name} ({user.email})
              </div>
              <Input
                id="confirmation"
                placeholder={user.email}
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className={!isConfirmationValid && confirmationText ? 'border-destructive' : ''}
              />
            </div>
            {!isConfirmationValid && confirmationText && (
              <p className="text-sm text-destructive">
                Email address must match exactly
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmationValid || isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
