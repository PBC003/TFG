import { IsOptional, IsString, Length } from 'class-validator';

export class StartQuizAttemptDto {
  @IsOptional()
  @IsString()
  @Length(4, 16)
  accessCode?: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  quizId?: string | null;

  @IsString()
  @Length(2, 120)
  participantName!: string;
}
