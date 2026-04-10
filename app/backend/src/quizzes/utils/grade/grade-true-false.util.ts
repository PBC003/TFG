import type { TrueFalseQuestionConfig } from '../../../questions/types/question-type-config.type';
import type { QuizAttemptQuestionSnapshot } from '../../schemas/quiz-attempt.schema';
import type { GradedQuestionResult } from './grade-attempt.types';

export function gradeTrueFalseQuestion(
  snapshot: QuizAttemptQuestionSnapshot,
  value: unknown,
): GradedQuestionResult {
  const questionConfig = snapshot.questionConfig as TrueFalseQuestionConfig & {
    feedbackForTrue?: string | null;
    feedbackForFalse?: string | null;
  };
  const submittedValue = typeof value === 'boolean' ? value : null;
  const isCorrect = submittedValue === questionConfig.correctAnswer;
  const earnedPoints = isCorrect ? snapshot.points : 0;
  const feedback =
    submittedValue === true
      ? questionConfig.feedbackForTrue?.trim() || snapshot.explanation
      : submittedValue === false
        ? questionConfig.feedbackForFalse?.trim() || snapshot.explanation
        : snapshot.explanation;

  return {
    answer: {
      questionId: snapshot.questionId,
      value: submittedValue,
      isCorrect,
      earnedPoints,
      maxPoints: snapshot.points,
      answeredAt: submittedValue === null ? null : new Date(),
    },
    points: snapshot.points,
    earnedPoints,
    isCorrect,
    submittedValue,
    correctValue: questionConfig.correctAnswer,
    explanation: snapshot.explanation,
    feedback,
  };
}
