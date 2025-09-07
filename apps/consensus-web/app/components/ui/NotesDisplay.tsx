'use client';

import React from 'react';
import { Card, CardContent } from './Card';
import { FileText, Calendar } from 'lucide-react';
import { MemberNote } from '../../context/AppContext';

interface NotesDisplayProps {
  note: MemberNote | null;
  roundTitle: string;
  onEdit: () => void;
  className?: string;
}

export function NotesDisplay({ note, roundTitle, onEdit, className }: NotesDisplayProps) {
  if (!note || (!note.title && !note.content)) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card className={`bg-muted/50 border-border ${className || ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              {note.title && (
                <h4 className="text-sm font-medium text-foreground mb-1">
                  {note.title}
                </h4>
              )}
              {note.content && (
                <p className="text-sm text-muted-foreground mb-2">
                  {truncateText(note.content)}
                </p>
              )}
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Updated {formatDate(note.updatedAt)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="text-xs text-primary hover:text-primary/80 transition-colors flex-shrink-0 ml-2"
          >
            Edit
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
