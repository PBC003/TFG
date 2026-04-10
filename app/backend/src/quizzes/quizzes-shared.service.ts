import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { In, Repository } from 'typeorm';
import { createAppErrorBody } from '../common/errors/app-http.exception';
import { QuestionType } from '../questions/enums/question-type.enum';
import {
  Question,
  type QuestionDocument,
} from '../questions/schemas/question.schema';
import { User } from '../users/entities/user.entity';
import {
  QuizAttempt,
  type QuizAttemptDocument,
} from './schemas/quiz-attempt.schema';
import { QuizStatus } from './enums/quiz-status.enum';
import { Quiz, type QuizDocument } from './schemas/quiz.schema';
import {
  generateAccessCode,
  normalizeAccessCode,
} from './utils/access-code.util';

const SUPPORTED_QUIZ_QUESTION_TYPES = new Set<QuestionType>([
  QuestionType.TRUE_FALSE,
  QuestionType.SINGLE_CHOICE,
  QuestionType.MULTIPLE_CHOICE,
]);

@Injectable()
export class QuizzesSharedService {
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

  normalizeAccessCode(value: string | null | undefined): string {
    return normalizeAccessCode(value);
  }

  generateAccessCode(): string {
    return generateAccessCode();
  }

  async assertAccessCodeIsAvailable(
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

  async assertQuestionReferencesAreValid(
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

  async findQuizDocumentOrThrow(quizId: string): Promise<QuizDocument> {
    const quiz = await this.quizModel.findOne({ quizId }).exec();

    if (!quiz) {
      this.throwNotFound('quiz.not_found', 'Quiz not found');
    }

    return quiz;
  }

  async findPublishedQuizById(quizId: string): Promise<QuizDocument> {
    const quiz = await this.quizModel
      .findOne({ quizId, status: QuizStatus.PUBLISHED })
      .exec();

    if (!quiz) {
      this.throwNotFound('quiz.not_found', 'Quiz not found');
    }

    return quiz;
  }

  async findPublishedQuizByAccessCode(
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

  assertQuizAvailability(quiz: QuizDocument, now: Date): void {
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

  async loadQuestionsMap(
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

  async countAttemptsByQuizIds(
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

  async quizHasAttempts(quizId: string): Promise<boolean> {
    const count = await this.quizAttemptModel.countDocuments({ quizId }).exec();
    return count > 0;
  }

  async countConsumedAttempts(
    quizId: string,
    participantName: string,
  ): Promise<number> {
    return this.quizAttemptModel
      .countDocuments({ quizId, participantName })
      .exec();
  }

  async loadTeacherNamesById(
    teacherIds: number[],
  ): Promise<Map<number, string>> {
    const uniqueTeacherIds = Array.from(new Set(teacherIds));

    if (uniqueTeacherIds.length === 0) {
      return new Map();
    }

    const teachers = await this.userRepository.findBy({
      id: In(uniqueTeacherIds),
    });

    return new Map(
      teachers.map((teacher) => [
        teacher.id,
        `${teacher.firstName} ${teacher.lastName}`.trim(),
      ]),
    );
  }

  throwBadRequest(
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

  throwConflict(
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

  throwNotFound(
    code: 'quiz.attempt_not_found' | 'quiz.not_found',
    message: string,
  ): never {
    throw new HttpException(
      createAppErrorBody(code, message),
      HttpStatus.NOT_FOUND,
    );
  }
}
