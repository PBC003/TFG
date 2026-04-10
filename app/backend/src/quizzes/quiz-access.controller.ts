import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { StartQuizAttemptDto } from './dto/start-quiz-attempt.dto';
import { SubmitQuizAttemptDto } from './dto/submit-quiz-attempt.dto';
import { QuizAccessService } from './quiz-access.service';
import type {
  PublicQuizCatalogItem,
  QuizAttemptItem,
  QuizSubmissionResult,
} from './types/quiz.types';

@Controller('quiz-access')
export class QuizAccessController {
  constructor(private readonly quizAccessService: QuizAccessService) {}

  @Get('quizzes')
  async listPublishedQuizzes(
    @Query('participantName') participantName?: string,
  ): Promise<{ quizzes: PublicQuizCatalogItem[] }> {
    const quizzes =
      await this.quizAccessService.listPublishedQuizzes(participantName);
    return { quizzes };
  }

  @Get('quizzes/:quizId/best-result')
  async getBestResult(
    @Param('quizId') quizId: string,
    @Query('participantName') participantName?: string,
  ): Promise<{ result: QuizSubmissionResult | null }> {
    const result = await this.quizAccessService.getBestResult(
      quizId,
      participantName,
    );
    return { result };
  }

  @Post('start')
  async startAttempt(
    @Body() startQuizAttemptDto: StartQuizAttemptDto,
  ): Promise<{ attempt: QuizAttemptItem }> {
    const attempt =
      await this.quizAccessService.startAttempt(startQuizAttemptDto);
    return { attempt };
  }

  @Post('attempts/:attemptId/submit')
  async submitAttempt(
    @Param('attemptId') attemptId: string,
    @Body() submitQuizAttemptDto: SubmitQuizAttemptDto,
  ): Promise<{ result: QuizSubmissionResult }> {
    const result = await this.quizAccessService.submitAttempt(
      attemptId,
      submitQuizAttemptDto,
    );

    return { result };
  }
}
