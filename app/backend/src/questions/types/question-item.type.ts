import { QuestionType } from '../enums/question-type.enum';
import type { QuestionTypeConfig } from './question-type-config.type';

export type QuestionItem = {
  questionId: string;
  title: string;
  type: QuestionType;
  statement: string;
  explanation: string | null;
  tags: string[];
  createdByUserId: number;
  updatedByUserId: number;
  version: number;
  questionConfig: QuestionTypeConfig;
  createdAt: Date;
  updatedAt: Date;
};
