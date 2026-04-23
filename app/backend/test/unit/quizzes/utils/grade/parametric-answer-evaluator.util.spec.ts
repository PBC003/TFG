import {
  evaluateParametricAnswerExpression,
  validateParametricAnswerExpression,
} from '../../../../../src/quizzes/utils/grade/parametric-answer-evaluator.util';

describe('parametric-answer-evaluator.util', () => {
  it('evaluates arithmetic expressions with precedence and right-associative powers', () => {
    expect(evaluateParametricAnswerExpression('2 + 3 * 4')).toBe(14);
    expect(evaluateParametricAnswerExpression('(2 + 3) * 4')).toBe(20);
    expect(evaluateParametricAnswerExpression('2^3^2')).toBe(512);
    expect(evaluateParametricAnswerExpression('10 / 2 - 1')).toBe(4);
  });

  it('supports unary operators, whitespace, decimals, pi constants and square roots', () => {
    expect(evaluateParametricAnswerExpression(' -(2 + 3) ')).toBe(-5);
    expect(evaluateParametricAnswerExpression('+4')).toBe(4);
    expect(evaluateParametricAnswerExpression('1,5 + 2.5')).toBe(4);
    expect(evaluateParametricAnswerExpression('sqrt(9) + pi')).toBeCloseTo(
      3 + Math.PI,
    );
    expect(evaluateParametricAnswerExpression('π / 2')).toBeCloseTo(
      Math.PI / 2,
    );
  });

  it('returns null for blank, malformed or unsupported expressions', () => {
    expect(evaluateParametricAnswerExpression('   ')).toBeNull();
    expect(evaluateParametricAnswerExpression('.')).toBeNull();
    expect(evaluateParametricAnswerExpression('1 +')).toBeNull();
    expect(evaluateParametricAnswerExpression('sqrt 9')).toBeNull();
    expect(evaluateParametricAnswerExpression('(2 + 1')).toBeNull();
    expect(evaluateParametricAnswerExpression('foo(2)')).toBeNull();
    expect(evaluateParametricAnswerExpression('abc')).toBeNull();
  });

  it('validates supported formats before evaluating them', () => {
    expect(validateParametricAnswerExpression('sqrt(2)')).toEqual({
      isValid: true,
      normalizedValue: 'sqrt(2)',
      reason: null,
    });
    expect(validateParametricAnswerExpression('sin(2)')).toEqual({
      isValid: false,
      normalizedValue: 'sin(2)',
      reason: 'unsupported_identifier',
    });
    expect(validateParametricAnswerExpression('2+(')).toEqual({
      isValid: false,
      normalizedValue: '2+(',
      reason: 'unbalanced_parentheses',
    });
    expect(validateParametricAnswerExpression('2;<script>')).toEqual({
      isValid: false,
      normalizedValue: '2;<script>',
      reason: 'invalid_characters',
    });
  });
});
