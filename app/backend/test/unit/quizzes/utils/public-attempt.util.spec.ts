import { QuestionType } from '../../../../src/questions/enums/question-type.enum';
import { QuizAttemptStatus } from '../../../../src/quizzes/enums/quiz-attempt-status.enum';
import {
  resolveTrueFalseCorrectValue,
  toQuizAttemptItem,
  toQuizSubmissionResult,
} from '../../../../src/quizzes/utils/public-attempt.util';

describe('public-attempt.util', () => {
  it('maps public attempts and submission results with sanitized configs', () => {
    const attempt = {
      attemptId: 'attempt-1',
      quizId: 'quiz-1',
      accessCode: 'ABCD',
      participantName: 'Pablo',
      attemptNumber: 1,
      status: QuizAttemptStatus.SUBMITTED,
      startedAt: new Date('2026-04-12T10:00:00.000Z'),
      submittedAt: new Date('2026-04-12T10:05:00.000Z'),
      expiresAt: new Date('2026-04-12T10:10:00.000Z'),
      earnedPoints: 3,
      maxPoints: 4,
      questions: [
        {
          questionId: 'q2',
          title: 'Second',
          type: QuestionType.TRUE_FALSE,
          statement: 'S2',
          explanation: 'E2',
          tags: [],
          points: 1,
          order: 1,
          questionConfig: { correctAnswer: true },
        },
        {
          questionId: 'q1',
          title: 'First',
          type: QuestionType.SINGLE_CHOICE,
          statement: 'S1',
          explanation: 'E1',
          tags: [],
          points: 3,
          order: 0,
          questionConfig: {
            options: [
              { key: 'a', text: 'A', feedback: 'x' },
              { key: 'b', text: 'B' },
            ],
            correctOptionKey: 'a',
          },
        },
      ],
    };

    const publicAttempt = toQuizAttemptItem(attempt as never, {
      title: 'Quiz',
      description: 'Desc',
      attemptsAllowed: 2,
      attemptsRemaining: 1,
    });

    expect(
      publicAttempt.questions.map((question) => question.questionId),
    ).toEqual(['q1', 'q2']);
    expect(publicAttempt.questions[0]?.questionConfig).toEqual({
      options: [
        { key: 'a', text: 'A' },
        { key: 'b', text: 'B' },
      ],
    });
    expect(publicAttempt.questions[1]?.questionConfig).toEqual({});

    const result = toQuizSubmissionResult(
      attempt as never,
      {
        title: 'Quiz',
        attemptsAllowed: 2,
        attemptsRemaining: 0,
        canRevealFeedback: false,
        revealBlockedByEndDate: true,
      },
      [{ questionId: 'q1' }] as never,
    );

    expect(result.scoreOverTen).toBe(7.5);
    expect(result.review).toEqual([]);
    expect(resolveTrueFalseCorrectValue({ correctAnswer: true } as never)).toBe(
      true,
    );
  });
});
