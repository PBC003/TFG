import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { QuestionDocument } from '../questions/schemas/question.schema';
import { StartQuizAttemptDto } from './dto/start-quiz-attempt.dto';
import { SubmitQuizAttemptDto } from './dto/submit-quiz-attempt.dto';
import { QuizAttemptStatus } from './enums/quiz-attempt-status.enum';
import { QuizStatus } from './enums/quiz-status.enum';
import {
  QuizAttempt,
  type QuizAttemptDocument,
} from './schemas/quiz-attempt.schema';
import { Quiz, type QuizDocument } from './schemas/quiz.schema';
import type {
  PublicQuizCatalogItem,
  QuizAttemptItem,
  QuizSubmissionResult,
} from './types/quiz.types';
import type {
  GradedAttempt,
  SubmittedAnswerMap,
} from './utils/grade/grade-attempt.types';
import { gradeAttempt } from './utils/grade/grade-attempt.util';
import {
  toQuizAttemptItem,
  toQuizSubmissionResult,
} from './utils/public-attempt.util';
import { toPublicQuizCatalogItem } from './utils/quiz/quiz-access-catalog.util';
import { buildAttemptQuestionSnapshots } from './utils/quiz/quiz-attempt-snapshot.util';
import { getQuizSubmissionVisibility } from './utils/quiz/quiz-submission-visibility.util';
import { QuizzesSharedService } from './quizzes-shared.service';

// cspell:ignore Profesorado

@Injectable()
export class QuizAccessService {
  constructor(
    @InjectModel(Quiz.name)
    private readonly quizModel: Model<QuizDocument>,
    @InjectModel(QuizAttempt.name)
    private readonly quizAttemptModel: Model<QuizAttemptDocument>,
    private readonly quizzesSharedService: QuizzesSharedService,
  ) {}

