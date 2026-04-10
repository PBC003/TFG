import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { In, Repository } from 'typeorm';
import type { PublicUser } from '../auth/auth.service';
import { createAppErrorBody } from '../common/errors/app-http.exception';
import { QuestionType } from '../questions/enums/question-type.enum';
import {
  Question,
  type QuestionDocument,
} from '../questions/schemas/question.schema';
import type {
  MultipleChoiceQuestionConfig,
  SingleChoiceQuestionConfig,
  TrueFalseQuestionConfig,
} from '../questions/types/question-type-config.type';
import { User } from '../users/entities/user.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { StartQuizAttemptDto } from './dto/start-quiz-attempt.dto';
import { SubmitQuizAttemptDto } from './dto/submit-quiz-attempt.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
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
  QuizItem,
  QuizSubmissionResult,
  SupportedQuestionConfig,
} from './types/quiz.types';
import {
  generateAccessCode,
  normalizeAccessCode,
} from './utils/access-code.util';
import { gradeAttempt } from './utils/grade-attempt.util';
import {
  toQuizAttemptItem,
  toQuizSubmissionResult,
} from './utils/public-attempt.util';
import { toQuizItem } from './utils/quiz-item.util';

const SUPPORTED_QUIZ_QUESTION_TYPES = new Set<QuestionType>([
  QuestionType.TRUE_FALSE,
  QuestionType.SINGLE_CHOICE,
  QuestionType.MULTIPLE_CHOICE,
]);

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
    @InjectModel(QuizAttempt.name)
    private readonly quizAttemptModel: Model<QuizAttemptDocument>,
    @InjectModel(Question.name)
    private readonly questionModel: Model<QuestionDocument>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

    const questionsById = await this.loadQuestionsMap(
      normalizedPayload.questions.map((question) => question.questionId),
    );

    return toQuizItem(quiz, questionsById, {
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

    const questionIds = quizzes.flatMap((quiz) =>
      quiz.questions.map((question) => question.questionId),
    );
    const questionsById = await this.loadQuestionsMap(questionIds);
    const attemptCountByQuizId = await this.countAttemptsByQuizIds(
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

  async listPublishedQuizzes(
    participantName?: string,
  ): Promise<PublicQuizCatalogItem[]> {
    const normalizedParticipantName = participantName?.trim() ?? '';
    const quizzes = await this.quizModel
      .find({ status: QuizStatus.PUBLISHED })
      .sort({ publishedAt: -1, updatedAt: -1 })
      .exec();

    const teacherIds = Array.from(
      new Set(quizzes.map((quiz) => quiz.createdByUserId)),
    );
    const teachers = teacherIds.length
      ? await this.userRepository.findBy({ id: In(teacherIds) })
      : [];
    const teachersById = new Map(
      teachers.map((teacher) => [
        teacher.id,
        `${teacher.firstName} ${teacher.lastName}`.trim(),
      ]),
    );

    const attemptsRemainingByQuiz = new Map<string, number>();

    if (normalizedParticipantName.length >= 2) {
      const counts = await Promise.all(
        quizzes.map(async (quiz) => {
          const usedAttempts = await this.countConsumedAttempts(
            quiz.quizId,
            normalizedParticipantName,
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
    }

    const nowMs = Date.now();

    return quizzes.map((quiz) => {
      const totalQuestions = quiz.questions.length;
      const totalPoints = quiz.questions.reduce(
        (sum, question) => sum + Number(question.points),
        0,
      );
      const isAvailableNow =
        (!quiz.startAt || quiz.startAt.getTime() <= nowMs) &&
        (!quiz.endAt || quiz.endAt.getTime() >= nowMs);
      const attemptsRemaining =
        normalizedParticipantName.length >= 2
          ? (attemptsRemainingByQuiz.get(quiz.quizId) ?? quiz.attemptsAllowed)
          : null;

      return {
        quizId: quiz.quizId,
        title: quiz.title,
        description: quiz.description,
        teacherName: teachersById.get(quiz.createdByUserId) ?? 'Profesorado',
        requiresAccessCode: quiz.requiresAccessCode === true,
        attemptsAllowed: quiz.attemptsAllowed,
        attemptsRemaining,
        totalQuestions,
        totalPoints,
        startAt: quiz.startAt,
        endAt: quiz.endAt,
        timeLimitMinutes: quiz.timeLimitMinutes,
        publishedAt: quiz.publishedAt,
        isAvailableNow,
        canStart:
          isAvailableNow &&
          (attemptsRemaining === null || attemptsRemaining > 0),
      };
    });
  }

  async findQuizById(quizId: string): Promise<QuizItem> {
    const quiz = await this.findQuizDocumentOrThrow(quizId);
    const questionsById = await this.loadQuestionsMap(
      quiz.questions.map((question) => question.questionId),
    );

    const hasAttempts = await this.quizHasAttempts(quiz.quizId);

    return toQuizItem(quiz, questionsById, {
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
    const quiz = await this.findQuizDocumentOrThrow(quizId);

    if (Object.keys(updateQuizDto).length === 0) {
      this.throwBadRequest(
        'quiz.update_requires_field',
        'At least one quiz field must be provided',
      );
    }

    if (quiz.status === QuizStatus.PUBLISHED) {
      this.throwConflict(
        'quiz.published_locked',
        'Published quizzes must be unpublished before they can be edited',
      );
    }

    if (await this.quizHasAttempts(quiz.quizId)) {
      this.throwConflict(
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

    const questionsById = await this.loadQuestionsMap(
      quiz.questions.map((question) => question.questionId),
    );

    const hasAttempts = await this.quizHasAttempts(quiz.quizId);

    return toQuizItem(quiz, questionsById, {
      hasAttempts,
      canEdit: !hasAttempts,
      canDelete: !hasAttempts,
    });
  }

  async publishQuiz(
    quizId: string,
    user: Pick<PublicUser, 'id'>,
  ): Promise<QuizItem> {
    const quiz = await this.findQuizDocumentOrThrow(quizId);

    if (quiz.questions.length === 0) {
      this.throwConflict(
        'quiz.publish_requires_questions',
        'A quiz must contain at least one question before publication',
      );
    }

    await this.assertQuestionReferencesAreValid(quiz.questions);

    quiz.status = QuizStatus.PUBLISHED;
    quiz.updatedByUserId = user.id;
    quiz.version += 1;
    quiz.publishedAt = new Date();

    await quiz.save();

    const questionsById = await this.loadQuestionsMap(
      quiz.questions.map((question) => question.questionId),
    );

    const hasAttempts = await this.quizHasAttempts(quiz.quizId);

    return toQuizItem(quiz, questionsById, {
      hasAttempts,
      canEdit: false,
      canDelete: !hasAttempts,
    });
  }

  async unpublishQuiz(
    quizId: string,
    user: Pick<PublicUser, 'id'>,
  ): Promise<QuizItem> {
    const quiz = await this.findQuizDocumentOrThrow(quizId);

    quiz.status = QuizStatus.DRAFT;
    quiz.updatedByUserId = user.id;
    quiz.version += 1;
    quiz.publishedAt = null;

    await quiz.save();

    const questionsById = await this.loadQuestionsMap(
      quiz.questions.map((question) => question.questionId),
    );

    const hasAttempts = await this.quizHasAttempts(quiz.quizId);

    return toQuizItem(quiz, questionsById, {
      hasAttempts,
      canEdit: !hasAttempts,
      canDelete: !hasAttempts,
    });
  }

  async deleteQuiz(quizId: string): Promise<void> {
    const quiz = await this.findQuizDocumentOrThrow(quizId);

    if (await this.quizHasAttempts(quiz.quizId)) {
      this.throwConflict(
        'quiz.has_attempts_locked',
        'Quizzes with attempts cannot be deleted anymore',
      );
    }

    await this.quizModel.deleteOne({ quizId: quiz.quizId }).exec();
  }

  async startAttempt(
    startQuizAttemptDto: StartQuizAttemptDto,
  ): Promise<QuizAttemptItem> {
    const accessCode = normalizeAccessCode(
      startQuizAttemptDto.accessCode ?? null,
    );
    const quizId = startQuizAttemptDto.quizId?.trim() ?? '';
    const participantName = startQuizAttemptDto.participantName.trim();

    if (!accessCode && !quizId) {
      this.throwBadRequest(
        'quiz.access_data_required',
        'A quiz link or access code is required to start an attempt',
      );
    }

    const quiz = quizId
      ? await this.findPublishedQuizById(quizId)
      : await this.findPublishedQuizByAccessCode(accessCode);

    if (quiz.requiresAccessCode === true) {
      if (!accessCode) {
        this.throwBadRequest(
          'quiz.access_data_required',
          'This quiz requires a valid access code',
        );
      }

      if (normalizeAccessCode(quiz.accessCode) !== accessCode) {
        this.throwBadRequest(
          'quiz.invalid_access_code',
          'The provided access code is not valid for this quiz',
        );
      }
    }

    this.assertQuizAvailability(quiz, new Date());

    const activeAttempt = await this.quizAttemptModel
      .findOne({
        quizId: quiz.quizId,
        participantName,
        status: QuizAttemptStatus.IN_PROGRESS,
      })
      .sort({ startedAt: -1 })
      .exec();

    if (activeAttempt) {
      const now = new Date();

      if (
        !activeAttempt.expiresAt ||
        activeAttempt.expiresAt.getTime() > now.getTime()
      ) {
        const usedAttempts = await this.countConsumedAttempts(
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
    }

    const usedAttempts = await this.countConsumedAttempts(
      quiz.quizId,
      participantName,
    );

    if (usedAttempts >= quiz.attemptsAllowed) {
      this.throwConflict(
        'quiz.attempts_exhausted',
        'No attempts remain for this quiz',
      );
    }

    const questionSnapshots = await this.buildAttemptQuestionSnapshots(quiz);
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
      this.throwNotFound('quiz.attempt_not_found', 'Quiz attempt not found');
    }

    if (attempt.status !== QuizAttemptStatus.IN_PROGRESS) {
      this.throwConflict(
        'quiz.attempt_already_submitted',
        'The selected attempt is no longer active',
      );
    }

    const quiz = await this.findQuizDocumentOrThrow(attempt.quizId);
    const answerMap = new Map(
      submitQuizAttemptDto.answers.map((answer) => [
        answer.questionId,
        answer.value,
      ]),
    );
    const gradedAttempt = gradeAttempt(attempt.questions, answerMap);

    attempt.answers = gradedAttempt.answers;
    attempt.earnedPoints = gradedAttempt.earnedPoints;
    attempt.maxPoints = gradedAttempt.maxPoints;
    attempt.status = QuizAttemptStatus.SUBMITTED;
    attempt.submittedAt = new Date();

    await attempt.save();

    const consumedAttempts = await this.countConsumedAttempts(
      quiz.quizId,
      attempt.participantName,
    );
    const attemptsRemaining = Math.max(
      0,
      quiz.attemptsAllowed - consumedAttempts,
    );
    const revealBlockedByEndDate =
      quiz.revealAnswersAfterClose &&
      quiz.endAt !== null &&
      quiz.endAt.getTime() > Date.now();
    const canRevealFeedback =
      attemptsRemaining === 0 && !revealBlockedByEndDate;

    return toQuizSubmissionResult(
      attempt,
      {
        title: quiz.title,
        attemptsAllowed: quiz.attemptsAllowed,
        attemptsRemaining,
        canRevealFeedback,
        revealBlockedByEndDate,
      },
      gradedAttempt.review,
    );
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
    const accessCode = normalizeAccessCode(
      requiresAccessCode
        ? (accessCodeInput ?? currentQuiz?.accessCode ?? generateAccessCode())
        : (currentQuiz?.accessCode ?? generateAccessCode()),
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
      this.throwBadRequest('common.bad_request', 'Incomplete quiz payload');
    }

    if (endAt && startAt && endAt.getTime() <= startAt.getTime()) {
      this.throwBadRequest(
        'quiz.invalid_schedule',
        'Quiz end date must be later than its start date',
      );
    }

    await this.assertAccessCodeIsAvailable(accessCode, currentQuiz?.quizId);
    await this.assertQuestionReferencesAreValid(questions);

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
      this.throwBadRequest('quiz.invalid_schedule', 'Invalid quiz schedule');
    }

    return parsedDate;
  }

  private async assertAccessCodeIsAvailable(
    accessCode: string,
    currentQuizId?: string,
  ): Promise<void> {
    const existingQuiz = await this.quizModel
      .findOne({ accessCode })
      .select(['quizId'])
      .exec();

    if (!existingQuiz) {
      return;
    }

    if (currentQuizId && existingQuiz.quizId === currentQuizId) {
      return;
    }

    this.throwConflict(
      'quiz.access_code_already_exists',
      'The selected quiz access code is already in use',
    );
  }

  private async assertQuestionReferencesAreValid(
    quizQuestions: { questionId: string; points: number }[],
  ): Promise<void> {
    const questions = await this.questionModel
      .find({
        questionId: {
          $in: quizQuestions.map((question) => question.questionId),
        },
      })
      .exec();

    if (questions.length !== quizQuestions.length) {
      this.throwBadRequest(
        'quiz.question_not_found',
        'At least one referenced question does not exist',
      );
    }

    const unsupportedQuestion = questions.find(
      (question) => !SUPPORTED_QUIZ_QUESTION_TYPES.has(question.type),
    );

    if (unsupportedQuestion) {
      this.throwBadRequest(
        'quiz.unsupported_question_type',
        'The selected quiz includes a question type that is not supported in Sprint 3',
        { type: unsupportedQuestion.type },
      );
    }
  }

  private async findQuizDocumentOrThrow(quizId: string): Promise<QuizDocument> {
    const quiz = await this.quizModel.findOne({ quizId }).exec();

    if (!quiz) {
      this.throwNotFound('quiz.not_found', 'Quiz not found');
    }

    return quiz;
  }

  private async findPublishedQuizById(quizId: string): Promise<QuizDocument> {
    const quiz = await this.quizModel
      .findOne({ quizId, status: QuizStatus.PUBLISHED })
      .exec();

    if (!quiz) {
      this.throwNotFound('quiz.not_found', 'Quiz not found');
    }

    return quiz;
  }

  private async findPublishedQuizByAccessCode(
    accessCode: string,
  ): Promise<QuizDocument> {
    const quiz = await this.quizModel
      .findOne({ accessCode, status: QuizStatus.PUBLISHED })
      .exec();

    if (!quiz) {
      this.throwNotFound('quiz.not_found', 'Quiz not found');
    }

    return quiz;
  }

  private assertQuizAvailability(quiz: QuizDocument, now: Date): void {
    if (quiz.status !== QuizStatus.PUBLISHED) {
      this.throwConflict('quiz.not_published', 'Quiz is not published');
    }

    if (quiz.startAt && quiz.startAt.getTime() > now.getTime()) {
      this.throwConflict('quiz.not_available_yet', 'Quiz is not available yet');
    }

    if (quiz.endAt && quiz.endAt.getTime() < now.getTime()) {
      this.throwConflict('quiz.closed', 'Quiz is already closed');
    }
  }

  private async buildAttemptQuestionSnapshots(
    quiz: QuizDocument,
  ): Promise<QuizAttemptDocument['questions']> {
    const questionIds = quiz.questions.map((question) => question.questionId);
    const questionMap = await this.loadQuestionsMap(questionIds);

    const orderedQuestions = quiz.questions.map((quizQuestion) => {
      const question = questionMap.get(quizQuestion.questionId);

      if (!question) {
        this.throwBadRequest(
          'quiz.question_not_found',
          'At least one quiz question does not exist anymore',
        );
      }

      const orderedConfig = this.createAttemptQuestionConfig(question);

      return {
        questionId: question.questionId,
        title: question.title,
        type: question.type,
        statement: question.statement,
        explanation: question.explanation,
        tags: question.tags,
        points: quizQuestion.points,
        order: 0,
        questionConfig: orderedConfig,
      };
    });

    const finalQuestions = quiz.shuffleQuestions
      ? this.shuffleItems(orderedQuestions)
      : orderedQuestions;

    return finalQuestions.map((question, index) => ({
      ...question,
      order: index,
    }));
  }

  private createAttemptQuestionConfig(
    question: QuestionDocument,
  ): SupportedQuestionConfig {
    switch (question.type) {
      case QuestionType.TRUE_FALSE: {
        const config = question.questionConfig as TrueFalseQuestionConfig;
        return { ...config };
      }
      case QuestionType.SINGLE_CHOICE: {
        const config = question.questionConfig as SingleChoiceQuestionConfig;

        return {
          ...config,
          options: config.randomizeOptions
            ? this.shuffleItems(config.options)
            : [...config.options],
        };
      }
      case QuestionType.MULTIPLE_CHOICE: {
        const config = question.questionConfig as MultipleChoiceQuestionConfig;

        return {
          ...config,
          options: config.randomizeOptions
            ? this.shuffleItems(config.options)
            : [...config.options],
        };
      }
      default:
        this.throwBadRequest(
          'quiz.unsupported_question_type',
          'Only true/false and choice questions can be used in quizzes',
          { type: question.type },
        );
    }
  }

  private async loadQuestionsMap(
    questionIds: string[],
  ): Promise<Map<string, QuestionDocument>> {
    const uniqueQuestionIds = Array.from(new Set(questionIds));

    if (uniqueQuestionIds.length === 0) {
      return new Map();
    }

    const questions: QuestionDocument[] = await this.questionModel
      .find({ questionId: { $in: uniqueQuestionIds } })
      .exec();

    return new Map(
      questions.map((question) => [question.questionId, question]),
    );
  }

  private async countAttemptsByQuizIds(
    quizIds: string[],
  ): Promise<Map<string, number>> {
    const uniqueQuizIds = Array.from(new Set(quizIds));

    if (uniqueQuizIds.length === 0) {
      return new Map();
    }

    const counts = await this.quizAttemptModel
      .aggregate<{
        _id: string;
        count: number;
      }>([
        { $match: { quizId: { $in: uniqueQuizIds } } },
        { $group: { _id: '$quizId', count: { $sum: 1 } } },
      ])
      .exec();

    return new Map(counts.map((item) => [item._id, Number(item.count)]));
  }

  private async quizHasAttempts(quizId: string): Promise<boolean> {
    const count = await this.quizAttemptModel.countDocuments({ quizId }).exec();
    return count > 0;
  }

  private async countConsumedAttempts(
    quizId: string,
    participantName: string,
  ): Promise<number> {
    return this.quizAttemptModel
      .countDocuments({ quizId, participantName })
      .exec();
  }

  private shuffleItems<T>(items: T[]): T[] {
    const clonedItems = [...items];

    for (let index = clonedItems.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const currentItem = clonedItems[index];
      clonedItems[index] = clonedItems[swapIndex];
      clonedItems[swapIndex] = currentItem;
    }

    return clonedItems;
  }

  private throwBadRequest(
    code:
      | 'common.bad_request'
      | 'quiz.access_data_required'
      | 'quiz.invalid_access_code'
      | 'quiz.invalid_schedule'
      | 'quiz.question_not_found'
      | 'quiz.unsupported_question_type'
      | 'quiz.update_requires_field',
    message: string,
    details?: Record<string, unknown>,
  ): never {
    throw new HttpException(
      createAppErrorBody(code, message, details),
      HttpStatus.BAD_REQUEST,
    );
  }

  private throwConflict(
    code:
      | 'quiz.access_code_already_exists'
      | 'quiz.attempt_already_submitted'
      | 'quiz.attempts_exhausted'
      | 'quiz.closed'
      | 'quiz.has_attempts_locked'
      | 'quiz.not_available_yet'
      | 'quiz.not_published'
      | 'quiz.publish_requires_questions'
      | 'quiz.published_locked',
    message: string,
  ): never {
    throw new HttpException(
      createAppErrorBody(code, message),
      HttpStatus.CONFLICT,
    );
  }

  private throwNotFound(
    code: 'quiz.attempt_not_found' | 'quiz.not_found',
    message: string,
  ): never {
    throw new HttpException(
      createAppErrorBody(code, message),
      HttpStatus.NOT_FOUND,
    );
  }
}
