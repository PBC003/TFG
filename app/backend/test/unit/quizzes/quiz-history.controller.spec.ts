import { QuizHistoryController } from '../../../src/quizzes/quiz-history.controller';
import { loadModuleWithoutReflect } from '../helpers/load-without-reflect';

describe('QuizHistoryController', () => {
  it('wraps the current user history response', async () => {
    const quizAnalyticsService = {
      listHistoryForUser: jest
        .fn()
        .mockResolvedValue([{ attemptId: 'attempt-1' }]),
    };
    const controller = new QuizHistoryController(quizAnalyticsService as never);

    await expect(
      controller.listOwnHistory({ user: { id: 7 } } as never),
    ).resolves.toEqual({ history: [{ attemptId: 'attempt-1' }] });
    expect(quizAnalyticsService.listHistoryForUser).toHaveBeenCalledWith(7);
  });

  it('loads the module without Reflect decorator helpers', () => {
    const { QuizHistoryController: ReloadedController } =
      loadModuleWithoutReflect<
        typeof import('../../../src/quizzes/quiz-history.controller')
      >('../../../src/quizzes/quiz-history.controller', __filename);

    expect(new ReloadedController({} as never)).toBeInstanceOf(
      ReloadedController,
    );
  });
});
