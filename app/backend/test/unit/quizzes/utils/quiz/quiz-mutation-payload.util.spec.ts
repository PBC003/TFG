import { normalizeQuizMutationPayload } from '../../../../../src/quizzes/utils/quiz/quiz-mutation-payload.util';
import { Role } from '../../../../../src/users/enums/role.enum';

describe('quiz-mutation-payload.util', () => {
  it('normalizes quiz payloads and validates dates and required fields', async () => {
    const sharedService = {
      normalizeAccessCode: jest.fn((value: string) => `N-${value}`),
      generateAccessCode: jest.fn(() => 'GEN123'),
      assertAccessCodeIsAvailable: jest.fn(async () => undefined),
      assertQuestionReferencesAreValid: jest.fn(async () => undefined),
      assertGroupReferencesAreValid: jest.fn(async () => undefined),
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
      { id: 7, role: Role.TEACHER },
    );

    expect(payload).toEqual({
      title: 'Quiz',
      description: 'Desc',
      accessCode: 'N-abc',
      requiresAccessCode: true,
      attemptsAllowed: 2,
      startAt: new Date('2026-04-12T10:00:00.000Z'),
      endAt: new Date('2026-04-12T11:00:00.000Z'),
      timeLimitMinutes: 20,
      shuffleQuestions: true,
      revealAnswersAfterClose: true,
      assignedGroupIds: [],
      questions: [
        {
          questionId: 'q1',
          points: 2,
          quantity: 1,
          toleranceOverride: null,
        },
      ],
    });
    expect(sharedService.assertAccessCodeIsAvailable).toHaveBeenCalledWith(
      'N-abc',
      undefined,
    );

    await expect(
      normalizeQuizMutationPayload(
        sharedService as never,
        { title: 'Only title' } as never,
        { id: 7, role: Role.TEACHER },
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
        { id: 7, role: Role.TEACHER },
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
        { id: 7, role: Role.TEACHER },
      ),
    ).rejects.toThrow('quiz.invalid_schedule:Invalid quiz schedule');
  });
});

it('uses current quiz defaults, trims group ids and normalizes blank schedule values', async () => {
  const sharedService = {
    normalizeAccessCode: jest.fn((value: string) => `N-${value}`),
    generateAccessCode: jest.fn(() => 'GEN123'),
    assertAccessCodeIsAvailable: jest.fn(async () => undefined),
    assertQuestionReferencesAreValid: jest.fn(async () => undefined),
    assertGroupReferencesAreValid: jest.fn(async () => undefined),
    throwBadRequest: jest.fn((code: string, message: string) => {
      throw new Error(`${code}:${message}`);
    }),
  };

  const payload = await normalizeQuizMutationPayload(
    sharedService as never,
    {
      title: ' Updated quiz ',
      description: '   ',
      requiresAccessCode: false,
      startAt: '   ',
      endAt: null,
      assignedGroupIds: [' g-1 ', 'g-1', ''],
      questions: [
        {
          questionId: 'q1',
          points: '3' as never,
          quantity: '2' as never,
          toleranceOverride: '0.25' as never,
        },
      ],
    } as never,
    { id: 7, role: Role.TEACHER },
    {
      quizId: 'quiz-1',
      title: 'Current',
      description: 'Current desc',
      accessCode: 'CURR',
      requiresAccessCode: true,
      attemptsAllowed: 2,
      startAt: new Date('2026-04-12T10:00:00.000Z'),
      endAt: new Date('2026-04-12T11:00:00.000Z'),
      timeLimitMinutes: 15,
      shuffleQuestions: false,
      revealAnswersAfterClose: false,
      assignedGroupIds: ['legacy'],
      questions: [{ questionId: 'legacy', points: 1 }],
    } as never,
  );

  expect(payload).toEqual({
    title: 'Updated quiz',
    description: null,
    accessCode: 'N-CURR',
    requiresAccessCode: false,
    attemptsAllowed: 2,
    startAt: null,
    endAt: null,
    timeLimitMinutes: 15,
    shuffleQuestions: false,
    revealAnswersAfterClose: false,
    assignedGroupIds: ['g-1'],
    questions: [
      {
        questionId: 'q1',
        points: 3,
        quantity: 2,
        toleranceOverride: 0.25,
      },
    ],
  });
  expect(sharedService.assertAccessCodeIsAvailable).toHaveBeenCalledWith(
    'N-CURR',
    'quiz-1',
  );
});
