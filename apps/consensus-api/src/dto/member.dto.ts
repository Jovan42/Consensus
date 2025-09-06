import { IsString, IsEmail, IsUUID, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateMemberDto {
  @IsString()
  @MinLength(1, { message: 'Member name cannot be empty' })
  @MaxLength(100, { message: 'Member name must be less than 100 characters' })
  name: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(255, { message: 'Email must be less than 255 characters' })
  email: string;

  @IsUUID('4', { message: 'Invalid club ID format' })
  clubId: string;
}

export class CreateMemberRequestDto {
  @IsString()
  @MinLength(1, { message: 'Member name cannot be empty' })
  @MaxLength(100, { message: 'Member name must be less than 100 characters' })
  name: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(255, { message: 'Email must be less than 255 characters' })
  email: string;
}

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Member name cannot be empty' })
  @MaxLength(100, { message: 'Member name must be less than 100 characters' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(255, { message: 'Email must be less than 255 characters' })
  email?: string;
}
