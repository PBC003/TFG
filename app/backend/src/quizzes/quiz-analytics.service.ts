// cspell:ignore Pregunta
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import {
  QuizAttempt,
  type QuizAttemptAnswer,
  type QuizAttemptDocument,
} from './schemas/quiz-attempt.schema';
import { Quiz, type QuizDocument } from './schemas/quiz.schema';
import type {
  QuizAnalyticsItem,
  QuizAttemptReviewDetail,
  QuizHistoryItem,
} from './types/quiz.types';
import { gradeAttempt } from './utils/grade/grade-attempt.util';
import {
  buildAnalyticsQuestionStats,
  buildAnalyticsScoreDistribution,
  buildAnalyticsSummary,
  buildCsvQuestionColumns,
  toAnalyticsAttemptItem,
} from './utils/analytics/quiz-analytics-builder.util';
import { loadParticipantDisplayNames } from './utils/analytics/quiz-analytics-participant.util';
import { synchronizeExpiredQuizAttempts } from './utils/quiz/quiz-attempt-expiration.util';
import {
  QuizzesSharedService,
  type AuthorizedQuizUser,
} from './quizzes-shared.service';

export {
  computeScoreOverTen,
  escapeCsvField,
  isEmptyAnswer,
  roundToTwo,
  serializeCsvValue,
} from './utils/analytics/quiz-analytics-format.util';

type CsvCell = string | number | boolean | bigint | Date | null | undefined;
type QuizListProjection = Pick<Quiz, 'quizId' | 'title' | 'description'>;

const roundToTwoSafe = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(value * 100) / 100;
};

const computeScoreOverTenSafe = (
  earnedPoints: number,
  maxPoints: number,
): number => {
  if (
    !Number.isFinite(earnedPoints) ||
    !Number.isFinite(maxPoints) ||
    maxPoints <= 0
  ) {
    return 0;
  }

  return roundToTwoSafe((earnedPoints / maxPoints) * 10);
};

