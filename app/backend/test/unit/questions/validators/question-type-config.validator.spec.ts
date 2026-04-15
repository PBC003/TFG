import { QuestionType } from '../../../../src/questions/enums/question-type.enum';
import { ParametricQuestionTemplateId } from '../../../../src/questions/types/question-type-config.type';
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

  it('accepts and rejects parametric configs based on template and tolerance', () => {
    expect(
      isValidQuestionTypeConfig(QuestionType.PARAMETRIC, {
        templateId: ParametricQuestionTemplateId.SERIES_GEOMETRIC,
        tolerance: 0.01,
      }),
    ).toBe(true);

    expect(
      isValidQuestionTypeConfig(QuestionType.PARAMETRIC, {
        templateId: 'nope',
        tolerance: 0.01,
      }),
    ).toBe(false);

    expect(
      isValidQuestionTypeConfig(QuestionType.PARAMETRIC, {
        templateId: ParametricQuestionTemplateId.SERIES_GEOMETRIC,
        tolerance: -1,
      }),
    ).toBe(false);
  });
});
