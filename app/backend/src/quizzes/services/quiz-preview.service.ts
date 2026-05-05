import { Injectable } from '@nestjs/common';
import type { PublicUser } from '../../auth/auth.service';
import type { QuizAttemptItem } from '../types/quiz.types';
import { QuizAttemptStarterService } from './quiz-attempt-starter.service';

export type AuthorizedPreviewUser = Pick<PublicUser, 'id' | 'role'>;

@Injectable()
export class QuizPreviewService {
  constructor(
    private readonly quizAttemptStarterService: QuizAttemptStarterService,
  ) {}

  async startPreview(
    quizId: string,
    user: AuthorizedPreviewUser,
  ): Promise<QuizAttemptItem> {
    return this.quizAttemptStarterService.startPreview(quizId, user);
  }
}