const escapeCsvFieldSafe = (value: CsvCell): string => {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue =
    value instanceof Date ? value.toISOString() : String(value);
  const escaped = stringValue.replaceAll('"', '""');

  return /[;"\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
};

@Injectable()
export class QuizAnalyticsService {
  constructor(
    @InjectModel(Quiz.name)
    private readonly quizModel: Model<QuizDocument>,
    @InjectModel(QuizAttempt.name)
    private readonly quizAttemptModel: Model<QuizAttemptDocument>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly quizzesSharedService: QuizzesSharedService,
  ) {}

  async getQuizAnalytics(
    quizId: string,
    user: AuthorizedQuizUser,
  ): Promise<QuizAnalyticsItem> {
    const quiz = await this.quizzesSharedService.findManagedQuizDocumentOrThrow(
      quizId,
      user,
    );
    const attempts = await this.loadAttemptsForQuiz(quiz.quizId);
    const participantNames = await loadParticipantDisplayNames(
      this.userRepository,
      attempts.map((attempt) => attempt.participantName),
    );

    return {
      quizId: quiz.quizId,
      title: quiz.title,
      description: quiz.description,
      status: quiz.status,
      hasAttempts: attempts.length > 0,
      generatedAt: new Date(),
      summary: buildAnalyticsSummary(attempts),
      scoreDistribution: buildAnalyticsScoreDistribution(attempts),
      attempts: attempts.map((attempt) =>
        toAnalyticsAttemptItem(attempt, participantNames),
      ),
      questionStats: buildAnalyticsQuestionStats(attempts),
    };
  }

  async getAttemptDetail(
    quizId: string,
    attemptId: string,
    user: AuthorizedQuizUser,
  ): Promise<QuizAttemptReviewDetail> {
    const quiz = await this.quizzesSharedService.findManagedQuizDocumentOrThrow(
      quizId,
      user,
    );

    const attempt = (await this.quizAttemptModel
      .findOne({ quizId: quiz.quizId, attemptId, isPreview: { $ne: true } })
      .exec()) as QuizAttemptDocument | null;

    if (!attempt) {
      this.quizzesSharedService.throwNotFound(
        'quiz.attempt_not_found',
        'Quiz attempt not found',
      );
    }

    await synchronizeExpiredQuizAttempts([attempt]);

    const participantNames = await loadParticipantDisplayNames(
      this.userRepository,
      [attempt.participantName],
    );

    const grading = gradeAttempt(
      attempt.questions,
      new Map<string, unknown>(
        attempt.answers.map((answer): [string, unknown] => [
          answer.questionId,
          answer.value,
        ]),
      ),
    );

    const scoreOverTen = computeScoreOverTenSafe(
      attempt.earnedPoints,
      attempt.maxPoints,
    );

    return {
      attemptId: attempt.attemptId,
      quizId: attempt.quizId,
      title: quiz.title,
      participantName: attempt.participantName,
      participantDisplayName:
        participantNames.get(attempt.participantName) ??
        attempt.participantName,
      attemptNumber: attempt.attemptNumber,
      status: attempt.status,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      expiresAt: attempt.expiresAt,
      earnedPoints: attempt.earnedPoints,
      maxPoints: attempt.maxPoints,
      scoreOverTen,
      review: grading.review,
    };
  }

  async exportQuizAnalyticsCsv(
    quizId: string,
    user: AuthorizedQuizUser,
  ): Promise<string> {
    const quiz = await this.quizzesSharedService.findManagedQuizDocumentOrThrow(
      quizId,
      user,
    );
    const attempts = await this.loadAttemptsForQuiz(quiz.quizId);
    const participantNames = await loadParticipantDisplayNames(
      this.userRepository,
      attempts.map((attempt) => attempt.participantName),
    );

    const questionColumns = buildCsvQuestionColumns(attempts);
    const headers: CsvCell[] = [
      'quizId',
      'quizTitle',
      'participantName',
      'participantDisplayName',
      'attemptNumber',
      'status',
      'startedAt',
      'submittedAt',
      'earnedPoints',
      'maxPoints',
      'scoreOverTen',
      ...questionColumns.map((column) => column.label),
    ];

    const rows: CsvCell[][] = attempts.map((attempt): CsvCell[] => {
      const answerMap = new Map<string, QuizAttemptAnswer>(
        attempt.answers.map((answer): [string, QuizAttemptAnswer] => [
          answer.questionId,
          answer,
        ]),
      );

      const scoreOverTen = computeScoreOverTenSafe(
        attempt.earnedPoints,
        attempt.maxPoints,
      );

      return [
        quiz.quizId,
        quiz.title,
        attempt.participantName,
        participantNames.get(attempt.participantName) ??
          attempt.participantName,
        attempt.attemptNumber,
        attempt.status,
        attempt.startedAt.toISOString(),
        attempt.submittedAt?.toISOString() ?? '',
        attempt.earnedPoints,
        attempt.maxPoints,
        scoreOverTen,
        ...questionColumns.map((column): CsvCell => {
          const answer = answerMap.get(column.questionId);
          return answer ? roundToTwoSafe(answer.earnedPoints) : '';
        }),
      ];
    });

    return [headers, ...rows]
      .map((row) => row.map((value) => escapeCsvFieldSafe(value)).join(';'))
      .join('\n');
  }

  async listHistoryForUser(userId: number): Promise<QuizHistoryItem[]> {
    const participantName = `user:${userId}`;

    const attempts = (await this.quizAttemptModel
      .find({ participantName, isPreview: { $ne: true } })
      .sort({ submittedAt: -1, startedAt: -1 })
      .exec()) as QuizAttemptDocument[];

    await synchronizeExpiredQuizAttempts(attempts);

    const quizIds = Array.from(
      new Set(attempts.map((attempt) => attempt.quizId)),
    );

    const quizzes = (await this.quizModel
      .find({ quizId: { $in: quizIds } })
      .select(['quizId', 'title', 'description'])
      .exec()) as QuizListProjection[];

    const quizMap = new Map<string, QuizListProjection>(
      quizzes.map((quiz): [string, QuizListProjection] => [quiz.quizId, quiz]),
    );

    return attempts.map((attempt): QuizHistoryItem => {
      const quiz = quizMap.get(attempt.quizId);
      const scoreOverTen = computeScoreOverTenSafe(
        attempt.earnedPoints,
        attempt.maxPoints,
      );

      return {
        attemptId: attempt.attemptId,
        quizId: attempt.quizId,
        quizTitle: quiz?.title ?? attempt.quizId,
        quizDescription: quiz?.description ?? null,
        status: attempt.status,
        attemptNumber: attempt.attemptNumber,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        earnedPoints: attempt.earnedPoints,
        maxPoints: attempt.maxPoints,
        scoreOverTen,
        totalQuestions: attempt.questions.length,
      };
    });
  }

  private async loadAttemptsForQuiz(
    quizId: string,
  ): Promise<QuizAttemptDocument[]> {
    const attempts = (await this.quizAttemptModel
      .find({ quizId, isPreview: { $ne: true } })
      .sort({ startedAt: -1, submittedAt: -1, attemptNumber: -1 })
      .exec()) as QuizAttemptDocument[];

    await synchronizeExpiredQuizAttempts(attempts);

    return attempts;
  }
}
