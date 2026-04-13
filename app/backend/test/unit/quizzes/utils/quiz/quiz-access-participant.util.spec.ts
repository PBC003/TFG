import {
  assertParticipantIdentityForReview,
  hasParticipantIdentity,
  normalizeParticipantIdentity,
} from '../../../../../src/quizzes/utils/quiz/quiz-access-participant.util';

describe('quiz-access-participant.util', () => {
  it('normalizes participant identities and detects valid identities', () => {
    expect(normalizeParticipantIdentity('  Pablo  ')).toBe('Pablo');
    expect(normalizeParticipantIdentity(undefined)).toBe('');
    expect(hasParticipantIdentity('P')).toBe(false);
    expect(hasParticipantIdentity('Pablo')).toBe(true);
  });

  it('throws when a result is requested without a stable participant identity', () => {
    const throwBadRequest = jest.fn((code: string, message: string) => {
      throw new Error(`${code}:${message}`);
    });

    expect(() =>
      assertParticipantIdentityForReview('P', throwBadRequest as never),
    ).toThrow(
      'quiz.access_data_required:A participant identity is required to retrieve quiz feedback',
    );

    expect(() =>
      assertParticipantIdentityForReview('Pablo', throwBadRequest as never),
    ).not.toThrow();
  });
});
