import { Response } from 'express';
import { In } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Club } from '../entities/Club';
import { Member } from '../entities/Member';
import { ClubType, ClubConfig, TurnOrder, TieBreakingMethod } from '../types/enums';
import { CreateClubDto, UpdateClubDto } from '../dto/club.dto';
import { NotFoundError, ConflictError, asyncHandler } from '../middleware/error.middleware';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

// Helper function to convert string values to enum values
function convertConfigToEnum(config: any): ClubConfig {
  return {
    minRecommendations: config.minRecommendations || 3,
    maxRecommendations: config.maxRecommendations || 5,
    votingPoints: config.votingPoints || [3, 2, 1],
    turnOrder: config.turnOrder === 'sequential' ? TurnOrder.SEQUENTIAL : TurnOrder.RANDOM,
    tieBreakingMethod: config.tieBreakingMethod === 'random' ? TieBreakingMethod.RANDOM :
                      config.tieBreakingMethod === 'recommender_decides' ? TieBreakingMethod.RECOMMENDER_DECIDES :
                      TieBreakingMethod.RE_VOTE,
    minimumParticipation: config.minimumParticipation || 80
  };
}

export const createClub = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, description, type, config } = req.body as CreateClubDto;

  // Set default config if not provided
  const defaultConfig: ClubConfig = {
    minRecommendations: 3,
    maxRecommendations: 5,
    votingPoints: [3, 2, 1],
    turnOrder: TurnOrder.SEQUENTIAL,
    tieBreakingMethod: TieBreakingMethod.RANDOM,
    minimumParticipation: 80
  };

  const clubRepository = AppDataSource.getRepository(Club);
  const finalConfig: ClubConfig = config ? convertConfigToEnum({ ...defaultConfig, ...config }) : defaultConfig;
  const club = clubRepository.create({
    name,
    description,
    type,
    config: finalConfig
  });

  const savedClub = await clubRepository.save(club);

  res.status(201).json({
    success: true,
    data: savedClub,
    message: 'Club created successfully'
  });
});

export const getAllClubs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clubRepository = AppDataSource.getRepository(Club);
    const memberRepository = AppDataSource.getRepository(Member);
    
    let clubs: Club[];
    
    // If user is authenticated
    if (req.user) {
      const isAdmin = req.user.role === 'admin';
      
      if (isAdmin) {
        // Admins can see all clubs
        clubs = await clubRepository.find({
          relations: ['members'],
          order: { createdAt: 'DESC' }
        });
      } else {
        // Regular users can only see clubs they are members of
        const userMemberships = await memberRepository.find({
          where: { email: req.user.email },
          relations: ['club']
        });
        
        const clubIds = userMemberships.map(membership => membership.clubId);
        
        if (clubIds.length === 0) {
          clubs = [];
        } else {
          clubs = await clubRepository.find({
            where: { id: In(clubIds) },
            relations: ['members'],
            order: { createdAt: 'DESC' }
          });
        }
      }
    } else {
      // If no user is authenticated, return empty array
      // In a real app, you might want to return public clubs or require authentication
      clubs = [];
    }

    res.json({
      success: true,
      data: clubs,
      count: clubs.length
    });
  } catch (error) {
    console.error('Error fetching clubs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getClubById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const clubRepository = AppDataSource.getRepository(Club);
  
  const club = await clubRepository.findOne({
    where: { id },
    relations: ['members', 'rounds']
  });

  if (!club) {
    throw new NotFoundError('Club', id);
  }

  res.json({
    success: true,
    data: club
  });
});

export const updateClub = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, type, config } = req.body as UpdateClubDto;
    
    const clubRepository = AppDataSource.getRepository(Club);
    const club = await clubRepository.findOne({ where: { id } });

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Update fields if provided
    if (name !== undefined) club.name = name;
    if (description !== undefined) club.description = description;
    if (type && Object.values(ClubType).includes(type)) club.type = type;
    if (config) {
      const updatedConfig: ClubConfig = convertConfigToEnum({ ...club.config, ...config });
      club.config = updatedConfig;
    }

    const updatedClub = await clubRepository.save(club);

    res.json({
      success: true,
      data: updatedClub,
      message: 'Club updated successfully'
    });
  } catch (error) {
    console.error('Error updating club:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteClub = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const clubRepository = AppDataSource.getRepository(Club);
    
    const club = await clubRepository.findOne({ where: { id } });

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    await clubRepository.remove(club);

    res.json({
      success: true,
      message: 'Club deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting club:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
