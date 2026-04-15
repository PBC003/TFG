import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';
import { Role } from '../../../src/users/enums/role.enum';
import { QuestionsController } from '../../../src/questions/questions.controller';
import {
  QuestionsService,
  type QuestionItem,
} from '../../../src/questions/questions.service';
import { QuestionType } from '../../../src/questions/enums/question-type.enum';
import type { PublicUser } from '../../../src/auth/auth.service';

describe('QuestionsController', () => {
  let controller: QuestionsController;
  let questionsService: jest.Mocked<QuestionsService>;

  const user: PublicUser = {
    id: 7,
    firstName: 'Pablo',
    lastName: 'Carrasco',
    email: 'uo123456@uniovi.es',
    uo: 'UO123456',
    role: Role.TEACHER,
    isActive: true,
    createdAt: new Date('2026-03-28T10:00:00.000Z'),
    updatedAt: new Date('2026-03-28T10:00:00.000Z'),
  };

  const question: QuestionItem = {
    questionId: 'question-1',
    title: 'Límite básico',
    type: QuestionType.TRUE_FALSE,
    statement: 'El límite existe.',
    explanation: 'Sí existe.',
    tags: ['limites'],
    createdByUserId: 7,
    updatedByUserId: 7,
    version: 1,
    questionConfig: { correctAnswer: true },
    createdAt: new Date('2026-03-28T10:00:00.000Z'),
    updatedAt: new Date('2026-03-28T10:00:00.000Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionsController],
      providers: [
        {
          provide: QuestionsService,
          useValue: {
            createQuestion: jest.fn(),
            listQuestions: jest.fn(),
            findQuestionById: jest.fn(),
            updateQuestion: jest.fn(),
            deleteQuestion: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(QuestionsController);
    questionsService = module.get(QuestionsService);
  });

  it('wraps list and single-item responses using the expected contracts', async () => {
    questionsService.listQuestions.mockResolvedValue([question]);
    questionsService.findQuestionById.mockResolvedValue(question);

    await expect(controller.findAll()).resolves.toEqual({
      questions: [question],
    });
    await expect(controller.findOne('question-1')).resolves.toEqual({
      question,
    });
  });

  it('passes the authenticated user to create and update operations', async () => {
    questionsService.createQuestion.mockResolvedValue(question);
    questionsService.updateQuestion.mockResolvedValue({
      ...question,
      version: 2,
      updatedByUserId: user.id,
    });

    const request = { user } as Request & { user: PublicUser };

    await expect(
      controller.createQuestion(
        {
          title: 'Límite básico',
          type: QuestionType.TRUE_FALSE,
          statement: 'El límite existe.',
          explanation: 'Sí existe.',
          tags: ['limites'],
          questionConfig: { correctAnswer: true },
        },
        request,
      ),
    ).resolves.toEqual({ question });

    await expect(
      controller.updateQuestion(
        'question-1',
        {
          title: 'Límite actualizado',
        },
        request,
      ),
    ).resolves.toEqual({
      question: expect.objectContaining({
        version: 2,
        updatedByUserId: user.id,
      }),
    });
  });

  it('delegates deletions without returning a body', async () => {
    const request = { user } as Request & { user: PublicUser };

    await expect(
      controller.deleteQuestion('question-1', request),
    ).resolves.toBeUndefined();
    expect(questionsService.deleteQuestion).toHaveBeenCalledWith(
      'question-1',
      request.user,
    );
  });
});
