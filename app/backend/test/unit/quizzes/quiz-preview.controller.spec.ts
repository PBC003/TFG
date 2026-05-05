import { QuizPreviewController } from '../../../src/quizzes/quiz-preview.controller';
import { loadModuleWithoutReflect } from '../helpers/load-without-reflect';

describe('QuizPreviewController', () => {
  it('starts preview attempts for the authenticated teacher/admin user', async () => {
    const quizAccessService = {
      startPreview: jest.fn().mockResolvedValue({ attemptId: 'attempt-1' }),
    };
    const controller = new QuizPreviewController(quizAccessService as never);
    const request = { user: { id: 7, role: 'TEACHER' } } as any;

    await expect(controller.startPreview('quiz-1', request)).resolves.toEqual({
      attempt: { attemptId: 'attempt-1' },
    });
    expect(quizAccessService.startPreview).toHaveBeenCalledWith(
      'quiz-1',
      request.user,
    );
  });

  it('loads the module without Reflect decorator helpers', () => {
    const { QuizPreviewController: ReloadedController } =
      loadModuleWithoutReflect<
        typeof import('../../../src/quizzes/quiz-preview.controller')
      >('../../../src/quizzes/quiz-preview.controller', __filename);

    expect(new ReloadedController({} as never)).toBeInstanceOf(
      ReloadedController,
    );
  });
});
