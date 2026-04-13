import { HttpStatus } from '@nestjs/common';
import { QuizzesSharedService } from '../../../src/quizzes/quizzes-shared.service';
import { QuizStatus } from '../../../src/quizzes/enums/quiz-status.enum';
import { QuestionType } from '../../../src/questions/enums/question-type.enum';

describe('QuizzesSharedService', () => {
  const createExecChain = <T>(value: T) => ({
    select: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(value),
  });

  const createQuizModelMock = () => ({
    findOne: jest.fn(),
  });

  const createQuizAttemptModelMock = () => ({
    aggregate: jest.fn(),
    countDocuments: jest.fn(),
  });

  const createQuestionModelMock = () => ({
    find: jest.fn(),
  });

  const createUserRepositoryMock = () => ({
    findBy: jest.fn(),
  });

  const createService = () => {
    const quizModel = createQuizModelMock();
    const quizAttemptModel = createQuizAttemptModelMock();
    const questionModel = createQuestionModelMock();
    const userRepository = createUserRepositoryMock();

    const service = new QuizzesSharedService(
      quizModel as never,
      quizAttemptModel as never,
      questionModel as never,
      userRepository as never,
    );

    return {
      service,
      quizModel,
      quizAttemptModel,
      questionModel,
      userRepository,
    };
  };

  it('validates access-code availability, document lookup and availability rules', async () => {
    const { service, quizModel } = createService();

    quizModel.findOne.mockReturnValueOnce(createExecChain(null));
    await expect(
      service.assertAccessCodeIsAvailable('ABCD'),
    ).resolves.toBeUndefined();

    quizModel.findOne.mockReturnValueOnce(
      createExecChain({ quizId: 'quiz-1' }),
    );
    await expect(
      service.assertAccessCodeIsAvailable('ABCD', 'quiz-1'),
    ).resolves.toBeUndefined();

    quizModel.findOne.mockReturnValueOnce(
      createExecChain({ quizId: 'quiz-2' }),
    );
    await expect(
      service.assertAccessCodeIsAvailable('ABCD'),
    ).rejects.toMatchObject({
      status: HttpStatus.CONFLICT,
    });

    const draftQuiz = { status: QuizStatus.DRAFT, startAt: null, endAt: null };
    expect(() =>
      service.assertQuizAvailability(draftQuiz as never, new Date()),
    ).toThrow();

    const futureQuiz = {
      status: QuizStatus.PUBLISHED,
      startAt: new Date('2099-04-12T12:00:00.000Z'),
      endAt: null,
    };
    expect(() =>
      service.assertQuizAvailability(
        futureQuiz as never,
        new Date('2099-04-12T10:00:00.000Z'),
      ),
    ).toThrow();

    const closedQuiz = {
      status: QuizStatus.PUBLISHED,
      startAt: null,
      endAt: new Date('2099-04-12T09:00:00.000Z'),
    };
    expect(() =>
      service.assertQuizAvailability(
        closedQuiz as never,
        new Date('2099-04-12T10:00:00.000Z'),
      ),
    ).toThrow();

    expect(() =>
      service.assertQuizAvailability(
        {
          status: QuizStatus.PUBLISHED,
          startAt: new Date('2099-04-12T08:00:00.000Z'),
          endAt: new Date('2099-04-12T12:00:00.000Z'),
        } as never,
        new Date('2099-04-12T10:00:00.000Z'),
      ),
    ).not.toThrow();

    const foundQuiz = { quizId: 'quiz-1' };
    quizModel.findOne.mockReturnValueOnce(createExecChain(foundQuiz));
    await expect(service.findQuizDocumentOrThrow('quiz-1')).resolves.toBe(
      foundQuiz,
    );

    quizModel.findOne.mockReturnValueOnce(createExecChain(null));
    await expect(
      service.findQuizDocumentOrThrow('missing'),
    ).rejects.toMatchObject({
      status: HttpStatus.NOT_FOUND,
    });

    quizModel.findOne.mockReturnValueOnce(
      createExecChain({ quizId: 'quiz-2' }),
    );
    await expect(service.findPublishedQuizById('quiz-2')).resolves.toEqual({
      quizId: 'quiz-2',
    });

    quizModel.findOne.mockReturnValueOnce(createExecChain(null));
    await expect(
      service.findPublishedQuizByAccessCode('ABCD'),
    ).rejects.toMatchObject({
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('validates referenced questions and rejects unsupported types', async () => {
    const { service, questionModel } = createService();

    questionModel.find.mockReturnValueOnce(
      createExecChain([{ questionId: 'q-1' }]),
    );
    await expect(
      service.assertQuestionReferencesAreValid([
        { questionId: 'q-1', points: 1 },
        { questionId: 'q-2', points: 2 },
      ]),
    ).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });

    questionModel.find.mockReturnValueOnce(
      createExecChain([{ questionId: 'q-1', type: QuestionType.PARAMETRIC }]),
    );
    await expect(
      service.assertQuestionReferencesAreValid([
        { questionId: 'q-1', points: 1 },
      ]),
    ).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });

    questionModel.find.mockReturnValueOnce(
      createExecChain([
        { questionId: 'q-1', type: QuestionType.TRUE_FALSE },
        { questionId: 'q-2', type: QuestionType.MULTIPLE_CHOICE },
      ]),
    );
    await expect(
      service.assertQuestionReferencesAreValid([
        { questionId: 'q-1', points: 1 },
        { questionId: 'q-2', points: 2 },
      ]),
    ).resolves.toBeUndefined();
  });

  it('loads question and attempt maps with deduplication support', async () => {
    const { service, questionModel, quizAttemptModel } = createService();

    await expect(service.loadQuestionsMap([])).resolves.toEqual(new Map());

    questionModel.find.mockReturnValueOnce(
      createExecChain([
        { questionId: 'q-1', title: 'One' },
        { questionId: 'q-2', title: 'Two' },
      ]),
    );
    await expect(
      service.loadQuestionsMap(['q-1', 'q-1', 'q-2']),
    ).resolves.toEqual(
      new Map([
        ['q-1', { questionId: 'q-1', title: 'One' }],
        ['q-2', { questionId: 'q-2', title: 'Two' }],
      ]),
    );

    await expect(service.countAttemptsByQuizIds([])).resolves.toEqual(
      new Map(),
    );

    quizAttemptModel.aggregate.mockReturnValueOnce(
      createExecChain([
        { _id: 'quiz-1', count: 2 },
        { _id: 'quiz-2', count: '3' },
      ]),
    );
    await expect(
      service.countAttemptsByQuizIds(['quiz-1', 'quiz-1', 'quiz-2']),
    ).resolves.toEqual(
      new Map([
        ['quiz-1', 2],
        ['quiz-2', 3],
      ]),
    );
  });

  it('reads attempt counters and teacher names', async () => {
    const { service, quizAttemptModel, userRepository } = createService();

    quizAttemptModel.countDocuments.mockReturnValueOnce(createExecChain(0));
    await expect(service.quizHasAttempts('quiz-1')).resolves.toBe(false);

    quizAttemptModel.countDocuments.mockReturnValueOnce(createExecChain(2));
    await expect(service.quizHasAttempts('quiz-1')).resolves.toBe(true);

    quizAttemptModel.countDocuments.mockReturnValueOnce(createExecChain(3));
    await expect(
      service.countConsumedAttempts('quiz-1', 'Pablo'),
    ).resolves.toBe(3);

    await expect(service.loadTeacherNamesById([])).resolves.toEqual(new Map());

    userRepository.findBy.mockResolvedValueOnce([
      { id: 1, firstName: 'Ada', lastName: 'Lovelace' },
      { id: 2, firstName: 'Alan', lastName: 'Turing' },
    ]);
    await expect(service.loadTeacherNamesById([1, 1, 2])).resolves.toEqual(
      new Map([
        [1, 'Ada Lovelace'],
        [2, 'Alan Turing'],
      ]),
    );
  });

  it('normalizes and generates access codes through shared helpers', () => {
    const { service } = createService();

    expect(service.normalizeAccessCode(' ab c-12 ')).toBe('AB C-12');
    expect(service.normalizeAccessCode(null)).toBe('');
    expect(service.generateAccessCode()).toMatch(/^[A-Z0-9]{6}$/);
  });
});
