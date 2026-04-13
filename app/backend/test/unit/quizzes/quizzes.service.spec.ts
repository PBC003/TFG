import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { QuizStatus } from '../../../src/quizzes/enums/quiz-status.enum';
import { Quiz } from '../../../src/quizzes/schemas/quiz.schema';
import { QuizzesService } from '../../../src/quizzes/quizzes.service';
import { QuizzesSharedService } from '../../../src/quizzes/quizzes-shared.service';
import { normalizeQuizMutationPayload } from '../../../src/quizzes/utils/quiz/quiz-mutation-payload.util';

jest.mock('../../../src/quizzes/utils/quiz/quiz-mutation-payload.util', () => ({
  normalizeQuizMutationPayload: jest.fn(),
}));

const mockedNormalizeQuizMutationPayload = jest.mocked(
  normalizeQuizMutationPayload,
);

describe('QuizzesService', () => {
  let service: QuizzesService;
  const quizModel = {
    create: jest.fn(),
    find: jest.fn(),
    deleteOne: jest.fn(),
  };
  const sharedService = {
    loadQuestionsMap: jest.fn(),
    countAttemptsByQuizIds: jest.fn(),
    findQuizDocumentOrThrow: jest.fn(),
    quizHasAttempts: jest.fn(),
    assertQuestionReferencesAreValid: jest.fn(),
    throwBadRequest: jest.fn((code: string) => {
      throw new Error(code);
    }),
    throwConflict: jest.fn((code: string) => {
      throw new Error(code);
    }),
  };

  const baseQuiz = {
    quizId: 'quiz-1',
    title: 'Quiz',
    description: 'Desc',
    accessCode: 'ABCD',
    requiresAccessCode: true,
    status: QuizStatus.DRAFT,
    attemptsAllowed: 2,
    startAt: null,
    endAt: null,
    timeLimitMinutes: null,
    shuffleQuestions: false,
    revealAnswersAfterClose: false,
    publishedAt: null,
    questions: [{ questionId: 'q-1', points: 2 }],
    createdByUserId: 1,
    updatedByUserId: 1,
    version: 1,
    createdAt: new Date('2026-04-12T10:00:00.000Z'),
    updatedAt: new Date('2026-04-12T10:00:00.000Z'),
    save: jest.fn(async function save(this: any) {
      return this;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    sharedService.loadQuestionsMap.mockResolvedValue(
      new Map([
        [
          'q-1',
          {
            questionId: 'q-1',
            title: 'Question 1',
            type: 'true_false',
            statement: 'S1',
            tags: [],
          },
        ],
      ]),
    );
    sharedService.countAttemptsByQuizIds.mockResolvedValue(new Map());
    sharedService.quizHasAttempts.mockResolvedValue(false);
    mockedNormalizeQuizMutationPayload.mockResolvedValue({
      title: 'Quiz',
      description: 'Desc',
      accessCode: 'ABCD',
      requiresAccessCode: true,
      attemptsAllowed: 2,
      startAt: null,
      endAt: null,
      timeLimitMinutes: null,
      shuffleQuestions: false,
      revealAnswersAfterClose: false,
      questions: [{ questionId: 'q-1', points: 2 }],
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizzesService,
        { provide: getModelToken(Quiz.name), useValue: quizModel },
        { provide: QuizzesSharedService, useValue: sharedService },
      ],
    }).compile();

    service = module.get(QuizzesService);
  });

  it('creates and lists quizzes with attempt flags', async () => {
    quizModel.create.mockResolvedValue({ ...baseQuiz });
    quizModel.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ ...baseQuiz }]),
      }),
    });
    sharedService.countAttemptsByQuizIds.mockResolvedValue(
      new Map([['quiz-1', 1]]),
    );

    const created = await service.createQuiz({ title: 'Quiz' } as never, {
      id: 9,
    });
    expect(mockedNormalizeQuizMutationPayload).toHaveBeenCalled();
    expect(quizModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: QuizStatus.DRAFT,
        createdByUserId: 9,
        updatedByUserId: 9,
      }),
    );
    expect(created).toEqual(
      expect.objectContaining({ quizId: 'quiz-1', canEdit: true }),
    );

    const listed = await service.listQuizzes();
    expect(listed[0]).toEqual(
      expect.objectContaining({
        hasAttempts: true,
        canEdit: false,
        canDelete: false,
      }),
    );
  });

  it('finds, updates and publishes/unpublishes quizzes with proper guards', async () => {
    const persisted = {
      ...baseQuiz,
      save: jest.fn(async function save(this: any) {
        return this;
      }),
    };
    sharedService.findQuizDocumentOrThrow.mockResolvedValue(persisted);

    const found = await service.findQuizById('quiz-1');
    expect(found).toEqual(
      expect.objectContaining({ canEdit: false, canDelete: true }),
    );

    await expect(
      service.updateQuiz('quiz-1', {} as never, { id: 7 }),
    ).rejects.toThrow('quiz.update_requires_field');

    await expect(
      service.updateQuiz('quiz-1', { title: 'Updated' } as never, { id: 7 }),
    ).resolves.toEqual(
      expect.objectContaining({ updatedByUserId: 7, version: 2 }),
    );

    await expect(service.publishQuiz('quiz-1', { id: 8 })).resolves.toEqual(
      expect.objectContaining({ status: QuizStatus.PUBLISHED, canEdit: false }),
    );
    expect(sharedService.assertQuestionReferencesAreValid).toHaveBeenCalledWith(
      persisted.questions,
    );

    await expect(service.unpublishQuiz('quiz-1', { id: 8 })).resolves.toEqual(
      expect.objectContaining({ status: QuizStatus.DRAFT, canEdit: true }),
    );
  });

  it('blocks updates, publication and deletion when business rules say so', async () => {
    const publishedQuiz = {
      ...baseQuiz,
      status: QuizStatus.PUBLISHED,
      save: jest.fn(),
    };
    sharedService.findQuizDocumentOrThrow.mockResolvedValue(publishedQuiz);
    sharedService.quizHasAttempts.mockResolvedValue(true);

    await expect(
      service.updateQuiz('quiz-1', { title: 'Updated' } as never, { id: 7 }),
    ).rejects.toThrow('quiz.published_locked');

    const emptyQuiz = { ...baseQuiz, questions: [], save: jest.fn() };
    sharedService.findQuizDocumentOrThrow.mockResolvedValueOnce(emptyQuiz);
    await expect(service.publishQuiz('quiz-1', { id: 8 })).rejects.toThrow(
      'quiz.publish_requires_questions',
    );

    const quizWithAttempts = { ...baseQuiz, save: jest.fn() };
    sharedService.findQuizDocumentOrThrow.mockResolvedValueOnce(
      quizWithAttempts,
    );
    sharedService.quizHasAttempts.mockResolvedValue(true);
    await expect(service.deleteQuiz('quiz-1')).rejects.toThrow(
      'quiz.has_attempts_locked',
    );
  });

  it('deletes quizzes without attempts', async () => {
    sharedService.findQuizDocumentOrThrow.mockResolvedValue({ ...baseQuiz });
    sharedService.quizHasAttempts.mockResolvedValue(false);
    quizModel.deleteOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    });

    await expect(service.deleteQuiz('quiz-1')).resolves.toBeUndefined();
    expect(quizModel.deleteOne).toHaveBeenCalledWith({ quizId: 'quiz-1' });
  });
});
