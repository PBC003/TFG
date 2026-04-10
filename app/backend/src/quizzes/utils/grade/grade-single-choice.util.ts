import type { SingleChoiceQuestionConfig } from '../../../questions/types/question-type-config.type';
import type { QuizAttemptQuestionSnapshot } from '../../schemas/quiz-attempt.schema';
import { findOptionFeedback } from './grade-attempt-feedback.util';
import type { GradedQuestionResult } from './grade-attempt.types';

export function gradeSingleChoiceQuestion(
  snapshot: QuizAttemptQuestionSnapshot,
  value: unknown,
): GradedQuestionResult {
  const questionConfig = snapshot.questionConfig as SingleChoiceQuestionConfig;
  const submittedValue = typeof value === 'string' ? value : null;
  const isCorrect = submittedValue === questionConfig.correctOptionKey;
  const earnedPoints = isCorrect ? snapshot.points : 0;
  const feedback =
    findOptionFeedback(questionConfig.options, submittedValue) ??
    snapshot.explanation;

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
    correctValue: questionConfig.correctOptionKey,
    explanation: snapshot.explanation,
    feedback,
  };
}
