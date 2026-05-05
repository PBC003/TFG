import { QuizAnalyticsController } from '../../../src/quizzes/quiz-analytics.controller';
import { loadModuleWithoutReflect } from '../helpers/load-without-reflect';

describe('QuizAnalyticsController', () => {
  const quizAnalyticsService = {
    getQuizAnalytics: jest.fn(),
    getAttemptDetail: jest.fn(),
    exportQuizAnalyticsCsv: jest.fn(),
  };
  const controller = new QuizAnalyticsController(quizAnalyticsService as never);
  const request = { user: { id: 1, role: 'TEACHER' } } as any;
  const response = { setHeader: jest.fn() } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('wraps analytics endpoints and sets csv response headers', async () => {
    quizAnalyticsService.getQuizAnalytics.mockResolvedValue({
      quizId: 'quiz-1',
    });
    quizAnalyticsService.getAttemptDetail.mockResolvedValue({
      attemptId: 'attempt-1',
    });
    quizAnalyticsService.exportQuizAnalyticsCsv.mockResolvedValue('a;b;c');

    await expect(
      controller.getQuizAnalytics('quiz-1', request),
    ).resolves.toEqual({
      analytics: { quizId: 'quiz-1' },
    });
    await expect(
      controller.getAttemptDetail('quiz-1', 'attempt-1', request),
    ).resolves.toEqual({ detail: { attemptId: 'attempt-1' } });
    await expect(
      controller.exportQuizAnalyticsCsv('quiz-1', request, response),
    ).resolves.toBe('a;b;c');

    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/csv; charset=utf-8',
    );
    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="quiz-quiz-1-results.csv"',
    );
  });

  it('loads the module without Reflect decorator helpers', () => {
    const { QuizAnalyticsController: ReloadedController } =
      loadModuleWithoutReflect<
        typeof import('../../../src/quizzes/quiz-analytics.controller')
      >('../../../src/quizzes/quiz-analytics.controller', __filename);

    expect(new ReloadedController({} as never)).toBeInstanceOf(
      ReloadedController,
    );
  });
});
