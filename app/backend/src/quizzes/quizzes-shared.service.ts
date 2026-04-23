import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type { PublicUser } from '../auth/auth.service';
import { createAppErrorBody } from '../common/errors/app-http.exception';
import type { GroupDocument } from '../groups/schemas/group.schema';
import type { QuestionDocument } from '../questions/schemas/question.schema';
import type { QuizDocument } from './schemas/quiz.schema';
import { QuizAccessCodeService } from './services/quiz-access-code.service';
import { QuizLoadingService } from './services/quiz-loading.service';
import { QuizTeacherLookupService } from './services/quiz-teacher-lookup.service';
import { QuizValidationService } from './services/quiz-validation.service';

type QuizQuestionReferenceInput = {
  questionId: string;
  points: number;
  quantity?: number;
  toleranceOverride?: number | null;
};

export type AuthorizedQuizUser = Pick<PublicUser, 'id' | 'role'>;

@Injectable()
export class QuizzesSharedService {
  constructor(
    private readonly quizAccessCodeService: QuizAccessCodeService,
    private readonly quizValidationService: QuizValidationService,
    private readonly quizLoadingService: QuizLoadingService,
    private readonly quizTeacherLookupService: QuizTeacherLookupService,
  ) {}

  normalizeAccessCode(value: string | null | undefined): string {
    return this.quizAccessCodeService.normalizeAccessCode(value);
  }

  generateAccessCode(): string {
    return this.quizAccessCodeService.generateAccessCode();
  }

  async assertAccessCodeIsAvailable(
    accessCode: string,
    currentQuizId?: string,
  ): Promise<void> {
    return this.quizAccessCodeService.assertAccessCodeIsAvailable(
      accessCode,
      currentQuizId,
    );
  }

  async assertQuestionReferencesAreValid(
    quizQuestions: QuizQuestionReferenceInput[],
  ): Promise<void> {
    return this.quizValidationService.assertQuestionReferencesAreValid(
      quizQuestions,
    );
  }

  async assertGroupReferencesAreValid(
    groupIds: string[],
    user: AuthorizedQuizUser,
  ): Promise<void> {
    return this.quizValidationService.assertGroupReferencesAreValid(
      groupIds,
      user,
    );
  }

  async findQuizDocumentOrThrow(quizId: string): Promise<QuizDocument> {
    return this.quizLoadingService.findQuizDocumentOrThrow(quizId);
  }

  async findManagedQuizDocumentOrThrow(
    quizId: string,
    user: AuthorizedQuizUser,
  ): Promise<QuizDocument> {
    return this.quizLoadingService.findManagedQuizDocumentOrThrow(quizId, user);
  }

  async findPublishedQuizById(quizId: string): Promise<QuizDocument> {
    return this.quizLoadingService.findPublishedQuizById(quizId);
  }

  async findPublishedQuizByAccessCode(
    accessCode: string,
  ): Promise<QuizDocument> {
    return this.quizLoadingService.findPublishedQuizByAccessCode(accessCode);
  }

  assertQuizAvailability(quiz: QuizDocument, now: Date): void {
    return this.quizValidationService.assertQuizAvailability(quiz, now);
  }

  async loadQuestionsMap(
    questionIds: string[],
  ): Promise<Map<string, QuestionDocument>> {
    return this.quizLoadingService.loadQuestionsMap(questionIds);
  }

  async loadGroupsMap(groupIds: string[]): Promise<Map<string, GroupDocument>> {
    return this.quizLoadingService.loadGroupsMap(groupIds);
  }

  async getAccessibleGroupIdsForParticipant(
    participantName: string,
  ): Promise<Set<string>> {
    return this.quizLoadingService.getAccessibleGroupIdsForParticipant(
      participantName,
    );
  }

  async countAttemptsByQuizIds(
    quizIds: string[],
  ): Promise<Map<string, number>> {
    return this.quizLoadingService.countAttemptsByQuizIds(quizIds);
  }

  async quizHasAttempts(quizId: string): Promise<boolean> {
    const counts = await this.quizLoadingService.countAttemptsByQuizIds([
      quizId,
    ]);
    return (counts.get(quizId) ?? 0) > 0;
  }

  async countConsumedAttempts(
    quizId: string,
    participantName: string,
  ): Promise<number> {
    return this.quizLoadingService.countConsumedAttempts(
      quizId,
      participantName,
    );
  }

  async loadTeacherNamesById(
    teacherIds: number[],
  ): Promise<Map<number, string>> {
    return this.quizTeacherLookupService.loadTeacherNamesById(teacherIds);
  }

  throwBadRequest(
    code:
      | 'common.bad_request'
      | 'quiz.access_data_required'
      | 'quiz.invalid_access_code'
      | 'quiz.question_not_found'
      | 'quiz.unsupported_question_type'
      | 'quiz.invalid_parametric_answer_format'
      | 'quiz.update_requires_field'
      | 'quiz.invalid_schedule',
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
      | 'quiz.attempts_exhausted'
      | 'quiz.not_published'
      | 'quiz.not_available_yet'
      | 'quiz.closed'
      | 'quiz.attempt_already_submitted'
      | 'quiz.published_locked'
      | 'quiz.has_attempts_locked'
      | 'quiz.publish_requires_questions',
    message: string,
  ): never {
    throw new HttpException(
      createAppErrorBody(code, message),
      HttpStatus.CONFLICT,
    );
  }

  throwNotFound(
    code: 'common.not_found' | 'quiz.not_found' | 'quiz.attempt_not_found',
    message: string,
  ): never {
    throw new HttpException(
      createAppErrorBody(code, message),
      HttpStatus.NOT_FOUND,
    );
  }
}
