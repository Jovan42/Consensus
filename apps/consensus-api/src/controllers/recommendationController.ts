import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Recommendation } from '../entities/Recommendation';
import { Round } from '../entities/Round';
import { Member } from '../entities/Member';
import { RoundStatus } from '../types/enums';
import { AddRecommendationDto, UpdateRecommendationDto } from '../dto/recommendation.dto';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { getSocketManager, emitRecommendationAdded, emitNotification } from '../utils/socket';

export const addRecommendation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, recommendations } = req.body as AddRecommendationDto;
    const urlRoundId = req.params.roundId;
    
    // Use roundId from URL parameter
    const finalRoundId = urlRoundId;

    // Validate required fields
    if (!finalRoundId) {
      return res.status(400).json({
        success: false,
        message: 'Round ID is required'
      });
    }

    // Check if round exists and is in recommending status
    const round = await AppDataSource.getRepository(Round).findOne({
      where: { id: finalRoundId },
      relations: ['club']
    });

    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Round not found'
      });
    }

    if (round.status !== RoundStatus.RECOMMENDING) {
      return res.status(400).json({
        success: false,
        message: 'Round is not in recommending status'
      });
    }

    // Validate user authentication
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user is the current recommender, admin, or club manager
    const currentRecommender = await AppDataSource.getRepository(Member).findOne({
      where: { id: round.currentRecommenderId }
    });

    const isCurrentRecommender = currentRecommender?.email === req.user.email;
    const isAdmin = req.user.role === 'admin';
    
    // Check if user is a club manager
    const userMember = await AppDataSource.getRepository(Member).findOne({
      where: { 
        email: req.user.email,
        clubId: round.clubId
      }
    });
    const isClubManager = userMember?.isClubManager || false;

    if (!isCurrentRecommender && !isAdmin && !isClubManager) {
      return res.status(403).json({
        success: false,
        message: 'Only the current recommender, club managers, or admins can add recommendations'
      });
    }

    // Use the current recommender from the round
    const finalRecommenderId = round.currentRecommenderId;

    if (!finalRecommenderId) {
      return res.status(400).json({
        success: false,
        message: 'No current recommender set for this round'
      });
    }

    // Check club configuration for min/max recommendations
    if (!round.club) {
      return res.status(500).json({
        success: false,
        message: 'Club information not found for this round'
      });
    }

    const clubConfig = round.club.config as any;
    const maxRecommendations = clubConfig?.maxRecommendations || 3; // Default to 3 if not configured

    const existingRecommendations = await AppDataSource.getRepository(Recommendation).count({
      where: { roundId: finalRoundId }
    });

    // Handle both single recommendation and array of recommendations
    let recommendationsToAdd = [];

    if (recommendations && Array.isArray(recommendations)) {
      // Array of recommendations
      recommendationsToAdd = recommendations;
    } else if (title) {
      // Single recommendation (backward compatibility)
      recommendationsToAdd = [{
        title,
        description: description || null
      }];
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either "title" or "recommendations" array is required'
      });
    }

    // Check if adding these recommendations would exceed the limit
    if (existingRecommendations + recommendationsToAdd.length > maxRecommendations) {
      return res.status(400).json({
        success: false,
        message: `Adding ${recommendationsToAdd.length} recommendations would exceed the maximum of ${maxRecommendations} (currently have ${existingRecommendations})`
      });
    }

    // Validate all recommendations have required fields
    for (const rec of recommendationsToAdd) {
      if (!rec.title) {
        return res.status(400).json({
          success: false,
          message: 'All recommendations must have a title'
        });
      }
    }

    // Create and save all recommendations
    const savedRecommendations = [];
    for (const rec of recommendationsToAdd) {
      const recommendation = new Recommendation();
      recommendation.roundId = finalRoundId;
      recommendation.title = rec.title;
      recommendation.description = rec.description || null;
      recommendation.recommenderId = finalRecommenderId;

      const savedRecommendation = await AppDataSource.getRepository(Recommendation).save(recommendation);
      savedRecommendations.push(savedRecommendation);
    }

    // Emit real-time notifications for new recommendations
    try {
      const socketManager = getSocketManager(req);
      if (socketManager) {
        const recommender = await AppDataSource.getRepository(Member).findOne({
          where: { id: finalRecommenderId }
        });

        // Emit specific recommendation events for each recommendation
        for (const recommendation of savedRecommendations) {
          emitRecommendationAdded(
            socketManager,
            round.clubId,
            finalRoundId,
            recommendation.id,
            recommendation.title,
            recommendation.description || '',
            finalRecommenderId,
            recommender?.name || 'Unknown'
          );
        }

        // Emit general notification
        emitNotification(
          socketManager,
          'success',
          'New Recommendations Added',
          `${savedRecommendations.length} new recommendation(s) added by ${recommender?.name || 'Unknown'}`,
          round.clubId,
          finalRoundId
        );
      }
    } catch (socketError) {
      console.error('Error emitting recommendation notification:', socketError);
      // Don't fail the request if socket notification fails
    }

    res.status(201).json({
      success: true,
      data: savedRecommendations,
      message: `${savedRecommendations.length} recommendation(s) added successfully`
    });
  } catch (error) {
    console.error('Error adding recommendation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getRecommendationsByRound = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { roundId } = req.params;

    const recommendations = await AppDataSource.getRepository(Recommendation).find({
      where: { roundId },
      relations: ['recommender'],
      order: { createdAt: 'ASC' }
    });

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getRecommendationById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const recommendation = await AppDataSource.getRepository(Recommendation).findOne({
      where: { id },
      relations: ['round', 'recommender', 'votes']
    });

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    res.json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    console.error('Error getting recommendation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateRecommendation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body as UpdateRecommendationDto;

    const recommendation = await AppDataSource.getRepository(Recommendation).findOne({
      where: { id },
      relations: ['round']
    });

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    // Check if round is still in recommending status
    if (recommendation.round.status !== RoundStatus.RECOMMENDING) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update recommendation after round has moved to voting phase'
      });
    }

    // Update recommendation
    if (title) recommendation.title = title;
    if (description !== undefined) recommendation.description = description;

    const updatedRecommendation = await AppDataSource.getRepository(Recommendation).save(recommendation);

    res.json({
      success: true,
      data: updatedRecommendation,
      message: 'Recommendation updated successfully'
    });
  } catch (error) {
    console.error('Error updating recommendation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteRecommendation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const recommendation = await AppDataSource.getRepository(Recommendation).findOne({
      where: { id },
      relations: ['round']
    });

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    // Check if round is still in recommending status
    if (recommendation.round.status !== RoundStatus.RECOMMENDING) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete recommendation after round has moved to voting phase'
      });
    }

    await AppDataSource.getRepository(Recommendation).remove(recommendation);

    res.json({
      success: true,
      message: 'Recommendation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting recommendation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const startVoting = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { roundId } = req.params;

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

    if (round.status !== RoundStatus.RECOMMENDING) {
      return res.status(400).json({
        success: false,
        message: 'Round is not in recommending status'
      });
    }

    // Check if minimum number of recommendations are met
    const recommendationCount = await AppDataSource.getRepository(Recommendation).count({
      where: { roundId }
    });

    const clubConfig = round.club.config;
    if (recommendationCount < clubConfig.minRecommendations) {
      return res.status(400).json({
        success: false,
        message: `Minimum number of recommendations (${clubConfig.minRecommendations}) not met. Current: ${recommendationCount}`
      });
    }

    // Update round status to voting
    round.status = RoundStatus.VOTING;
    const updatedRound = await AppDataSource.getRepository(Round).save(round);

    res.json({
      success: true,
      data: updatedRound,
      message: 'Voting started successfully'
    });
  } catch (error) {
    console.error('Error starting voting:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
