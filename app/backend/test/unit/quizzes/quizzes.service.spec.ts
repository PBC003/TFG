import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { QuizStatus } from '../../../src/quizzes/enums/quiz-status.enum';
import { Quiz } from '../../../src/quizzes/schemas/quiz.schema';
import { QuizzesService } from '../../../src/quizzes/quizzes.service';
import { QuizzesSharedService } from '../../../src/quizzes/quizzes-shared.service';
import { normalizeQuizMutationPayload } from '../../../src/quizzes/utils/quiz/quiz-mutation-payload.util';
import { Role } from '../../../src/users/enums/role.enum';

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
    loadGroupsMap: jest.fn(),
    countAttemptsByQuizIds: jest.fn(),
    findQuizDocumentOrThrow: jest.fn(),
    findManagedQuizDocumentOrThrow: jest.fn(),
    quizHasAttempts: jest.fn(),
    assertQuestionReferencesAreValid: jest.fn(),
    assertGroupReferencesAreValid: jest.fn(),
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
    assignedGroupIds: [],
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
    sharedService.loadGroupsMap.mockResolvedValue(new Map());
    sharedService.countAttemptsByQuizIds.mockResolvedValue(new Map());
    sharedService.quizHasAttempts.mockResolvedValue(false);
    sharedService.assertGroupReferencesAreValid.mockResolvedValue(undefined);
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
      assignedGroupIds: [],
      questions: [
        {
          questionId: 'q-1',
          points: 2,
          quantity: 1,
          toleranceOverride: null,
        },
      ],
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
      role: Role.TEACHER,
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

    const listed = await service.listQuizzes({
      id: 9,
      role: Role.TEACHER,
    });
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
    sharedService.findManagedQuizDocumentOrThrow.mockResolvedValue(persisted);

    const found = await service.findQuizById('quiz-1', {
      id: 7,
      role: Role.TEACHER,
    });
    expect(found).toEqual(
      expect.objectContaining({ canEdit: false, canDelete: true }),
    );

    await expect(
      service.updateQuiz('quiz-1', {} as never, { id: 7, role: Role.TEACHER }),
    ).rejects.toThrow('quiz.update_requires_field');

    await expect(
      service.updateQuiz('quiz-1', { title: 'Updated' } as never, {
        id: 7,
        role: Role.TEACHER,
      }),
    ).resolves.toEqual(
      expect.objectContaining({ updatedByUserId: 7, version: 2 }),
    );

    await expect(
      service.publishQuiz('quiz-1', { id: 8, role: Role.TEACHER }),
    ).resolves.toEqual(
      expect.objectContaining({ status: QuizStatus.PUBLISHED, canEdit: false }),
    );
    expect(sharedService.assertQuestionReferencesAreValid).toHaveBeenCalledWith(
      persisted.questions,
    );
    expect(sharedService.assertGroupReferencesAreValid).toHaveBeenCalledWith(
      persisted.assignedGroupIds,
      { id: 8, role: Role.TEACHER },
    );

    await expect(
      service.unpublishQuiz('quiz-1', { id: 8, role: Role.TEACHER }),
    ).resolves.toEqual(
      expect.objectContaining({ status: QuizStatus.DRAFT, canEdit: true }),
    );
  });

  it('blocks updates, publication and deletion when business rules say so', async () => {
    const publishedQuiz = {
      ...baseQuiz,
      status: QuizStatus.PUBLISHED,
      save: jest.fn(),
    };
    sharedService.findManagedQuizDocumentOrThrow.mockResolvedValue(
      publishedQuiz,
    );
    sharedService.quizHasAttempts.mockResolvedValue(true);

    await expect(
      service.updateQuiz('quiz-1', { title: 'Updated' } as never, {
        id: 7,
        role: Role.TEACHER,
      }),
    ).rejects.toThrow('quiz.published_locked');

    const emptyQuiz = { ...baseQuiz, questions: [], save: jest.fn() };
    sharedService.findManagedQuizDocumentOrThrow.mockResolvedValueOnce(
      emptyQuiz,
    );
    await expect(
      service.publishQuiz('quiz-1', { id: 8, role: Role.TEACHER }),
    ).rejects.toThrow('quiz.publish_requires_questions');

    const quizWithAttempts = { ...baseQuiz, save: jest.fn() };
    sharedService.findManagedQuizDocumentOrThrow.mockResolvedValueOnce(
      quizWithAttempts,
    );
    sharedService.quizHasAttempts.mockResolvedValue(true);
    await expect(
      service.deleteQuiz('quiz-1', { id: 8, role: Role.TEACHER }),
    ).rejects.toThrow('quiz.has_attempts_locked');
  });

  it('deletes quizzes without attempts', async () => {
    const persisted = {
      ...baseQuiz,
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    };
    sharedService.findManagedQuizDocumentOrThrow.mockResolvedValue(persisted);
    sharedService.quizHasAttempts.mockResolvedValue(false);

    await expect(
      service.deleteQuiz('quiz-1', { id: 8, role: Role.TEACHER }),
    ).resolves.toBeUndefined();
    expect(persisted.deleteOne).toHaveBeenCalled();
  });

  it('lists quizzes as admin and blocks updates once attempts exist', async () => {
    quizModel.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ ...baseQuiz }]),
      }),
    });
    sharedService.countAttemptsByQuizIds.mockResolvedValue(new Map());

    await service.listQuizzes({ id: 1, role: Role.ADMIN });
    expect(quizModel.find).toHaveBeenCalledWith({});

    const persisted = {
      ...baseQuiz,
      save: jest.fn(async function save(this: any) {
        return this;
      }),
    };
    sharedService.findManagedQuizDocumentOrThrow.mockResolvedValue(persisted);
    sharedService.quizHasAttempts.mockResolvedValue(true);

    await expect(
      service.updateQuiz('quiz-1', { title: 'Updated' } as never, {
        id: 7,
        role: Role.TEACHER,
      }),
    ).rejects.toThrow('quiz.has_attempts_locked');
  });

  it('lists quizzes for admins and handles published quizzes without assigned groups', async () => {
    const publishedQuiz = {
      ...baseQuiz,
      status: QuizStatus.PUBLISHED,
      assignedGroupIds: undefined,
    };

    quizModel.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([publishedQuiz]),
      }),
    });
    sharedService.countAttemptsByQuizIds.mockResolvedValue(new Map());

    const listed = await service.listQuizzes({ id: 1, role: Role.ADMIN });

    expect(quizModel.find).toHaveBeenCalledWith({});
    expect(sharedService.loadGroupsMap).toHaveBeenCalledWith([]);
    expect(listed).toEqual([
      expect.objectContaining({
        quizId: 'quiz-1',
        canEdit: false,
        canDelete: true,
        hasAttempts: false,
      }),
    ]);
  });

  it('blocks draft updates when quizzes already have attempts and keeps unpublished quizzes locked', async () => {
    const draftWithAttempts = {
      ...baseQuiz,
      status: QuizStatus.DRAFT,
      save: jest.fn(async function save(this: any) {
        return this;
      }),
    };
    sharedService.findManagedQuizDocumentOrThrow.mockResolvedValueOnce(
      draftWithAttempts,
    );
    sharedService.quizHasAttempts.mockResolvedValueOnce(true);

    await expect(
      service.updateQuiz('quiz-1', { title: 'Updated' } as never, {
        id: 7,
        role: Role.TEACHER,
      }),
    ).rejects.toThrow('quiz.has_attempts_locked');

    const publishedNoGroups = {
      ...baseQuiz,
      status: QuizStatus.PUBLISHED,
      assignedGroupIds: undefined,
      save: jest.fn(async function save(this: any) {
        return this;
      }),
    };
    sharedService.findManagedQuizDocumentOrThrow.mockResolvedValueOnce(
      publishedNoGroups,
    );
    sharedService.quizHasAttempts.mockResolvedValueOnce(true);
    sharedService.quizHasAttempts.mockResolvedValueOnce(true);

    const unpublished = await service.unpublishQuiz('quiz-1', {
      id: 7,
      role: Role.TEACHER,
    });

    expect(unpublished).toEqual(
      expect.objectContaining({
        status: QuizStatus.DRAFT,
        canEdit: false,
        canDelete: false,
      }),
    );
  });

  it('publishes quizzes without groups and returns delete flags when attempts already exist afterwards', async () => {
    const quizWithoutGroups = {
      ...baseQuiz,
      assignedGroupIds: undefined,
      save: jest.fn(async function save(this: any) {
        return this;
      }),
    };
    sharedService.findManagedQuizDocumentOrThrow.mockResolvedValueOnce(
      quizWithoutGroups,
    );
    sharedService.quizHasAttempts.mockResolvedValueOnce(true);

    const published = await service.publishQuiz('quiz-1', {
      id: 5,
      role: Role.TEACHER,
    });

    expect(sharedService.assertGroupReferencesAreValid).toHaveBeenCalledWith(
      [],
      { id: 5, role: Role.TEACHER },
    );
    expect(published).toEqual(
      expect.objectContaining({
        status: QuizStatus.PUBLISHED,
        canEdit: false,
        canDelete: false,
      }),
    );
  });
});
