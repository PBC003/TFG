import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createAppErrorBody } from '../../common/errors/app-http.exception';
import { QuizAttemptStatus } from '../enums/quiz-attempt-status.enum';
import {
  QuizAttempt,
  type QuizAttemptDocument,
} from '../schemas/quiz-attempt.schema';
import type { SubmitQuizAttemptDto } from '../dto/submit-quiz-attempt.dto';
import type { QuizSubmissionResult } from '../types/quiz.types';
import type {
  GradedAttempt,
  SubmittedAnswerMap,
} from '../utils/grade/grade-attempt.types';
import { gradeAttempt } from '../utils/grade/grade-attempt.util';
import { toQuizSubmissionResult } from '../utils/public-attempt.util';
import { getQuizSubmissionVisibility } from '../utils/quiz/quiz-submission-visibility.util';
import { synchronizeExpiredQuizAttempts } from '../utils/quiz/quiz-attempt-expiration.util';
import { assertSubmittedParametricAnswersAreValid } from '../utils/quiz/quiz-access-submission.util';
import { buildPreviewParticipantNameFromAuthenticatedParticipant } from '../utils/quiz/quiz-access-audience.util';
import { calculateAttemptsRemaining } from '../utils/quiz/quiz-access-attempt.util';
import { QuizLoadingService } from './quiz-loading.service';
import { QuizValidationService } from './quiz-validation.service';
import type { QuizDocument } from '../schemas/quiz.schema';

@Injectable()
export class QuizAttemptSubmissionService {
  constructor(
    @InjectModel(QuizAttempt.name)
    private readonly quizAttemptModel: Model<QuizAttemptDocument>,
    private readonly quizLoadingService: QuizLoadingService,
    private readonly quizValidationService: QuizValidationService,
  ) {}

  async submitAttempt(
    attemptId: string,
    submitQuizAttemptDto: SubmitQuizAttemptDto,
    authenticatedParticipantName?: string,
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

    const quiz = await this.quizLoadingService.findQuizDocumentOrThrow(
      attempt.quizId,
    );
    const now = new Date();
    const expectedParticipantName = attempt.isPreview
      ? buildPreviewParticipantNameFromAuthenticatedParticipant(
          authenticatedParticipantName,
        )
      : authenticatedParticipantName?.trim();

    if (
      expectedParticipantName &&
      attempt.participantName.trim() !== expectedParticipantName
    ) {
      this.throwNotFound('quiz.attempt_not_found', 'Quiz attempt not found');
    }

    if (attempt.expiresAt && attempt.expiresAt.getTime() <= now.getTime()) {
      await synchronizeExpiredQuizAttempts([attempt], now);
      this.throwConflict(
        'quiz.closed',
        'The selected attempt is no longer active',
      );
    }

    if (!attempt.isPreview) {
      this.assertQuizAvailability(quiz, now);
    }

    assertSubmittedParametricAnswersAreValid(
      attempt.questions,
      submitQuizAttemptDto.answers,
      (code, message, details) => this.throwBadRequest(code, message, details),
    );

    const submittedAnswersByQuestionId: SubmittedAnswerMap = new Map<
      string,
      unknown
    >(
      submitQuizAttemptDto.answers.map((answer) => [
        answer.questionId,
        answer.value,
      ]),
    );

    const gradedAttempt: GradedAttempt = gradeAttempt(
      attempt.questions,
      submittedAnswersByQuestionId,
    );

    attempt.answers = gradedAttempt.answers.map((answer) => ({ ...answer }));
    attempt.earnedPoints = gradedAttempt.earnedPoints;
    attempt.maxPoints = gradedAttempt.maxPoints;
    attempt.status = QuizAttemptStatus.SUBMITTED;
    attempt.submittedAt = new Date();

    await attempt.save();

    const attemptsRemaining = attempt.isPreview
      ? 0
      : calculateAttemptsRemaining(
          quiz.attemptsAllowed,
          await this.quizLoadingService.countConsumedAttempts(
            quiz.quizId,
            attempt.participantName,
          ),
        );

    const visibility = attempt.isPreview
      ? { canRevealFeedback: true, revealBlockedByEndDate: false }
      : getQuizSubmissionVisibility(quiz, attemptsRemaining);

    return toQuizSubmissionResult(
      attempt,
      {
        title: quiz.title,
        attemptsAllowed: attempt.isPreview ? 1 : quiz.attemptsAllowed,
        attemptsRemaining,
        canRevealFeedback: visibility.canRevealFeedback,
        revealBlockedByEndDate: visibility.revealBlockedByEndDate,
        isPreview: attempt.isPreview,
      },
      gradedAttempt.review,
    );
  }

  private assertQuizAvailability(quiz: QuizDocument, now: Date): void {
    const quizAvailabilityValidator = this.quizValidationService as {
      assertQuizAvailability: (quiz: QuizDocument, now: Date) => void;
    };

    quizAvailabilityValidator.assertQuizAvailability(quiz, now);
  }

  private throwBadRequest(
    code: 'quiz.invalid_parametric_answer_format',
    message: string,
    details?: Record<string, unknown>,
  ): never {
    throw new HttpException(
      createAppErrorBody(code, message, details),
      HttpStatus.BAD_REQUEST,
    );
  }

  private throwConflict(
    code: 'quiz.attempt_already_submitted' | 'quiz.closed',
    message: string,
  ): never {
    throw new HttpException(
      createAppErrorBody(code, message),
      HttpStatus.CONFLICT,
    );
  }

  private throwNotFound(
    code: 'quiz.attempt_not_found',
    message: string,
  ): never {
    throw new HttpException(
      createAppErrorBody(code, message),
      HttpStatus.NOT_FOUND,
    );
  }
}
