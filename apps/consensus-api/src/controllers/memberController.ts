import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Member } from '../entities/Member';
import { CreateMemberRequestDto, UpdateMemberDto } from '../dto/member.dto';
import { Club } from '../entities/Club';
import { NotFoundError, asyncHandler } from '../middleware/error.middleware';

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
    const { memberId } = req.params;

    const memberRepository = AppDataSource.getRepository(Member);
    const member = await memberRepository.findOne({ where: { id: memberId } });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    await memberRepository.remove(member);

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
