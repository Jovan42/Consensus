import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Completion } from '../entities/Completion';
import { Round } from '../entities/Round';
import { Member } from '../entities/Member';
import { RoundStatus } from '../types/enums';
import { MarkCompletionDto } from '../dto/completion.dto';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const markCompletion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { roundId } = req.params;
    const { memberId, isCompleted } = req.body as MarkCompletionDto;

    // Validate required fields
    if (!roundId) {
      return res.status(400).json({
        success: false,
        message: 'Round ID is required'
      });
    }

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: 'Member ID is required'
      });
    }

    if (typeof isCompleted !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isCompleted must be a boolean value'
      });
    }

    // Validate user authentication
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if round exists and is in completed status
    const round = await AppDataSource.getRepository(Round).findOne({
      where: { id: roundId },
      relations: ['club']
    });

    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Round not found'
      });
    }

    if (round.status !== RoundStatus.COMPLETING) {
      return res.status(400).json({
        success: false,
        message: 'Round is not in completing status'
      });
    }

    if (!round.winningRecommendationId) {
      return res.status(400).json({
        success: false,
        message: 'No winning recommendation found for this round'
      });
    }

    // Verify member exists and belongs to the club
    const member = await AppDataSource.getRepository(Member).findOne({
      where: { id: memberId, clubId: round.clubId }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found or does not belong to this club'
      });
    }

    // Check completion permissions
    const isMarkingForSelf = member.email === req.user.email;
    const isAdmin = req.user.role === 'admin';
    
    // Check if user is a club manager
    const userMember = await AppDataSource.getRepository(Member).findOne({
      where: { 
        email: req.user.email,
        clubId: round.clubId
      }
    });
    const isClubManager = userMember?.isClubManager || false;
    
    if (!isMarkingForSelf && !isAdmin && !isClubManager) {
      return res.status(403).json({
        success: false,
        message: 'You can only mark completion for yourself. Club managers and admins can mark completion for others.'
      });
    }

    // Check if completion already exists
    let completion = await AppDataSource.getRepository(Completion).findOne({
      where: {
        memberId,
        recommendationId: round.winningRecommendationId
      }
    });

    if (completion) {
      // Update existing completion
      completion.isCompleted = isCompleted;
      await AppDataSource.getRepository(Completion).save(completion);
    } else {
      // Create new completion
      completion = new Completion();
      completion.memberId = memberId;
      completion.recommendationId = round.winningRecommendationId;
      completion.isCompleted = isCompleted;
      await AppDataSource.getRepository(Completion).save(completion);
    }

    res.status(201).json({
      success: true,
      data: completion,
      message: `Completion status updated successfully`
    });
  } catch (error) {
    console.error('Error marking completion:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getCompletionsByRound = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { roundId } = req.params;

    if (!roundId) {
      return res.status(400).json({
        success: false,
        message: 'Round ID is required'
      });
    }

    // Get round with winning recommendation
    const round = await AppDataSource.getRepository(Round).findOne({
      where: { id: roundId }
    });

    if (!round || !round.winningRecommendationId) {
      return res.status(404).json({
        success: false,
        message: 'Round not found or no winning recommendation'
      });
    }

    // Get all completions for the winning recommendation
    const completions = await AppDataSource.getRepository(Completion)
      .createQueryBuilder('completion')
      .leftJoinAndSelect('completion.member', 'member')
      .leftJoinAndSelect('completion.recommendation', 'recommendation')
      .where('completion.recommendationId = :recommendationId', {
        recommendationId: round.winningRecommendationId
      })
      .getMany();

    res.status(200).json({
      success: true,
      data: completions
    });
  } catch (error) {
    console.error('Error getting completions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getCompletionStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { roundId } = req.params;

    if (!roundId) {
      return res.status(400).json({
        success: false,
        message: 'Round ID is required'
      });
    }

    // Get round with club and winning recommendation
    const round = await AppDataSource.getRepository(Round).findOne({
      where: { id: roundId },
      relations: ['club']
    });

    if (!round || !round.winningRecommendationId) {
      return res.status(404).json({
        success: false,
        message: 'Round not found or no winning recommendation'
      });
    }

    // Get all members in the club
    const members = await AppDataSource.getRepository(Member).find({
      where: { clubId: round.clubId }
    });

    // Get all completions for the winning recommendation
    const completions = await AppDataSource.getRepository(Completion).find({
      where: { recommendationId: round.winningRecommendationId }
    });

    // Create completion status for each member
    const completionStatus = members.map(member => {
      const completion = completions.find(c => c.memberId === member.id);
      return {
        memberId: member.id,
        memberName: member.name,
        isCompleted: completion ? completion.isCompleted : false,
        completedAt: completion && completion.isCompleted ? completion.updatedAt : null
      };
    });

    const completedCount = completionStatus.filter(c => c.isCompleted).length;
    const totalCount = completionStatus.length;
    const allCompleted = completedCount === totalCount;

    res.status(200).json({
      success: true,
      data: {
        roundId,
        winningRecommendationId: round.winningRecommendationId,
        completionStatus,
        summary: {
          completed: completedCount,
          total: totalCount,
          allCompleted,
          percentage: totalCount > 0 ? (completedCount / totalCount) * 100 : 0
        }
      }
    });
  } catch (error) {
    console.error('Error getting completion status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
