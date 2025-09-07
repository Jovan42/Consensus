import { Router } from 'express';
import { getMemberNoteByRound, updateMemberNote, getAllMemberNotes, deleteMemberNote } from '../controllers/memberNoteController';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

// Get or create a note for a specific round
router.get('/round/:roundId', getMemberNoteByRound);

// Update a note
router.put('/:noteId', updateMemberNote);

// Get all notes for the authenticated member
router.get('/', getAllMemberNotes);

// Delete a note
router.delete('/:noteId', deleteMemberNote);

export default router;
