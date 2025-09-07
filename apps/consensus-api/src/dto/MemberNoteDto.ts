import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class CreateMemberNoteDto {
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsUUID('4', { message: 'Round ID must be a valid UUID' })
  roundId: string;
}

export class UpdateMemberNoteDto {
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;
}

export class MemberNoteResponseDto {
  id: string;
  title: string | null;
  content: string | null;
  roundId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(note: any) {
    this.id = note.id;
    this.title = note.title;
    this.content = note.content;
    this.roundId = note.round?.id || note.roundId;
    this.createdAt = note.createdAt;
    this.updatedAt = note.updatedAt;
  }
}
