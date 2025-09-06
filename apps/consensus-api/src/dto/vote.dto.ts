import { IsUUID, IsNumber, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class VoteItemDto {
  @IsUUID('4', { message: 'Invalid recommendation ID format' })
  recommendationId: string;

  @IsNumber({}, { message: 'Points must be a number' })
  @Min(1, { message: 'Points must be at least 1' })
  @Max(10, { message: 'Points must be at most 10' })
  points: number;
}

export class SubmitVotesDto {
  @IsUUID('4', { message: 'Invalid member ID format' })
  memberId: string;

  @IsArray({ message: 'Votes must be an array' })
  @ValidateNested({ each: true })
  @Type(() => VoteItemDto)
  votes: VoteItemDto[];
}
