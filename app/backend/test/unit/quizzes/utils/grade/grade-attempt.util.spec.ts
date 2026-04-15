import { QuestionType } from '../../../../../src/questions/enums/question-type.enum';
import { gradeAttempt } from '../../../../../src/quizzes/utils/grade/grade-attempt.util';

describe('grade-attempt.util', () => {
  const singleChoiceSnapshot = {
    questionId: 'q-single',
    title: 'Single',
    type: QuestionType.SINGLE_CHOICE,
    statement: 'Choose one',
    explanation: 'single explanation',
    tags: ['tag'],
    points: 2,
    order: 2,
    questionConfig: {
      options: [
        { key: 'a', text: 'A', feedback: ' feedback A ' },
        { key: 'b', text: 'B' },
      ],
      correctOptionKey: 'a',
    },
  };

  const multipleChoiceSnapshot = {
    questionId: 'q-multi',
    title: 'Multiple',
    type: QuestionType.MULTIPLE_CHOICE,
    statement: 'Choose several',
    explanation: 'multi explanation',
    tags: [],
    points: 4,
    order: 1,
    questionConfig: {
      options: [
        { key: 'a', text: 'A', feedback: 'feedback A' },
        { key: 'b', text: 'B', feedback: 'feedback B' },
        { key: 'c', text: 'C' },
      ],
      correctOptionKeys: ['a', 'b'],
      gradingMode: 'partial_credit',
    },
  };

  const trueFalseSnapshot = {
    questionId: 'q-tf',
    title: 'True false',
    type: QuestionType.TRUE_FALSE,
    statement: 'Is it true?',
    explanation: 'tf explanation',
    tags: [],
    points: 1,
    order: 0,
    questionConfig: {
      correctAnswer: true,
      feedbackForTrue: ' feedback true ',
      feedbackForFalse: ' feedback false ',
    },
  };

  it('grades complete attempts ordered by question order, including parametric questions', () => {
    const parametricSnapshot = {
      questionId: 'q-parametric',
      title: 'Parametric',
      type: QuestionType.PARAMETRIC,
      statement: 'Calcula',
      explanation: 'param explanation',
      tags: [],
      points: 3,
      order: 3,
      questionConfig: {
        templateId: 'series_geometric',
        tolerance: 0.01,
        generatedValues: { i: 2, r: 0.5 },
        correctAnswerNumeric: 0.5,
        correctAnswerLatex: '\\frac{1}{2}',
        inputPlaceholder: 'Ej.: 1/2',
      },
    };

    const result = gradeAttempt(
      [
        singleChoiceSnapshot,
        parametricSnapshot as never,
        trueFalseSnapshot,
        multipleChoiceSnapshot,
      ],
      new Map<string, unknown>([
        ['q-single', 'a'],
        ['q-tf', true],
        ['q-multi', ['a', 'b']],
        ['q-parametric', '1/2'],
      ]),
    );

    expect(result.maxPoints).toBe(10);
    expect(result.earnedPoints).toBe(10);
    expect(result.answers.map((answer) => answer.questionId)).toEqual([
      'q-tf',
      'q-multi',
      'q-single',
      'q-parametric',
    ]);
    expect(result.review[1]).toEqual(
      expect.objectContaining({
        questionId: 'q-multi',
        availableOptions: [
          { key: 'a', text: 'A' },
          { key: 'b', text: 'B' },
          { key: 'c', text: 'C' },
        ],
      }),
    );
    expect(result.review[3]).toEqual(
      expect.objectContaining({
        questionId: 'q-parametric',
        isCorrect: true,
        correctValue: '$\\frac{1}{2}$',
      }),
    );
  });
});
