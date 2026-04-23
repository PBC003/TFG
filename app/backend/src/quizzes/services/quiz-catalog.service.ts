import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuizAttemptStatus } from '../enums/quiz-attempt-status.enum';
import { QuizStatus } from '../enums/quiz-status.enum';
import {
  QuizAttempt,
  type QuizAttemptDocument,
} from '../schemas/quiz-attempt.schema';
import { Quiz, type QuizDocument } from '../schemas/quiz.schema';
import type {
  PublicQuizCatalogItem,
  QuizSubmissionResult,
} from '../types/quiz.types';
import type {
  GradedAttempt,
  SubmittedAnswerMap,
} from '../utils/grade/grade-attempt.types';
import { gradeAttempt } from '../utils/grade/grade-attempt.util';
import { toQuizSubmissionResult } from '../utils/public-attempt.util';
import { toPublicQuizCatalogItem } from '../utils/quiz/quiz-access-catalog.util';
import { calculateAttemptsRemaining } from '../utils/quiz/quiz-access-attempt.util';
import { isQuizVisibleToParticipant } from '../utils/quiz/quiz-access-audience.util';
import { getQuizSubmissionVisibility } from '../utils/quiz/quiz-submission-visibility.util';
import { QuizLoadingService } from './quiz-loading.service';
import { QuizTeacherLookupService } from './quiz-teacher-lookup.service';

@Injectable()
export class QuizCatalogService {
  constructor(
    @InjectModel(Quiz.name)
    private readonly quizModel: Model<QuizDocument>,
    @InjectModel(QuizAttempt.name)
    private readonly quizAttemptModel: Model<QuizAttemptDocument>,
    private readonly quizLoadingService: QuizLoadingService,
    private readonly quizTeacherLookupService: QuizTeacherLookupService,
  ) {}

  async listPublishedQuizzes(
    participantName?: string,
  ): Promise<PublicQuizCatalogItem[]> {
    const normalizedParticipantName = participantName?.trim() ?? '';
    const quizzes = await this.quizModel
      .find({ status: QuizStatus.PUBLISHED })
      .sort({ publishedAt: -1, updatedAt: -1 })
      .exec();
    const accessibleGroupIds =
      await this.quizLoadingService.getAccessibleGroupIdsForParticipant(
        normalizedParticipantName,
      );
    const visibleQuizzes = quizzes.filter((quiz) =>
      isQuizVisibleToParticipant(quiz, accessibleGroupIds),
    );
    const teachersById =
      await this.quizTeacherLookupService.loadTeacherNamesById(
        visibleQuizzes.map((quiz) => quiz.createdByUserId),
      );
    const attemptsRemainingByQuiz = await this.loadAttemptsRemainingByQuiz(
      visibleQuizzes,
      normalizedParticipantName,
    );
    const nowMs = Date.now();

    return visibleQuizzes.map((quiz) =>
      toPublicQuizCatalogItem(
        quiz,
        teachersById.get(quiz.createdByUserId) ?? 'Profesorado',
        normalizedParticipantName.length >= 2
          ? (attemptsRemainingByQuiz.get(quiz.quizId) ?? quiz.attemptsAllowed)
          : null,
        nowMs,
      ),
    );
  }

  async getBestResult(
    quizId: string,
    participantName: string,
  ): Promise<QuizSubmissionResult | null> {
    const normalizedParticipantName = participantName.trim();
    const quiz = await this.quizLoadingService.findQuizDocumentOrThrow(quizId);
    const bestAttempt = await this.quizAttemptModel
      .findOne({
        quizId,
        participantName: normalizedParticipantName,
        status: QuizAttemptStatus.SUBMITTED,
        isPreview: { $ne: true },
      })
      .sort({ earnedPoints: -1, submittedAt: -1, attemptNumber: -1 })
      .exec();

    if (!bestAttempt) {
      return null;
    }

    const consumedAttempts =
      await this.quizLoadingService.countConsumedAttempts(
        quiz.quizId,
        normalizedParticipantName,
      );
    const attemptsRemaining = calculateAttemptsRemaining(
      quiz.attemptsAllowed,
      consumedAttempts,
    );
    const visibility = getQuizSubmissionVisibility(quiz, attemptsRemaining);
    const submittedAnswersByQuestionId: SubmittedAnswerMap = new Map(
      bestAttempt.answers.map((answer) => [answer.questionId, answer.value]),
    );
    const gradedAttempt: GradedAttempt = gradeAttempt(
      bestAttempt.questions,
      submittedAnswersByQuestionId,
    );

    return toQuizSubmissionResult(
      bestAttempt,
      {
        title: quiz.title,
        attemptsAllowed: quiz.attemptsAllowed,
        attemptsRemaining,
        canRevealFeedback: visibility.canRevealFeedback,
        revealBlockedByEndDate: visibility.revealBlockedByEndDate,
      },
      gradedAttempt.review,
    );
  }

  private async loadAttemptsRemainingByQuiz(
    quizzes: QuizDocument[],
    participantName: string,
  ): Promise<Map<string, number>> {
    const attemptsRemainingByQuiz = new Map<string, number>();

    if (participantName.length < 2) {
      return attemptsRemainingByQuiz;
    }

    const counts = await Promise.all(
      quizzes.map(async (quiz) => {
        const usedAttempts =
          await this.quizLoadingService.countConsumedAttempts(
            quiz.quizId,
            participantName,
          );

        return [
          quiz.quizId,
          calculateAttemptsRemaining(quiz.attemptsAllowed, usedAttempts),
        ] as const;
      }),
    );

    counts.forEach(([quizId, attemptsRemaining]) => {
      attemptsRemainingByQuiz.set(quizId, attemptsRemaining);
    });

    return attemptsRemainingByQuiz;
  }
}
