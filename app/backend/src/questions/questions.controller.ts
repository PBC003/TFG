import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { type PublicUser } from '../auth/auth.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/enums/role.enum';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionsService, type QuestionItem } from './questions.service';

@Controller('questions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.TEACHER)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  async createQuestion(
    @Body() createQuestionDto: CreateQuestionDto,
    @Req() request: Request & { user: PublicUser },
  ): Promise<{ question: QuestionItem }> {
    const question = await this.questionsService.createQuestion(
      createQuestionDto,
      request.user,
    );

    return { question };
  }

  @Get()
  async findAll(): Promise<{ questions: QuestionItem[] }> {
    const questions = await this.questionsService.listQuestions();
    return { questions };
  }

  @Get(':questionId')
  async findOne(
    @Param('questionId') questionId: string,
  ): Promise<{ question: QuestionItem }> {
    const question = await this.questionsService.findQuestionById(questionId);
    return { question };
  }

  @Patch(':questionId')
  async updateQuestion(
    @Param('questionId') questionId: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
    @Req() request: Request & { user: PublicUser },
  ): Promise<{ question: QuestionItem }> {
    const question = await this.questionsService.updateQuestion(
      questionId,
      updateQuestionDto,
      request.user,
    );

    return { question };
  }

  @Delete(':questionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestion(
    @Param('questionId') questionId: string,
    @Req() request: Request & { user: PublicUser },
  ): Promise<void> {
    await this.questionsService.deleteQuestion(questionId, request.user);
  }
}
