import type { QuestionDocument } from '../schemas/question.schema';
import type { QuestionItem } from '../types/question-item.type';

export const toQuestionItem = (question: QuestionDocument): QuestionItem => ({
  questionId: question.questionId,
  title: question.title,
  type: question.type,
  statement: question.statement,
  explanation: question.explanation,
  tags: question.tags,
  createdByUserId: question.createdByUserId,
  updatedByUserId: question.updatedByUserId,
  version: question.version,
  questionConfig: question.questionConfig,
  createdAt: question.createdAt,
  updatedAt: question.updatedAt,
});
