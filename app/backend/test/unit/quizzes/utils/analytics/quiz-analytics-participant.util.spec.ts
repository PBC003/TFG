import {
  extractParticipantUserIds,
  loadParticipantDisplayNames,
} from '../../../../../src/quizzes/utils/analytics/quiz-analytics-participant.util';

describe('quiz-analytics-participant.util', () => {
  it('extracts unique numeric ids from participant names', () => {
    expect(
      extractParticipantUserIds([
        'user:1',
        'preview:user:2',
        'user:1',
        'guest',
      ]),
    ).toEqual([1, 2]);
  });

  it('loads display names and keeps unknown values as fallback', async () => {
    const userRepository = {
      findBy: jest
        .fn()
        .mockResolvedValue([{ id: 1, firstName: 'Ada', lastName: 'Lovelace' }]),
    };

    await expect(
      loadParticipantDisplayNames(userRepository as never, [
        'user:1',
        'preview:user:1',
        'guest',
      ]),
    ).resolves.toEqual(
      new Map([
        ['user:1', 'Ada Lovelace'],
        ['preview:user:1', 'Ada Lovelace'],
        ['guest', 'guest'],
      ]),
    );
  });
});
