import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import type { PublicUser } from '../auth/auth.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/enums/role.enum';
import { QuizAnalyticsService } from './quiz-analytics.service';
import type { QuizHistoryItem } from './types/quiz.types';

@Controller('quiz-history')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
export class QuizHistoryController {
  constructor(private readonly quizAnalyticsService: QuizAnalyticsService) {}

  @Get('me')
  async listOwnHistory(
    @Req() request: Request & { user: PublicUser },
  ): Promise<{ history: QuizHistoryItem[] }> {
    const history = await this.quizAnalyticsService.listHistoryForUser(
      request.user.id,
    );
    return { history };
  }
}
