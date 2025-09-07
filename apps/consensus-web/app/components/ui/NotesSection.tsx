'use client';

import React, { useState } from 'react';
import { NotesButton } from './NotesButton';
import { NotesEditor } from './NotesEditor';
import { NotesDisplay } from './NotesDisplay';
import { useMemberNote, useUpdateMemberNote } from '../../hooks/useApi';
import { MemberNote } from '../../context/AppContext';

interface NotesSectionProps {
  roundId: string;
  roundTitle: string;
  className?: string;
  isMember?: boolean;
}

export function NotesSection({ roundId, roundTitle, className, isMember = true }: NotesSectionProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const { note, isLoading, error, mutate } = useMemberNote(roundId);
  const updateNote = useUpdateMemberNote();

  const handleSave = async (noteId: string, data: { title?: string; content?: string }) => {
    try {
      await updateNote(noteId, data);
      await mutate(); // Refresh the note data
    } catch (error) {
      throw error; // Re-throw to let the editor handle the error
    }
  };

  const handleOpenEditor = () => {
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
  };

  // Don't show notes section if user is not a member or if there's an error
  if (!isMember || error) {
    if (error) {
      console.error('Error loading notes:', error);
    }
    return null;
  }

  const hasNotes = note && (note.title || note.content);

  return (
    <div className={`space-y-3 ${className || ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">My Private Notes</h3>
        <NotesButton
          roundId={roundId}
          hasNotes={!!hasNotes}
          onClick={handleOpenEditor}
        />
      </div>

      {hasNotes && (
        <NotesDisplay
          note={note}
          roundTitle={roundTitle}
          onEdit={handleOpenEditor}
        />
      )}

      {isEditorOpen && (
        <NotesEditor
          note={note}
          roundTitle={roundTitle}
          onSave={handleSave}
          onClose={handleCloseEditor}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
