'use client';

import React from 'react';
import { Button } from './Button';
import { FileText, Edit3 } from 'lucide-react';

interface NotesButtonProps {
  roundId: string;
  hasNotes: boolean;
  onClick: () => void;
  className?: string;
}

export function NotesButton({ roundId, hasNotes, onClick, className }: NotesButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={`flex items-center space-x-2 ${className || ''}`}
    >
      {hasNotes ? (
        <>
          <Edit3 className="h-4 w-4" />
          <span>Edit Notes</span>
        </>
      ) : (
        <>
          <FileText className="h-4 w-4" />
          <span>Add Notes</span>
        </>
      )}
    </Button>
  );
}
