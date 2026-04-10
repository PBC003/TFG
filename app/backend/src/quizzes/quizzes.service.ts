import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { PublicUser } from '../auth/auth.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { QuizStatus } from './enums/quiz-status.enum';
import { Quiz, type QuizDocument } from './schemas/quiz.schema';
import type { QuizItem } from './types/quiz.types';
import { toQuizItem } from './utils/quiz-item.util';
import { QuizzesSharedService } from './quizzes-shared.service';

type QuizMutationPayload = {
  title: string;
  description: string | null;
  accessCode: string;
  requiresAccessCode: boolean;
  attemptsAllowed: number;
  startAt: Date | null;
  endAt: Date | null;
  timeLimitMinutes: number | null;
  shuffleQuestions: boolean;
  revealAnswersAfterClose: boolean;
  questions: { questionId: string; points: number }[];
};

@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(Quiz.name)
    private readonly quizModel: Model<QuizDocument>,
    private readonly quizzesSharedService: QuizzesSharedService,
  ) {}

  async createQuiz(
    createQuizDto: CreateQuizDto,
    user: Pick<PublicUser, 'id'>,
  ): Promise<QuizItem> {
    const normalizedPayload =
      await this.normalizeQuizMutationPayload(createQuizDto);

    const quiz = await this.quizModel.create({
      ...normalizedPayload,
      status: QuizStatus.DRAFT,
      createdByUserId: user.id,
      updatedByUserId: user.id,
      publishedAt: null,
    });

    return this.mapQuizItem(quiz, {
      hasAttempts: false,
      canEdit: true,
      canDelete: true,
    });
  }

  async listQuizzes(): Promise<QuizItem[]> {
    const quizzes = await this.quizModel
      .find()
      .sort({ updatedAt: -1, createdAt: -1 })
      .exec();

    const questionsById = await this.quizzesSharedService.loadQuestionsMap(
      quizzes.flatMap((quiz) =>
        quiz.questions.map((question) => question.questionId),
      ),
    );
    const attemptCountByQuizId =
      await this.quizzesSharedService.countAttemptsByQuizIds(
        quizzes.map((quiz) => quiz.quizId),
      );

    return quizzes.map((quiz) => {
      const hasAttempts = (attemptCountByQuizId.get(quiz.quizId) ?? 0) > 0;
      const canEdit = quiz.status !== QuizStatus.PUBLISHED && !hasAttempts;
      const canDelete = !hasAttempts;

      return toQuizItem(quiz, questionsById, {
        hasAttempts,
        canEdit,
        canDelete,
      });
    });
  }

  async findQuizById(quizId: string): Promise<QuizItem> {
    const quiz =
      await this.quizzesSharedService.findQuizDocumentOrThrow(quizId);
    const hasAttempts = await this.quizzesSharedService.quizHasAttempts(
      quiz.quizId,
    );

    return this.mapQuizItem(quiz, {
      hasAttempts,
      canEdit: false,
      canDelete: !hasAttempts,
    });
  }

  async updateQuiz(
    quizId: string,
    updateQuizDto: UpdateQuizDto,
    user: Pick<PublicUser, 'id'>,
  ): Promise<QuizItem> {
    const quiz =
      await this.quizzesSharedService.findQuizDocumentOrThrow(quizId);

    if (Object.keys(updateQuizDto).length === 0) {
      this.quizzesSharedService.throwBadRequest(
        'quiz.update_requires_field',
        'At least one quiz field must be provided',
      );
    }

    if (quiz.status === QuizStatus.PUBLISHED) {
      this.quizzesSharedService.throwConflict(
        'quiz.published_locked',
        'Published quizzes must be unpublished before they can be edited',
      );
    }

    if (await this.quizzesSharedService.quizHasAttempts(quiz.quizId)) {
      this.quizzesSharedService.throwConflict(
        'quiz.has_attempts_locked',
        'Quizzes with attempts cannot be edited anymore',
      );
    }

    const normalizedPayload = await this.normalizeQuizMutationPayload(
      updateQuizDto,
      quiz,
    );

    quiz.title = normalizedPayload.title;
    quiz.description = normalizedPayload.description;
    quiz.accessCode = normalizedPayload.accessCode;
    quiz.requiresAccessCode = normalizedPayload.requiresAccessCode;
    quiz.attemptsAllowed = normalizedPayload.attemptsAllowed;
    quiz.startAt = normalizedPayload.startAt;
    quiz.endAt = normalizedPayload.endAt;
    quiz.timeLimitMinutes = normalizedPayload.timeLimitMinutes;
    quiz.shuffleQuestions = normalizedPayload.shuffleQuestions;
    quiz.revealAnswersAfterClose = normalizedPayload.revealAnswersAfterClose;
    quiz.questions = normalizedPayload.questions;
    quiz.updatedByUserId = user.id;
    quiz.version += 1;

    await quiz.save();

    const hasAttempts = await this.quizzesSharedService.quizHasAttempts(
      quiz.quizId,
    );

    return this.mapQuizItem(quiz, {
      hasAttempts,
      canEdit: !hasAttempts,
      canDelete: !hasAttempts,
    });
  }

  async publishQuiz(
    quizId: string,
    user: Pick<PublicUser, 'id'>,
  ): Promise<QuizItem> {
    const quiz =
      await this.quizzesSharedService.findQuizDocumentOrThrow(quizId);

    if (quiz.questions.length === 0) {
      this.quizzesSharedService.throwConflict(
        'quiz.publish_requires_questions',
        'A quiz must contain at least one question before publication',
      );
    }

    await this.quizzesSharedService.assertQuestionReferencesAreValid(
      quiz.questions,
    );

    quiz.status = QuizStatus.PUBLISHED;
    quiz.updatedByUserId = user.id;
    quiz.version += 1;
    quiz.publishedAt = new Date();

    await quiz.save();

    const hasAttempts = await this.quizzesSharedService.quizHasAttempts(
      quiz.quizId,
    );

    return this.mapQuizItem(quiz, {
      hasAttempts,
      canEdit: false,
      canDelete: !hasAttempts,
    });
  }

  async unpublishQuiz(
    quizId: string,
    user: Pick<PublicUser, 'id'>,
  ): Promise<QuizItem> {
    const quiz =
      await this.quizzesSharedService.findQuizDocumentOrThrow(quizId);

    quiz.status = QuizStatus.DRAFT;
    quiz.updatedByUserId = user.id;
    quiz.version += 1;
    quiz.publishedAt = null;

    await quiz.save();

    const hasAttempts = await this.quizzesSharedService.quizHasAttempts(
      quiz.quizId,
    );

    return this.mapQuizItem(quiz, {
      hasAttempts,
      canEdit: !hasAttempts,
      canDelete: !hasAttempts,
    });
  }

  async deleteQuiz(quizId: string): Promise<void> {
    const quiz =
      await this.quizzesSharedService.findQuizDocumentOrThrow(quizId);

    if (await this.quizzesSharedService.quizHasAttempts(quiz.quizId)) {
      this.quizzesSharedService.throwConflict(
        'quiz.has_attempts_locked',
        'Quizzes with attempts cannot be deleted anymore',
      );
    }

    await this.quizModel.deleteOne({ quizId: quiz.quizId }).exec();
  }

  private async normalizeQuizMutationPayload(
    payload: CreateQuizDto | UpdateQuizDto,
    currentQuiz?: QuizDocument,
  ): Promise<QuizMutationPayload> {
    const title = (payload.title ?? currentQuiz?.title)?.trim();
    const description =
      payload.description !== undefined
        ? payload.description?.trim() || null
        : (currentQuiz?.description ?? null);
    const requiresAccessCode =
      payload.requiresAccessCode ?? currentQuiz?.requiresAccessCode ?? false;
    const accessCodeInput =
      payload.accessCode !== undefined
        ? payload.accessCode?.trim() || null
        : null;
    const accessCode = this.quizzesSharedService.normalizeAccessCode(
      requiresAccessCode
        ? (accessCodeInput ??
            currentQuiz?.accessCode ??
            this.quizzesSharedService.generateAccessCode())
        : (currentQuiz?.accessCode ??
            this.quizzesSharedService.generateAccessCode()),
    );
    const attemptsAllowed =
      payload.attemptsAllowed ?? currentQuiz?.attemptsAllowed;
    const startAt =
      payload.startAt !== undefined
        ? this.toNullableDate(payload.startAt)
        : (currentQuiz?.startAt ?? null);
    const endAt =
      payload.endAt !== undefined
        ? this.toNullableDate(payload.endAt)
        : (currentQuiz?.endAt ?? null);
    const timeLimitMinutes =
      payload.timeLimitMinutes !== undefined
        ? (payload.timeLimitMinutes ?? null)
        : (currentQuiz?.timeLimitMinutes ?? null);
    const shuffleQuestions =
      payload.shuffleQuestions ?? currentQuiz?.shuffleQuestions ?? false;
    const revealAnswersAfterClose =
      payload.revealAnswersAfterClose ??
      currentQuiz?.revealAnswersAfterClose ??
      false;
    const questions = payload.questions ?? currentQuiz?.questions;

    if (!title || attemptsAllowed === undefined || !questions) {
      this.quizzesSharedService.throwBadRequest(
        'common.bad_request',
        'Incomplete quiz payload',
      );
    }

    if (endAt && startAt && endAt.getTime() <= startAt.getTime()) {
      this.quizzesSharedService.throwBadRequest(
        'quiz.invalid_schedule',
        'Quiz end date must be later than its start date',
      );
    }

    await this.quizzesSharedService.assertAccessCodeIsAvailable(
      accessCode,
      currentQuiz?.quizId,
    );
    await this.quizzesSharedService.assertQuestionReferencesAreValid(questions);

    return {
      title,
      description,
      accessCode,
      requiresAccessCode,
      attemptsAllowed,
      startAt,
      endAt,
      timeLimitMinutes,
      shuffleQuestions,
      revealAnswersAfterClose,
      questions: questions.map((question) => ({
        questionId: question.questionId,
        points: Number(question.points),
      })),
    };
  }

  private toNullableDate(value: string | null | undefined): Date | null {
    if (!value || value.trim().length === 0) {
      return null;
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      this.quizzesSharedService.throwBadRequest(
        'quiz.invalid_schedule',
        'Invalid quiz schedule',
      );
    }

    return parsedDate;
  }

  private async mapQuizItem(
    quiz: QuizDocument,
    flags: { hasAttempts: boolean; canEdit: boolean; canDelete: boolean },
  ): Promise<QuizItem> {
    const questionsById = await this.quizzesSharedService.loadQuestionsMap(
      quiz.questions.map((question) => question.questionId),
    );

    return toQuizItem(quiz, questionsById, flags);
  }
}
