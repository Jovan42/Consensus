import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Club } from '../entities/Club';
import { ClubType, ClubConfig } from '../types/enums';
import { CreateClubDto, UpdateClubDto } from '../dto/club.dto';
import { NotFoundError, ConflictError, asyncHandler } from '../middleware/error.middleware';

export const createClub = asyncHandler(async (req: Request, res: Response) => {
  const { name, type, config } = req.body as CreateClubDto;

  // Set default config if not provided
  const defaultConfig: ClubConfig = {
    minRecommendations: 3,
    maxRecommendations: 5,
    votingPoints: [3, 2, 1],
    turnOrder: 'sequential',
    tieBreakingMethod: 'random',
    minimumParticipation: 80
  };

  const clubRepository = AppDataSource.getRepository(Club);
  const club = clubRepository.create({
    name,
    type,
    config: config || defaultConfig
  });

  const savedClub = await clubRepository.save(club);

  res.status(201).json({
    success: true,
    data: savedClub,
    message: 'Club created successfully'
  });
});

export const getAllClubs = async (req: Request, res: Response) => {
  try {
    const clubRepository = AppDataSource.getRepository(Club);
    const clubs = await clubRepository.find({
      relations: ['members'],
      order: { createdAt: 'DESC' }
    });

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

export const getClubById = asyncHandler(async (req: Request, res: Response) => {
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

export const updateClub = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, config } = req.body as UpdateClubDto;
    
    const clubRepository = AppDataSource.getRepository(Club);
    const club = await clubRepository.findOne({ where: { id } });

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Update fields if provided
    if (name) club.name = name;
    if (type && Object.values(ClubType).includes(type)) club.type = type;
    if (config) club.config = config;

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

export const deleteClub = async (req: Request, res: Response) => {
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
