import { getQuizSubmissionVisibility } from '../../../../../src/quizzes/utils/quiz/quiz-submission-visibility.util';

describe('quiz-submission-visibility.util', () => {
  it('evaluates feedback visibility from attempts and end date', () => {
    const nowMs = new Date('2026-04-12T12:00:00.000Z').getTime();
    const quiz = {
      revealAnswersAfterClose: true,
      endAt: new Date('2026-04-12T13:00:00.000Z'),
    };

    expect(getQuizSubmissionVisibility(quiz as never, 0, nowMs)).toEqual({
      revealBlockedByEndDate: true,
      canRevealFeedback: false,
    });
    expect(
      getQuizSubmissionVisibility({ ...quiz, endAt: null } as never, 0, nowMs),
    ).toEqual({
      revealBlockedByEndDate: false,
      canRevealFeedback: true,
    });
    expect(
      getQuizSubmissionVisibility(
        { ...quiz, revealAnswersAfterClose: false } as never,
        1,
        nowMs,
      ),
    ).toEqual({
      revealBlockedByEndDate: false,
      canRevealFeedback: false,
    });
  });
});
