import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class QuizQuestionDto {
  @IsString()
  questionId!: string;

  @IsNumber()
  @Min(0)
  points!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  toleranceOverride?: number | null;
}
