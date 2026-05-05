import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { PublicUser } from '../auth/auth.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/enums/role.enum';
import { QuizAnalyticsService } from './quiz-analytics.service';
import type {
  QuizAnalyticsItem,
  QuizAttemptReviewDetail,
} from './types/quiz.types';

@Controller('quizzes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.TEACHER)
export class QuizAnalyticsController {
  constructor(private readonly quizAnalyticsService: QuizAnalyticsService) {}

  @Get(':quizId/analytics')
  async getQuizAnalytics(
    @Param('quizId') quizId: string,
    @Req() request: Request & { user: PublicUser },
  ): Promise<{ analytics: QuizAnalyticsItem }> {
    const analytics = await this.quizAnalyticsService.getQuizAnalytics(
      quizId,
      request.user,
    );
    return { analytics };
  }

  @Get(':quizId/attempts/:attemptId/detail')
  async getAttemptDetail(
    @Param('quizId') quizId: string,
    @Param('attemptId') attemptId: string,
    @Req() request: Request & { user: PublicUser },
  ): Promise<{ detail: QuizAttemptReviewDetail }> {
    const detail = await this.quizAnalyticsService.getAttemptDetail(
      quizId,
      attemptId,
      request.user,
    );
    return { detail };
  }

  @Get(':quizId/export')
  async exportQuizAnalyticsCsv(
    @Param('quizId') quizId: string,
    @Req() request: Request & { user: PublicUser },
    @Res({ passthrough: true }) response: Response,
  ): Promise<string> {
    const csv = await this.quizAnalyticsService.exportQuizAnalyticsCsv(
      quizId,
      request.user,
    );

    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="quiz-${quizId}-results.csv"`,
    );

    return csv;
  }
}
