import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import type { PublicUser } from '../auth/auth.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/enums/role.enum';
import { QuizAccessService } from './quiz-access.service';
import type { QuizAttemptItem } from './types/quiz.types';

@Controller('quizzes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.TEACHER)
export class QuizPreviewController {
  constructor(private readonly quizAccessService: QuizAccessService) {}

  @Post(':quizId/preview/start')
  async startPreview(
    @Param('quizId') quizId: string,
    @Req() request: Request & { user: PublicUser },
  ): Promise<{ attempt: QuizAttemptItem }> {
    const attempt = await this.quizAccessService.startPreview(
      quizId,
      request.user,
    );

    return { attempt };
  }
}
