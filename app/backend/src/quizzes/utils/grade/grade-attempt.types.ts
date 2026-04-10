import type { QuizAttemptAnswer } from '../../schemas/quiz-attempt.schema';
import type { QuizSubmissionQuestionReview } from '../../types/quiz.types';

export type SubmittedAnswerMap = Map<string, unknown>;

export type GradedAttempt = {
  answers: QuizAttemptAnswer[];
  review: QuizSubmissionQuestionReview[];
  earnedPoints: number;
  maxPoints: number;
};

export type GradedQuestionResult = Omit<
  QuizSubmissionQuestionReview,
  'questionId' | 'title' | 'statement' | 'type' | 'availableOptions'
> & {
  answer: QuizAttemptAnswer;
};
