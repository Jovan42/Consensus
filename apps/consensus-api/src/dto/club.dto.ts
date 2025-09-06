import { IsString, IsEnum, IsObject, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ClubType } from '../types/enums';

export class CreateClubDto {
  @IsString()
  @MinLength(1, { message: 'Club name cannot be empty' })
  @MaxLength(100, { message: 'Club name must be less than 100 characters' })
  name: string;

  @IsEnum(ClubType, { message: 'Invalid club type' })
  type: ClubType;

  @IsObject({ message: 'Config must be an object' })
  config: {
    minRecommendations?: number;
    maxRecommendations?: number;
    votingPoints?: number[];
    turnOrder?: 'sequential' | 'random';
    tieBreakingMethod?: 'random' | 'recommender_decides' | 're_vote';
    minimumParticipation?: number;
  };
}

export class UpdateClubDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Club name cannot be empty' })
  @MaxLength(100, { message: 'Club name must be less than 100 characters' })
  name?: string;

  @IsOptional()
  @IsEnum(ClubType, { message: 'Invalid club type' })
  type?: ClubType;

  @IsOptional()
  @IsObject({ message: 'Config must be an object' })
  config?: {
    minRecommendations?: number;
    maxRecommendations?: number;
    votingPoints?: number[];
    turnOrder?: 'sequential' | 'random';
    tieBreakingMethod?: 'random' | 'recommender_decides' | 're_vote';
    minimumParticipation?: number;
  };
}
