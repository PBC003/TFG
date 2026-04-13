import { QuizStatus } from '../../../../../src/quizzes/enums/quiz-status.enum';
import { toPublicQuizCatalogItem } from '../../../../../src/quizzes/utils/quiz/quiz-access-catalog.util';

describe('quiz-access-catalog.util', () => {
  it('builds public catalog items with derived availability and totals', () => {
    const nowMs = new Date('2026-04-12T12:00:00.000Z').getTime();
    const quiz = {
      quizId: 'quiz-1',
      title: 'Quiz 1',
      description: 'Desc',
      accessCode: 'ABCD',
      requiresAccessCode: true,
      attemptsAllowed: 2,
      startAt: new Date('2026-04-12T10:00:00.000Z'),
      endAt: new Date('2026-04-12T13:00:00.000Z'),
      timeLimitMinutes: 15,
      publishedAt: new Date('2026-04-12T09:00:00.000Z'),
      shuffleQuestions: false,
      revealAnswersAfterClose: true,
      status: QuizStatus.PUBLISHED,
      questions: [
        { questionId: 'q1', points: 2 },
        { questionId: 'q2', points: 3 },
      ],
    };

    const catalog = toPublicQuizCatalogItem(quiz as never, 'Ada', 1, nowMs);

    expect(catalog).toEqual(
      expect.objectContaining({
        teacherName: 'Ada',
        totalQuestions: 2,
        totalPoints: 5,
        isAvailableNow: true,
        canStart: true,
      }),
    );
  });
});
