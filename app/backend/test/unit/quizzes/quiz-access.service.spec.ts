import { QuizAccessService } from '../../../src/quizzes/quiz-access.service';
import type { AuthorizedPreviewUser } from '../../../src/quizzes/quiz-access.service';

describe('QuizAccessService', () => {
  const quizCatalogService = {
    listPublishedQuizzes: jest.fn(),
    getBestResult: jest.fn(),
  };

  const quizAttemptStarterService = {
    startAttempt: jest.fn(),
  };

  const quizAttemptSubmissionService = {
    submitAttempt: jest.fn(),
  };

  const quizPreviewService = {
    startPreview: jest.fn(),
  };

  const createService = () =>
    new QuizAccessService(
      quizCatalogService as never,
      quizAttemptStarterService as never,
      quizAttemptSubmissionService as never,
      quizPreviewService as never,
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates published quiz listing to the catalog service', async () => {
    const expected = [{ quizId: 'quiz-1' }];
    quizCatalogService.listPublishedQuizzes.mockResolvedValue(expected);

    const service = createService();
    await expect(service.listPublishedQuizzes(' Pablo ')).resolves.toBe(
      expected,
    );

    expect(quizCatalogService.listPublishedQuizzes).toHaveBeenCalledWith(
      ' Pablo ',
    );
  });

  it('delegates best-result loading to the catalog service', async () => {
    const expected = { attemptId: 'attempt-1' };
    quizCatalogService.getBestResult.mockResolvedValue(expected);

    const service = createService();
    await expect(service.getBestResult('quiz-1', 'Pablo')).resolves.toBe(
      expected,
    );

    expect(quizCatalogService.getBestResult).toHaveBeenCalledWith(
      'quiz-1',
      'Pablo',
    );
  });

  it('starts attempts using the authenticated participant when available', async () => {
    const expected = { attemptId: 'attempt-1' };
    quizAttemptStarterService.startAttempt.mockResolvedValue(expected);

    const service = createService();
    const dto = {
      quizId: 'quiz-1',
      accessCode: ' ab-12 ',
      participantName: 'ignored',
    } as never;

    await expect(service.startAttempt(dto, ' user:7 ')).resolves.toBe(expected);

    expect(quizAttemptStarterService.startAttempt).toHaveBeenCalledWith({
      quizId: 'quiz-1',
      accessCode: ' ab-12 ',
      participantName: 'user:7',
    });
  });

  it('starts attempts using the dto participant when there is no authenticated identity', async () => {
    const expected = { attemptId: 'attempt-2' };
    quizAttemptStarterService.startAttempt.mockResolvedValue(expected);

    const service = createService();
    const dto = {
      quizId: null,
      accessCode: null,
      participantName: '  Pablo  ',
    } as never;

    await expect(service.startAttempt(dto)).resolves.toBe(expected);

    expect(quizAttemptStarterService.startAttempt).toHaveBeenCalledWith({
      quizId: undefined,
      accessCode: null,
      participantName: 'Pablo',
    });
  });

  it('delegates submissions to the submission service', async () => {
    const expected = { attemptId: 'attempt-1', earnedPoints: 2 };
    quizAttemptSubmissionService.submitAttempt.mockResolvedValue(expected);

    const service = createService();
    const dto = { answers: [{ questionId: 'q-1', value: true }] } as never;

    await expect(
      service.submitAttempt('attempt-1', dto, 'user:7'),
    ).resolves.toBe(expected);

    expect(quizAttemptSubmissionService.submitAttempt).toHaveBeenCalledWith(
      'attempt-1',
      dto,
      'user:7',
    );
  });

  it('delegates previews to the preview service', async () => {
    const expected = { attemptId: 'preview-1', isPreview: true };
    const user: AuthorizedPreviewUser = { id: 1, role: 'ADMIN' as never };
    quizPreviewService.startPreview.mockResolvedValue(expected);

    const service = createService();
    await expect(service.startPreview('quiz-1', user)).resolves.toBe(expected);

    expect(quizPreviewService.startPreview).toHaveBeenCalledWith(
      'quiz-1',
      user,
    );
  });
});
