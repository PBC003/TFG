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
          questionId: 'q4',
          title: 'Parametric',
          type: QuestionType.PARAMETRIC,
          statement: 'S4',
          explanation: 'E4',
          tags: [],
          points: 1,
          order: 3,
          questionConfig: {
            tolerance: 0.25,
            inputPlaceholder: '1/2',
            correctAnswerExpression: '0.5',
          },
        },
        {
          questionId: 'q3',
          title: 'Multiple',
          type: QuestionType.MULTIPLE_CHOICE,
          statement: 'S3',
          explanation: 'E3',
          tags: [],
          points: 1,
          order: 2,
          questionConfig: {
            options: [
              { key: 'a', text: 'A', feedback: 'fa' },
              { key: 'b', text: 'B', feedback: 'fb' },
            ],
            correctOptionKeys: ['a'],
          },
        },
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
      isPreview: true,
    });

    expect(publicAttempt.isPreview).toBe(true);
    expect(
      publicAttempt.questions.map((question) => question.questionId),
    ).toEqual(['q1', 'q2', 'q3', 'q4']);
    expect(publicAttempt.questions[0]?.questionConfig).toEqual({
      options: [
        { key: 'a', text: 'A' },
        { key: 'b', text: 'B' },
      ],
    });
    expect(publicAttempt.questions[1]?.questionConfig).toEqual({});
    expect(publicAttempt.questions[2]?.questionConfig).toEqual({
      options: [
        { key: 'a', text: 'A' },
        { key: 'b', text: 'B' },
      ],
    });
    expect(publicAttempt.questions[3]?.questionConfig).toEqual({
      tolerance: 0.25,
      inputPlaceholder: '1/2',
    });

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

  it('uses a fallback submission date and reveals feedback when allowed', () => {
    const now = new Date('2026-04-17T09:30:00.000Z');
    jest.useFakeTimers().setSystemTime(now);

    const attempt = {
      attemptId: 'attempt-2',
      quizId: 'quiz-2',
      participantName: 'Ada',
      attemptNumber: 2,
      status: QuizAttemptStatus.EXPIRED,
      submittedAt: null,
      earnedPoints: 0,
      maxPoints: 0,
    };

    const review = [{ questionId: 'q-1', feedback: 'ok' }];
    const result = toQuizSubmissionResult(
      attempt as never,
      {
        title: 'Quiz 2',
        attemptsAllowed: 3,
        attemptsRemaining: 1,
        canRevealFeedback: true,
        revealBlockedByEndDate: false,
        isPreview: true,
      },
      review as never,
    );

    expect(result.isPreview).toBe(true);
    expect(result.submittedAt).toEqual(now);
    expect(result.scoreOverTen).toBe(0);
    expect(result.review).toEqual(review);

    jest.useRealTimers();
  });
});
