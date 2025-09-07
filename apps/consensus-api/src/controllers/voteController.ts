import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Vote } from '../entities/Vote';
import { Round } from '../entities/Round';
import { Member } from '../entities/Member';
import { Recommendation } from '../entities/Recommendation';
import { RoundStatus } from '../types/enums';
import { SubmitVotesDto } from '../dto/vote.dto';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { getSocketManager, emitVoteCast, emitRoundStatusChanged, emitNotification } from '../utils/socket';
import { NotificationService } from '../services/notificationService';
import { NotificationType } from '../entities/Notification';

export const submitVotes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { roundId } = req.params;
    const { votes, memberId } = req.body as SubmitVotesDto;

    // Validate required fields
    if (!roundId) {
      return res.status(400).json({
        success: false,
        message: 'Round ID is required'
      });
    }

    if (!votes || !Array.isArray(votes) || votes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Votes array is required and must not be empty'
      });
    }

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: 'Member ID is required'
      });
    }

    // Validate user authentication
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if round exists and is in voting status
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

    if (round.status !== RoundStatus.VOTING) {
      return res.status(400).json({
        success: false,
        message: 'Round is not in voting status'
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

    // Check voting permissions
    const isVotingForSelf = member.email === req.user.email;
    const isAdmin = req.user.role === 'admin';
    
    // Check if user is a club manager
    const userMember = await AppDataSource.getRepository(Member).findOne({
      where: { 
        email: req.user.email,
        clubId: round.clubId
      }
    });
    const isClubManager = userMember?.isClubManager || false;
    
    if (!isVotingForSelf && !isAdmin && !isClubManager) {
      return res.status(403).json({
        success: false,
        message: 'You can only vote for yourself. Club managers and admins can vote for others.'
      });
    }

    // Get all recommendations for this round
    const recommendations = await AppDataSource.getRepository(Recommendation).find({
      where: { roundId }
    });

    if (recommendations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No recommendations found for this round'
      });
    }

    // Validate votes
    const recommendationIds = recommendations.map(r => r.id);
    const clubConfig = round.club.config as any;
    const votingPoints = clubConfig?.votingPoints || [3, 2, 1];

    // Check if member has already voted
    const existingVotes = await AppDataSource.getRepository(Vote).find({
      where: { memberId, recommendation: { roundId } }
    });

    if (existingVotes.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Member has already voted for this round'
      });
    }

    // Validate each vote
    for (const vote of votes) {
      if (!vote.recommendationId || !vote.points) {
        return res.status(400).json({
          success: false,
          message: 'Each vote must have recommendationId and points'
        });
      }

      if (!recommendationIds.includes(vote.recommendationId)) {
        return res.status(400).json({
          success: false,
          message: `Recommendation ${vote.recommendationId} not found in this round`
        });
      }

      if (!votingPoints.includes(vote.points)) {
        return res.status(400).json({
          success: false,
          message: `Invalid points ${vote.points}. Valid points are: ${votingPoints.join(', ')}`
        });
      }
    }

    // Check if at least one recommendation is voted for
    if (votes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Must vote for at least one recommendation'
      });
    }

    // Check for duplicate recommendation votes
    const votedRecommendationIds = votes.map(v => v.recommendationId);
    const uniqueVotedIds = [...new Set(votedRecommendationIds)];
    if (votedRecommendationIds.length !== uniqueVotedIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Cannot vote for the same recommendation multiple times'
      });
    }

    // Check for duplicate points
    const votedPoints = votes.map(v => v.points);
    const uniquePoints = [...new Set(votedPoints)];
    if (votedPoints.length !== uniquePoints.length) {
      return res.status(400).json({
        success: false,
        message: 'Cannot assign the same points to multiple recommendations'
      });
    }

    // Create and save all votes
    const savedVotes = [];
    for (const vote of votes) {
      const newVote = new Vote();
      newVote.memberId = memberId;
      newVote.recommendationId = vote.recommendationId;
      newVote.points = vote.points;

      const savedVote = await AppDataSource.getRepository(Vote).save(newVote);
      savedVotes.push(savedVote);
    }

    // Emit real-time vote cast events
    const socketManager = getSocketManager(req);
    for (const vote of votes) {
      emitVoteCast(
        socketManager,
        round.clubId,
        roundId,
        memberId,
        member.name,
        vote.recommendationId,
        vote.points
      );
    }

    // Create and save notifications for all club members
    console.log('Creating vote cast notifications for member:', member.name, 'in club:', round.clubId);
    await NotificationService.createAndEmitClubNotification(req, {
      type: NotificationType.VOTE_CAST,
      title: 'Vote Submitted',
      message: `${member.name} has submitted their vote for this round`,
      clubId: round.clubId,
      roundId: roundId,
      data: {
        voterName: member.name,
        voterId: memberId,
        roundId: roundId
      }
    });

    res.status(201).json(savedVotes);
  } catch (error) {
    console.error('Error submitting votes:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const closeVoting = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { roundId } = req.params;

    // Validate required fields
    if (!roundId) {
      return res.status(400).json({
        success: false,
        message: 'Round ID is required'
      });
    }

    // Check if round exists and is in voting status
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

    if (round.status !== RoundStatus.VOTING) {
      return res.status(400).json({
        success: false,
        message: 'Round is not in voting status'
      });
    }

    // Get all votes for this round
    const votes = await AppDataSource.getRepository(Vote)
      .createQueryBuilder('vote')
      .leftJoinAndSelect('vote.recommendation', 'recommendation')
      .where('recommendation.roundId = :roundId', { roundId })
      .getMany();

    if (votes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No votes found for this round'
      });
    }

    // Get all members in the club
    const members = await AppDataSource.getRepository(Member).find({
      where: { clubId: round.clubId }
    });

    const clubConfig = round.club.config as any;
    const minimumParticipation = clubConfig?.minimumParticipation || 100;

    // Calculate participation percentage
    const uniqueVoters = [...new Set(votes.map(v => v.memberId))];
    const participationPercentage = (uniqueVoters.length / members.length) * 100;

    if (participationPercentage < minimumParticipation) {
      return res.status(400).json({
        success: false,
        message: `Minimum participation not met. ${participationPercentage.toFixed(1)}% voted, but ${minimumParticipation}% required`
      });
    }

    // Calculate total points for each recommendation
    const recommendationTotals: { [key: string]: number } = {};
    votes.forEach(vote => {
      const recId = vote.recommendationId;
      if (!recommendationTotals[recId]) {
        recommendationTotals[recId] = 0;
      }
      recommendationTotals[recId] += vote.points;
    });

    // Find the winner(s)
    const maxPoints = Math.max(...Object.values(recommendationTotals));
    const winners = Object.entries(recommendationTotals)
      .filter(([_, points]) => points === maxPoints)
      .map(([recId, _]) => recId);

    let winningRecommendationId;

    if (winners.length === 1) {
      // Clear winner
      winningRecommendationId = winners[0];
    } else {
      // Tie - use tie-breaking method
      const tieBreakingMethod = clubConfig?.tieBreakingMethod || 'random';
      
      if (tieBreakingMethod === 'random') {
        winningRecommendationId = winners[Math.floor(Math.random() * winners.length)];
      } else if (tieBreakingMethod === 'recommender_decides') {
        // For now, just pick the first one (in Phase 2, this would trigger a special flow)
        winningRecommendationId = winners[0];
      } else {
        // Default to random
        winningRecommendationId = winners[Math.floor(Math.random() * winners.length)];
      }
    }

    // Update round with winner and change status to completing
    round.winningRecommendationId = winningRecommendationId;
    round.status = RoundStatus.COMPLETING;
    await AppDataSource.getRepository(Round).save(round);

    // Get the winning recommendation details
    const winningRecommendation = await AppDataSource.getRepository(Recommendation).findOne({
      where: { id: winningRecommendationId }
    });

    // Emit real-time events
    const socketManager = getSocketManager(req);
    
    // Emit round status change
    emitRoundStatusChanged(
      socketManager,
      round.clubId,
      roundId,
      'completed',
      winningRecommendationId,
      winningRecommendation?.title
    );

    // Create and save notifications about voting completion for all club members
    await NotificationService.createAndEmitClubNotification(req, {
      type: NotificationType.VOTING_COMPLETED,
      title: 'Voting Complete!',
      message: `Voting has been closed. Winner: ${winningRecommendation?.title}`,
      clubId: round.clubId,
      roundId: roundId,
      data: {
        winnerTitle: winningRecommendation?.title,
        winnerId: winningRecommendationId,
        totalPoints: recommendationTotals,
        participation: {
          voted: uniqueVoters.length,
          total: members.length,
          percentage: participationPercentage
        }
      }
    });

    res.status(200).json({
      success: true,
      winner: winningRecommendation,
      totalPoints: recommendationTotals,
      participation: {
        voted: uniqueVoters.length,
        total: members.length,
        percentage: participationPercentage
      },
      message: 'Voting closed successfully'
    });
  } catch (error) {
    console.error('Error closing voting:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getVotesByRound = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { roundId } = req.params;

    if (!roundId) {
      return res.status(400).json({
        success: false,
        message: 'Round ID is required'
      });
    }

    const votes = await AppDataSource.getRepository(Vote)
      .createQueryBuilder('vote')
      .leftJoinAndSelect('vote.member', 'member')
      .leftJoinAndSelect('vote.recommendation', 'recommendation')
      .where('recommendation.roundId = :roundId', { roundId })
      .getMany();

    res.status(200).json({
      success: true,
      data: votes
    });
  } catch (error) {
    console.error('Error getting votes:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
