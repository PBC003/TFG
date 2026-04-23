import { QuestionType } from '../../../../src/questions/enums/question-type.enum';
import { ParametricQuestionTemplateId } from '../../../../src/questions/types/question-type-config.type';
import { normalizeQuestionTypeConfig } from '../../../../src/questions/utils/question-type-config-normalizer.util';

describe('question-type-config-normalizer.util', () => {
  it('keeps true-false configs unchanged', () => {
    const config = { correctAnswer: true };

    expect(normalizeQuestionTypeConfig(QuestionType.TRUE_FALSE, config)).toBe(
      config,
    );
  });

  it('trims single-choice and multiple-choice option keys and texts', () => {
    expect(
      normalizeQuestionTypeConfig(QuestionType.SINGLE_CHOICE, {
        options: [
          { key: ' a ', text: ' Option A ' },
          { key: ' b', text: 'Option B  ' },
        ],
        correctOptionKey: ' a ',
      }),
    ).toEqual({
      options: [
        { key: 'a', text: 'Option A' },
        { key: 'b', text: 'Option B' },
      ],
      correctOptionKey: 'a',
    });

    expect(
      normalizeQuestionTypeConfig(QuestionType.MULTIPLE_CHOICE, {
        options: [
          { key: ' a ', text: ' Option A ' },
          { key: ' b', text: ' Option B ' },
        ],
        correctOptionKeys: [' a ', 'b '],
      }),
    ).toEqual({
      options: [
        { key: 'a', text: 'Option A' },
        { key: 'b', text: 'Option B' },
      ],
      correctOptionKeys: ['a', 'b'],
    });
  });

  it('normalizes parametric tolerances and keeps undefined when absent', () => {
    expect(
      normalizeQuestionTypeConfig(QuestionType.PARAMETRIC, {
        templateId: ParametricQuestionTemplateId.SERIES_GEOMETRIC,
        tolerance: 0.0100004,
      }),
    ).toEqual({
      templateId: ParametricQuestionTemplateId.SERIES_GEOMETRIC,
      tolerance: 0.01,
    });

    expect(
      normalizeQuestionTypeConfig(QuestionType.PARAMETRIC, {
        templateId: ParametricQuestionTemplateId.LIMIT_TRIGONOMETRIC,
      }),
    ).toEqual({
      templateId: ParametricQuestionTemplateId.LIMIT_TRIGONOMETRIC,
      tolerance: undefined,
    });
  });

  it('returns unknown config types untouched through the default branch', () => {
    const config = { freeform: true };

    expect(
      normalizeQuestionTypeConfig('essay' as QuestionType, config as never),
    ).toBe(config);
  });
});
