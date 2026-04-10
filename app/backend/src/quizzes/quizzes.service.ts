import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { PublicUser } from '../auth/auth.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { QuizStatus } from './enums/quiz-status.enum';
import { Quiz, type QuizDocument } from './schemas/quiz.schema';
import type { QuizItem } from './types/quiz.types';
import { toQuizItem } from './utils/quiz/quiz-item.util';
import {
  normalizeQuizMutationPayload,
  type QuizMutationPayload,
} from './utils/quiz/quiz-mutation-payload.util';
import { QuizzesSharedService } from './quizzes-shared.service';

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
    const normalizedPayload = await normalizeQuizMutationPayload(
      this.quizzesSharedService,
      createQuizDto,
    );

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

    const normalizedPayload = await normalizeQuizMutationPayload(
      this.quizzesSharedService,
      updateQuizDto,
      quiz,
    );

    this.applyQuizMutationPayload(quiz, normalizedPayload, user.id);
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

  private applyQuizMutationPayload(
    quiz: QuizDocument,
    payload: QuizMutationPayload,
    userId: number,
  ) {
    quiz.title = payload.title;
    quiz.description = payload.description;
    quiz.accessCode = payload.accessCode;
    quiz.requiresAccessCode = payload.requiresAccessCode;
    quiz.attemptsAllowed = payload.attemptsAllowed;
    quiz.startAt = payload.startAt;
    quiz.endAt = payload.endAt;
    quiz.timeLimitMinutes = payload.timeLimitMinutes;
    quiz.shuffleQuestions = payload.shuffleQuestions;
    quiz.revealAnswersAfterClose = payload.revealAnswersAfterClose;
    quiz.questions = payload.questions;
    quiz.updatedByUserId = userId;
    quiz.version += 1;
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
