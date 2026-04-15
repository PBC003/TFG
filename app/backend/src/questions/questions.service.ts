import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { type PublicUser } from '../auth/auth.service';
import { createAppErrorBody } from '../common/errors/app-http.exception';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question, type QuestionDocument } from './schemas/question.schema';
import type { QuestionItem } from './types/question-item.type.ts';
import { toQuestionItem } from './utils/question-item.util';
import {
  applyQuestionUpdate,
  normalizeCreateQuestionData,
  normalizeUpdateQuestionData,
  resolveValidatedQuestionSnapshot,
} from './utils/question-payload.util';
import { assertValidQuestionContent } from './utils/question-validation.util';
export type { QuestionItem } from './types/question-item.type';
@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name)
    private readonly questionModel: Model<Question>,
  ) {}

  async createQuestion(
    createQuestionDto: CreateQuestionDto,
    user: Pick<PublicUser, 'id'>,
  ): Promise<QuestionItem> {
    const normalizedPayload = normalizeCreateQuestionData(createQuestionDto);

    assertValidQuestionContent(normalizedPayload);

    const question = await this.questionModel.create({
      ...normalizedPayload,
      createdByUserId: user.id,
      updatedByUserId: user.id,
    });

    return toQuestionItem(question);
  }

  async listQuestions(): Promise<QuestionItem[]> {
    const questions = await this.questionModel
      .find({ isArchived: { $ne: true } })
      .sort({ updatedAt: -1, createdAt: -1 })
      .exec();

    return questions.map(toQuestionItem);
  }

  async findQuestionById(questionId: string): Promise<QuestionItem> {
    const question = await this.findActiveQuestionDocumentOrThrow(questionId);

    return toQuestionItem(question);
  }

  async updateQuestion(
    questionId: string,
    updateQuestionDto: UpdateQuestionDto,
    user: Pick<PublicUser, 'id'>,
  ): Promise<QuestionItem> {
    const question = await this.findActiveQuestionDocumentOrThrow(questionId);

    this.assertUpdatePayloadHasChanges(updateQuestionDto);

    const normalizedPayload = normalizeUpdateQuestionData(updateQuestionDto);
    const nextQuestionSnapshot = resolveValidatedQuestionSnapshot(
      question,
      normalizedPayload,
    );

    assertValidQuestionContent(nextQuestionSnapshot);

    applyQuestionUpdate(question, normalizedPayload);
    question.updatedByUserId = user.id;
    question.version += 1;

    await question.save();

    return toQuestionItem(question);
  }

  async deleteQuestion(
    questionId: string,
    user: Pick<PublicUser, 'id'>,
  ): Promise<void> {
    const question = await this.findActiveQuestionDocumentOrThrow(questionId);

    question.isArchived = true;
    question.archivedAt = new Date();
    question.archivedByUserId = user.id;
    question.updatedByUserId = user.id;
    question.version += 1;

    await question.save();
  }

  private async findQuestionDocumentOrThrow(
    questionId: string,
  ): Promise<QuestionDocument> {
    const question = await this.questionModel.findOne({ questionId }).exec();

    if (!question) {
      this.throwQuestionNotFound();
    }

    return question;
  }

  private async findActiveQuestionDocumentOrThrow(
    questionId: string,
  ): Promise<QuestionDocument> {
    const question = await this.questionModel
      .findOne({ questionId, isArchived: { $ne: true } })
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

  private throwQuestionNotFound(): never {
    throw new HttpException(
      createAppErrorBody('question.not_found', 'Question not found'),
      HttpStatus.NOT_FOUND,
    );
  }
}
