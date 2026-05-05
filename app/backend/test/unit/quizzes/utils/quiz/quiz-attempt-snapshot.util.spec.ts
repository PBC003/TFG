import * as parametricTemplateUtils from '../../../../../src/questions/parametric/parametric-question-template.util';
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
        statement: expect.stringContaining('\\sum_{n=2}^{\\infty}'),
        questionConfig: expect.objectContaining({
          templateId: 'series_geometric',
          generatedValues: expect.objectContaining({
            i: expect.any(Number),
            r: expect.any(Number),
          }),
          correctAnswerLatex: expect.any(String),
          correctAnswerNumeric: expect.any(Number),
          tolerance: 0.01,
        }),
      }),
    );
  });

  it('keeps non-randomized multiple-choice options stable and preserves order without shuffle', () => {
    const multipleChoiceQuestion = {
      questionId: 'q-multi',
      title: 'Multiple',
      type: QuestionType.MULTIPLE_CHOICE,
      statement: 'Select',
      explanation: null,
      tags: ['multi'],
      questionConfig: {
        options: [
          { key: 'a', text: 'A' },
          { key: 'b', text: 'B' },
        ],
        correctOptionKeys: ['a'],
        randomizeOptions: false,
      },
    } as unknown as QuestionDocument;

    const config = createAttemptQuestionConfig(multipleChoiceQuestion);
    expect(config).toEqual({
      statement: 'Select',
      questionConfig: {
        options: [
          { key: 'a', text: 'A' },
          { key: 'b', text: 'B' },
        ],
        correctOptionKeys: ['a'],
        randomizeOptions: false,
      },
    });

    const snapshots = buildAttemptQuestionSnapshots(
      {
        questions: [{ questionId: 'q-multi', points: 2 }],
        shuffleQuestions: false,
      } as never,
      new Map([['q-multi', multipleChoiceQuestion]]),
    );

    expect(snapshots).toEqual([
      expect.objectContaining({
        questionId: 'q-multi',
        order: 0,
        points: 2,
      }),
    ]);
  });

  it('builds multiple parametric snapshots with tolerance override and quantity suffixes', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);

    const parametricQuestion = {
      questionId: 'q-param',
      title: 'Parametric',
      type: QuestionType.PARAMETRIC,
      statement: 'base',
      explanation: 'explanation',
      tags: ['param'],
      questionConfig: {
        templateId: ParametricQuestionTemplateId.SERIES_GEOMETRIC,
        tolerance: 0.01,
      },
    } as unknown as QuestionDocument;

    const snapshots = buildAttemptQuestionSnapshots(
      {
        questions: [
          {
            questionId: 'q-param',
            points: 3,
            quantity: 2,
            toleranceOverride: 0.25,
          },
        ],
        shuffleQuestions: false,
      } as never,
      new Map([['q-param', parametricQuestion]]),
    );

    expect(snapshots).toHaveLength(2);
    expect(snapshots?.[0]).toEqual(
      expect.objectContaining({
        questionId: 'q-param::1',
        order: 0,
        points: 3,
        questionConfig: expect.objectContaining({ tolerance: 0.25 }),
      }),
    );
    expect(snapshots?.[1]).toEqual(
      expect.objectContaining({
        questionId: 'q-param::2',
        order: 1,
      }),
    );
  });

  it('returns null when parametric instance generation fails and for unsupported question types', () => {
    const parametricQuestion = {
      questionId: 'q-param',
      title: 'Parametric',
      type: QuestionType.PARAMETRIC,
      statement: 'base',
      explanation: null,
      tags: [],
      questionConfig: {
        templateId: ParametricQuestionTemplateId.SERIES_GEOMETRIC,
        tolerance: 0.01,
      },
    } as unknown as QuestionDocument;

    expect(
      buildAttemptQuestionSnapshots(
        {
          questions: [{ questionId: 'q-param', points: 1, quantity: 30 }],
          shuffleQuestions: false,
        } as never,
        new Map([['q-param', parametricQuestion]]),
      ),
    ).toBeNull();

    jest
      .spyOn(
        parametricTemplateUtils,
        'generateDistinctParametricQuestionInstances',
      )
      .mockReturnValueOnce(null as never);

    expect(createAttemptQuestionConfig(parametricQuestion)).toBeNull();
    expect(createAttemptQuestionConfig({ type: 'essay' } as never)).toBeNull();
  });
});
