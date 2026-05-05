import { QuizAttemptStatus } from '../../enums/quiz-attempt-status.enum';
import type {
  QuizAnalyticsAttemptItem,
  QuizAnalyticsItem,
  QuizAnalyticsQuestionStatsItem,
  QuizAnalyticsScoreBucket,
} from '../../types/quiz.types';
import type { QuizAttemptDocument } from '../../schemas/quiz-attempt.schema';
import {
  computeScoreOverTen,
  isEmptyAnswer,
  roundToTwo,
} from './quiz-analytics-format.util';

export type CsvQuestionColumn = {
  questionId: string;
  label: string;
};

export function buildAnalyticsSummary(
  attempts: QuizAttemptDocument[],
): QuizAnalyticsItem['summary'] {
  const completedAttempts = attempts.filter(
    (attempt) => attempt.status !== QuizAttemptStatus.IN_PROGRESS,
  );
  const scores = completedAttempts.map((attempt) =>
    computeScoreOverTen(attempt.earnedPoints, attempt.maxPoints),
  );

  const averageScoreOverTen =
    scores.length > 0
      ? roundToTwo(
          scores.reduce((total, score) => total + score, 0) / scores.length,
        )
      : 0;

  return {
    totalAttempts: attempts.length,
    completedAttempts: completedAttempts.length,
    submittedAttempts: attempts.filter(
      (attempt) => attempt.status === QuizAttemptStatus.SUBMITTED,
    ).length,
    expiredAttempts: attempts.filter(
      (attempt) => attempt.status === QuizAttemptStatus.EXPIRED,
    ).length,
    inProgressAttempts: attempts.filter(
      (attempt) => attempt.status === QuizAttemptStatus.IN_PROGRESS,
    ).length,
    uniqueParticipants: new Set(
      attempts.map((attempt) => attempt.participantName),
    ).size,
    averageScoreOverTen,
    bestScoreOverTen: scores.length > 0 ? Math.max(...scores) : 0,
    worstScoreOverTen: scores.length > 0 ? Math.min(...scores) : 0,
  };
}

export function buildAnalyticsScoreDistribution(
  attempts: QuizAttemptDocument[],
): QuizAnalyticsScoreBucket[] {
  const completedAttempts = attempts.filter(
    (attempt) => attempt.status !== QuizAttemptStatus.IN_PROGRESS,
  );
  const buckets: QuizAnalyticsScoreBucket[] = [
    { label: '0 - 4.99', minScore: 0, maxScore: 4.99, count: 0 },
    { label: '5 - 6.99', minScore: 5, maxScore: 6.99, count: 0 },
    { label: '7 - 8.99', minScore: 7, maxScore: 8.99, count: 0 },
    { label: '9 - 10', minScore: 9, maxScore: 10, count: 0 },
  ];

  for (const attempt of completedAttempts) {
    const score = computeScoreOverTen(attempt.earnedPoints, attempt.maxPoints);
    const bucket =
      buckets.find(
        (item) => score >= item.minScore && score <= item.maxScore,
      ) ?? buckets[buckets.length - 1];
    bucket.count += 1;
  }

  return buckets;
}

export function buildAnalyticsQuestionStats(
  attempts: QuizAttemptDocument[],
): QuizAnalyticsQuestionStatsItem[] {
  const statsByQuestionId = new Map<
    string,
    QuizAnalyticsQuestionStatsItem & { totalEarnedPoints: number }
  >();

  for (const attempt of attempts) {
    const answerMap = new Map(
      attempt.answers.map((answer) => [answer.questionId, answer]),
    );

    for (const question of [...attempt.questions].sort(
      (left, right) => left.order - right.order,
    )) {
      const stat = statsByQuestionId.get(question.questionId) ?? {
        questionId: question.questionId,
        title: question.title,
        type: question.type,
        order: question.order,
        maxPoints: question.points,
        attempts: 0,
        correctCount: 0,
        incorrectCount: 0,
        unansweredCount: 0,
        averageEarnedPoints: 0,
        correctRate: 0,
        totalEarnedPoints: 0,
      };
      const answer = answerMap.get(question.questionId);

      stat.attempts += 1;
      stat.maxPoints = Math.max(stat.maxPoints, question.points);
      stat.order = Math.min(stat.order, question.order);

      if (!answer || isEmptyAnswer(answer.value)) {
        stat.unansweredCount += 1;
      } else if (answer.isCorrect) {
        stat.correctCount += 1;
      } else {
        stat.incorrectCount += 1;
      }

      stat.totalEarnedPoints += answer?.earnedPoints ?? 0;
      statsByQuestionId.set(question.questionId, stat);
    }
  }

  return [...statsByQuestionId.values()]
    .map((stat) => ({
      questionId: stat.questionId,
      title: stat.title,
      type: stat.type,
      order: stat.order,
      maxPoints: stat.maxPoints,
      attempts: stat.attempts,
      correctCount: stat.correctCount,
      incorrectCount: stat.incorrectCount,
      unansweredCount: stat.unansweredCount,
      averageEarnedPoints:
        stat.attempts > 0
          ? roundToTwo(stat.totalEarnedPoints / stat.attempts)
          : 0,
      correctRate:
        stat.attempts > 0
          ? roundToTwo((stat.correctCount / stat.attempts) * 100)
          : 0,
    }))
    .sort((left, right) => left.order - right.order);
}

export function toAnalyticsAttemptItem(
  attempt: QuizAttemptDocument,
  participantNames: Map<string, string>,
): QuizAnalyticsAttemptItem {
  return {
    attemptId: attempt.attemptId,
    quizId: attempt.quizId,
    participantName: attempt.participantName,
    participantDisplayName:
      participantNames.get(attempt.participantName) ?? attempt.participantName,
    attemptNumber: attempt.attemptNumber,
    status: attempt.status,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    expiresAt: attempt.expiresAt,
    earnedPoints: attempt.earnedPoints,
    maxPoints: attempt.maxPoints,
    scoreOverTen: computeScoreOverTen(attempt.earnedPoints, attempt.maxPoints),
    questionCount: attempt.questions.length,
  };
}

export function buildCsvQuestionColumns(
  attempts: QuizAttemptDocument[],
): CsvQuestionColumn[] {
  const orderedQuestionIds = new Map<string, number>();

  for (const attempt of attempts) {
    for (const question of [...attempt.questions].sort(
      (left, right) => left.order - right.order,
    )) {
      if (orderedQuestionIds.has(question.questionId)) {
        continue;
      }

      orderedQuestionIds.set(question.questionId, orderedQuestionIds.size + 1);
    }
  }

  return [...orderedQuestionIds.entries()].map(([questionId, index]) => ({
    questionId,
    label: `Pregunta ${index}`,
  }));
}
