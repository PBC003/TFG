import {
  buildAttemptExpiresAt,
  calculateAttemptsRemaining,
} from '../../../../../src/quizzes/utils/quiz/quiz-access-attempt.util';

describe('quiz-access-attempt.util', () => {
  it('calculates remaining attempts without returning negative values', () => {
    expect(calculateAttemptsRemaining(3, 1)).toBe(2);
    expect(calculateAttemptsRemaining(2, 4)).toBe(0);
  });

  it('builds expiration dates only when a quiz has a time limit', () => {
    const startedAt = new Date('2026-04-13T10:00:00.000Z');

    expect(buildAttemptExpiresAt(startedAt, null)).toBeNull();
    expect(buildAttemptExpiresAt(startedAt, 15)?.toISOString()).toBe(
      '2026-04-13T10:15:00.000Z',
    );
  });
});
