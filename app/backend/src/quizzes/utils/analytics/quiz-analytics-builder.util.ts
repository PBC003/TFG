import { QuizAttemptStatus } from '../../enums/quiz-attempt-status.enum';
import type {
  MultipleChoiceQuestionConfig,
  QuestionOption,
  SingleChoiceQuestionConfig,
  TrueFalseQuestionConfig,
} from '../../../questions/types/question-type-config.type';
import { QuestionType } from '../../../questions/enums/question-type.enum';
import type {
  QuizAnalyticsAnswerDistributionItem,
  QuizAnalyticsAttemptItem,
  QuizAnalyticsItem,
  QuizAnalyticsQuestionStatsItem,
  QuizAnalyticsScoreBucket,
} from '../../types/quiz.types';
import type {
  QuizAttemptAnswer,
  QuizAttemptDocument,
  QuizAttemptQuestionSnapshot,
} from '../../schemas/quiz-attempt.schema';
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
  const completionMinutes = completedAttempts
    .map((attempt) => {
      if (!attempt.submittedAt) {
        return null;
      }

      return (
        (attempt.submittedAt.getTime() - attempt.startedAt.getTime()) / 60_000
      );
    })
    .filter(
      (duration): duration is number =>
        duration !== null && Number.isFinite(duration) && duration >= 0,
    );

  const averageScoreOverTen =
    scores.length > 0
      ? roundToTwo(
          scores.reduce((total, score) => total + score, 0) / scores.length,
        )
      : 0;
  const averageCompletionMinutes =
    completionMinutes.length > 0
      ? roundToTwo(
          completionMinutes.reduce((total, minutes) => total + minutes, 0) /
            completionMinutes.length,
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
    averageCompletionMinutes,
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
    QuizAnalyticsQuestionStatsItem & {
      answerCounts: Map<
        string,
        QuizAnalyticsAnswerDistributionItem & { firstSeenIndex: number }
      >;
      totalEarnedPoints: number;
    }
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
        statement: question.statement,
        type: question.type,
        order: question.order,
        maxPoints: question.points,
        attempts: 0,
        correctCount: 0,
        incorrectCount: 0,
        unansweredCount: 0,
        averageEarnedPoints: 0,
        correctRate: 0,
        answerDistribution: [],
        answerCounts: initializeAnswerCounts(question),
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
      recordAnswerDistribution(stat.answerCounts, question, answer);
      statsByQuestionId.set(question.questionId, stat);
    }
  }

  return [...statsByQuestionId.values()]
    .map((stat) => ({
      questionId: stat.questionId,
      title: stat.title,
      statement: stat.statement,
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
      answerDistribution: [...stat.answerCounts.values()]
        .sort((left, right) => left.firstSeenIndex - right.firstSeenIndex)
        .map(toAnswerDistributionItem),
    }))
    .sort((left, right) => left.order - right.order);
}

function initializeAnswerCounts(
  question: QuizAttemptQuestionSnapshot,
): Map<
  string,
  QuizAnalyticsAnswerDistributionItem & { firstSeenIndex: number }
> {
  const counts = new Map<
    string,
    QuizAnalyticsAnswerDistributionItem & { firstSeenIndex: number }
  >();

  const addOption = (key: string, label: string, isCorrect: boolean | null) => {
    counts.set(key, {
      key,
      label,
      count: 0,
      isCorrect,
      firstSeenIndex: counts.size,
    });
  };

  if (question.type === QuestionType.TRUE_FALSE) {
    const config = question.questionConfig as TrueFalseQuestionConfig;
    addOption('true', 'true', config.correctAnswer === true);
    addOption('false', 'false', config.correctAnswer === false);
  }

  if (question.type === QuestionType.SINGLE_CHOICE) {
    const config = question.questionConfig as SingleChoiceQuestionConfig;
    for (const option of config.options) {
      addOption(
        option.key,
        option.text,
        option.key === config.correctOptionKey,
      );
    }
  }

  if (question.type === QuestionType.MULTIPLE_CHOICE) {
    const config = question.questionConfig as MultipleChoiceQuestionConfig;
    const correctKeys = new Set(config.correctOptionKeys);
    for (const option of config.options) {
      addOption(option.key, option.text, correctKeys.has(option.key));
    }
  }

  return counts;
}

function recordAnswerDistribution(
  counts: Map<
    string,
    QuizAnalyticsAnswerDistributionItem & { firstSeenIndex: number }
  >,
  question: QuizAttemptQuestionSnapshot,
  answer: QuizAttemptAnswer | undefined,
) {
  if (!answer || isEmptyAnswer(answer.value)) {
    incrementAnswerCount(counts, '__unanswered__', '__unanswered__', null);
    return;
  }

  if (question.type === QuestionType.MULTIPLE_CHOICE) {
    const selectedKeys = toStringArray(answer.value);
    for (const selectedKey of selectedKeys) {
      const option = findQuestionOption(question, selectedKey);
      incrementAnswerCount(
        counts,
        selectedKey,
        option?.text ?? selectedKey,
        answer.isCorrect,
      );
    }
    return;
  }

  const key = serializeAnswerKey(answer.value);
  const option = findQuestionOption(question, key);
  incrementAnswerCount(counts, key, option?.text ?? key, answer.isCorrect);
}

function toAnswerDistributionItem(
  item: QuizAnalyticsAnswerDistributionItem & { firstSeenIndex: number },
): QuizAnalyticsAnswerDistributionItem {
  return {
    key: item.key,
    label: item.label,
    count: item.count,
    isCorrect: item.isCorrect,
  };
}

function incrementAnswerCount(
  counts: Map<
    string,
    QuizAnalyticsAnswerDistributionItem & { firstSeenIndex: number }
  >,
  key: string,
  label: string,
  isCorrect: boolean | null,
) {
  const current = counts.get(key);

  if (current) {
    current.count += 1;
    return;
  }

  counts.set(key, {
    key,
    label,
    count: 1,
    isCorrect,
    firstSeenIndex: counts.size,
  });
}

function findQuestionOption(
  question: QuizAttemptQuestionSnapshot,
  key: string,
): QuestionOption | undefined {
  const config = question.questionConfig as { options?: QuestionOption[] };
  return config.options?.find((option) => option.key === key);
}

function toStringArray(value: unknown): string[] {
  const values: unknown[] = Array.isArray(value) ? value : [];
  return values.filter((item): item is string => typeof item === 'string');
}

function serializeAnswerKey(value: unknown): string {
  if (typeof value === 'boolean') {
    return String(value);
  }

  if (typeof value === 'string') {
    return value.trim() || '__empty__';
  }

  return JSON.stringify(value);
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
