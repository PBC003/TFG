import type { QuestionDocument } from '../../../../../src/questions/schemas/question.schema';
import { QuestionType } from '../../../../../src/questions/enums/question-type.enum';
import { ParametricQuestionTemplateId } from '../../../../../src/questions/types/question-type-config.type';
import {
  buildAttemptQuestionSnapshots,
  createAttemptQuestionConfig,
} from '../../../../../src/quizzes/utils/quiz/quiz-attempt-snapshot.util';

describe('quiz-attempt-snapshot.util', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates ordered configs and randomizes options/questions when requested', () => {
    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0);

    const singleQuestion = {
      questionId: 'q1',
      title: 'Single',
      type: QuestionType.SINGLE_CHOICE,
      statement: 'S',
      explanation: null,
      tags: [],
      questionConfig: {
        options: [
          { key: 'a', text: 'A' },
          { key: 'b', text: 'B' },
        ],
        correctOptionKey: 'a',
        randomizeOptions: true,
      },
    } as unknown as QuestionDocument;

    const trueFalseQuestion = {
      questionId: 'q2',
      title: 'TF',
      type: QuestionType.TRUE_FALSE,
      statement: 'T',
      explanation: 'E',
      tags: [],
      questionConfig: { correctAnswer: true },
    } as unknown as QuestionDocument;

    const config = createAttemptQuestionConfig(singleQuestion);
    expect(config).toEqual(
      expect.objectContaining({
        questionConfig: expect.objectContaining({
          options: [
            { key: 'b', text: 'B' },
            { key: 'a', text: 'A' },
          ],
        }),
      }),
    );

    const questionMap = new Map<string, QuestionDocument>();
    questionMap.set('q1', singleQuestion);
    questionMap.set('q2', trueFalseQuestion);

    const snapshots = buildAttemptQuestionSnapshots(
      {
        questions: [
          { questionId: 'q1', points: 2 },
          { questionId: 'q2', points: 1 },
        ],
        shuffleQuestions: true,
      } as never,
      questionMap,
    );

    expect(snapshots).toEqual([
      expect.objectContaining({ questionId: 'q2', order: 0 }),
      expect.objectContaining({ questionId: 'q1', order: 1 }),
    ]);
  });

  it('returns null when a referenced question is missing and prepares parametric questions', () => {
    expect(
      buildAttemptQuestionSnapshots(
        {
          questions: [{ questionId: 'missing', points: 1 }],
          shuffleQuestions: false,
        } as never,
        new Map<string, QuestionDocument>(),
      ),
    ).toBeNull();

    jest.spyOn(Math, 'random').mockReturnValue(0);

    const prepared = createAttemptQuestionConfig({
      questionId: 'param',
      title: 'Param',
      type: QuestionType.PARAMETRIC,
      statement: 'base',
      explanation: null,
      tags: [],
      questionConfig: {
        templateId: ParametricQuestionTemplateId.SERIES_GEOMETRIC,
        tolerance: 0.01,
      },
    } as never);

    expect(prepared).toEqual(
      expect.objectContaining({
        statement: expect.stringContaining('\\sum_{n=2}^{\\infty} r^n'),
        questionConfig: expect.objectContaining({
          templateId: ParametricQuestionTemplateId.SERIES_GEOMETRIC,
          correctAnswerLatex: '\\frac{1}{2}',
        }),
      }),
    );
  });
});
