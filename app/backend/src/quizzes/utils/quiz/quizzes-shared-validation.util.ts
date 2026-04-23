import { QuestionType } from '../../../questions/enums/question-type.enum';
import type { QuestionDocument } from '../../../questions/schemas/question.schema';
import type { ParametricQuestionConfig } from '../../../questions/types/question-type-config.type';
import { getParametricTemplateVariantCount } from '../../../questions/parametric/parametric-question-template.util';

export const SUPPORTED_QUIZ_QUESTION_TYPES = new Set<QuestionType>([
  QuestionType.TRUE_FALSE,
  QuestionType.SINGLE_CHOICE,
  QuestionType.MULTIPLE_CHOICE,
  QuestionType.PARAMETRIC,
]);

export type QuizQuestionReferenceInput = {
  questionId: string;
  points: number;
  quantity?: number;
  toleranceOverride?: number | null;
};

export type SharedServiceBadRequestThrower = (
  code:
    | 'common.bad_request'
    | 'quiz.question_not_found'
    | 'quiz.unsupported_question_type',
  message: string,
  details?: Record<string, unknown>,
) => never;

export function validateQuizQuestionReference(
  quizQuestion: QuizQuestionReferenceInput,
  question: QuestionDocument | undefined,
  throwBadRequest: SharedServiceBadRequestThrower,
): void {
  if (!question) {
    throwBadRequest(
      'quiz.question_not_found',
      'At least one referenced question does not exist',
    );
  }

  if (!SUPPORTED_QUIZ_QUESTION_TYPES.has(question.type)) {
    throwBadRequest(
      'quiz.unsupported_question_type',
      'The selected quiz includes a question type that is not currently supported by the platform',
      { type: question.type },
    );
  }

  const quantity = Number(quizQuestion.quantity ?? 1);
  const toleranceOverride = quizQuestion.toleranceOverride;

  if (!Number.isInteger(quantity) || quantity < 1) {
    throwBadRequest(
      'common.bad_request',
      'Quiz question quantity must be an integer greater than or equal to 1',
    );
  }

  if (
    toleranceOverride !== undefined &&
    toleranceOverride !== null &&
    (!Number.isFinite(Number(toleranceOverride)) ||
      Number(toleranceOverride) < 0)
  ) {
    throwBadRequest(
      'common.bad_request',
      'Quiz parametric tolerance override must be a number greater than or equal to 0',
    );
  }

  if (question.type === QuestionType.PARAMETRIC) {
    const config = question.questionConfig as
      | ParametricQuestionConfig
      | undefined;

    if (config?.templateId) {
      const maxVariants = getParametricTemplateVariantCount(config.templateId);

      if (quantity > maxVariants) {
        throwBadRequest(
          'common.bad_request',
          `The selected parametric question only supports ${maxVariants} distinct variants per quiz`,
        );
      }
    }

    return;
  }

  if (quantity !== 1) {
    throwBadRequest(
      'common.bad_request',
      'Only parametric questions can request more than one variant per quiz',
    );
  }

  if (toleranceOverride !== undefined && toleranceOverride !== null) {
    throwBadRequest(
      'common.bad_request',
      'Only parametric questions can override the grading tolerance inside a quiz',
    );
  }
}
