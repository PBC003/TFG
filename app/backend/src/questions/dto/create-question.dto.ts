import {
  ArrayUnique,
  IsArray,
  IsDefined,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { QuestionType } from '../enums/question-type.enum';

export class CreateQuestionDto {
  @IsString()
  @Length(3, 120)
  title!: string;

  @IsEnum(QuestionType)
  type!: QuestionType;

  @IsString()
  @Length(1, 10_000)
  statement!: string;

  @IsOptional()
  @IsString()
  @Length(1, 10_000)
  explanation?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  tags?: string[];

  @IsDefined()
  questionConfig!: unknown;
}
