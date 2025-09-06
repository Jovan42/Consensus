import { IsString, IsUUID, IsOptional, MinLength, MaxLength, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RecommendationItemDto {
  @IsString()
  @MinLength(1, { message: 'Recommendation title cannot be empty' })
  @MaxLength(200, { message: 'Recommendation title must be less than 200 characters' })
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Recommendation description must be less than 1000 characters' })
  description?: string;
}

export class AddRecommendationDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Recommendation title cannot be empty' })
  @MaxLength(200, { message: 'Recommendation title must be less than 200 characters' })
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Recommendation description must be less than 1000 characters' })
  description?: string;

  @IsOptional()
  @IsArray()
  recommendations?: any[];

  @IsOptional()
  @IsUUID('4', { message: 'Invalid recommender ID format' })
  recommenderId?: string;
}

export class UpdateRecommendationDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Recommendation title cannot be empty' })
  @MaxLength(200, { message: 'Recommendation title must be less than 200 characters' })
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Recommendation description must be less than 1000 characters' })
  description?: string;
}
