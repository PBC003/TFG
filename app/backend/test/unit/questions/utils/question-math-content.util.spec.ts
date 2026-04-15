import { QuestionType } from '../../../../src/questions/enums/question-type.enum';
import { ParametricQuestionTemplateId } from '../../../../src/questions/types/question-type-config.type';
import {
  normalizeQuestionTypeConfig,
  validateMathTextContent,
  validateQuestionMathContent,
} from '../../../../src/questions/utils/question-math-content.util';

describe('question-math-content.util', () => {
  it('accepts plain text and balanced LaTeX delimiters', () => {
    expect(
      validateMathTextContent('Sea $x^2 + 1$ una función.', 'statement'),
    ).toEqual([]);
    expect(
      validateMathTextContent(
        'Bloque $$\\int_0^1 x \\, dx$$ válido.',
        'statement',
      ),
    ).toEqual([]);
    expect(
      validateMathTextContent(
        'Inline \\(a+b\\) y block \\[c+d\\]',
        'statement',
      ),
    ).toEqual([]);
  });

  it('rejects unbalanced delimiters and executable HTML content', () => {
    expect(validateMathTextContent('Texto con $x^2', 'statement')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'statement',
          message: 'Unclosed inline math delimiter $',
        }),
      ]),
    );

    expect(
      validateMathTextContent('<script>alert(1)</script>', 'statement'),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'statement',
          message:
            'HTML executable content is not allowed in math-capable text fields',
        }),
      ]),
    );
  });

  it('normalizes question config text fields by type', () => {
    expect(
      normalizeQuestionTypeConfig(QuestionType.SINGLE_CHOICE, {
        options: [
          { key: ' a ', text: '  Opción A  ' },
          { key: 'b', text: ' Opción B ' },
        ],
        correctOptionKey: ' a ',
      }),
    ).toEqual({
      options: [
        { key: 'a', text: 'Opción A' },
        { key: 'b', text: 'Opción B' },
      ],
      correctOptionKey: 'a',
    });

    expect(
      normalizeQuestionTypeConfig(QuestionType.PARAMETRIC, {
        templateId: ParametricQuestionTemplateId.INTEGRAL_LOGARITHMIC,
        tolerance: 0.0100004,
      }),
    ).toEqual({
      templateId: ParametricQuestionTemplateId.INTEGRAL_LOGARITHMIC,
      tolerance: 0.01,
    });
  });

  it('validates math-capable content across question fields', () => {
    const validResult = validateQuestionMathContent(
      QuestionType.MULTIPLE_CHOICE,
      'Selecciona la opción con $\\pi$.',
      null,
      {
        options: [
          { key: 'a', text: '$\\pi$' },
          { key: 'b', text: '$e$' },
        ],
        correctOptionKeys: ['a'],
      },
    );

    expect(validResult).toEqual({ isValid: true, errors: [] });

    const invalidResult = validateQuestionMathContent(
      QuestionType.PARAMETRIC,
      'Calcula $$\\int_0^1 x dx$ mal delimitado',
      'Explicación correcta.',
      {
        templateId: ParametricQuestionTemplateId.INTEGRAL_LOGARITHMIC,
        tolerance: 0.01,
      },
    );

    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'statement',
        }),
        expect.objectContaining({
          field: `questionConfig.template.${ParametricQuestionTemplateId.INTEGRAL_LOGARITHMIC}`,
        }),
      ]),
    );
  });
});
