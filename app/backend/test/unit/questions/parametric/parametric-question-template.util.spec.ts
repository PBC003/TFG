import {
  __parametricTemplateInternalsForTesting,
  buildCanonicalParametricQuestionStatement,
  buildCanonicalParametricStatement,
  generateDistinctParametricQuestionInstances,
  generateParametricQuestionInstance,
  getParametricTemplateVariantCount,
  isParametricQuestionTemplateId,
} from '../../../../src/questions/parametric/parametric-question-template.util';
import { ParametricQuestionTemplateId } from '../../../../src/questions/types/question-type-config.type';

describe('parametric-question-template.util', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    [ParametricQuestionTemplateId.LIMIT_TRIGONOMETRIC, '\\tan'],
    [ParametricQuestionTemplateId.LIMIT_LOGARITHMIC, '\\log'],
    [ParametricQuestionTemplateId.INTEGRAL_LOGARITHMIC, '\\int_{1}^{e}'],
    [
      ParametricQuestionTemplateId.INTEGRAL_INVERSE_QUADRATIC,
      '\\int_{0}^{\\sqrt{a}}',
    ],
    [ParametricQuestionTemplateId.SERIES_GEOMETRIC, '\\sum_{n=2}^{\\infty}'],
  ] as const)('builds canonical statements for %s', (templateId, snippet) => {
    expect(buildCanonicalParametricStatement(templateId)).toContain(snippet);
    expect(
      buildCanonicalParametricQuestionStatement({
        templateId,
        tolerance: 0.01,
      } as never),
    ).toContain(snippet);
  });

  it('generates deterministic instances for every template and honors tolerance fallbacks', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);

    const trig = generateParametricQuestionInstance(
      {
        templateId: ParametricQuestionTemplateId.LIMIT_TRIGONOMETRIC,
        tolerance: 0.25,
      } as never,
      { toleranceOverride: 0.5 },
    );
    expect(trig.statement).toContain('\\tan');
    expect(trig.tolerance).toBe(0.5);
    expect(trig.correctAnswerLatex).toBe('0');

    const logarithmic = generateParametricQuestionInstance({
      templateId: ParametricQuestionTemplateId.LIMIT_LOGARITHMIC,
      tolerance: 0.01,
    } as never);
    expect(logarithmic.statement).toContain('\\log');
    expect(logarithmic.correctAnswerLatex).toBe('\\frac{1}{2}');

    const integralLog = generateParametricQuestionInstance({
      templateId: ParametricQuestionTemplateId.INTEGRAL_LOGARITHMIC,
    } as never);
    expect(integralLog.statement).toContain('\\int_{1}^{e}');
    expect(integralLog.tolerance).toBe(0.01);

    const inverseQuadratic = generateParametricQuestionInstance({
      templateId: ParametricQuestionTemplateId.INTEGRAL_INVERSE_QUADRATIC,
    } as never);
    expect(inverseQuadratic.statement).toContain('\\frac{4}{1+x^2}');
    expect(inverseQuadratic.correctAnswerLatex).toBe('\\pi');

    const series = generateParametricQuestionInstance({
      templateId: ParametricQuestionTemplateId.SERIES_GEOMETRIC,
      tolerance: 0.01,
    } as never);
    expect(series.statement).toContain('\\left(\\frac{1}{2}\\right)^n');
    expect(series.correctAnswerLatex).toBe('\\frac{1}{2}');
  });

  it('generates distinct instances and rejects impossible quantities', () => {
    const instances = generateDistinctParametricQuestionInstances(
      {
        templateId: ParametricQuestionTemplateId.SERIES_GEOMETRIC,
        tolerance: 0.01,
      } as never,
      3,
    );

    expect(instances).toHaveLength(3);
    const uniqueStatements = new Set(instances?.map((item) => item.statement));
    expect(uniqueStatements.size).toBe(3);

    expect(
      generateDistinctParametricQuestionInstances(
        {
          templateId: ParametricQuestionTemplateId.INTEGRAL_INVERSE_QUADRATIC,
          tolerance: 0.01,
        } as never,
        11,
      ),
    ).toBeNull();
  });

  it('returns the expected variant counts and template guards', () => {
    expect(
      getParametricTemplateVariantCount(
        ParametricQuestionTemplateId.INTEGRAL_INVERSE_QUADRATIC,
      ),
    ).toBe(10);
    expect(
      getParametricTemplateVariantCount(
        ParametricQuestionTemplateId.SERIES_GEOMETRIC,
      ),
    ).toBe(24);

    expect(
      isParametricQuestionTemplateId(
        ParametricQuestionTemplateId.INTEGRAL_LOGARITHMIC,
      ),
    ).toBe(true);
    expect(isParametricQuestionTemplateId('unknown-template')).toBe(false);
  });

  it('formats inverse quadratic variants beyond pi as fractions over integers', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.1);

    const inverseQuadratic = generateParametricQuestionInstance({
      templateId: ParametricQuestionTemplateId.INTEGRAL_INVERSE_QUADRATIC,
      tolerance: 0.01,
    } as never);

    expect(inverseQuadratic.statement).toContain('\\frac{4}{4+x^2}');
    expect(inverseQuadratic.correctAnswerLatex).toBe('\\frac{\\pi}{2}');
  });

  it('exposes defensive formatting helpers used by the generated templates', () => {
    expect(
      __parametricTemplateInternalsForTesting.simplifyFraction(2, -4),
    ).toEqual({ numerator: -1, denominator: 2 });
    expect(
      __parametricTemplateInternalsForTesting.formatPiOverIntegerLatex(1),
    ).toBe('\\pi');
    expect(
      __parametricTemplateInternalsForTesting.formatPiOverIntegerLatex(2),
    ).toBe('\\frac{\\pi}{2}');
  });
});
