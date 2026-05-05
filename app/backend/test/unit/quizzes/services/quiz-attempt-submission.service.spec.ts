import { QuizAttemptSubmissionService } from '../../../../src/quizzes/services/quiz-attempt-submission.service';

describe('QuizAttemptSubmissionService', () => {
  it('throws when the attempt does not exist', async () => {
    const model = {
      findOne: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
    };
    const service = new QuizAttemptSubmissionService(
      model as never,
      {} as never,
      {} as never,
    );

    await expect(
      service.submitAttempt('missing', { answers: [] }, 'user:7'),
    ).rejects.toBeDefined();
  });
});
