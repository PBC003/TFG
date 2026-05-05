import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createAppErrorBody } from '../../common/errors/app-http.exception';
import type { PublicUser } from '../../auth/auth.service';
import { QuizAttemptStatus } from '../enums/quiz-attempt-status.enum';
import {
  QuizAttempt,
  type QuizAttemptDocument,
} from '../schemas/quiz-attempt.schema';
import type { QuizDocument } from '../schemas/quiz.schema';
import type { QuizAttemptItem } from '../types/quiz.types';
import { toQuizAttemptItem } from '../utils/public-attempt.util';
import {
  buildAttemptExpiresAt,
  calculateAttemptsRemaining,
} from '../utils/quiz/quiz-access-attempt.util';
import {
  assertQuizAudienceForParticipant,
  buildPreviewParticipantName,
} from '../utils/quiz/quiz-access-audience.util';
import { buildAttemptQuestionSnapshots } from '../utils/quiz/quiz-attempt-snapshot.util';
import { synchronizeExpiredQuizAttempts } from '../utils/quiz/quiz-attempt-expiration.util';
import { QuizLoadingService } from './quiz-loading.service';
import { QuizValidationService } from './quiz-validation.service';
import { QuizAccessCodeService } from './quiz-access-code.service';

export type AuthorizedPreviewUser = Pick<PublicUser, 'id' | 'role'>;

@Injectable()
export class QuizAttemptStarterService {
  constructor(
    @InjectModel(QuizAttempt.name)
    private readonly quizAttemptModel: Model<QuizAttemptDocument>,
    private readonly quizLoadingService: QuizLoadingService,
    private readonly quizValidationService: QuizValidationService,
    private readonly quizAccessCodeService: QuizAccessCodeService,
  ) {}

  async startAttempt(params: {
    quizId?: string;
    accessCode?: string | null;
    participantName: string;
  }): Promise<QuizAttemptItem> {
    const accessCode = this.quizAccessCodeService.normalizeAccessCode(
      params.accessCode ?? null,
    );
    const quizId = params.quizId?.trim() ?? '';
    const participantName = params.participantName.trim();

    if (!accessCode && !quizId) {
      this.throwBadRequest(
        'quiz.access_data_required',
        'A quiz link or access code is required to start an attempt',
      );
    }

    const quiz = quizId
      ? await this.quizLoadingService.findPublishedQuizById(quizId)
      : await this.quizLoadingService.findPublishedQuizByAccessCode(accessCode);

    this.assertQuizAccess(quiz, accessCode);
    await assertQuizAudienceForParticipant(
      quiz,
      participantName,
      (name) =>
        this.quizLoadingService.getAccessibleGroupIdsForParticipant(name),
      (code, message) => this.throwNotFound(code, message),
    );
    this.quizValidationService.assertQuizAvailability(quiz, new Date());

    const existingAttempt = await this.findOrExpireActiveAttempt(
      quiz,
      participantName,
      false,
    );

    if (existingAttempt) {
      return existingAttempt;
    }

    const usedAttempts = await this.quizLoadingService.countConsumedAttempts(
      quiz.quizId,
      participantName,
    );

    if (usedAttempts >= quiz.attemptsAllowed) {
      this.throwConflict(
        'quiz.attempts_exhausted',
        'No attempts remain for this quiz',
      );
    }

    const questionSnapshots = await this.buildQuestionSnapshots(quiz);
    const maxPoints = questionSnapshots.reduce(
      (sum, question) => sum + question.points,
      0,
    );
    const startedAt = new Date();
    const expiresAt = buildAttemptExpiresAt(startedAt, quiz.timeLimitMinutes);

    const attempt = await this.quizAttemptModel.create({
      quizId: quiz.quizId,
      accessCode: quiz.requiresAccessCode === false ? null : quiz.accessCode,
      participantName,
      isPreview: false,
      attemptNumber: usedAttempts + 1,
      status: QuizAttemptStatus.IN_PROGRESS,
      startedAt,
      submittedAt: null,
      expiresAt,
      maxPoints,
      earnedPoints: 0,
      questions: questionSnapshots,
      answers: [],
    });

    return toQuizAttemptItem(attempt, {
      title: quiz.title,
      description: quiz.description,
      attemptsAllowed: quiz.attemptsAllowed,
      attemptsRemaining: calculateAttemptsRemaining(
        quiz.attemptsAllowed,
        attempt.attemptNumber,
      ),
    });
  }

