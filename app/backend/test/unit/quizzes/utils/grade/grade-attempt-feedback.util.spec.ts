import { QuestionType } from '../../../../../src/questions/enums/question-type.enum';
import {
  coerceStringArray,
  findMultipleFeedback,
  findOptionFeedback,
  getReviewAvailableOptions,
} from '../../../../../src/quizzes/utils/grade/grade-attempt-feedback.util';

describe('grade-attempt-feedback.util', () => {
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

  it('coerces arrays and resolves option feedback helpers', () => {
    expect(coerceStringArray(['a', ' ', 'b', 'a', 1, null])).toEqual([
      'a',
      'b',
    ]);
    expect(coerceStringArray('a')).toEqual([]);

    expect(
      findOptionFeedback(singleChoiceSnapshot.questionConfig.options, 'a'),
    ).toBe('feedback A');
    expect(
      findOptionFeedback(
        singleChoiceSnapshot.questionConfig.options,
        'missing',
      ),
    ).toBeNull();
    expect(
      findMultipleFeedback(multipleChoiceSnapshot.questionConfig.options, [
        'a',
        'b',
        'c',
      ]),
    ).toBe('feedback A\nfeedback B');
    expect(
      findMultipleFeedback(multipleChoiceSnapshot.questionConfig.options, []),
    ).toBeNull();
  });

  it('exposes review options only for selectable question types', () => {
    expect(getReviewAvailableOptions(singleChoiceSnapshot as never)).toEqual([
      { key: 'a', text: 'A' },
      { key: 'b', text: 'B' },
    ]);
    expect(getReviewAvailableOptions(multipleChoiceSnapshot as never)).toEqual([
      { key: 'a', text: 'A' },
      { key: 'b', text: 'B' },
      { key: 'c', text: 'C' },
    ]);
    expect(getReviewAvailableOptions(trueFalseSnapshot as never)).toBeNull();
  });
});
