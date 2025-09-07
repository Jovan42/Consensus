'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Card, CardContent, CardHeader } from './Card';
import { Alert } from './Alert';
import { Save, X, FileText } from 'lucide-react';
import { MemberNote } from '../../context/AppContext';

interface NotesEditorProps {
  note: MemberNote | null;
  roundTitle: string;
  onSave: (noteId: string, data: { title?: string; content?: string }) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export function NotesEditor({ note, roundTitle, onSave, onClose, isLoading = false }: NotesEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form with existing note data
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
    } else {
      setTitle('');
      setContent('');
    }
    setHasChanges(false);
    setError(null);
  }, [note]);

  // Track changes
  useEffect(() => {
    const originalTitle = note?.title || '';
    const originalContent = note?.content || '';
    setHasChanges(title !== originalTitle || content !== originalContent);
  }, [title, content, note]);

  const handleSave = async () => {
    if (!note) {
      setError('No note to save');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(note.id, {
        title: title.trim() || undefined,
        content: content.trim() || undefined,
      });
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save notes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close without saving?'
      );
      if (!confirmed) return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {note ? 'Edit Notes' : 'Add Notes'}
              </h2>
              <p className="text-sm text-muted-foreground">
                Private notes for: {roundTitle}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="note-title" className="text-sm font-medium text-foreground">
              Title (optional)
            </label>
            <Input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your notes..."
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="note-content" className="text-sm font-medium text-foreground">
              Notes
            </label>
            <Textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your private notes about this round..."
              rows={12}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              These notes are private and only visible to you. Not even admins can see them.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              {hasChanges && (
                <span className="text-warning-600">You have unsaved changes</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSaving || isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || isLoading || !hasChanges}
                className="flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Notes</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
