import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { type PublicUser } from '../auth/auth.service';
import { createAppErrorBody } from '../common/errors/app-http.exception';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionType } from './enums/question-type.enum';
import { Question, type QuestionDocument } from './schemas/question.schema';
import type { QuestionTypeConfig } from './types/question-type-config.type';
import {
  normalizeQuestionTypeConfig,
  validateQuestionMathContent,
} from './utils/question-math-content.util';
import { isValidQuestionTypeConfig } from './validators/question-type-config.validator';

export type QuestionItem = {
  questionId: string;
  title: string;
  type: QuestionType;
  statement: string;
  explanation: string | null;
  tags: string[];
  createdByUserId: number;
  updatedByUserId: number;
  version: number;
  questionConfig: QuestionTypeConfig;
  createdAt: Date;
  updatedAt: Date;
};

type NormalizedCreateQuestionData = {
  title: string;
  type: QuestionType;
  statement: string;
  explanation: string | null;
  tags: string[];
  questionConfig: QuestionTypeConfig;
};

type NormalizedUpdateQuestionData = {
  title?: string;
  type?: QuestionType;
  statement?: string;
  explanation?: string | null;
  tags?: string[];
  questionConfig?: QuestionTypeConfig;
};

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
    const normalizedPayload =
      this.normalizeCreateQuestionData(createQuestionDto);

    if (
      !isValidQuestionTypeConfig(
        normalizedPayload.type,
        normalizedPayload.questionConfig,
      )
    ) {
      throw new HttpException(
        createAppErrorBody(
          'question.invalid_type_config',
          'questionConfig does not match the selected question type',
        ),
        HttpStatus.BAD_REQUEST,
      );
    }

    const mathValidation = validateQuestionMathContent(
      normalizedPayload.type,
      normalizedPayload.statement,
      normalizedPayload.explanation,
      normalizedPayload.questionConfig,
    );

    if (!mathValidation.isValid) {
      throw new HttpException(
        createAppErrorBody(
          'question.invalid_math_content',
          'Question content contains invalid LaTeX or forbidden executable markup',
          { fields: mathValidation.errors },
        ),
        HttpStatus.BAD_REQUEST,
      );
    }

    const question = await this.questionModel.create({
      ...normalizedPayload,
      questionConfig: normalizedPayload.questionConfig,
      createdByUserId: user.id,
      updatedByUserId: user.id,
    });

    return this.toQuestionItem(question);
  }

  async listQuestions(): Promise<QuestionItem[]> {
    const questions = await this.questionModel
      .find()
      .sort({ updatedAt: -1, createdAt: -1 })
      .exec();

    return questions.map((question) => this.toQuestionItem(question));
  }

  async findQuestionById(questionId: string): Promise<QuestionItem> {
    const question = await this.questionModel.findOne({ questionId }).exec();

    if (!question) {
      throw new HttpException(
        createAppErrorBody('question.not_found', 'Question not found'),
        HttpStatus.NOT_FOUND,
      );
    }

    return this.toQuestionItem(question);
  }

  async updateQuestion(
    questionId: string,
    updateQuestionDto: UpdateQuestionDto,
    user: Pick<PublicUser, 'id'>,
  ): Promise<QuestionItem> {
    const question = await this.questionModel.findOne({ questionId }).exec();

    if (!question) {
      throw new HttpException(
        createAppErrorBody('question.not_found', 'Question not found'),
        HttpStatus.NOT_FOUND,
      );
    }

    if (Object.keys(updateQuestionDto).length === 0) {
      throw new HttpException(
        createAppErrorBody(
          'question.update_requires_field',
          'At least one field must be provided',
        ),
        HttpStatus.BAD_REQUEST,
      );
    }

    const normalizedPayload =
      this.normalizeUpdateQuestionData(updateQuestionDto);

    const nextType = normalizedPayload.type ?? question.type;

    if (normalizedPayload.questionConfig !== undefined) {
      normalizedPayload.questionConfig = normalizeQuestionTypeConfig(
        nextType,
        normalizedPayload.questionConfig,
      );
    }

    const nextQuestionConfig =
      normalizedPayload.questionConfig ?? question.questionConfig;

    if (!isValidQuestionTypeConfig(nextType, nextQuestionConfig)) {
      throw new HttpException(
        createAppErrorBody(
          'question.invalid_type_config',
          'questionConfig does not match the selected question type',
        ),
        HttpStatus.BAD_REQUEST,
      );
    }

    const mathValidation = validateQuestionMathContent(
      nextType,
      normalizedPayload.statement ?? question.statement,
      normalizedPayload.explanation === undefined
        ? question.explanation
        : normalizedPayload.explanation,
      nextQuestionConfig,
    );

    if (!mathValidation.isValid) {
      throw new HttpException(
        createAppErrorBody(
          'question.invalid_math_content',
          'Question content contains invalid LaTeX or forbidden executable markup',
          { fields: mathValidation.errors },
        ),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (normalizedPayload.title !== undefined) {
      question.title = normalizedPayload.title;
    }

    if (normalizedPayload.type !== undefined) {
      question.type = normalizedPayload.type;
    }

    if (normalizedPayload.statement !== undefined) {
      question.statement = normalizedPayload.statement;
    }

    if (normalizedPayload.explanation !== undefined) {
      question.explanation = normalizedPayload.explanation;
    }

    if (normalizedPayload.tags !== undefined) {
      question.tags = normalizedPayload.tags;
    }

    if (normalizedPayload.questionConfig !== undefined) {
      question.questionConfig = normalizedPayload.questionConfig;
    }

    question.updatedByUserId = user.id;
    question.version += 1;

    await question.save();

    return this.toQuestionItem(question);
  }

  async deleteQuestion(questionId: string): Promise<void> {
    const deleteResult = await this.questionModel
      .deleteOne({ questionId })
      .exec();

    if (deleteResult.deletedCount === 0) {
      throw new HttpException(
        createAppErrorBody('question.not_found', 'Question not found'),
        HttpStatus.NOT_FOUND,
      );
    }
  }

  private normalizeCreateQuestionData(
    payload: CreateQuestionDto,
  ): NormalizedCreateQuestionData {
    return {
      title: payload.title.trim(),
      type: payload.type,
      statement: payload.statement.trim(),
      explanation:
        payload.explanation === undefined || payload.explanation === null
          ? null
          : payload.explanation.trim(),
      tags: this.normalizeTags(payload.tags),
      questionConfig: normalizeQuestionTypeConfig(
        payload.type,
        payload.questionConfig as QuestionTypeConfig,
      ),
    };
  }

  private normalizeUpdateQuestionData(
    payload: UpdateQuestionDto,
  ): NormalizedUpdateQuestionData {
    const normalized: NormalizedUpdateQuestionData = {};

    if (payload.title !== undefined) {
      normalized.title = payload.title.trim();
    }

    if (payload.type !== undefined) {
      normalized.type = payload.type;
    }

    if (payload.statement !== undefined) {
      normalized.statement = payload.statement.trim();
    }

    if (payload.explanation !== undefined) {
      normalized.explanation =
        payload.explanation === null ? null : payload.explanation.trim();
    }

    if (payload.tags !== undefined) {
      normalized.tags = this.normalizeTags(payload.tags);
    }

    if (payload.questionConfig !== undefined) {
      normalized.questionConfig = payload.questionConfig as QuestionTypeConfig;
    }

    return normalized;
  }

  private normalizeTags(tags: string[] | undefined): string[] {
    if (!tags) {
      return [];
    }

    return Array.from(
      new Set(tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0)),
    );
  }

  private toQuestionItem(question: QuestionDocument): QuestionItem {
    return {
      questionId: question.questionId,
      title: question.title,
      type: question.type,
      statement: question.statement,
      explanation: question.explanation,
      tags: question.tags,
      createdByUserId: question.createdByUserId,
      updatedByUserId: question.updatedByUserId,
      version: question.version,
      questionConfig: question.questionConfig,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };
  }
}
