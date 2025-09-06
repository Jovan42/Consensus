import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Round } from '../entities/Round';
import { Club } from '../entities/Club';
import { Member } from '../entities/Member';
import { RoundStatus } from '../types/enums';

export const startNewRound = async (req: Request, res: Response) => {
  try {
    const { clubId, currentRecommenderId } = req.body;
    const urlClubId = req.params.clubId;
    
    // Debug logging
    console.log('Debug - req.params:', req.params);
    console.log('Debug - urlClubId:', urlClubId);
    console.log('Debug - body clubId:', clubId);
    
    // Use clubId from URL parameter if available, otherwise from body
    const finalClubId = urlClubId || clubId;

    // Validate required fields
    if (!finalClubId) {
      return res.status(400).json({
        success: false,
        message: 'Club ID is required (either in URL parameter or request body)'
      });
    }
    
    if (!currentRecommenderId) {
      return res.status(400).json({
        success: false,
        message: 'Current recommender ID is required'
      });
    }

    // Check if club exists
    const club = await AppDataSource.getRepository(Club).findOne({
      where: { id: finalClubId }
    });

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if member exists and belongs to the club
    const member = await AppDataSource.getRepository(Member).findOne({
      where: { id: currentRecommenderId, clubId: finalClubId }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found or does not belong to this club'
      });
    }

    // Check if there's already an active round for this club
    const existingRound = await AppDataSource.getRepository(Round).findOne({
      where: { 
        clubId: finalClubId,
        status: RoundStatus.RECOMMENDING
      }
    });

    if (existingRound) {
      return res.status(400).json({
        success: false,
        message: 'There is already an active round for this club'
      });
    }

    // Create new round
    const round = new Round();
    round.clubId = finalClubId;
    round.currentRecommenderId = currentRecommenderId;
    round.status = RoundStatus.RECOMMENDING;

    const savedRound = await AppDataSource.getRepository(Round).save(round);

    res.status(201).json({
      success: true,
      data: savedRound,
      message: 'Round started successfully'
    });
  } catch (error) {
    console.error('Error starting new round:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getRoundById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const round = await AppDataSource.getRepository(Round).findOne({
      where: { id },
      relations: ['club', 'currentRecommender', 'recommendations', 'winningRecommendation']
    });

    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Round not found'
      });
    }

    res.json({
      success: true,
      data: round
    });
  } catch (error) {
    console.error('Error getting round:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getClubRounds = async (req: Request, res: Response) => {
  try {
    const { clubId } = req.params;

    const rounds = await AppDataSource.getRepository(Round).find({
      where: { clubId },
      relations: ['currentRecommender', 'winningRecommendation'],
      order: { createdAt: 'DESC' }
    });

    res.json({
      success: true,
      data: rounds
    });
  } catch (error) {
    console.error('Error getting club rounds:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateRoundStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, winningRecommendationId } = req.body;

    // Validate status
    if (!Object.values(RoundStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid round status'
      });
    }

    const round = await AppDataSource.getRepository(Round).findOne({
      where: { id }
    });

    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Round not found'
      });
    }

    // Update round
    round.status = status;
    if (winningRecommendationId) {
      round.winningRecommendationId = winningRecommendationId;
    }

    const updatedRound = await AppDataSource.getRepository(Round).save(round);

    res.json({
      success: true,
      data: updatedRound,
      message: 'Round status updated successfully'
    });
  } catch (error) {
    console.error('Error updating round status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const finishRound = async (req: Request, res: Response) => {
  try {
    const { roundId } = req.params;

    // Validate required fields
    if (!roundId) {
      return res.status(400).json({
        success: false,
        message: 'Round ID is required'
      });
    }

    // Get the current round with club and members
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

    // Get all members in the club
    const members = await AppDataSource.getRepository(Member).find({
      where: { clubId: round.clubId },
      order: { createdAt: 'ASC' } // Ensure consistent order
    });

    if (members.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No members found in the club'
      });
    }

    // Mark current round as finished
    round.status = RoundStatus.FINISHED;
    await AppDataSource.getRepository(Round).save(round);

    // Determine next recommender based on turn order
    const clubConfig = round.club.config as any;
    const turnOrder = clubConfig?.turnOrder || 'sequential';
    
    let nextRecommenderId;
    
    if (turnOrder === 'sequential') {
      // Find current recommender index and get next one
      const currentIndex = members.findIndex(m => m.id === round.currentRecommenderId);
      const nextIndex = (currentIndex + 1) % members.length;
      nextRecommenderId = members[nextIndex].id;
    } else {
      // Random selection
      const randomIndex = Math.floor(Math.random() * members.length);
      nextRecommenderId = members[randomIndex].id;
    }

    // Check if there's already an active round for this club
    const existingActiveRound = await AppDataSource.getRepository(Round).findOne({
      where: { 
        clubId: round.clubId,
        status: RoundStatus.RECOMMENDING
      }
    });

    let nextRound = null;
    
    if (!existingActiveRound) {
      // Create new round with next recommender
      const newRound = new Round();
      newRound.clubId = round.clubId;
      newRound.currentRecommenderId = nextRecommenderId;
      newRound.status = RoundStatus.RECOMMENDING;
      
      nextRound = await AppDataSource.getRepository(Round).save(newRound);
    }

    res.status(200).json({
      success: true,
      status: round.status,
      nextRound: nextRound,
      message: 'Round finished successfully'
    });
  } catch (error) {
    console.error('Error finishing round:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
