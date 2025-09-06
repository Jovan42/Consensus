import { IsUUID, IsBoolean } from 'class-validator';

export class MarkCompletionDto {
  @IsUUID('4', { message: 'Invalid member ID format' })
  memberId: string;

  @IsBoolean({ message: 'isCompleted must be a boolean value' })
  isCompleted: boolean;
}
