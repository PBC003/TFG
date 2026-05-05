import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import type { PublicUser } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StartQuizAttemptDto } from './dto/start-quiz-attempt.dto';
import { SubmitQuizAttemptDto } from './dto/submit-quiz-attempt.dto';
import { QuizAccessService } from './quiz-access.service';
import type {
  PublicQuizCatalogItem,
  QuizAttemptItem,
  QuizSubmissionResult,
} from './types/quiz.types';

@Controller('quiz-access')
@UseGuards(JwtAuthGuard)
export class QuizAccessController {
  constructor(private readonly quizAccessService: QuizAccessService) {}

  @Get('quizzes')
  async listPublishedQuizzes(
    @Req() request: Request & { user: PublicUser },
  ): Promise<{ quizzes: PublicQuizCatalogItem[] }> {
    const quizzes = await this.quizAccessService.listPublishedQuizzes(
      this.buildParticipantName(request.user.id),
    );
    return { quizzes };
  }

  @Get('quizzes/:quizId/best-result')
  async getBestResult(
    @Param('quizId') quizId: string,
    @Req() request: Request & { user: PublicUser },
  ): Promise<{ result: QuizSubmissionResult | null }> {
    const result = await this.quizAccessService.getBestResult(
      quizId,
      this.buildParticipantName(request.user.id),
    );
    return { result };
  }

  @Post('start')
  async startAttempt(
    @Body() startQuizAttemptDto: StartQuizAttemptDto,
    @Req() request: Request & { user: PublicUser },
  ): Promise<{ attempt: QuizAttemptItem }> {
    const attempt = await this.quizAccessService.startAttempt(
      startQuizAttemptDto,
      this.buildParticipantName(request.user.id),
    );
    return { attempt };
  }

  @Post('attempts/:attemptId/submit')
  async submitAttempt(
    @Param('attemptId') attemptId: string,
    @Body() submitQuizAttemptDto: SubmitQuizAttemptDto,
    @Req() request: Request & { user: PublicUser },
  ): Promise<{ result: QuizSubmissionResult }> {
    const result = await this.quizAccessService.submitAttempt(
      attemptId,
      submitQuizAttemptDto,
      this.buildParticipantName(request.user.id),
    );

    return { result };
  }

  private buildParticipantName(userId: number): string {
    return `user:${userId}`;
  }
}