  async listPublishedQuizzes(
    participantName?: string,
  ): Promise<PublicQuizCatalogItem[]> {
    const normalizedParticipantName = participantName?.trim() ?? '';
    const quizzes = await this.quizModel
      .find({ status: QuizStatus.PUBLISHED })
      .sort({ publishedAt: -1, updatedAt: -1 })
      .exec();

    const teachersById = await this.quizzesSharedService.loadTeacherNamesById(
      quizzes.map((quiz) => quiz.createdByUserId),
    );
    const attemptsRemainingByQuiz = await this.loadAttemptsRemainingByQuiz(
      quizzes,
      normalizedParticipantName,
    );
    const nowMs = Date.now();

    return quizzes.map((quiz) =>
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
    participantName?: string,
  ): Promise<QuizSubmissionResult | null> {
    const normalizedParticipantName = participantName?.trim() ?? '';

    if (normalizedParticipantName.length < 2) {
      this.quizzesSharedService.throwBadRequest(
        'quiz.access_data_required',
        'A participant identity is required to retrieve quiz feedback',
      );
    }

    const quiz =
      await this.quizzesSharedService.findQuizDocumentOrThrow(quizId);
    const bestAttempt = await this.quizAttemptModel
      .findOne({
        quizId,
        participantName: normalizedParticipantName,
        status: QuizAttemptStatus.SUBMITTED,
      })
      .sort({ earnedPoints: -1, submittedAt: -1, attemptNumber: -1 })
      .exec();

    if (!bestAttempt) {
      return null;
    }

    const consumedAttempts =
      await this.quizzesSharedService.countConsumedAttempts(
        quiz.quizId,
        normalizedParticipantName,
      );
    const attemptsRemaining = Math.max(
      0,
      quiz.attemptsAllowed - consumedAttempts,
    );
    const visibility = getQuizSubmissionVisibility(quiz, attemptsRemaining);
    const submittedAnswersByQuestionId: SubmittedAnswerMap = new Map<
      string,
      unknown
    >(bestAttempt.answers.map((answer) => [answer.questionId, answer.value]));
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

  async startAttempt(
    startQuizAttemptDto: StartQuizAttemptDto,
  ): Promise<QuizAttemptItem> {
    const accessCode = this.quizzesSharedService.normalizeAccessCode(
      startQuizAttemptDto.accessCode ?? null,
    );
    const quizId = startQuizAttemptDto.quizId?.trim() ?? '';
    const participantName = startQuizAttemptDto.participantName.trim();

    if (!accessCode && !quizId) {
      this.quizzesSharedService.throwBadRequest(
        'quiz.access_data_required',
        'A quiz link or access code is required to start an attempt',
      );
    }

    const quiz = quizId
      ? await this.quizzesSharedService.findPublishedQuizById(quizId)
      : await this.quizzesSharedService.findPublishedQuizByAccessCode(
          accessCode,
        );

    this.assertQuizAccess(quiz, accessCode);
    this.quizzesSharedService.assertQuizAvailability(quiz, new Date());

    const existingAttempt = await this.findOrExpireActiveAttempt(
      quiz,
      participantName,
    );

    if (existingAttempt) {
      return existingAttempt;
    }

    const usedAttempts = await this.quizzesSharedService.countConsumedAttempts(
      quiz.quizId,
      participantName,
    );

    if (usedAttempts >= quiz.attemptsAllowed) {
      this.quizzesSharedService.throwConflict(
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
    const expiresAt =
      quiz.timeLimitMinutes !== null
        ? new Date(startedAt.getTime() + quiz.timeLimitMinutes * 60_000)
        : null;

    const attempt = await this.quizAttemptModel.create({
      quizId: quiz.quizId,
      accessCode: quiz.requiresAccessCode === false ? null : quiz.accessCode,
      participantName,
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
      attemptsRemaining: Math.max(
        0,
        quiz.attemptsAllowed - attempt.attemptNumber,
      ),
    });
  }

  async submitAttempt(
    attemptId: string,
    submitQuizAttemptDto: SubmitQuizAttemptDto,
  ): Promise<QuizSubmissionResult> {
    const attempt = await this.quizAttemptModel.findOne({ attemptId }).exec();

    if (!attempt) {
      this.quizzesSharedService.throwNotFound(
        'quiz.attempt_not_found',
        'Quiz attempt not found',
      );
    }

    if (attempt.status !== QuizAttemptStatus.IN_PROGRESS) {
      this.quizzesSharedService.throwConflict(
        'quiz.attempt_already_submitted',
        'The selected attempt is no longer active',
      );
    }

    const quiz = await this.quizzesSharedService.findQuizDocumentOrThrow(
      attempt.quizId,
    );
    const submittedAnswersByQuestionId: SubmittedAnswerMap = new Map<
      string,
      unknown
    >(
      submitQuizAttemptDto.answers.map((answer) => [
        answer.questionId,
        answer.value,
      ]),
    );
    const gradedAttempt: GradedAttempt = gradeAttempt(
      attempt.questions,
      submittedAnswersByQuestionId,
    );
    const gradedAnswers = gradedAttempt.answers.map((answer) => ({
      ...answer,
    }));

    attempt.answers = gradedAnswers;
    attempt.earnedPoints = gradedAttempt.earnedPoints;
    attempt.maxPoints = gradedAttempt.maxPoints;
    attempt.status = QuizAttemptStatus.SUBMITTED;
    attempt.submittedAt = new Date();

    await attempt.save();

    const consumedAttempts =
      await this.quizzesSharedService.countConsumedAttempts(
        quiz.quizId,
        attempt.participantName,
      );
    const attemptsRemaining = Math.max(
      0,
      quiz.attemptsAllowed - consumedAttempts,
    );
    const visibility = getQuizSubmissionVisibility(quiz, attemptsRemaining);

    return toQuizSubmissionResult(
      attempt,
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
          await this.quizzesSharedService.countConsumedAttempts(
            quiz.quizId,
            participantName,
          );

        return [
          quiz.quizId,
          Math.max(0, quiz.attemptsAllowed - usedAttempts),
        ] as const;
      }),
    );

    counts.forEach(([quizId, attemptsRemaining]) => {
      attemptsRemainingByQuiz.set(quizId, attemptsRemaining);
    });

    return attemptsRemainingByQuiz;
  }

  private assertQuizAccess(quiz: QuizDocument, accessCode: string): void {
    if (quiz.requiresAccessCode !== true) {
      return;
    }

    if (!accessCode) {
      this.quizzesSharedService.throwBadRequest(
        'quiz.access_data_required',
        'This quiz requires a valid access code',
      );
    }

    if (
      this.quizzesSharedService.normalizeAccessCode(quiz.accessCode) !==
      accessCode
    ) {
      this.quizzesSharedService.throwBadRequest(
        'quiz.invalid_access_code',
        'The provided access code is not valid for this quiz',
      );
    }
  }

  private async findOrExpireActiveAttempt(
    quiz: QuizDocument,
    participantName: string,
  ): Promise<QuizAttemptItem | null> {
    const activeAttempt = await this.quizAttemptModel
      .findOne({
        quizId: quiz.quizId,
        participantName,
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
      const usedAttempts =
        await this.quizzesSharedService.countConsumedAttempts(
          quiz.quizId,
          participantName,
        );

      return toQuizAttemptItem(activeAttempt, {
        title: quiz.title,
        description: quiz.description,
        attemptsAllowed: quiz.attemptsAllowed,
        attemptsRemaining: Math.max(0, quiz.attemptsAllowed - usedAttempts),
      });
    }

    activeAttempt.status = QuizAttemptStatus.EXPIRED;
    activeAttempt.submittedAt = activeAttempt.expiresAt;
    activeAttempt.answers = [];
    activeAttempt.earnedPoints = 0;
    await activeAttempt.save();

    return null;
  }

  private async buildQuestionSnapshots(
    quiz: QuizDocument,
  ): Promise<QuizAttemptDocument['questions']> {
    const questionIds = quiz.questions.map((question) => question.questionId);
    const questionMap: Map<string, QuestionDocument> =
      await this.quizzesSharedService.loadQuestionsMap(questionIds);
    const snapshotsOrNull: QuizAttemptDocument['questions'] | null =
      buildAttemptQuestionSnapshots(quiz, questionMap);

    if (!snapshotsOrNull) {
      this.quizzesSharedService.throwBadRequest(
        'quiz.question_not_found',
        'At least one quiz question does not exist anymore',
      );
    }

    const snapshots: QuizAttemptDocument['questions'] = snapshotsOrNull;

    return snapshots;
  }
}
