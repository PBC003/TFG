import { QuizAttemptStarterService } from '../../../../src/quizzes/services/quiz-attempt-starter.service';

describe('QuizAttemptStarterService', () => {
  it('requires a quiz id or access code', async () => {
    const service = new QuizAttemptStarterService(
      {} as never,
      {} as never,
      {} as never,
      { normalizeAccessCode: jest.fn(() => '') } as never,
    );

    await expect(
      service.startAttempt({ participantName: 'user:7' }),
    ).rejects.toBeDefined();
  });
});
