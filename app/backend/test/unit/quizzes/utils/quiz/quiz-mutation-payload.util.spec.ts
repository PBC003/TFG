import { normalizeQuizMutationPayload } from '../../../../../src/quizzes/utils/quiz/quiz-mutation-payload.util';

describe('quiz-mutation-payload.util', () => {
  it('normalizes quiz payloads and validates dates and required fields', async () => {
    const sharedService = {
      normalizeAccessCode: jest.fn((value: string) => `N-${value}`),
      generateAccessCode: jest.fn(() => 'GEN123'),
      assertAccessCodeIsAvailable: jest.fn(async () => undefined),
      assertQuestionReferencesAreValid: jest.fn(async () => undefined),
      throwBadRequest: jest.fn((code: string, message: string) => {
        throw new Error(`${code}:${message}`);
      }),
    };

    const payload = await normalizeQuizMutationPayload(
      sharedService as never,
      {
        title: '  Quiz  ',
        description: '  Desc  ',
        requiresAccessCode: true,
        accessCode: '  abc ',
        attemptsAllowed: 2,
        startAt: '2026-04-12T10:00:00.000Z',
        endAt: '2026-04-12T11:00:00.000Z',
        timeLimitMinutes: 20,
        shuffleQuestions: true,
        revealAnswersAfterClose: true,
        questions: [{ questionId: 'q1', points: 2 }],
      } as never,
    );

    expect(payload).toEqual(
      expect.objectContaining({
        title: 'Quiz',
        description: 'Desc',
        accessCode: 'N-abc',
        questions: [{ questionId: 'q1', points: 2 }],
      }),
    );
    expect(sharedService.assertAccessCodeIsAvailable).toHaveBeenCalledWith(
      'N-abc',
      undefined,
    );

    await expect(
      normalizeQuizMutationPayload(
        sharedService as never,
        { title: 'Only title' } as never,
      ),
    ).rejects.toThrow('common.bad_request:Incomplete quiz payload');

    await expect(
      normalizeQuizMutationPayload(
        sharedService as never,
        {
          title: 'Quiz',
          attemptsAllowed: 1,
          startAt: '2026-04-12T12:00:00.000Z',
          endAt: '2026-04-12T10:00:00.000Z',
          questions: [{ questionId: 'q1', points: 1 }],
        } as never,
      ),
    ).rejects.toThrow(
      'quiz.invalid_schedule:Quiz end date must be later than its start date',
    );

    await expect(
      normalizeQuizMutationPayload(
        sharedService as never,
        {
          title: 'Quiz',
          attemptsAllowed: 1,
          startAt: 'not-a-date',
          questions: [{ questionId: 'q1', points: 1 }],
        } as never,
      ),
    ).rejects.toThrow('quiz.invalid_schedule:Invalid quiz schedule');
  });
});
