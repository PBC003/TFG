import { Test, TestingModule } from '@nestjs/testing';
import { QuizzesController } from '../../../src/quizzes/quizzes.controller';
import { QuizzesService } from '../../../src/quizzes/quizzes.service';

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
    quizzesService.createQuiz.mockResolvedValue({ quizId: 'quiz-1' });
    quizzesService.listQuizzes.mockResolvedValue([{ quizId: 'quiz-1' }]);
    quizzesService.findQuizById.mockResolvedValue({ quizId: 'quiz-1' });
    quizzesService.updateQuiz.mockResolvedValue({ quizId: 'quiz-1' });
    quizzesService.publishQuiz.mockResolvedValue({ quizId: 'quiz-1' });
    quizzesService.unpublishQuiz.mockResolvedValue({ quizId: 'quiz-1' });

    await expect(
      controller.createQuiz(
        { title: 'Quiz' } as never,
        { user: { id: 7 } } as never,
      ),
    ).resolves.toEqual({ quiz: { quizId: 'quiz-1' } });
    await expect(controller.listQuizzes()).resolves.toEqual({
      quizzes: [{ quizId: 'quiz-1' }],
    });
    await expect(controller.findQuiz('quiz-1')).resolves.toEqual({
      quiz: { quizId: 'quiz-1' },
    });
    await expect(
      controller.updateQuiz(
        'quiz-1',
        { title: 'Updated' } as never,
        { user: { id: 8 } } as never,
      ),
    ).resolves.toEqual({ quiz: { quizId: 'quiz-1' } });
    await expect(
      controller.publishQuiz('quiz-1', { user: { id: 9 } } as never),
    ).resolves.toEqual({
      quiz: { quizId: 'quiz-1' },
    });
    await expect(
      controller.unpublishQuiz('quiz-1', { user: { id: 9 } } as never),
    ).resolves.toEqual({
      quiz: { quizId: 'quiz-1' },
    });
    await expect(controller.deleteQuiz('quiz-1')).resolves.toEqual({
      success: true,
    });

    expect(quizzesService.deleteQuiz).toHaveBeenCalledWith('quiz-1');
  });
});
