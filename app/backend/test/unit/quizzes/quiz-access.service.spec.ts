import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { QuestionType } from '../../../src/questions/enums/question-type.enum';
import { QuizAccessService } from '../../../src/quizzes/quiz-access.service';
import { QuizAttemptStatus } from '../../../src/quizzes/enums/quiz-attempt-status.enum';
import { QuizStatus } from '../../../src/quizzes/enums/quiz-status.enum';
import { QuizAttempt } from '../../../src/quizzes/schemas/quiz-attempt.schema';
import { Quiz } from '../../../src/quizzes/schemas/quiz.schema';
import type { QuizSubmissionQuestionReview } from '../../../src/quizzes/types/quiz.types';
import { QuizzesSharedService } from '../../../src/quizzes/quizzes-shared.service';

jest.mock('../../../src/quizzes/utils/grade/grade-attempt.util', () => ({
  gradeAttempt: jest.fn(),
}));

const { gradeAttempt } = jest.requireMock(
  '../../../src/quizzes/utils/grade/grade-attempt.util',
);

describe('QuizAccessService', () => {
  let service: QuizAccessService;
  const quizModel = {
    find: jest.fn(),
  };
  const quizAttemptModel = {
    findOne: jest.fn(),
    create: jest.fn(),
  };
  const sharedService = {
    loadTeacherNamesById: jest.fn(),
    countConsumedAttempts: jest.fn(),
    findQuizDocumentOrThrow: jest.fn(),
    findPublishedQuizById: jest.fn(),
    findPublishedQuizByAccessCode: jest.fn(),
    normalizeAccessCode: jest.fn((value?: string | null) =>
      (value ?? '').trim().toUpperCase(),
    ),
    assertQuizAvailability: jest.fn(),
    throwBadRequest: jest.fn((code: string, message: string) => {
      throw new Error(`${code}:${message}`);
    }),
    throwConflict: jest.fn((code: string, message: string) => {
      throw new Error(`${code}:${message}`);
    }),
    throwNotFound: jest.fn((code: string, message: string) => {
      throw new Error(`${code}:${message}`);
    }),
    loadQuestionsMap: jest.fn(),
  };

  const publishedQuiz = {
    quizId: 'quiz-1',
    title: 'Quiz 1',
    description: 'Desc',
    accessCode: 'ABCD',
    requiresAccessCode: true,
    attemptsAllowed: 2,
    timeLimitMinutes: 10,
    shuffleQuestions: false,
    revealAnswersAfterClose: false,
    status: QuizStatus.PUBLISHED,
    startAt: null,
    endAt: null,
    publishedAt: new Date('2026-04-12T10:00:00.000Z'),
    createdByUserId: 1,
    questions: [{ questionId: 'q-1', points: 2 }],
  };

  const activeAttempt = {
    attemptId: 'attempt-1',
    quizId: 'quiz-1',
    accessCode: 'ABCD',
    participantName: 'Pablo',
    attemptNumber: 1,
    status: QuizAttemptStatus.IN_PROGRESS,
    startedAt: new Date('2026-04-12T10:00:00.000Z'),
    submittedAt: null,
    expiresAt: new Date(Date.now() + 60_000),
    maxPoints: 2,
    earnedPoints: 0,
    questions: [
      {
        questionId: 'q-1',
        title: 'Question',
        type: QuestionType.TRUE_FALSE,
        statement: 'Statement',
        explanation: 'Explanation',
        tags: [],
        points: 2,
        order: 0,
        questionConfig: { correctAnswer: true },
      },
    ],
    answers: [],
    save: jest.fn(async function save(this: unknown) {
      return this;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const review: QuizSubmissionQuestionReview[] = [
      {
        questionId: 'q-1',
        title: 'Question',
        statement: 'Statement',
        type: QuestionType.TRUE_FALSE,
        points: 2,
        earnedPoints: 2,
        isCorrect: true,
        submittedValue: true,
        correctValue: true,
        explanation: 'Explanation',
        feedback: null,
        availableOptions: null,
      },
    ];

    sharedService.loadTeacherNamesById.mockResolvedValue(
      new Map([[1, 'Ada Lovelace']]),
    );
    sharedService.countConsumedAttempts.mockResolvedValue(1);
    sharedService.findQuizDocumentOrThrow.mockResolvedValue(publishedQuiz);
    sharedService.findPublishedQuizById.mockResolvedValue(publishedQuiz);
    sharedService.findPublishedQuizByAccessCode.mockResolvedValue(
      publishedQuiz,
    );
    sharedService.loadQuestionsMap.mockResolvedValue(
      new Map([
        [
          'q-1',
          {
            questionId: 'q-1',
            title: 'Question',
            type: QuestionType.TRUE_FALSE,
            statement: 'Statement',
            explanation: 'Explanation',
            tags: [],
            questionConfig: { correctAnswer: true },
          },
        ],
      ]),
    );
    quizModel.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([publishedQuiz]),
      }),
    });
    quizAttemptModel.findOne.mockReturnValue({
      sort: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      exec: jest.fn().mockResolvedValue(null),
    });
    quizAttemptModel.create.mockResolvedValue({ ...activeAttempt });
    gradeAttempt.mockReturnValue({
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
      review,
      earnedPoints: 2,
      maxPoints: 2,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizAccessService,
        { provide: getModelToken(Quiz.name), useValue: quizModel },
        {
          provide: getModelToken(QuizAttempt.name),
          useValue: quizAttemptModel,
        },
        { provide: QuizzesSharedService, useValue: sharedService },
      ],
    }).compile();

    service = module.get(QuizAccessService);
  });

  it('lists published quizzes and only exposes remaining attempts for identified participants', async () => {
    const anonymous = await service.listPublishedQuizzes(' ');
    expect(anonymous[0]).toEqual(
      expect.objectContaining({
        teacherName: 'Ada Lovelace',
        attemptsRemaining: null,
      }),
    );

    const identified = await service.listPublishedQuizzes('Pablo');
    expect(sharedService.countConsumedAttempts).toHaveBeenCalledWith(
      'quiz-1',
      'Pablo',
    );
    expect(identified[0]).toEqual(
      expect.objectContaining({ attemptsRemaining: 1, canStart: true }),
    );
  });

  it('loads the best result when the participant is valid and returns null if there is none', async () => {
    await expect(service.getBestResult('quiz-1', 'P')).rejects.toThrow(
      'quiz.access_data_required:A participant identity is required to retrieve quiz feedback',
    );

    const noResult = await service.getBestResult('quiz-1', 'Pablo');
    expect(noResult).toBeNull();

    quizAttemptModel.findOne.mockReturnValueOnce({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...activeAttempt,
          status: QuizAttemptStatus.SUBMITTED,
          submittedAt: new Date('2026-04-12T10:05:00.000Z'),
          answers: [{ questionId: 'q-1', value: true }],
        }),
      }),
    });

    const result = await service.getBestResult('quiz-1', 'Pablo');
    expect(result).toEqual(
      expect.objectContaining({
        attemptId: 'attempt-1',
        review: expect.any(Array),
      }),
    );
    expect(gradeAttempt).toHaveBeenCalled();
  });

  it('starts attempts by reusing active ones or creating new attempts', async () => {
    await expect(
      service.startAttempt({
        participantName: 'Pablo',
        accessCode: '',
        quizId: '',
      } as never),
    ).rejects.toThrow(
      'quiz.access_data_required:A quiz link or access code is required to start an attempt',
    );

    quizAttemptModel.findOne.mockReturnValueOnce({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...activeAttempt }),
      }),
    });
    const existing = await service.startAttempt({
      participantName: 'Pablo',
      quizId: 'quiz-1',
      accessCode: 'ABCD',
    } as never);
    expect(existing).toEqual(
      expect.objectContaining({ attemptId: 'attempt-1', attemptsRemaining: 1 }),
    );

    quizAttemptModel.create.mockResolvedValueOnce({
      ...activeAttempt,
      attemptNumber: 2,
    });
    const created = await service.startAttempt({
      participantName: 'Pablo',
      quizId: 'quiz-1',
      accessCode: 'abcd',
    } as never);
    expect(sharedService.assertQuizAvailability).toHaveBeenCalled();
    expect(quizAttemptModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        quizId: 'quiz-1',
        attemptNumber: 2,
        status: QuizAttemptStatus.IN_PROGRESS,
      }),
    );
    expect(created).toEqual(
      expect.objectContaining({ quizId: 'quiz-1', attemptsRemaining: 0 }),
    );
  });

  it('expires stale attempts, blocks exhausted access codes and submits active attempts', async () => {
    await expect(
      service.startAttempt({
        participantName: 'Pablo',
        quizId: 'quiz-1',
        accessCode: 'WRONG',
      } as never),
    ).rejects.toThrow(
      'quiz.invalid_access_code:The provided access code is not valid for this quiz',
    );

    const expired = {
      ...activeAttempt,
      expiresAt: new Date(Date.now() - 60_000),
      save: jest.fn(async function save(this: unknown) {
        return this;
      }),
    };
    quizAttemptModel.findOne.mockReturnValueOnce({
      sort: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(expired) }),
    });
    sharedService.countConsumedAttempts.mockResolvedValueOnce(1);
    await service.startAttempt({
      participantName: 'Pablo',
      quizId: 'quiz-1',
      accessCode: 'ABCD',
    } as never);
    expect(expired.status).toBe(QuizAttemptStatus.EXPIRED);
    expect(expired.save).toHaveBeenCalled();

    quizAttemptModel.findOne.mockReturnValueOnce({
      exec: jest.fn().mockResolvedValue(null),
    });
    await expect(
      service.submitAttempt('missing', { answers: [] } as never),
    ).rejects.toThrow('quiz.attempt_not_found:Quiz attempt not found');

    quizAttemptModel.findOne.mockReturnValueOnce({
      exec: jest.fn().mockResolvedValue({
        ...activeAttempt,
        status: QuizAttemptStatus.SUBMITTED,
      }),
    });
    await expect(
      service.submitAttempt('attempt-1', { answers: [] } as never),
    ).rejects.toThrow(
      'quiz.attempt_already_submitted:The selected attempt is no longer active',
    );

    const inProgress = {
      ...activeAttempt,
      save: jest.fn(async function save(this: unknown) {
        return this;
      }),
    };
    quizAttemptModel.findOne.mockReturnValueOnce({
      exec: jest.fn().mockResolvedValue(inProgress),
    });
    const result = await service.submitAttempt('attempt-1', {
      answers: [{ questionId: 'q-1', value: true }],
    } as never);
    expect(result).toEqual(
      expect.objectContaining({ earnedPoints: 2, review: expect.any(Array) }),
    );
    expect(inProgress.status).toBe(QuizAttemptStatus.SUBMITTED);
    expect(inProgress.save).toHaveBeenCalled();
  });
});
