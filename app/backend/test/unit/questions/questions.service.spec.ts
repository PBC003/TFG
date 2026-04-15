import { HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { QuestionType } from '../../../src/questions/enums/question-type.enum';
import { ParametricQuestionTemplateId } from '../../../src/questions/types/question-type-config.type';
import { Question } from '../../../src/questions/schemas/question.schema';
import { QuestionsService } from '../../../src/questions/questions.service';

describe('QuestionsService', () => {
  let service: QuestionsService;
  let questionModel: {
    create: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    deleteOne: jest.Mock;
  };

  const baseQuestion = {
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
    questionModel = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      deleteOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionsService,
        {
          provide: getModelToken(Question.name),
          useValue: questionModel,
        },
      ],
    }).compile();

    service = module.get(QuestionsService);
  });

  it('creates questions with normalized fields and creator metadata', async () => {
    questionModel.create.mockResolvedValue({
      ...baseQuestion,
      title: 'Límite básico',
      statement: 'El límite existe.',
      explanation: 'Sí existe.',
      tags: ['limites', 'continuidad'],
    });

    await expect(
      service.createQuestion(
        {
          title: '  Límite básico  ',
          type: QuestionType.TRUE_FALSE,
          statement: '  El límite existe.  ',
          explanation: '  Sí existe.  ',
          tags: [' limites ', 'continuidad', 'limites'],
          questionConfig: { correctAnswer: true },
        },
        { id: 7 },
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        title: 'Límite básico',
        statement: 'El límite existe.',
        explanation: 'Sí existe.',
        tags: ['limites', 'continuidad'],
        createdByUserId: 7,
        updatedByUserId: 7,
      }),
    );

    expect(questionModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Límite básico',
        statement: 'El límite existe.',
        explanation: 'Sí existe.',
        tags: ['limites', 'continuidad'],
        createdByUserId: 7,
        updatedByUserId: 7,
      }),
    );
  });

  it('rejects invalid configs on create and update', async () => {
    await expect(
      service.createQuestion(
        {
          title: 'Pregunta inválida',
          type: QuestionType.SINGLE_CHOICE,
          statement: 'Selecciona una opción.',
          questionConfig: {
            options: [
              { key: 'a', text: 'A' },
              { key: 'b', text: 'B' },
            ],
            correctOptionKey: 'c',
          },
        },
        { id: 7 },
      ),
    ).rejects.toMatchObject({
      response: { code: 'question.invalid_type_config' },
      status: HttpStatus.BAD_REQUEST,
    });

    questionModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        ...baseQuestion,
        save: jest.fn(),
      }),
    });

    await expect(
      service.updateQuestion(
        'question-1',
        {
          type: QuestionType.MULTIPLE_CHOICE,
        },
        { id: 8 },
      ),
    ).rejects.toMatchObject({
      response: { code: 'question.invalid_type_config' },
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('rejects invalid math content in create and update payloads', async () => {
    await expect(
      service.createQuestion(
        {
          title: 'Pregunta con script',
          type: QuestionType.TRUE_FALSE,
          statement: 'Resultado <script>alert(1)</script>',
          questionConfig: { correctAnswer: true },
        },
        { id: 7 },
      ),
    ).rejects.toMatchObject({
      response: {
        code: 'question.invalid_math_content',
        details: {
          fields: expect.arrayContaining([
            expect.objectContaining({ field: 'statement' }),
          ]),
        },
      },
      status: HttpStatus.BAD_REQUEST,
    });

    const save = jest.fn().mockResolvedValue(undefined);
    questionModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        ...baseQuestion,
        save,
      }),
    });

    await expect(
      service.updateQuestion(
        'question-1',
        {
          statement: 'Texto con $x^2',
        },
        { id: 8 },
      ),
    ).rejects.toMatchObject({
      response: { code: 'question.invalid_math_content' },
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('normalizes questionConfig content before persisting or updating', async () => {
    questionModel.create.mockResolvedValue({
      ...baseQuestion,
      type: QuestionType.SINGLE_CHOICE,
      questionConfig: {
        options: [
          { key: 'a', text: 'Opción A' },
          { key: 'b', text: 'Opción B' },
        ],
        correctOptionKey: 'a',
      },
    });

    await service.createQuestion(
      {
        title: 'Opciones con espacios',
        type: QuestionType.SINGLE_CHOICE,
        statement: 'Selecciona la correcta.',
        questionConfig: {
          options: [
            { key: ' a ', text: '  Opción A  ' },
            { key: 'b', text: ' Opción B ' },
          ],
          correctOptionKey: ' a ',
        },
      },
      { id: 7 },
    );

    expect(questionModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        questionConfig: {
          options: [
            { key: 'a', text: 'Opción A' },
            { key: 'b', text: 'Opción B' },
          ],
          correctOptionKey: 'a',
        },
      }),
    );

    const save = jest.fn().mockResolvedValue(undefined);
    const persistedQuestion = {
      ...baseQuestion,
      type: QuestionType.PARAMETRIC,
      questionConfig: {
        templateId: ParametricQuestionTemplateId.LIMIT_TRIGONOMETRIC,
        tolerance: 0.01,
      },
      save,
    };

    questionModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(persistedQuestion),
    });

    await service.updateQuestion(
      'question-1',
      {
        questionConfig: {
          templateId: ParametricQuestionTemplateId.SERIES_GEOMETRIC,
          tolerance: 0.005,
        },
      },
      { id: 9 },
    );

    expect(persistedQuestion.questionConfig).toEqual({
      templateId: ParametricQuestionTemplateId.SERIES_GEOMETRIC,
      tolerance: 0.005,
    });
    expect(persistedQuestion.statement).toContain('\\sum_{n=2}^{\\infty} r^n');
  });

  it('lists questions sorted by most recently updated and finds single questions', async () => {
    const exec = jest.fn().mockResolvedValue([baseQuestion]);
    const sort = jest.fn().mockReturnValue({ exec });
    questionModel.find.mockReturnValue({ sort });
    questionModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(baseQuestion),
    });

    await expect(service.listQuestions()).resolves.toEqual([baseQuestion]);
    await expect(service.findQuestionById('question-1')).resolves.toEqual(
      baseQuestion,
    );
    expect(sort).toHaveBeenCalledWith({ updatedAt: -1, createdAt: -1 });
  });

  it('updates question fields, bumps the version and tracks the updater', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const persistedQuestion = {
      ...baseQuestion,
      save,
    };

    questionModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(persistedQuestion),
    });

    await expect(
      service.updateQuestion(
        'question-1',
        {
          title: '  Límite actualizado  ',
          tags: [' limites ', 'derivadas', 'limites'],
        },
        { id: 9 },
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        title: 'Límite actualizado',
        tags: ['limites', 'derivadas'],
        updatedByUserId: 9,
        version: 2,
      }),
    );

    expect(save).toHaveBeenCalled();
  });

  it('rejects empty updates and missing questions', async () => {
    questionModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(baseQuestion),
    });

    await expect(
      service.updateQuestion('question-1', {}, { id: 7 }),
    ).rejects.toMatchObject({
      response: { code: 'question.update_requires_field' },
      status: HttpStatus.BAD_REQUEST,
    });

    questionModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(service.findQuestionById('missing')).rejects.toMatchObject({
      response: { code: 'question.not_found' },
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('archives questions instead of deleting them physically', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const persistedQuestion = {
      ...baseQuestion,
      isArchived: false,
      archivedAt: null,
      archivedByUserId: null,
      save,
    };

    questionModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(persistedQuestion),
    });

    await expect(
      service.deleteQuestion('question-1', { id: 9 }),
    ).resolves.toBeUndefined();

    expect(persistedQuestion.isArchived).toBe(true);
    expect(persistedQuestion.archivedByUserId).toBe(9);
    expect(persistedQuestion.updatedByUserId).toBe(9);
    expect(persistedQuestion.version).toBe(2);
    expect(save).toHaveBeenCalled();

    questionModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(
      service.deleteQuestion('missing', { id: 9 }),
    ).rejects.toMatchObject({
      response: { code: 'question.not_found' },
      status: HttpStatus.NOT_FOUND,
    });
  });
});
