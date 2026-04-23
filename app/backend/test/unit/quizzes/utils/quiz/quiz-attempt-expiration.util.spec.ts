import { QuizAttemptStatus } from '../../../../../src/quizzes/enums/quiz-attempt-status.enum';
import { synchronizeExpiredQuizAttempts } from '../../../../../src/quizzes/utils/quiz/quiz-attempt-expiration.util';

describe('quiz-attempt-expiration.util', () => {
  it('expires overdue in-progress attempts and persists them', async () => {
    const expiredAttempt = {
      status: QuizAttemptStatus.IN_PROGRESS,
      expiresAt: new Date('2000-01-01T00:00:00.000Z'),
      submittedAt: null,
      answers: [{ questionId: 'q-1' }],
      earnedPoints: 3,
      save: jest.fn(async function save(this: unknown) {
        return this;
      }),
    };
    const activeAttempt = {
      status: QuizAttemptStatus.IN_PROGRESS,
      expiresAt: new Date('2099-01-01T00:00:00.000Z'),
      submittedAt: null,
      answers: [{ questionId: 'q-1' }],
      earnedPoints: 3,
      save: jest.fn(),
    };

    await synchronizeExpiredQuizAttempts(
      [expiredAttempt, activeAttempt] as never,
      new Date('2026-01-01T00:00:00.000Z'),
    );

    expect(expiredAttempt.status).toBe(QuizAttemptStatus.EXPIRED);
    expect(expiredAttempt.submittedAt).toEqual(expiredAttempt.expiresAt);
    expect(expiredAttempt.answers).toEqual([]);
    expect(expiredAttempt.earnedPoints).toBe(0);
    expect(expiredAttempt.save).toHaveBeenCalled();
    expect(activeAttempt.save).not.toHaveBeenCalled();
  });
});
