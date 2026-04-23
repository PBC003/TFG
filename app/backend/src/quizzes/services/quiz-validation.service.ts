import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createAppErrorBody } from '../../common/errors/app-http.exception';
import { Group, type GroupDocument } from '../../groups/schemas/group.schema';
import { QuestionType } from '../../questions/enums/question-type.enum';
import {
  Question,
  type QuestionDocument,
} from '../../questions/schemas/question.schema';
import type { ParametricQuestionConfig } from '../../questions/types/question-type-config.type';
import { Role } from '../../users/enums/role.enum';
import { QuizStatus } from '../enums/quiz-status.enum';
import type { QuizDocument } from '../schemas/quiz.schema';
import { getParametricTemplateVariantCount } from '../../questions/parametric/parametric-question-template.util';
import type { AuthorizedQuizUser } from '../quizzes-shared.service';

export type QuizQuestionReferenceInput = {
  questionId: string;
  points: number;
  quantity?: number;
  toleranceOverride?: number | null;
};

const SUPPORTED_QUIZ_QUESTION_TYPES = new Set<QuestionType>([
  QuestionType.TRUE_FALSE,
  QuestionType.SINGLE_CHOICE,
  QuestionType.MULTIPLE_CHOICE,
  QuestionType.PARAMETRIC,
]);

@Injectable()
export class QuizValidationService {
  constructor(
    @InjectModel(Question.name)
    private readonly questionModel: Model<QuestionDocument>,
    @InjectModel(Group.name)
    private readonly groupModel: Model<GroupDocument>,
  ) {}

  async assertQuestionReferencesAreValid(
    quizQuestions: QuizQuestionReferenceInput[],
  ): Promise<void> {
    const questions = await this.questionModel
      .find({
        questionId: {
          $in: quizQuestions.map((question) => question.questionId),
        },
        isArchived: { $ne: true },
      })
      .exec();

    if (questions.length !== quizQuestions.length) {
      this.throwBadRequest(
        'quiz.question_not_found',
        'At least one referenced question does not exist',
      );
    }

    const questionMap = new Map(
      questions.map((question) => [question.questionId, question]),
    );

    for (const quizQuestion of quizQuestions) {
      const question = questionMap.get(quizQuestion.questionId);

      if (!question) {
        this.throwBadRequest(
          'quiz.question_not_found',
          'At least one referenced question does not exist',
        );
      }

      if (!SUPPORTED_QUIZ_QUESTION_TYPES.has(question.type)) {
        this.throwBadRequest(
          'quiz.unsupported_question_type',
          'The selected quiz includes a question type that is not currently supported by the platform',
        );
      }

      const quantity = Number(quizQuestion.quantity ?? 1);
      const toleranceOverride = quizQuestion.toleranceOverride;

      if (!Number.isInteger(quantity) || quantity < 1) {
        this.throwBadRequest(
          'common.bad_request',
          'Quiz question quantity must be an integer greater than or equal to 1',
        );
      }

      if (
        toleranceOverride !== undefined &&
        toleranceOverride !== null &&
        (!Number.isFinite(Number(toleranceOverride)) ||
          Number(toleranceOverride) < 0)
      ) {
        this.throwBadRequest(
          'common.bad_request',
          'Quiz parametric tolerance override must be a number greater than or equal to 0',
        );
      }

      if (question.type === QuestionType.PARAMETRIC) {
        const config = question.questionConfig as
          | ParametricQuestionConfig
          | undefined;

        if (config?.templateId) {
          const maxVariants = getParametricTemplateVariantCount(
            config.templateId,
          );

          if (quantity > maxVariants) {
            this.throwBadRequest(
              'common.bad_request',
              `The selected parametric question only supports ${maxVariants} distinct variants per quiz`,
            );
          }
        }

        continue;
      }

      if (quantity !== 1) {
        this.throwBadRequest(
          'common.bad_request',
          'Only parametric questions can request more than one variant per quiz',
        );
      }

      if (toleranceOverride !== undefined && toleranceOverride !== null) {
        this.throwBadRequest(
          'common.bad_request',
          'Only parametric questions can override the grading tolerance inside a quiz',
        );
      }
    }
  }

  async assertGroupReferencesAreValid(
    groupIds: string[],
    user: AuthorizedQuizUser,
  ): Promise<void> {
    if (groupIds.length === 0) {
      return;
    }

    const query: Record<string, unknown> = {
      groupId: { $in: groupIds },
      isArchived: { $ne: true },
    };

    if (user.role !== Role.ADMIN) {
      query.createdByUserId = user.id;
    }

    const groups = await this.groupModel.find(query).select(['groupId']).exec();

    if (groups.length !== groupIds.length) {
      this.throwBadRequest(
        'common.bad_request',
        'At least one selected group is not available for this quiz',
      );
    }
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

  private throwBadRequest(
    code:
      | 'common.bad_request'
      | 'quiz.question_not_found'
      | 'quiz.unsupported_question_type',
    message: string,
  ): never {
    throw new HttpException(
      createAppErrorBody(code, message),
      HttpStatus.BAD_REQUEST,
    );
  }

  private throwConflict(
    code: 'quiz.closed' | 'quiz.not_available_yet' | 'quiz.not_published',
    message: string,
  ): never {
    throw new HttpException(
      createAppErrorBody(code, message),
      HttpStatus.CONFLICT,
    );
  }
}
