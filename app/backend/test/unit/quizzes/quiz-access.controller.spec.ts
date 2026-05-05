import { Test, TestingModule } from '@nestjs/testing';
import { QuizAccessController } from '../../../src/quizzes/quiz-access.controller';
import { QuizAccessService } from '../../../src/quizzes/quiz-access.service';
import { loadModuleWithoutReflect } from '../helpers/load-without-reflect';

describe('QuizAccessController', () => {
  let controller: QuizAccessController;
  const quizAccessService = {
    listPublishedQuizzes: jest.fn(),
    getBestResult: jest.fn(),
    startAttempt: jest.fn(),
    submitAttempt: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizAccessController],
      providers: [{ provide: QuizAccessService, useValue: quizAccessService }],
    }).compile();

    controller = module.get(QuizAccessController);
  });

  it('derives participant identity from the authenticated user and wraps responses', async () => {
    quizAccessService.listPublishedQuizzes.mockResolvedValue([
      { quizId: 'quiz-1' },
    ]);
    quizAccessService.getBestResult.mockResolvedValue({ attemptId: 'a-1' });
    quizAccessService.startAttempt.mockResolvedValue({ attemptId: 'a-1' });
    quizAccessService.submitAttempt.mockResolvedValue({ attemptId: 'a-1' });

    const request = { user: { id: 7 } } as never;

    await expect(controller.listPublishedQuizzes(request)).resolves.toEqual({
      quizzes: [{ quizId: 'quiz-1' }],
    });
    await expect(controller.getBestResult('quiz-1', request)).resolves.toEqual({
      result: { attemptId: 'a-1' },
    });
    await expect(
      controller.startAttempt({ quizId: 'quiz-1' } as never, request),
    ).resolves.toEqual({
      attempt: { attemptId: 'a-1' },
    });
    await expect(
      controller.submitAttempt('a-1', { answers: [] } as never, request),
    ).resolves.toEqual({
      result: { attemptId: 'a-1' },
    });

    expect(quizAccessService.listPublishedQuizzes).toHaveBeenCalledWith(
      'user:7',
    );
    expect(quizAccessService.getBestResult).toHaveBeenCalledWith(
      'quiz-1',
      'user:7',
    );
    expect(quizAccessService.startAttempt).toHaveBeenCalledWith(
      { quizId: 'quiz-1' },
      'user:7',
    );
    expect(quizAccessService.submitAttempt).toHaveBeenCalledWith(
      'a-1',
      { answers: [] },
      'user:7',
    );
  });

  it('loads the module without Reflect decorator helpers', () => {
    const { QuizAccessController: ReloadedController } =
      loadModuleWithoutReflect<
        typeof import('../../../src/quizzes/quiz-access.controller')
      >('../../../src/quizzes/quiz-access.controller', __filename);

    expect(new ReloadedController({} as never)).toBeInstanceOf(
      ReloadedController,
    );
  });
});
