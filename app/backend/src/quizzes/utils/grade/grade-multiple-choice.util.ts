import type { MultipleChoiceQuestionConfig } from '../../../questions/types/question-type-config.type';
import type { QuizAttemptQuestionSnapshot } from '../../schemas/quiz-attempt.schema';
import {
  coerceStringArray,
  findMultipleFeedback,
} from './grade-attempt-feedback.util';
import type { GradedQuestionResult } from './grade-attempt.types';

export function gradeMultipleChoiceQuestion(
  snapshot: QuizAttemptQuestionSnapshot,
  value: unknown,
): GradedQuestionResult {
  const questionConfig =
    snapshot.questionConfig as MultipleChoiceQuestionConfig;
  const submittedValue = coerceStringArray(value);
  const correctKeys = Array.from(new Set(questionConfig.correctOptionKeys));
  const submittedSet = new Set(submittedValue);
  const correctSet = new Set(correctKeys);
  const incorrectSelections = submittedValue.filter(
    (key) => !correctSet.has(key),
  );
  const correctSelections = submittedValue.filter((key) => correctSet.has(key));

  let earnedPoints = 0;
  let isCorrect = false;

  if ((questionConfig.gradingMode ?? 'all_or_nothing') === 'partial_credit') {
    const rawRatio =
      correctKeys.length === 0
        ? 0
        : (correctSelections.length - incorrectSelections.length) /
          correctKeys.length;
    const safeRatio = Math.max(0, Math.min(1, rawRatio));
    earnedPoints = Number((snapshot.points * safeRatio).toFixed(2));
    isCorrect = safeRatio === 1;
  } else {
    isCorrect =
      submittedSet.size === correctSet.size &&
      correctKeys.every((key) => submittedSet.has(key));
    earnedPoints = isCorrect ? snapshot.points : 0;
  }

  const feedback =
    findMultipleFeedback(questionConfig.options, submittedValue) ??
    snapshot.explanation;

  return {
    answer: {
      questionId: snapshot.questionId,
      value: submittedValue,
      isCorrect,
      earnedPoints,
      maxPoints: snapshot.points,
      answeredAt: submittedValue.length === 0 ? null : new Date(),
    },
    points: snapshot.points,
    earnedPoints,
    isCorrect,
    submittedValue,
    correctValue: correctKeys,
    explanation: snapshot.explanation,
    feedback,
  };
}
