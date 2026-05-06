import { QuizAnalyticsService } from '../../../src/quizzes/quiz-analytics.service';
import { QuestionType } from '../../../src/questions/enums/question-type.enum';
import { QuizAttemptStatus } from '../../../src/quizzes/enums/quiz-attempt-status.enum';
import { QuizStatus } from '../../../src/quizzes/enums/quiz-status.enum';

jest.mock('../../../src/quizzes/utils/grade/grade-attempt.util', () => ({
  gradeAttempt: jest.fn(),
}));

const { gradeAttempt } = jest.requireMock(
  '../../../src/quizzes/utils/grade/grade-attempt.util',
);

describe('QuizAnalyticsService', () => {
  const createExecChain = <T>(value: T) => ({
    sort: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(value),
  });

  const createQuizModelMock = () => ({
    find: jest.fn(),
  });

  const createQuizAttemptModelMock = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
  });

  const createUserRepositoryMock = () => ({
    findBy: jest.fn(),
  });

  const createSharedServiceMock = () => ({
    findManagedQuizDocumentOrThrow: jest.fn(),
    throwNotFound: jest.fn((code: string, message: string) => {
      const error = new Error(message) as Error & { code?: string };
      error.code = code;
      throw error;
    }),
  });

  const createService = () => {
    const quizModel = createQuizModelMock();
    const quizAttemptModel = createQuizAttemptModelMock();
    const userRepository = createUserRepositoryMock();
    const quizzesSharedService = createSharedServiceMock();

    const service = new QuizAnalyticsService(
      quizModel as never,
      quizAttemptModel as never,
      userRepository as never,
      quizzesSharedService as never,
    );

    return {
      service,
      quizModel,
      quizAttemptModel,
      userRepository,
      quizzesSharedService,
    };
  };

  const quiz = {
    quizId: 'quiz-1',
    title: 'Quiz 1',
    description: 'Desc',
    status: QuizStatus.PUBLISHED,
  };

  const baseQuestion = {
    questionId: 'q-1',
    title: 'Question 1',
    type: QuestionType.TRUE_FALSE,
    statement: 'Statement',
    explanation: 'Explanation',
    tags: [],
    points: 2,
    order: 1,
    questionConfig: { correctAnswer: true },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    gradeAttempt.mockReturnValue({
      review: [
        {
          questionId: 'q-1',
          title: 'Question 1',
          statement: 'Statement',
          type: QuestionType.TRUE_FALSE,
          points: 2,
          earnedPoints: 2,
          isCorrect: true,
          submittedValue: true,
          correctValue: true,
          explanation: 'Explanation',
          feedback: 'Good',
          availableOptions: null,
        },
      ],
    });
  });

  it('builds analytics, synchronizes expired attempts and maps participant display names', async () => {
    const { service, quizAttemptModel, userRepository, quizzesSharedService } =
      createService();

    quizzesSharedService.findManagedQuizDocumentOrThrow.mockResolvedValue(quiz);
    const expiredAttempt = {
      attemptId: 'attempt-1',
      quizId: 'quiz-1',
      participantName: 'user:1',
      attemptNumber: 1,
      status: QuizAttemptStatus.IN_PROGRESS,
      startedAt: new Date('2026-04-12T10:00:00.000Z'),
      submittedAt: null,
      expiresAt: new Date('2000-04-12T10:00:00.000Z'),
      earnedPoints: 2,
      maxPoints: 2,
      questions: [baseQuestion],
      answers: [
        {
          questionId: 'q-1',
          value: true,
          isCorrect: true,
          earnedPoints: 2,
          maxPoints: 2,
          answeredAt: new Date(),
        },
      ],
      save: jest.fn(async function save(this: unknown) {
        return this;
      }),
    };
    const submittedAttempt = {
      attemptId: 'attempt-2',
      quizId: 'quiz-1',
      participantName: 'preview:user:2',
      attemptNumber: 2,
      status: QuizAttemptStatus.SUBMITTED,
      startedAt: new Date('2026-04-13T10:00:00.000Z'),
      submittedAt: new Date('2026-04-13T10:05:00.000Z'),
      expiresAt: null,
      earnedPoints: 1,
      maxPoints: 2,
      questions: [baseQuestion],
      answers: [
        {
          questionId: 'q-1',
          value: false,
          isCorrect: false,
          earnedPoints: 1,
          maxPoints: 2,
          answeredAt: new Date(),
        },
      ],
      save: jest.fn(async function save(this: unknown) {
        return this;
      }),
    };

    quizAttemptModel.find.mockReturnValueOnce(
      createExecChain([expiredAttempt, submittedAttempt]),
    );
    userRepository.findBy.mockResolvedValueOnce([
      { id: 1, firstName: 'Ada', lastName: 'Lovelace' },
      { id: 2, firstName: 'Alan', lastName: 'Turing' },
    ]);

    const analytics = await service.getQuizAnalytics('quiz-1', {
      id: 7,
      role: 'TEACHER',
    } as never);

    expect(expiredAttempt.save).toHaveBeenCalled();
    expect(expiredAttempt.status).toBe(QuizAttemptStatus.EXPIRED);
    expect(expiredAttempt.answers).toEqual([]);
    expect(analytics).toEqual(
      expect.objectContaining({
        quizId: 'quiz-1',
        title: 'Quiz 1',
        hasAttempts: true,
        summary: expect.objectContaining({
          totalAttempts: 2,
          completedAttempts: 2,
          submittedAttempts: 1,
          expiredAttempts: 1,
          inProgressAttempts: 0,
          uniqueParticipants: 2,
          averageScoreOverTen: 2.5,
          bestScoreOverTen: 5,
          worstScoreOverTen: 0,
        }),
        scoreDistribution: [
          { label: '0 - 4.99', minScore: 0, maxScore: 4.99, count: 1 },
          { label: '5 - 6.99', minScore: 5, maxScore: 6.99, count: 1 },
          { label: '7 - 8.99', minScore: 7, maxScore: 8.99, count: 0 },
          { label: '9 - 10', minScore: 9, maxScore: 10, count: 0 },
        ],
      }),
    );
    expect(analytics.attempts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          participantDisplayName: 'Ada Lovelace',
          scoreOverTen: 0,
        }),
        expect.objectContaining({
          participantDisplayName: 'Alan Turing',
          scoreOverTen: 5,
        }),
      ]),
    );
    expect(analytics.questionStats).toEqual([
      expect.objectContaining({
        questionId: 'q-1',
        attempts: 2,
        correctCount: 0,
        incorrectCount: 1,
        unansweredCount: 1,
        averageEarnedPoints: 0.5,
        correctRate: 0,
      }),
    ]);
  });

  it('loads attempt detail, exports csv and lists history for the authenticated user', async () => {
    const {
      service,
      quizModel,
      quizAttemptModel,
      userRepository,
      quizzesSharedService,
    } = createService();

    quizzesSharedService.findManagedQuizDocumentOrThrow.mockResolvedValue(quiz);
    const detailAttempt = {
      attemptId: 'attempt-1',
      quizId: 'quiz-1',
      participantName: 'user:1',
      attemptNumber: 1,
      status: QuizAttemptStatus.SUBMITTED,
      startedAt: new Date('2026-04-12T10:00:00.000Z'),
      submittedAt: new Date('2026-04-12T10:05:00.000Z'),
      expiresAt: null,
      earnedPoints: 2,
      maxPoints: 2,
      questions: [baseQuestion],
      answers: [
        { questionId: 'q-1', value: true, earnedPoints: 2, isCorrect: true },
      ],
      save: jest.fn(),
    };
    quizAttemptModel.findOne.mockReturnValueOnce(
      createExecChain(detailAttempt),
    );
    userRepository.findBy.mockResolvedValueOnce([
      { id: 1, firstName: 'Ada', lastName: 'Lovelace' },
    ]);

    const detail = await service.getAttemptDetail('quiz-1', 'attempt-1', {
      id: 7,
      role: 'TEACHER',
    } as never);
    expect(detail).toEqual(
      expect.objectContaining({
        attemptId: 'attempt-1',
        participantDisplayName: 'Ada Lovelace',
        scoreOverTen: 10,
        review: expect.any(Array),
      }),
    );
    expect(gradeAttempt).toHaveBeenCalled();

    // CSV export with escaping and question columns
    quizAttemptModel.find.mockReturnValueOnce(
      createExecChain([
        {
          ...detailAttempt,
          participantName: 'user:1',
          answers: [
            {
              questionId: 'q-1',
              value: 'Line 1\nLine 2',
              earnedPoints: 2,
              isCorrect: true,
            },
          ],
        },
      ]),
    );
    userRepository.findBy.mockResolvedValueOnce([
      { id: 1, firstName: 'Ada', lastName: 'Lovelace' },
    ]);
    const csv = await service.exportQuizAnalyticsCsv('quiz-1', {
      id: 7,
      role: 'TEACHER',
    } as never);
    expect(csv).toContain('quizId;quizTitle;participantID;participantName');
    expect(csv).toContain('Pregunta 1');
    expect(csv).toContain('Ada Lovelace');

    // History loading with quiz fallback title
    quizAttemptModel.find.mockReturnValueOnce(
      createExecChain([
        {
          ...detailAttempt,
          quizId: 'quiz-1',
          participantName: 'user:7',
          attemptId: 'attempt-2',
        },
        {
          ...detailAttempt,
          quizId: 'missing-quiz',
          participantName: 'user:7',
          attemptId: 'attempt-3',
        },
      ]),
    );
    quizModel.find.mockReturnValueOnce(
      createExecChain([
        { quizId: 'quiz-1', title: 'Quiz 1', description: 'Desc' },
      ]),
    );
    const history = await service.listHistoryForUser(7);
    expect(history).toEqual([
      expect.objectContaining({
        quizTitle: 'Quiz 1',
        totalQuestions: 1,
        scoreOverTen: 10,
      }),
      expect.objectContaining({
        quizTitle: 'missing-quiz',
        quizDescription: null,
      }),
    ]);
  });

  it('delegates not-found errors when the requested attempt does not exist', async () => {
    const { service, quizAttemptModel, quizzesSharedService } = createService();
    quizzesSharedService.findManagedQuizDocumentOrThrow.mockResolvedValue(quiz);
    quizAttemptModel.findOne.mockReturnValueOnce(createExecChain(null));

    await expect(
      service.getAttemptDetail('quiz-1', 'missing', {
        id: 7,
        role: 'TEACHER',
      } as never),
    ).rejects.toThrow('Quiz attempt not found');
    expect(quizzesSharedService.throwNotFound).toHaveBeenCalledWith(
      'quiz.attempt_not_found',
      'Quiz attempt not found',
    );
  });
});
