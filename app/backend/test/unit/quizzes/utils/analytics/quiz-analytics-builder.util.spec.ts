import { QuestionType } from '../../../../../src/questions/enums/question-type.enum';
import { QuizAttemptStatus } from '../../../../../src/quizzes/enums/quiz-attempt-status.enum';
import {
  buildAnalyticsQuestionStats,
  buildAnalyticsScoreDistribution,
  buildAnalyticsSummary,
  buildCsvQuestionColumns,
  toAnalyticsAttemptItem,
} from '../../../../../src/quizzes/utils/analytics/quiz-analytics-builder.util';

const baseQuestion = {
  questionId: 'q-1',
  title: 'Question 1',
  type: QuestionType.TRUE_FALSE,
  statement: 'Statement',
  explanation: 'Explanation',
  tags: [],
  points: 2,
  order: 1,
  questionConfig: { correctAnswer: true },
};

describe('quiz-analytics-builder.util', () => {
  it('builds summary and score distribution for completed attempts', () => {
    const attempts = [
      {
        participantName: 'user:1',
        status: QuizAttemptStatus.SUBMITTED,
        startedAt: new Date('2026-04-12T10:00:00.000Z'),
        submittedAt: new Date('2026-04-12T10:05:00.000Z'),
        earnedPoints: 2,
        maxPoints: 2,
      },
      {
        participantName: 'user:2',
        status: QuizAttemptStatus.EXPIRED,
        startedAt: new Date('2026-04-12T11:00:00.000Z'),
        submittedAt: new Date('2026-04-12T11:10:00.000Z'),
        earnedPoints: 0,
        maxPoints: 2,
      },
      {
        participantName: 'user:2',
        status: QuizAttemptStatus.IN_PROGRESS,
        startedAt: new Date('2026-04-12T12:00:00.000Z'),
        submittedAt: null,
        earnedPoints: 0,
        maxPoints: 2,
      },
    ] as never[];

    expect(buildAnalyticsSummary(attempts as never)).toEqual(
      expect.objectContaining({
        totalAttempts: 3,
        completedAttempts: 2,
        submittedAttempts: 1,
        expiredAttempts: 1,
        inProgressAttempts: 1,
        uniqueParticipants: 2,
        averageScoreOverTen: 5,
        bestScoreOverTen: 10,
        worstScoreOverTen: 0,
        averageCompletionMinutes: 7.5,
      }),
    );

    expect(buildAnalyticsScoreDistribution(attempts as never)).toEqual([
      { label: '0 - 4.99', minScore: 0, maxScore: 4.99, count: 1 },
      { label: '5 - 6.99', minScore: 5, maxScore: 6.99, count: 0 },
      { label: '7 - 8.99', minScore: 7, maxScore: 8.99, count: 0 },
      { label: '9 - 10', minScore: 9, maxScore: 10, count: 1 },
    ]);
  });

  it('builds question stats, csv columns and analytics attempt items', () => {
    const attempts = [
      {
        attemptId: 'attempt-1',
        quizId: 'quiz-1',
        participantName: 'user:1',
        attemptNumber: 1,
        status: QuizAttemptStatus.SUBMITTED,
        startedAt: new Date('2026-04-12T10:00:00.000Z'),
        submittedAt: new Date('2026-04-12T10:02:00.000Z'),
        expiresAt: null,
        earnedPoints: 1,
        maxPoints: 2,
        questions: [baseQuestion],
        answers: [
          {
            questionId: 'q-1',
            value: false,
            isCorrect: false,
            earnedPoints: 1,
          },
        ],
      },
      {
        attemptId: 'attempt-2',
        quizId: 'quiz-1',
        participantName: 'user:2',
        attemptNumber: 1,
        status: QuizAttemptStatus.SUBMITTED,
        startedAt: new Date('2026-04-12T11:00:00.000Z'),
        submittedAt: new Date('2026-04-12T11:02:00.000Z'),
        expiresAt: null,
        earnedPoints: 0,
        maxPoints: 2,
        questions: [baseQuestion],
        answers: [],
      },
    ] as never[];

    expect(buildAnalyticsQuestionStats(attempts as never)).toEqual([
      expect.objectContaining({
        questionId: 'q-1',
        attempts: 2,
        correctCount: 0,
        incorrectCount: 1,
        unansweredCount: 1,
        averageEarnedPoints: 0.5,
        correctRate: 0,
      }),
    ]);

    expect(buildCsvQuestionColumns(attempts as never)).toEqual([
      { questionId: 'q-1', label: 'Pregunta 1' },
    ]);

    expect(
      toAnalyticsAttemptItem(attempts[0], new Map([['user:1', 'Ada']])),
    ).toEqual(
      expect.objectContaining({
        participantDisplayName: 'Ada',
        questionCount: 1,
        scoreOverTen: 5,
      }),
    );
  });
});
