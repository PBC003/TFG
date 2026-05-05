import { Test, TestingModule } from '@nestjs/testing';
import { QuizzesController } from '../../../src/quizzes/quizzes.controller';
import { QuizzesService } from '../../../src/quizzes/quizzes.service';
import { Role } from '../../../src/users/enums/role.enum';
import { loadModuleWithoutReflect } from '../helpers/load-without-reflect';

describe('QuizzesController', () => {
  let controller: QuizzesController;
  const quizzesService = {
    createQuiz: jest.fn(),
    listQuizzes: jest.fn(),
    findQuizById: jest.fn(),
    updateQuiz: jest.fn(),
    publishQuiz: jest.fn(),
    unpublishQuiz: jest.fn(),
    deleteQuiz: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizzesController],
      providers: [{ provide: QuizzesService, useValue: quizzesService }],
    }).compile();

    controller = module.get(QuizzesController);
  });

  it('delegates all quizzes endpoints and wraps responses', async () => {
    const request = { user: { id: 7, role: Role.TEACHER } } as never;
    quizzesService.createQuiz.mockResolvedValue({ quizId: 'quiz-1' });
    quizzesService.listQuizzes.mockResolvedValue([{ quizId: 'quiz-1' }]);
    quizzesService.findQuizById.mockResolvedValue({ quizId: 'quiz-1' });
    quizzesService.updateQuiz.mockResolvedValue({ quizId: 'quiz-1' });
    quizzesService.publishQuiz.mockResolvedValue({ quizId: 'quiz-1' });
    quizzesService.unpublishQuiz.mockResolvedValue({ quizId: 'quiz-1' });

    await expect(
      controller.createQuiz({ title: 'Quiz' } as never, request),
    ).resolves.toEqual({ quiz: { quizId: 'quiz-1' } });
    await expect(controller.listQuizzes(request)).resolves.toEqual({
      quizzes: [{ quizId: 'quiz-1' }],
    });
    await expect(controller.findQuiz('quiz-1', request)).resolves.toEqual({
      quiz: { quizId: 'quiz-1' },
    });
    await expect(
      controller.updateQuiz(
        'quiz-1',
        { title: 'Updated' } as never,
        { user: { id: 8, role: Role.TEACHER } } as never,
      ),
    ).resolves.toEqual({ quiz: { quizId: 'quiz-1' } });
    await expect(
      controller.publishQuiz('quiz-1', {
        user: { id: 9, role: Role.TEACHER },
      } as never),
    ).resolves.toEqual({
      quiz: { quizId: 'quiz-1' },
    });
    await expect(
      controller.unpublishQuiz('quiz-1', {
        user: { id: 9, role: Role.TEACHER },
      } as never),
    ).resolves.toEqual({
      quiz: { quizId: 'quiz-1' },
    });
    await expect(controller.deleteQuiz('quiz-1', request)).resolves.toEqual({
      success: true,
    });

    expect(quizzesService.deleteQuiz).toHaveBeenCalledWith('quiz-1', {
      id: 7,
      role: Role.TEACHER,
    });
  });

  it('loads the module without Reflect decorator helpers', () => {
    const { QuizzesController: ReloadedController } = loadModuleWithoutReflect<
      typeof import('../../../src/quizzes/quizzes.controller')
    >('../../../src/quizzes/quizzes.controller', __filename);

    expect(new ReloadedController({} as never)).toBeInstanceOf(
      ReloadedController,
    );
  });
});
