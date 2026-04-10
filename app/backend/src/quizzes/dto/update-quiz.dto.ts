import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuizQuestionDto } from './quiz-question.dto';

export class UpdateQuizDto {
  @IsOptional()
  @IsString()
  @Length(3, 120)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(1, 5_000)
  description?: string | null;

  @IsOptional()
  @IsString()
  @Length(4, 16)
  accessCode?: string | null;

  @IsOptional()
  @IsBoolean()
  requiresAccessCode?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  attemptsAllowed?: number;

  @IsOptional()
  @IsISO8601()
  startAt?: string | null;

  @IsOptional()
  @IsISO8601()
  endAt?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(300)
  timeLimitMinutes?: number | null;

  @IsOptional()
  @IsBoolean()
  shuffleQuestions?: boolean;

  @IsOptional()
  @IsBoolean()
  revealAnswersAfterClose?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique((value: QuizQuestionDto) => value.questionId)
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  questions?: QuizQuestionDto[];
}
