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

  it('grades complete attempts ordered by question order and handles unsupported types', () => {
    const unsupportedSnapshot = {
      questionId: 'q-unsupported',
      title: 'Unsupported',
      type: QuestionType.PARAMETRIC,
      statement: 'x',
      explanation: 'unsupported explanation',
      tags: [],
      points: 3,
      order: 3,
      questionConfig: {},
    };

    const result = gradeAttempt(
      [
        singleChoiceSnapshot,
        unsupportedSnapshot as never,
        trueFalseSnapshot,
        multipleChoiceSnapshot,
      ],
      new Map<string, unknown>([
        ['q-single', 'a'],
        ['q-tf', true],
        ['q-multi', ['a', 'b']],
      ]),
    );

    expect(result.maxPoints).toBe(10);
    expect(result.earnedPoints).toBe(7);
    expect(result.answers.map((answer) => answer.questionId)).toEqual([
      'q-tf',
      'q-multi',
      'q-single',
      'q-unsupported',
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
        questionId: 'q-unsupported',
        isCorrect: false,
        feedback: 'unsupported explanation',
      }),
    );
  });
});
