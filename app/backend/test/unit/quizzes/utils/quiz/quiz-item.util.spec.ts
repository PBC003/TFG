import { QuestionType } from '../../../../../src/questions/enums/question-type.enum';
import { QuizStatus } from '../../../../../src/quizzes/enums/quiz-status.enum';
import { toQuizItem } from '../../../../../src/quizzes/utils/quiz/quiz-item.util';

describe('quiz-item.util', () => {
  it('builds quiz items and falls back when question metadata is missing', () => {
    const quiz = {
      quizId: 'quiz-1',
      title: 'Quiz 1',
      description: 'Desc',
      accessCode: 'ABCD',
      requiresAccessCode: true,
      status: QuizStatus.PUBLISHED,
      attemptsAllowed: 2,
      startAt: null,
      endAt: null,
      timeLimitMinutes: null,
      shuffleQuestions: false,
      revealAnswersAfterClose: false,
      publishedAt: null,
      questions: [
        { questionId: 'q1', points: 2 },
        { questionId: 'q2', points: 3 },
      ],
      createdByUserId: 1,
      updatedByUserId: 1,
      version: 1,
      createdAt: new Date('2026-04-12T09:00:00.000Z'),
      updatedAt: new Date('2026-04-12T09:00:00.000Z'),
    };

    const quizItem = toQuizItem(
      quiz as never,
      new Map([
        [
          'q1',
          {
            questionId: 'q1',
            title: 'Question 1',
            type: QuestionType.TRUE_FALSE,
            statement: 'Statement',
            tags: ['algebra'],
          },
        ],
      ]) as never,
    );

    expect(quizItem.totalPoints).toBe(5);
    expect(quizItem.canEdit).toBe(false);
    expect(quizItem.questions[0]).toEqual(
      expect.objectContaining({
        title: 'Question 1',
        type: QuestionType.TRUE_FALSE,
      }),
    );
    expect(quizItem.questions[1]).toEqual(
      expect.objectContaining({
        title: 'q2',
        type: QuestionType.SINGLE_CHOICE,
      }),
    );
  });
});
