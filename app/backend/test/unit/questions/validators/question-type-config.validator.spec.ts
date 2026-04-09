import { QuestionType } from '../../../../src/questions/enums/question-type.enum';
import { isValidQuestionTypeConfig } from '../../../../src/questions/validators/question-type-config.validator';

describe('isValidQuestionTypeConfig', () => {
  it('accepts a valid true/false config', () => {
    expect(
      isValidQuestionTypeConfig(QuestionType.TRUE_FALSE, {
        correctAnswer: true,
      }),
    ).toBe(true);
  });

  it('rejects a single choice config with a missing correct option', () => {
    expect(
      isValidQuestionTypeConfig(QuestionType.SINGLE_CHOICE, {
        options: [
          { key: 'a', text: 'Option A' },
          { key: 'b', text: 'Option B' },
        ],
        correctOptionKey: 'c',
      }),
    ).toBe(false);
  });

  it('accepts a valid multiple choice config', () => {
    expect(
      isValidQuestionTypeConfig(QuestionType.MULTIPLE_CHOICE, {
        options: [
          { key: 'a', text: 'Option A' },
          { key: 'b', text: 'Option B' },
          { key: 'c', text: 'Option C' },
        ],
        correctOptionKeys: ['a', 'c'],
        gradingMode: 'partial_credit',
      }),
    ).toBe(true);
  });

  it('rejects a parametric config with duplicate variable names', () => {
    expect(
      isValidQuestionTypeConfig(QuestionType.PARAMETRIC, {
        variables: [
          { name: 'a', min: 1, max: 5 },
          { name: 'a', min: 2, max: 8 },
        ],
        answerFormula: 'a + 1',
      }),
    ).toBe(false);
  });
});
