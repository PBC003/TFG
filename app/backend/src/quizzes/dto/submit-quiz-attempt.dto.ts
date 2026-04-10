import { IsArray, IsDefined, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SubmitQuizAttemptAnswerDto {
  @IsString()
  questionId!: string;

  @IsDefined()
  value!: unknown;
}

export class SubmitQuizAttemptDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitQuizAttemptAnswerDto)
  answers!: SubmitQuizAttemptAnswerDto[];
}
