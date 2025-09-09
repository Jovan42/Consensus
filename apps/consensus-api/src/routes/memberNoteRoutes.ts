import { Router } from 'express';
import { getMemberNoteByRound, updateMemberNote, getAllMemberNotes, deleteMemberNote, debugMemberNoteAccess } from '../controllers/memberNoteController';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

// Debug endpoint to troubleshoot access issues
router.get('/debug/round/:roundId', debugMemberNoteAccess);

// Get or create a note for a specific round
router.get('/round/:roundId', getMemberNoteByRound);

// Update a note
router.put('/:noteId', updateMemberNote);

// Get all notes for the authenticated member
router.get('/', getAllMemberNotes);

// Delete a note
router.delete('/:noteId', deleteMemberNote);

export default router;
