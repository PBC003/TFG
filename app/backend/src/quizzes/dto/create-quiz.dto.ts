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
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuizQuestionDto } from './quiz-question.dto';

export class CreateQuizDto {
  @IsString()
  @Length(3, 120)
  title!: string;

  @IsOptional()
  @IsString()
  @Length(1, 5_000)
  description?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  accessCode?: string | null;

  @IsBoolean()
  requiresAccessCode!: boolean;

  @IsInt()
  @Min(1)
  @Max(10)
  attemptsAllowed!: number;

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

  @IsBoolean()
  shuffleQuestions!: boolean;

  @IsBoolean()
  revealAnswersAfterClose!: boolean;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  assignedGroupIds?: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique((value: QuizQuestionDto) => value.questionId)
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  questions!: QuizQuestionDto[];
}
