import { Test, TestingModule } from '@nestjs/testing';
import { QuizAccessController } from '../../../src/quizzes/quiz-access.controller';
import { QuizAccessService } from '../../../src/quizzes/quiz-access.service';

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

  it('delegates quiz access endpoints and wraps responses', async () => {
    quizAccessService.listPublishedQuizzes.mockResolvedValue([
      { quizId: 'quiz-1' },
    ]);
    quizAccessService.getBestResult.mockResolvedValue({ attemptId: 'a-1' });
    quizAccessService.startAttempt.mockResolvedValue({ attemptId: 'a-1' });
    quizAccessService.submitAttempt.mockResolvedValue({ attemptId: 'a-1' });

    await expect(controller.listPublishedQuizzes('Pablo')).resolves.toEqual({
      quizzes: [{ quizId: 'quiz-1' }],
    });
    await expect(controller.getBestResult('quiz-1', 'Pablo')).resolves.toEqual({
      result: { attemptId: 'a-1' },
    });
    await expect(
      controller.startAttempt({ quizId: 'quiz-1' } as never),
    ).resolves.toEqual({
      attempt: { attemptId: 'a-1' },
    });
    await expect(
      controller.submitAttempt('a-1', { answers: [] } as never),
    ).resolves.toEqual({
      result: { attemptId: 'a-1' },
    });
  });
});
