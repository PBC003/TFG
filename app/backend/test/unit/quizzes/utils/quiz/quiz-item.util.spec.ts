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
      new Map() as never,
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

  it('maps assigned groups and quantities when metadata is available', () => {
    const quiz = {
      quizId: 'quiz-2',
      title: 'Quiz 2',
      description: null,
      accessCode: null,
      requiresAccessCode: false,
      status: QuizStatus.DRAFT,
      attemptsAllowed: 1,
      startAt: null,
      endAt: null,
      timeLimitMinutes: 30,
      shuffleQuestions: true,
      revealAnswersAfterClose: true,
      publishedAt: null,
      assignedGroupIds: ['g-1', 'missing-group'],
      questions: [
        { questionId: 'q1', points: 2, quantity: 3, toleranceOverride: 0.2 },
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
            type: QuestionType.PARAMETRIC,
            statement: 'Statement',
            tags: ['series'],
          },
        ],
      ]) as never,
      new Map([['g-1', { groupId: 'g-1', name: 'Grupo A' }]]) as never,
    );

    expect(quizItem.audienceScope).toBe('groups');
    expect(quizItem.totalQuestions).toBe(3);
    expect(quizItem.totalPoints).toBe(6);
    expect(quizItem.canEdit).toBe(true);
    expect(quizItem.assignedGroupIds).toEqual(['g-1', 'missing-group']);
    expect(quizItem.assignedGroups).toEqual([
      { groupId: 'g-1', name: 'Grupo A' },
    ]);
    expect(quizItem.questions[0]).toEqual(
      expect.objectContaining({
        quantity: 3,
        toleranceOverride: 0.2,
      }),
    );
  });
});
