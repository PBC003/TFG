import {
  assertQuizAudienceForParticipant,
  buildPreviewParticipantName,
  buildPreviewParticipantNameFromAuthenticatedParticipant,
  isQuizVisibleToParticipant,
} from '../../../../../src/quizzes/utils/quiz/quiz-access-audience.util';

describe('quiz-access-audience.util', () => {
  it('determines visibility and preview participant names', () => {
    expect(
      isQuizVisibleToParticipant({ assignedGroupIds: [] } as never, new Set()),
    ).toBe(true);
    expect(
      isQuizVisibleToParticipant(
        { assignedGroupIds: ['group-1'] } as never,
        new Set(['group-1']),
      ),
    ).toBe(true);
    expect(buildPreviewParticipantName(7)).toBe('preview:user:7');
    expect(
      buildPreviewParticipantNameFromAuthenticatedParticipant('user:7'),
    ).toBe('preview:user:7');
    expect(
      buildPreviewParticipantNameFromAuthenticatedParticipant('guest'),
    ).toBe('guest');
  });

  it('asserts group audience access for the participant', async () => {
    const throwNotFound = jest.fn((code: string, message: string) => {
      throw new Error(`${code}:${message}`);
    });

    await expect(
      assertQuizAudienceForParticipant(
        { assignedGroupIds: ['group-1'] } as never,
        'guest',
        async () => new Set(),
        throwNotFound as never,
      ),
    ).rejects.toThrow('quiz.not_found:Quiz not found');

    await expect(
      assertQuizAudienceForParticipant(
        { assignedGroupIds: ['group-1'] } as never,
        'user:7',
        async () => new Set(['group-1']),
        throwNotFound as never,
      ),
    ).resolves.toBeUndefined();
  });
});
