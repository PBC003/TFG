import type { QuizAttemptQuestionSnapshot } from '../../schemas/quiz-attempt.schema';
import type { ParametricAttemptQuestionConfig } from '../../types/quiz.types';
import type { GradedQuestionResult } from './grade-attempt.types';
import { evaluateParametricAnswerExpression } from './parametric-answer-evaluator.util';

export function gradeParametricQuestion(
  snapshot: QuizAttemptQuestionSnapshot,
  value: unknown,
): GradedQuestionResult {
  const questionConfig =
    snapshot.questionConfig as ParametricAttemptQuestionConfig;
  const submittedValue = typeof value === 'string' ? value.trim() : null;
  const parsedValue = submittedValue
    ? evaluateParametricAnswerExpression(submittedValue)
    : null;
  const isCorrect =
    parsedValue !== null &&
    Math.abs(parsedValue - questionConfig.correctAnswerNumeric) <=
      questionConfig.tolerance;
  const earnedPoints = isCorrect ? snapshot.points : 0;
  const toleranceFeedback = `Se acepta un error absoluto de hasta ${questionConfig.tolerance}.`;

  return {
    answer: {
      questionId: snapshot.questionId,
      value: submittedValue,
      isCorrect,
      earnedPoints,
      maxPoints: snapshot.points,
      answeredAt: submittedValue ? new Date() : null,
    },
    points: snapshot.points,
    earnedPoints,
    isCorrect,
    submittedValue,
    correctValue: `$${questionConfig.correctAnswerLatex}$`,
    explanation: snapshot.explanation,
    feedback: snapshot.explanation
      ? `${snapshot.explanation}\n${toleranceFeedback}`
      : toleranceFeedback,
  };
}
