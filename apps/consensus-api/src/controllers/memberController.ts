import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Member } from '../entities/Member';
import { CreateMemberRequestDto, UpdateMemberDto } from '../dto/member.dto';
import { Club } from '../entities/Club';
import { NotFoundError, asyncHandler } from '../middleware/error.middleware';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { getSocketManager, emitMemberAdded, emitMemberRemoved, emitMemberRoleChanged } from '../utils/socket';
import { NotificationService } from '../services/notificationService';
import { NotificationType } from '../entities/Notification';


export const addMemberToClub = async (req: Request, res: Response) => {
  try {
    const { clubId } = req.params;
    const { name, email } = req.body as CreateMemberRequestDto;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    // Check if club exists
    const clubRepository = AppDataSource.getRepository(Club);
    const club = await clubRepository.findOne({ where: { id: clubId } });

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Create member
    const memberRepository = AppDataSource.getRepository(Member);
    const member = memberRepository.create({
      name,
      email,
      clubId
    });

    const savedMember = await memberRepository.save(member);

    // Emit real-time member added event
    const socketManager = getSocketManager(req);
    emitMemberAdded(
      socketManager,
      clubId,
      savedMember.id,
      savedMember.name,
      savedMember.email,
      savedMember.isClubManager ? 'manager' : 'member'
    );

    // Create and save notifications for all existing club members
    await NotificationService.createAndEmitClubNotification(req, {
      type: NotificationType.MEMBER_ADDED,
      title: 'New Member Added',
      message: `${savedMember.name} has been added to the club`,
      clubId: clubId,
      data: {
        newMemberName: savedMember.name,
        newMemberEmail: savedMember.email,
        newMemberId: savedMember.id,
        isClubManager: savedMember.isClubManager
      }
    });

    res.status(201).json({
      success: true,
      data: savedMember,
      message: 'Member added to club successfully'
    });
  } catch (error) {
    console.error('Error adding member to club:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getClubMembers = async (req: Request, res: Response) => {
  try {
    const { clubId } = req.params;

    // Check if club exists
    const clubRepository = AppDataSource.getRepository(Club);
    const club = await clubRepository.findOne({ where: { id: clubId } });

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Get members for the club
    const memberRepository = AppDataSource.getRepository(Member);
    const members = await memberRepository.find({
      where: { clubId },
      order: { createdAt: 'ASC' }
    });

    res.json({
      success: true,
      data: members,
      count: members.length
    });
  } catch (error) {
    console.error('Error fetching club members:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateMember = async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const { name, email } = req.body as UpdateMemberDto;

    const memberRepository = AppDataSource.getRepository(Member);
    const member = await memberRepository.findOne({ where: { id: memberId } });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Update fields if provided
    if (name) member.name = name;
    if (email !== undefined) member.email = email;

    const updatedMember = await memberRepository.save(member);

    res.json({
      success: true,
      data: updatedMember,
      message: 'Member updated successfully'
    });
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const removeMember = async (req: Request, res: Response) => {
  try {
    const { memberId, clubId } = req.params;

    // Validate required fields
    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: 'Member ID is required'
      });
    }

    if (!clubId) {
      return res.status(400).json({
        success: false,
        message: 'Club ID is required'
      });
    }

    const memberRepository = AppDataSource.getRepository(Member);
    const member = await memberRepository.findOne({ 
      where: { 
        id: memberId,
        clubId: clubId 
      } 
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found in this club'
      });
    }

    // Store member info before removal for real-time events
    const memberInfo = {
      id: member.id,
      name: member.name,
      clubId: member.clubId
    };

    await memberRepository.remove(member);

    // Emit real-time member removed event
    const socketManager = getSocketManager(req);
    emitMemberRemoved(
      socketManager,
      memberInfo.clubId,
      memberInfo.id,
      memberInfo.name
    );

    // Create and save notifications for all remaining club members
    await NotificationService.createAndEmitClubNotification(req, {
      type: NotificationType.MEMBER_REMOVED,
      title: 'Member Removed',
      message: `${memberInfo.name} has been removed from the club`,
      clubId: memberInfo.clubId,
      data: {
        removedMemberName: memberInfo.name,
        removedMemberId: memberInfo.id
      }
    });

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getMemberById = asyncHandler(async (req: Request, res: Response) => {
  const { memberId } = req.params;

  const memberRepository = AppDataSource.getRepository(Member);
  const member = await memberRepository.findOne({
    where: { id: memberId },
    relations: ['club']
  });

  if (!member) {
    throw new NotFoundError('Member', memberId);
  }

  res.json({
    success: true,
    data: member
  });
});

export const updateMemberManagerStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { memberId } = req.params;
    const { isClubManager: newManagerStatus } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const memberRepository = AppDataSource.getRepository(Member);
    const member = await memberRepository.findOne({
      where: { id: memberId },
      relations: ['club']
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Check if the requesting user is a club manager or site admin
    const requestingUserMember = await memberRepository.findOne({
      where: { 
        email: req.user.email,
        clubId: member.clubId
      }
    });

    const isSiteAdmin = req.user.role === 'admin';
    const isClubManager = requestingUserMember?.isClubManager || false;

    if (!isSiteAdmin && !isClubManager) {
      return res.status(403).json({
        success: false,
        message: 'Only club managers or site admins can update member manager status'
      });
    }

    // Store old status for real-time events
    const oldRole = member.isClubManager ? 'manager' : 'member';
    const newRole = newManagerStatus ? 'manager' : 'member';

    // Update the member's manager status
    member.isClubManager = newManagerStatus;
    const updatedMember = await memberRepository.save(member);

    // Emit real-time role change event
    const socketManager = getSocketManager(req);
    emitMemberRoleChanged(
      socketManager,
      member.clubId,
      member.id,
      member.name,
      oldRole,
      newRole
    );

    // Create and save notifications for all club members
    const actionText = newManagerStatus ? 'promoted to' : 'removed from';
    await NotificationService.createAndEmitClubNotification(req, {
      type: NotificationType.MEMBER_ROLE_CHANGED,
      title: 'Role Changed',
      message: `${member.name} has been ${actionText} club manager`,
      clubId: member.clubId,
      data: {
        memberName: member.name,
        memberId: member.id,
        oldRole: oldRole,
        newRole: newRole,
        action: actionText
      }
    });

    res.json({
      success: true,
      data: updatedMember,
      message: `Member ${newManagerStatus ? 'promoted to' : 'removed from'} club manager successfully`
    });
  } catch (error) {
    console.error('Error updating member manager status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
