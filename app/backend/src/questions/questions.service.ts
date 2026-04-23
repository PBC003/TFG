import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { type PublicUser } from '../auth/auth.service';
import { createAppErrorBody } from '../common/errors/app-http.exception';
import { Role } from '../users/enums/role.enum';
import { QuestionType } from './enums/question-type.enum';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question, type QuestionDocument } from './schemas/question.schema';
import type { QuestionItem } from './types/question-item.type';
import { toQuestionItem } from './utils/question-item.util';
import {
  applyQuestionUpdate,
  normalizeCreateQuestionData,
  normalizeUpdateQuestionData,
  resolveValidatedQuestionSnapshot,
} from './utils/question-payload.util';
import { assertValidQuestionContent } from './utils/question-validation.util';
export type { QuestionItem } from './types/question-item.type';

export type AuthorizedQuestionUser = Pick<PublicUser, 'id' | 'role'>;

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name)
    private readonly questionModel: Model<Question>,
  ) {}

  async createQuestion(
    createQuestionDto: CreateQuestionDto,
    user: AuthorizedQuestionUser,
  ): Promise<QuestionItem> {
    const normalizedPayload = normalizeCreateQuestionData(createQuestionDto);

    this.assertParametricMutationIsAllowed(normalizedPayload.type, user);
    assertValidQuestionContent(normalizedPayload);

    const question = await this.questionModel.create({
      ...normalizedPayload,
      createdByUserId: user.id,
      updatedByUserId: user.id,
    });

    return toQuestionItem(question);
  }

  async listQuestions(user: AuthorizedQuestionUser): Promise<QuestionItem[]> {
    const questions = await this.questionModel
      .find(this.buildQuestionVisibilityFilter(user))
      .sort({ updatedAt: -1, createdAt: -1 })
      .exec();

    return questions.map(toQuestionItem);
  }

  async listQuestionBank(): Promise<QuestionItem[]> {
    const questions = await this.questionModel
      .find({ isArchived: { $ne: true } })
      .sort({ updatedAt: -1, createdAt: -1 })
      .exec();

    return questions.map(toQuestionItem);
  }

  async findQuestionById(
    questionId: string,
    user: AuthorizedQuestionUser,
  ): Promise<QuestionItem> {
    const question = await this.findVisibleQuestionDocumentOrThrow(
      questionId,
      user,
    );

    return toQuestionItem(question);
  }

  async updateQuestion(
    questionId: string,
    updateQuestionDto: UpdateQuestionDto,
    user: AuthorizedQuestionUser,
  ): Promise<QuestionItem> {
    const question = await this.findVisibleQuestionDocumentOrThrow(
      questionId,
      user,
    );

    this.assertUpdatePayloadHasChanges(updateQuestionDto);

    const normalizedPayload = normalizeUpdateQuestionData(updateQuestionDto);
    const nextQuestionSnapshot = resolveValidatedQuestionSnapshot(
      question,
      normalizedPayload,
    );

    this.assertParametricMutationIsAllowed(nextQuestionSnapshot.type, user);
    assertValidQuestionContent(nextQuestionSnapshot);

    applyQuestionUpdate(question, normalizedPayload);
    question.updatedByUserId = user.id;
    question.version += 1;

    await question.save();

    return toQuestionItem(question);
  }

  async deleteQuestion(
    questionId: string,
    user: AuthorizedQuestionUser,
  ): Promise<void> {
    const question = await this.findVisibleQuestionDocumentOrThrow(
      questionId,
      user,
    );

    question.isArchived = true;
    question.archivedAt = new Date();
    question.archivedByUserId = user.id;
    question.updatedByUserId = user.id;
    question.version += 1;

    await question.save();
  }

  private buildQuestionVisibilityFilter(
    user: AuthorizedQuestionUser,
  ): Record<string, unknown> {
    if (user.role === Role.ADMIN) {
      return { isArchived: { $ne: true } };
    }

    return {
      isArchived: { $ne: true },
      createdByUserId: user.id,
    };
  }

  private async findVisibleQuestionDocumentOrThrow(
    questionId: string,
    user: AuthorizedQuestionUser,
  ): Promise<QuestionDocument> {
    const question = await this.questionModel
      .findOne({
        questionId,
        ...this.buildQuestionVisibilityFilter(user),
      })
      .exec();

    if (!question) {
      this.throwQuestionNotFound();
    }

    return question;
  }

  private assertUpdatePayloadHasChanges(payload: UpdateQuestionDto): void {
    if (Object.keys(payload).length > 0) {
      return;
    }

    throw new HttpException(
      createAppErrorBody(
        'question.update_requires_field',
        'At least one field must be provided',
      ),
      HttpStatus.BAD_REQUEST,
    );
  }

  private assertParametricMutationIsAllowed(
    nextQuestionType: QuestionType,
    user: AuthorizedQuestionUser,
  ): void {
    if (nextQuestionType !== QuestionType.PARAMETRIC) {
      return;
    }

    if (user.role === Role.ADMIN) {
      return;
    }

    throw new HttpException(
      createAppErrorBody(
        'question.parametric_admin_only',
        'Only administrators can create or modify parametric questions',
      ),
      HttpStatus.FORBIDDEN,
    );
  }

  private throwQuestionNotFound(): never {
    throw new HttpException(
      createAppErrorBody('question.not_found', 'Question not found'),
      HttpStatus.NOT_FOUND,
    );
  }
}
