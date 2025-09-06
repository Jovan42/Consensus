import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { RoundStatus } from '../types/enums';

export class StartRoundDto {
  @IsUUID('4', { message: 'Invalid current recommender ID format' })
  currentRecommenderId: string;
}

export class UpdateRoundStatusDto {
  @IsEnum(RoundStatus, { message: 'Invalid round status' })
  status: RoundStatus;

  @IsOptional()
  @IsUUID('4', { message: 'Invalid winning recommendation ID format' })
  winningRecommendationId?: string;
}
