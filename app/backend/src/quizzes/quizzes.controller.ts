import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import type { PublicUser } from '../auth/auth.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/enums/role.enum';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { QuizzesService } from './quizzes.service';
import type { QuizItem } from './types/quiz.types';

@Controller('quizzes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.TEACHER)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  async createQuiz(
    @Body() createQuizDto: CreateQuizDto,
    @Req() request: Request & { user: PublicUser },
  ): Promise<{ quiz: QuizItem }> {
    const quiz = await this.quizzesService.createQuiz(
      createQuizDto,
      request.user,
    );
    return { quiz };
  }

  @Get()
  async listQuizzes(
    @Req() request: Request & { user: PublicUser },
  ): Promise<{ quizzes: QuizItem[] }> {
    const quizzes = await this.quizzesService.listQuizzes(request.user);
    return { quizzes };
  }

  @Get(':quizId')
  async findQuiz(
    @Param('quizId') quizId: string,
    @Req() request: Request & { user: PublicUser },
  ): Promise<{ quiz: QuizItem }> {
    const quiz = await this.quizzesService.findQuizById(quizId, request.user);
    return { quiz };
  }

  @Patch(':quizId')
  async updateQuiz(
    @Param('quizId') quizId: string,
    @Body() updateQuizDto: UpdateQuizDto,
    @Req() request: Request & { user: PublicUser },
  ): Promise<{ quiz: QuizItem }> {
    const quiz = await this.quizzesService.updateQuiz(
      quizId,
      updateQuizDto,
      request.user,
    );

    return { quiz };
  }

  @Post(':quizId/publish')
  async publishQuiz(
    @Param('quizId') quizId: string,
    @Req() request: Request & { user: PublicUser },
  ): Promise<{ quiz: QuizItem }> {
    const quiz = await this.quizzesService.publishQuiz(quizId, request.user);
    return { quiz };
  }

  @Post(':quizId/unpublish')
  async unpublishQuiz(
    @Param('quizId') quizId: string,
    @Req() request: Request & { user: PublicUser },
  ): Promise<{ quiz: QuizItem }> {
    const quiz = await this.quizzesService.unpublishQuiz(quizId, request.user);
    return { quiz };
  }

  @Delete(':quizId')
  async deleteQuiz(
    @Param('quizId') quizId: string,
    @Req() request: Request & { user: PublicUser },
  ): Promise<{ success: true }> {
    await this.quizzesService.deleteQuiz(quizId, request.user);
    return { success: true };
  }
}
