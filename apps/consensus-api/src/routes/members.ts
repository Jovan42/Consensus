import { Router } from 'express';
import {
  addMemberToClub,
  getClubMembers,
  updateMember,
  removeMember,
  getMemberById
} from '../controllers/memberController';
import { validateDto } from '../middleware/validation.middleware';
import { CreateMemberRequestDto, UpdateMemberDto } from '../dto/member.dto';

const router = Router();

// Member routes
router.post('/clubs/:clubId/members', validateDto(CreateMemberRequestDto), addMemberToClub);
router.get('/clubs/:clubId/members', getClubMembers);
router.get('/members/:memberId', getMemberById);
router.put('/members/:memberId', validateDto(UpdateMemberDto), updateMember);
router.delete('/members/:memberId', removeMember);

export default router;
