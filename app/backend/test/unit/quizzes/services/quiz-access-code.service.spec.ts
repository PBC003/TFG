import { QuizAccessCodeService } from '../../../../src/quizzes/services/quiz-access-code.service';

describe('QuizAccessCodeService', () => {
  it('normalizes access codes', () => {
    const service = new QuizAccessCodeService({} as never);
    expect(service.normalizeAccessCode(' ab-12 ')).toBe('AB12');
  });

  it('allows reusing the same code for the current quiz', async () => {
    const model = {
      findOne: jest.fn(() => ({
        select: jest.fn(() => ({
          exec: jest.fn().mockResolvedValue({ quizId: 'quiz-1' }),
        })),
      })),
    };
    const service = new QuizAccessCodeService(model as never);

    await expect(
      service.assertAccessCodeIsAvailable('ABC1', 'quiz-1'),
    ).resolves.toBeUndefined();
  });
});
