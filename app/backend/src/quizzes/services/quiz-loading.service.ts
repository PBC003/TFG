import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createAppErrorBody } from '../../common/errors/app-http.exception';
import { Group, type GroupDocument } from '../../groups/schemas/group.schema';
import {
  Question,
  type QuestionDocument,
} from '../../questions/schemas/question.schema';
import { Role } from '../../users/enums/role.enum';
import { QuizStatus } from '../enums/quiz-status.enum';
import {
  QuizAttempt,
  type QuizAttemptDocument,
} from '../schemas/quiz-attempt.schema';
import { Quiz, type QuizDocument } from '../schemas/quiz.schema';
import type { AuthorizedQuizUser } from '../quizzes-shared.service';

@Injectable()
export class QuizLoadingService {
  constructor(
    @InjectModel(Quiz.name)
    private readonly quizModel: Model<QuizDocument>,
    @InjectModel(QuizAttempt.name)
    private readonly quizAttemptModel: Model<QuizAttemptDocument>,
    @InjectModel(Question.name)
    private readonly questionModel: Model<QuestionDocument>,
    @InjectModel(Group.name)
    private readonly groupModel: Model<GroupDocument>,
  ) {}

  async findQuizDocumentOrThrow(quizId: string): Promise<QuizDocument> {
    const quiz = await this.quizModel.findOne({ quizId }).exec();

    if (!quiz) {
      this.throwNotFound('quiz.not_found', 'Quiz not found');
    }

    return quiz;
  }

  async findManagedQuizDocumentOrThrow(
    quizId: string,
    user: AuthorizedQuizUser,
  ): Promise<QuizDocument> {
    const query: Record<string, unknown> = { quizId };

    if (user.role !== Role.ADMIN) {
      query.createdByUserId = user.id;
    }

    const quiz = await this.quizModel.findOne(query).exec();

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

  async loadQuestionsMap(
    questionIds: string[],
  ): Promise<Map<string, QuestionDocument>> {
    const uniqueQuestionIds = Array.from(new Set(questionIds));

    if (uniqueQuestionIds.length === 0) {
      return new Map();
    }

    const questions = await this.questionModel
      .find({ questionId: { $in: uniqueQuestionIds } })
      .exec();

    return new Map(
      questions.map((question) => [question.questionId, question]),
    );
  }

  async loadGroupsMap(groupIds: string[]): Promise<Map<string, GroupDocument>> {
    const uniqueGroupIds = Array.from(new Set(groupIds));

    if (uniqueGroupIds.length === 0) {
      return new Map();
    }

    const groups = await this.groupModel
      .find({ groupId: { $in: uniqueGroupIds }, isArchived: { $ne: true } })
      .exec();

    return new Map(groups.map((group) => [group.groupId, group]));
  }

  async getAccessibleGroupIdsForParticipant(
    participantName: string,
  ): Promise<Set<string>> {
    const match = /^user:(\d+)$/.exec(participantName.trim());

    if (!match) {
      return new Set();
    }

    const userId = Number(match[1]);

    if (!Number.isInteger(userId)) {
      return new Set();
    }

    const groups = await this.groupModel
      .find({ memberUserIds: userId, isArchived: { $ne: true } })
      .select(['groupId'])
      .exec();

    return new Set(groups.map((group) => group.groupId));
  }

  async countAttemptsByQuizIds(
    quizIds: string[],
  ): Promise<Map<string, number>> {
    const uniqueQuizIds = Array.from(new Set(quizIds));

    if (uniqueQuizIds.length === 0) {
      return new Map();
    }

    const counts = await this.quizAttemptModel
      .aggregate<{ _id: string; count: number }>([
        {
          $match: { quizId: { $in: uniqueQuizIds }, isPreview: { $ne: true } },
        },
        { $group: { _id: '$quizId', count: { $sum: 1 } } },
      ])
      .exec();

    return new Map(counts.map((item) => [item._id, Number(item.count)]));
  }

  async countConsumedAttempts(
    quizId: string,
    participantName: string,
  ): Promise<number> {
    return this.quizAttemptModel
      .countDocuments({ quizId, participantName, isPreview: { $ne: true } })
      .exec();
  }

  private throwNotFound(code: 'quiz.not_found', message: string): never {
    throw new HttpException(
      createAppErrorBody(code, message),
      HttpStatus.NOT_FOUND,
    );
  }
}
