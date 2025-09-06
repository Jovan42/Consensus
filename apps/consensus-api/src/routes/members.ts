import { Router } from 'express';
import {
  addMemberToClub,
  getClubMembers,
  updateMember,
  removeMember,
  getMemberById
} from '../controllers/memberController';

const router = Router();

// Member routes
router.post('/clubs/:clubId/members', addMemberToClub);
router.get('/clubs/:clubId/members', getClubMembers);
router.get('/members/:memberId', getMemberById);
router.put('/members/:memberId', updateMember);
router.delete('/members/:memberId', removeMember);

export default router;
