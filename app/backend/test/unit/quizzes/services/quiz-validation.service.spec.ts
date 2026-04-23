import { QuizStatus } from '../../../../src/quizzes/enums/quiz-status.enum';
import { QuizValidationService } from '../../../../src/quizzes/services/quiz-validation.service';

describe('QuizValidationService', () => {
  it('accepts availability for an open published quiz', () => {
    const service = new QuizValidationService({} as never, {} as never);

    expect(() =>
      service.assertQuizAvailability(
        {
          status: QuizStatus.PUBLISHED,
          startAt: null,
          endAt: null,
        } as never,
        new Date(),
      ),
    ).not.toThrow();
  });

  it('throws when the quiz is not yet available', () => {
    const service = new QuizValidationService({} as never, {} as never);

    expect(() =>
      service.assertQuizAvailability(
        {
          status: QuizStatus.PUBLISHED,
          startAt: new Date('2099-01-01T00:00:00.000Z'),
          endAt: null,
        } as never,
        new Date('2026-01-01T00:00:00.000Z'),
      ),
    ).toThrow();
  });
});