  async startPreview(
    quizId: string,
    user: AuthorizedPreviewUser,
  ): Promise<QuizAttemptItem> {
    const quiz = await this.quizLoadingService.findManagedQuizDocumentOrThrow(
      quizId,
      user,
    );
    const previewParticipantName = buildPreviewParticipantName(user.id);

    const existingAttempt = await this.findOrExpireActiveAttempt(
      quiz,
      previewParticipantName,
      true,
    );

    if (existingAttempt) {
      return existingAttempt;
    }

    const questionSnapshots = await this.buildQuestionSnapshots(quiz);
    const maxPoints = questionSnapshots.reduce(
      (sum, question) => sum + question.points,
      0,
    );
    const startedAt = new Date();
    const expiresAt = buildAttemptExpiresAt(startedAt, quiz.timeLimitMinutes);

    const attempt = await this.quizAttemptModel.create({
      quizId: quiz.quizId,
      accessCode: null,
      participantName: previewParticipantName,
      isPreview: true,
      attemptNumber: 1,
      status: QuizAttemptStatus.IN_PROGRESS,
      startedAt,
      submittedAt: null,
      expiresAt,
      maxPoints,
      earnedPoints: 0,
      questions: questionSnapshots,
      answers: [],
    });

    return toQuizAttemptItem(attempt, {
      title: quiz.title,
      description: quiz.description,
      attemptsAllowed: 1,
      attemptsRemaining: 0,
      isPreview: true,
    });
  }

  private async buildQuestionSnapshots(
    quiz: QuizDocument,
  ): Promise<QuizAttemptDocument['questions']> {
    const questionIds = quiz.questions.map((question) => question.questionId);
    const questionMap =
      await this.quizLoadingService.loadQuestionsMap(questionIds);
    const snapshotsOrNull = buildAttemptQuestionSnapshots(quiz, questionMap);

    if (!snapshotsOrNull) {
      this.throwBadRequest(
        'quiz.question_not_found',
        'At least one quiz question does not exist anymore',
      );
    }

    return snapshotsOrNull;
  }

  private async resolveAttemptsRemaining(
    quiz: QuizDocument,
    participantName: string,
  ): Promise<number> {
    const consumedAttempts =
      await this.quizLoadingService.countConsumedAttempts(
        quiz.quizId,
        participantName,
      );

    return calculateAttemptsRemaining(quiz.attemptsAllowed, consumedAttempts);
  }

  private assertQuizAccess(quiz: QuizDocument, accessCode: string): void {
    if (quiz.requiresAccessCode !== true) {
      return;
    }

    if (!accessCode) {
      this.throwBadRequest(
        'quiz.access_data_required',
        'This quiz requires a valid access code',
      );
    }

    if (
      this.quizAccessCodeService.normalizeAccessCode(quiz.accessCode) !==
      accessCode
    ) {
      this.throwBadRequest(
        'quiz.invalid_access_code',
        'The provided access code is not valid for this quiz',
      );
    }
  }

  private async findOrExpireActiveAttempt(
    quiz: QuizDocument,
    participantName: string,
    isPreview: boolean,
  ): Promise<QuizAttemptItem | null> {
    const activeAttempt = await this.quizAttemptModel
      .findOne({
        quizId: quiz.quizId,
        participantName,
        isPreview,
        status: QuizAttemptStatus.IN_PROGRESS,
      })
      .sort({ startedAt: -1 })
      .exec();

    if (!activeAttempt) {
      return null;
    }

    const now = new Date();

    if (
      !activeAttempt.expiresAt ||
      activeAttempt.expiresAt.getTime() > now.getTime()
    ) {
      const attemptsRemaining = isPreview
        ? 0
        : await this.resolveAttemptsRemaining(quiz, participantName);

      return toQuizAttemptItem(activeAttempt, {
        title: quiz.title,
        description: quiz.description,
        attemptsAllowed: isPreview ? 1 : quiz.attemptsAllowed,
        attemptsRemaining,
        isPreview,
      });
    }

    await synchronizeExpiredQuizAttempts([activeAttempt], now);
    return null;
  }

  private throwBadRequest(
    code:
      | 'quiz.access_data_required'
      | 'quiz.invalid_access_code'
      | 'quiz.question_not_found',
    message: string,
  ): never {
    throw new HttpException(
      createAppErrorBody(code, message),
      HttpStatus.BAD_REQUEST,
    );
  }

  private throwConflict(
    code: 'quiz.attempts_exhausted',
    message: string,
  ): never {
    throw new HttpException(
      createAppErrorBody(code, message),
      HttpStatus.CONFLICT,
    );
  }

  private throwNotFound(code: 'quiz.not_found', message: string): never {
    throw new HttpException(
      createAppErrorBody(code, message),
      HttpStatus.NOT_FOUND,
    );
  }
}
