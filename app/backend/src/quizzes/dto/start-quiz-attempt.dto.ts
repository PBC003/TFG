import { IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class StartQuizAttemptDto {
  @IsOptional()
  @IsString()
  @MaxLength(16)
  accessCode?: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  quizId?: string | null;

  @IsOptional()
  @IsString()
  @Length(2, 120)
  participantName?: string;
}
