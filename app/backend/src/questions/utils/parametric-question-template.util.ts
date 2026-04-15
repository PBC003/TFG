import {
  ParametricQuestionConfig,
  ParametricQuestionTemplateId,
} from '../types/question-type-config.type';

export type ParametricGeneratedQuestionInstance = {
  statement: string;
  correctAnswerNumeric: number;
  correctAnswerLatex: string;
  tolerance: number;
  inputPlaceholder: string;
  templateId: ParametricQuestionTemplateId;
  generatedValues: Record<string, number>;
};

type ParametricTemplateDefinition = {
  templateId: ParametricQuestionTemplateId;
  defaultTolerance: number;
  buildCanonicalStatement: () => string;
  generateInstance: () => Omit<
    ParametricGeneratedQuestionInstance,
    'templateId' | 'tolerance'
  >;
};

const DEFAULT_INPUT_PLACEHOLDER = 'Ej.: 1/2, pi/4 o 0.7854';
const INVERSE_QUADRATIC_ALLOWED_A_VALUES = [
  1, 4, 9, 16, 25, 36, 49, 64, 81, 100,
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick<T>(values: T[]): T {
  return values[Math.floor(Math.random() * values.length)];
}

function gcd(left: number, right: number): number {
  let a = Math.abs(left);
  let b = Math.abs(right);

  while (b !== 0) {
    const next = a % b;
    a = b;
    b = next;
  }

  return a === 0 ? 1 : a;
}

function simplifyFraction(
  numerator: number,
  denominator: number,
): {
  numerator: number;
  denominator: number;
} {
  const divisor = gcd(numerator, denominator);
  const normalizedDenominator = denominator / divisor;
  const normalizedNumerator = numerator / divisor;

  if (normalizedDenominator < 0) {
    return {
      numerator: -normalizedNumerator,
      denominator: -normalizedDenominator,
    };
  }

  return {
    numerator: normalizedNumerator,
    denominator: normalizedDenominator,
  };
}

function formatFractionLatex(numerator: number, denominator: number): string {
  const simplified = simplifyFraction(numerator, denominator);

  if (simplified.denominator === 1) {
    return `${simplified.numerator}`;
  }

  return `\\frac{${simplified.numerator}}{${simplified.denominator}}`;
}

function formatPiOverIntegerLatex(value: number): string {
  if (value === 1) {
    return '\\pi';
  }

  return `\\frac{\\pi}{${value}}`;
}

function buildTrigCanonicalStatement(): string {
  return [
    '$$\\lim_{x \\to 0} \\frac{\\tan(x)-a x}{x-b\\sin(x)}$$',
    '$a \\in \\{1,2,\\ldots,25\\}$, $b = a + 1$.',
  ].join('\n');
}

function buildTrigInstance() {
  const a = randomInt(1, 25);
  const b = a + 1;

  return {
    statement: [
      `$$\\lim_{x \\to 0} \\frac{\\tan(x)-${a}x}{x-${b}\\sin(x)}$$`,
      `$a = ${a}$, $b = ${b}$.`,
    ].join('\n'),
    generatedValues: { a, b },
    correctAnswerNumeric: (a - 1) / (b - 1),
    correctAnswerLatex: formatFractionLatex(a - 1, b - 1),
    inputPlaceholder: DEFAULT_INPUT_PLACEHOLDER,
  };
}

function buildLogCanonicalStatement(): string {
  return [
    '$$\\lim_{x \\to 1} \\left[\\frac{ax}{b(x-1)}-\\frac{a}{b\\log(x)}\\right]$$',
    '$a \\in \\{1,2,\\ldots,25\\}$, $b = \\frac{a+1}{2}$.',
  ].join('\n');
}

function buildLogInstance() {
  const a = randomInt(1, 25);
  const bNumerator = a + 1;
  const b = bNumerator / 2;

  return {
    statement: [
      `$$\\lim_{x \\to 1} \\left[\\frac{${a}x}{\\left(\\frac{${bNumerator}}{2}\\right)(x-1)}-\\frac{${a}}{\\left(\\frac{${bNumerator}}{2}\\right)\\log(x)}\\right]$$`,
      `$a = ${a}$, $b = \\frac{${bNumerator}}{2}$.`,
    ].join('\n'),
    generatedValues: { a, b },
    correctAnswerNumeric: a / (2 * b),
    correctAnswerLatex: formatFractionLatex(a, bNumerator),
    inputPlaceholder: DEFAULT_INPUT_PLACEHOLDER,
  };
}

function buildIntegralLogCanonicalStatement(): string {
  return [
    '$$\\int_{1}^{e} \\frac{a\\log(x)}{bx}\\,dx$$',
    '$a \\in \\{1,2,\\ldots,25\\}$, $b = \\frac{a+1}{2}$.',
  ].join('\n');
}

function buildIntegralLogInstance() {
  const a = randomInt(1, 25);
  const bNumerator = a + 1;
  const b = bNumerator / 2;

  return {
    statement: [
      `$$\\int_{1}^{e} \\frac{${a}\\log(x)}{\\left(\\frac{${bNumerator}}{2}\\right)x}\\,dx$$`,
      `$a = ${a}$, $b = \\frac{${bNumerator}}{2}$.`,
    ].join('\n'),
    generatedValues: { a, b },
    correctAnswerNumeric: a / (2 * b),
    correctAnswerLatex: formatFractionLatex(a, bNumerator),
    inputPlaceholder: DEFAULT_INPUT_PLACEHOLDER,
  };
}

function buildInverseQuadraticCanonicalStatement(): string {
  return [
    '$$\\int_{0}^{\\sqrt{a}} \\frac{4}{a+x^2}\\,dx$$',
    '$a \\in \\{1,4,9,16,25,36,49,64,81,100\\}$.',
  ].join('\n');
}

function buildInverseQuadraticInstance() {
  const a = randomPick(INVERSE_QUADRATIC_ALLOWED_A_VALUES);
  const sqrtA = Math.sqrt(a);

  return {
    statement: [
      `$$\\int_{0}^{${sqrtA}} \\frac{4}{${a}+x^2}\\,dx$$`,
      `$a = ${a}$.`,
    ].join('\n'),
    generatedValues: { a },
    correctAnswerNumeric: Math.PI / sqrtA,
    correctAnswerLatex: formatPiOverIntegerLatex(sqrtA),
    inputPlaceholder: DEFAULT_INPUT_PLACEHOLDER,
  };
}

function buildSeriesCanonicalStatement(): string {
  return [
    '$$\\sum_{n=2}^{\\infty} r^n$$',
    '$r = \\frac{1}{i}$, $i \\in \\{2,3,\\ldots,25\\}$.',
  ].join('\n');
}

function buildSeriesInstance() {
  const i = randomInt(2, 25);
  const r = 1 / i;

  return {
    statement: [
      '$$\\sum_{n=2}^{\\infty} r^n$$',
      `$r = \\frac{1}{${i}}$, $i = ${i}$.`,
    ].join('\n'),
    generatedValues: { i, r },
    correctAnswerNumeric: r ** 2 / (1 - r),
    correctAnswerLatex: formatFractionLatex(1, i * (i - 1)),
    inputPlaceholder: DEFAULT_INPUT_PLACEHOLDER,
  };
}

const PARAMETRIC_TEMPLATE_DEFINITIONS: Record<
  ParametricQuestionTemplateId,
  ParametricTemplateDefinition
> = {
  [ParametricQuestionTemplateId.LIMIT_TRIGONOMETRIC]: {
    templateId: ParametricQuestionTemplateId.LIMIT_TRIGONOMETRIC,
    defaultTolerance: 0.01,
    buildCanonicalStatement: buildTrigCanonicalStatement,
    generateInstance: buildTrigInstance,
  },
  [ParametricQuestionTemplateId.LIMIT_LOGARITHMIC]: {
    templateId: ParametricQuestionTemplateId.LIMIT_LOGARITHMIC,
    defaultTolerance: 0.01,
    buildCanonicalStatement: buildLogCanonicalStatement,
    generateInstance: buildLogInstance,
  },
  [ParametricQuestionTemplateId.INTEGRAL_LOGARITHMIC]: {
    templateId: ParametricQuestionTemplateId.INTEGRAL_LOGARITHMIC,
    defaultTolerance: 0.01,
    buildCanonicalStatement: buildIntegralLogCanonicalStatement,
    generateInstance: buildIntegralLogInstance,
  },
  [ParametricQuestionTemplateId.INTEGRAL_INVERSE_QUADRATIC]: {
    templateId: ParametricQuestionTemplateId.INTEGRAL_INVERSE_QUADRATIC,
    defaultTolerance: 0.01,
    buildCanonicalStatement: buildInverseQuadraticCanonicalStatement,
    generateInstance: buildInverseQuadraticInstance,
  },
  [ParametricQuestionTemplateId.SERIES_GEOMETRIC]: {
    templateId: ParametricQuestionTemplateId.SERIES_GEOMETRIC,
    defaultTolerance: 0.01,
    buildCanonicalStatement: buildSeriesCanonicalStatement,
    generateInstance: buildSeriesInstance,
  },
};

export function isParametricQuestionTemplateId(
  value: unknown,
): value is ParametricQuestionTemplateId {
  return Object.values(ParametricQuestionTemplateId).includes(
    value as ParametricQuestionTemplateId,
  );
}

export function resolveParametricQuestionTolerance(
  config: ParametricQuestionConfig,
): number {
  const definition = PARAMETRIC_TEMPLATE_DEFINITIONS[config.templateId];
  return Number((config.tolerance ?? definition.defaultTolerance).toFixed(6));
}

export function buildCanonicalParametricQuestionStatement(
  config: ParametricQuestionConfig,
): string {
  return PARAMETRIC_TEMPLATE_DEFINITIONS[
    config.templateId
  ].buildCanonicalStatement();
}

export function generateParametricQuestionInstance(
  config: ParametricQuestionConfig,
): ParametricGeneratedQuestionInstance {
  const definition = PARAMETRIC_TEMPLATE_DEFINITIONS[config.templateId];
  const generated = definition.generateInstance();

  return {
    ...generated,
    templateId: definition.templateId,
    tolerance: resolveParametricQuestionTolerance(config),
  };
}
