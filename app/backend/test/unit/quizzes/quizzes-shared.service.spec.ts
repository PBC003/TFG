import { HttpException, HttpStatus } from '@nestjs/common';
import { QuizzesSharedService } from '../../../src/quizzes/quizzes-shared.service';

describe('QuizzesSharedService', () => {
  const quizAccessCodeService = {
    normalizeAccessCode: jest.fn(),
    generateAccessCode: jest.fn(),
    assertAccessCodeIsAvailable: jest.fn(),
  };

  const quizValidationService = {
    assertQuestionReferencesAreValid: jest.fn(),
    assertGroupReferencesAreValid: jest.fn(),
    assertQuizAvailability: jest.fn(),
  };

  const quizLoadingService = {
    findQuizDocumentOrThrow: jest.fn(),
    findManagedQuizDocumentOrThrow: jest.fn(),
    findPublishedQuizById: jest.fn(),
    findPublishedQuizByAccessCode: jest.fn(),
    loadQuestionsMap: jest.fn(),
    loadGroupsMap: jest.fn(),
    getAccessibleGroupIdsForParticipant: jest.fn(),
    countAttemptsByQuizIds: jest.fn(),
    countConsumedAttempts: jest.fn(),
  };

  const quizTeacherLookupService = {
    loadTeacherNamesById: jest.fn(),
  };

  const createService = () =>
    new QuizzesSharedService(
      quizAccessCodeService as never,
      quizValidationService as never,
      quizLoadingService as never,
      quizTeacherLookupService as never,
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates access-code helpers', async () => {
    quizAccessCodeService.normalizeAccessCode.mockReturnValue('ABC12');
    quizAccessCodeService.generateAccessCode.mockReturnValue('ZXCVBN');
    quizAccessCodeService.assertAccessCodeIsAvailable.mockResolvedValue(
      undefined,
    );

    const service = createService();

    expect(service.normalizeAccessCode(' ab c-12 ')).toBe('ABC12');
    expect(service.generateAccessCode()).toBe('ZXCVBN');
    await expect(
      service.assertAccessCodeIsAvailable('ABC12', 'quiz-1'),
    ).resolves.toBeUndefined();

    expect(quizAccessCodeService.normalizeAccessCode).toHaveBeenCalledWith(
      ' ab c-12 ',
    );
    expect(quizAccessCodeService.generateAccessCode).toHaveBeenCalled();
    expect(
      quizAccessCodeService.assertAccessCodeIsAvailable,
    ).toHaveBeenCalledWith('ABC12', 'quiz-1');
  });

  it('delegates validation helpers', async () => {
    quizValidationService.assertQuestionReferencesAreValid.mockResolvedValue(
      undefined,
    );
    quizValidationService.assertGroupReferencesAreValid.mockResolvedValue(
      undefined,
    );

    const service = createService();
    const quizQuestions = [{ questionId: 'q-1', points: 2 }];
    const groupIds = ['group-1'];
    const user = { id: 7, role: 'TEACHER' as never };
    const now = new Date();
    const quiz = { quizId: 'quiz-1' };

    await expect(
      service.assertQuestionReferencesAreValid(quizQuestions),
    ).resolves.toBeUndefined();
    await expect(
      service.assertGroupReferencesAreValid(groupIds, user),
    ).resolves.toBeUndefined();
    service.assertQuizAvailability(quiz as never, now);

    expect(
      quizValidationService.assertQuestionReferencesAreValid,
    ).toHaveBeenCalledWith(quizQuestions);
    expect(
      quizValidationService.assertGroupReferencesAreValid,
    ).toHaveBeenCalledWith(groupIds, user);
    expect(quizValidationService.assertQuizAvailability).toHaveBeenCalledWith(
      quiz,
      now,
    );
  });

  it('delegates loading and lookup helpers', async () => {
    quizLoadingService.findQuizDocumentOrThrow.mockResolvedValue({
      quizId: 'quiz-1',
    });
    quizLoadingService.findManagedQuizDocumentOrThrow.mockResolvedValue({
      quizId: 'quiz-2',
    });
    quizLoadingService.findPublishedQuizById.mockResolvedValue({
      quizId: 'quiz-3',
    });
    quizLoadingService.findPublishedQuizByAccessCode.mockResolvedValue({
      quizId: 'quiz-4',
    });
    quizLoadingService.loadQuestionsMap.mockResolvedValue(
      new Map([['q-1', { questionId: 'q-1' }]]),
    );
    quizLoadingService.loadGroupsMap.mockResolvedValue(
      new Map([['group-1', { groupId: 'group-1' }]]),
    );
    quizLoadingService.getAccessibleGroupIdsForParticipant.mockResolvedValue(
      new Set(['group-1']),
    );
    quizTeacherLookupService.loadTeacherNamesById.mockResolvedValue(
      new Map([[1, 'Ada Lovelace']]),
    );

    const service = createService();
    const user = { id: 1, role: 'ADMIN' as never };

    await expect(service.findQuizDocumentOrThrow('quiz-1')).resolves.toEqual({
      quizId: 'quiz-1',
    });
    await expect(
      service.findManagedQuizDocumentOrThrow('quiz-2', user),
    ).resolves.toEqual({ quizId: 'quiz-2' });
    await expect(service.findPublishedQuizById('quiz-3')).resolves.toEqual({
      quizId: 'quiz-3',
    });
    await expect(
      service.findPublishedQuizByAccessCode('ABCD'),
    ).resolves.toEqual({ quizId: 'quiz-4' });
    await expect(service.loadQuestionsMap(['q-1'])).resolves.toEqual(
      new Map([['q-1', { questionId: 'q-1' }]]),
    );
    await expect(service.loadGroupsMap(['group-1'])).resolves.toEqual(
      new Map([['group-1', { groupId: 'group-1' }]]),
    );
    await expect(
      service.getAccessibleGroupIdsForParticipant('user:7'),
    ).resolves.toEqual(new Set(['group-1']));
    await expect(service.loadTeacherNamesById([1])).resolves.toEqual(
      new Map([[1, 'Ada Lovelace']]),
    );
  });

  it('delegates counters and derives whether a quiz has attempts', async () => {
    quizLoadingService.countAttemptsByQuizIds
      .mockResolvedValueOnce(new Map())
      .mockResolvedValueOnce(new Map([['quiz-1', 2]]));
    quizLoadingService.countConsumedAttempts.mockResolvedValue(3);

    const service = createService();

    await expect(service.quizHasAttempts('quiz-1')).resolves.toBe(false);
    await expect(service.quizHasAttempts('quiz-1')).resolves.toBe(true);
    await expect(
      service.countConsumedAttempts('quiz-1', 'Pablo'),
    ).resolves.toBe(3);

    expect(quizLoadingService.countAttemptsByQuizIds).toHaveBeenNthCalledWith(
      1,
      ['quiz-1'],
    );
    expect(quizLoadingService.countAttemptsByQuizIds).toHaveBeenNthCalledWith(
      2,
      ['quiz-1'],
    );
    expect(quizLoadingService.countConsumedAttempts).toHaveBeenCalledWith(
      'quiz-1',
      'Pablo',
    );
  });

  it('throws standardized http exceptions', () => {
    const service = createService();

    expect(() =>
      service.throwBadRequest('quiz.invalid_access_code', 'Invalid code', {
        received: 'bad',
      }),
    ).toThrow(HttpException);

    try {
      service.throwBadRequest('quiz.invalid_access_code', 'Invalid code', {
        received: 'bad',
      });
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect((error as HttpException).getResponse()).toEqual({
        code: 'quiz.invalid_access_code',
        message: 'Invalid code',
        details: { received: 'bad' },
      });
    }

    try {
      service.throwConflict('quiz.closed', 'Quiz closed');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(HttpStatus.CONFLICT);
      expect((error as HttpException).getResponse()).toEqual({
        code: 'quiz.closed',
        message: 'Quiz closed',
      });
    }

    try {
      service.throwNotFound('quiz.not_found', 'Quiz not found');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect((error as HttpException).getResponse()).toEqual({
        code: 'quiz.not_found',
        message: 'Quiz not found',
      });
    }
  });
});
