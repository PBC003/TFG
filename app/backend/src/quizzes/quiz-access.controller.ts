import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { StartQuizAttemptDto } from './dto/start-quiz-attempt.dto';
import { SubmitQuizAttemptDto } from './dto/submit-quiz-attempt.dto';
import { QuizzesService } from './quizzes.service';
import type {
  PublicQuizCatalogItem,
  QuizAttemptItem,
  QuizSubmissionResult,
} from './types/quiz.types';

@Controller('quiz-access')
export class QuizAccessController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get('quizzes')
  async listPublishedQuizzes(
    @Query('participantName') participantName?: string,
  ): Promise<{ quizzes: PublicQuizCatalogItem[] }> {
    const quizzes =
      await this.quizzesService.listPublishedQuizzes(participantName);
    return { quizzes };
  }

  @Post('start')
  async startAttempt(
    @Body() startQuizAttemptDto: StartQuizAttemptDto,
  ): Promise<{ attempt: QuizAttemptItem }> {
    const attempt = await this.quizzesService.startAttempt(startQuizAttemptDto);
    return { attempt };
  }

  @Post('attempts/:attemptId/submit')
  async submitAttempt(
    @Param('attemptId') attemptId: string,
    @Body() submitQuizAttemptDto: SubmitQuizAttemptDto,
  ): Promise<{ result: QuizSubmissionResult }> {
    const result = await this.quizzesService.submitAttempt(
      attemptId,
      submitQuizAttemptDto,
    );

    return { result };
  }
}
