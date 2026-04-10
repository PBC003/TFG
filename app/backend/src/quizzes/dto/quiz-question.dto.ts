import { IsNumber, IsString, Min } from 'class-validator';

export class QuizQuestionDto {
  @IsString()
  questionId!: string;

  @IsNumber()
  @Min(0)
  points!: number;
}
