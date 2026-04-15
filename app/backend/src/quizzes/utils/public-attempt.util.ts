import { QuestionType } from '../../questions/enums/question-type.enum';
import type {
  MultipleChoiceQuestionConfig,
  SingleChoiceQuestionConfig,
  TrueFalseQuestionConfig,
} from '../../questions/types/question-type-config.type';
import type { QuizAttemptDocument } from '../schemas/quiz-attempt.schema';
import type {
  ParametricAttemptQuestionConfig,
  PublicAttemptQuestion,
  QuizAttemptItem,
  QuizSubmissionQuestionReview,
  QuizSubmissionResult,
} from '../types/quiz.types';

function sanitizeQuestionConfig(
  type: QuestionType,
  questionConfig: unknown,
): PublicAttemptQuestion['questionConfig'] {
  switch (type) {
    case QuestionType.TRUE_FALSE:
      return {};
    case QuestionType.SINGLE_CHOICE: {
      const config = questionConfig as SingleChoiceQuestionConfig;
      return {
        options: config.options.map((option) => ({
          key: option.key,
          text: option.text,
        })),
      };
    }
    case QuestionType.MULTIPLE_CHOICE: {
      const config = questionConfig as MultipleChoiceQuestionConfig;
      return {
        options: config.options.map((option) => ({
          key: option.key,
          text: option.text,
        })),
      };
    }
    case QuestionType.PARAMETRIC: {
      const config = questionConfig as ParametricAttemptQuestionConfig;
      return {
        tolerance: config.tolerance,
        inputPlaceholder: config.inputPlaceholder,
      };
    }
    default:
      return {};
  }
}

export function toQuizAttemptItem(
  attempt: QuizAttemptDocument,
  meta: {
    title: string;
    description: string | null;
    attemptsAllowed: number;
    attemptsRemaining: number;
  },
): QuizAttemptItem {
  const questions = [...attempt.questions]
    .sort((left, right) => left.order - right.order)
    .map<PublicAttemptQuestion>((question) => ({
      questionId: question.questionId,
      title: question.title,
      type: question.type,
      statement: question.statement,
      explanation: question.explanation,
      tags: question.tags,
      points: question.points,
      order: question.order,
      questionConfig: sanitizeQuestionConfig(
        question.type,
        question.questionConfig,
      ),
    }));

  return {
    attemptId: attempt.attemptId,
    quizId: attempt.quizId,
    title: meta.title,
    description: meta.description,
    accessCode: attempt.accessCode,
    participantName: attempt.participantName,
    attemptNumber: attempt.attemptNumber,
    attemptsAllowed: meta.attemptsAllowed,
    attemptsRemaining: meta.attemptsRemaining,
    status: attempt.status,
    startedAt: attempt.startedAt,
    expiresAt: attempt.expiresAt,
    questions,
  };
}

export function toQuizSubmissionResult(
  attempt: QuizAttemptDocument,
  meta: {
    title: string;
    attemptsAllowed: number;
    attemptsRemaining: number;
    canRevealFeedback: boolean;
    revealBlockedByEndDate: boolean;
  },
  review: QuizSubmissionQuestionReview[],
): QuizSubmissionResult {
  return {
    attemptId: attempt.attemptId,
    quizId: attempt.quizId,
    title: meta.title,
    participantName: attempt.participantName,
    attemptNumber: attempt.attemptNumber,
    attemptsAllowed: meta.attemptsAllowed,
    attemptsRemaining: meta.attemptsRemaining,
    status: attempt.status,
    submittedAt: attempt.submittedAt ?? new Date(),
    earnedPoints: attempt.earnedPoints,
    maxPoints: attempt.maxPoints,
    scoreOverTen:
      attempt.maxPoints > 0
        ? Number(((attempt.earnedPoints / attempt.maxPoints) * 10).toFixed(2))
        : 0,
    canRevealFeedback: meta.canRevealFeedback,
    revealBlockedByEndDate: meta.revealBlockedByEndDate,
    review: meta.canRevealFeedback ? review : [],
  };
}

export function resolveTrueFalseCorrectValue(
  questionConfig: TrueFalseQuestionConfig,
): boolean {
  return questionConfig.correctAnswer;
}
