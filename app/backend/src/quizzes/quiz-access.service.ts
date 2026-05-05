import { Injectable } from '@nestjs/common';
import type { PublicUser } from '../auth/auth.service';
import { StartQuizAttemptDto } from './dto/start-quiz-attempt.dto';
import { SubmitQuizAttemptDto } from './dto/submit-quiz-attempt.dto';
import type {
  PublicQuizCatalogItem,
  QuizAttemptItem,
  QuizSubmissionResult,
} from './types/quiz.types';
import { QuizAttemptStarterService } from './services/quiz-attempt-starter.service';
import { QuizAttemptSubmissionService } from './services/quiz-attempt-submission.service';
import { QuizCatalogService } from './services/quiz-catalog.service';
import { QuizPreviewService } from './services/quiz-preview.service';

export type AuthorizedPreviewUser = Pick<PublicUser, 'id' | 'role'>;

@Injectable()
export class QuizAccessService {
  constructor(
    private readonly quizCatalogService: QuizCatalogService,
    private readonly quizAttemptStarterService: QuizAttemptStarterService,
    private readonly quizAttemptSubmissionService: QuizAttemptSubmissionService,
    private readonly quizPreviewService: QuizPreviewService,
  ) {}

  async listPublishedQuizzes(
    participantName?: string,
  ): Promise<PublicQuizCatalogItem[]> {
    return this.quizCatalogService.listPublishedQuizzes(participantName);
  }

  async getBestResult(
    quizId: string,
    participantName: string,
  ): Promise<QuizSubmissionResult | null> {
    return this.quizCatalogService.getBestResult(quizId, participantName);
  }

  async startAttempt(
    startQuizAttemptDto: StartQuizAttemptDto,
    authenticatedParticipantName?: string,
  ): Promise<QuizAttemptItem> {
    return this.quizAttemptStarterService.startAttempt({
      quizId: startQuizAttemptDto.quizId ?? undefined,
      accessCode: startQuizAttemptDto.accessCode ?? null,
      participantName:
        authenticatedParticipantName?.trim() ??
        startQuizAttemptDto.participantName?.trim() ??
        '',
    });
  }

  async submitAttempt(
    attemptId: string,
    submitQuizAttemptDto: SubmitQuizAttemptDto,
    authenticatedParticipantName?: string,
  ): Promise<QuizSubmissionResult> {
    return this.quizAttemptSubmissionService.submitAttempt(
      attemptId,
      submitQuizAttemptDto,
      authenticatedParticipantName,
    );
  }

  async startPreview(
    quizId: string,
    user: AuthorizedPreviewUser,
  ): Promise<QuizAttemptItem> {
    return this.quizPreviewService.startPreview(quizId, user);
  }
}
