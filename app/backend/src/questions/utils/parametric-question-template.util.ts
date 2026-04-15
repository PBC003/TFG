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
  variantKeys: number[];
  buildCanonicalStatement: () => string;
  buildInstanceFromVariantKey: (
    variantKey: number,
  ) => Omit<ParametricGeneratedQuestionInstance, 'templateId' | 'tolerance'>;
};

type GenerateInstanceOptions = {
  toleranceOverride?: number | null;
};

const DEFAULT_INPUT_PLACEHOLDER = 'Ej.: 1/2, pi/4 o 0.7854';
const INVERSE_QUADRATIC_ALLOWED_A_VALUES = [
  1, 4, 9, 16, 25, 36, 49, 64, 81, 100,
];
const A_VARIANTS = Array.from({ length: 25 }, (_, index) => index + 1);
const I_VARIANTS = Array.from({ length: 24 }, (_, index) => index + 2);

function randomPick<T>(values: T[]): T {
  return values[Math.floor(Math.random() * values.length)];
}

function shuffleItems<T>(items: T[]): T[] {
  const clonedItems = [...items];

  for (let index = clonedItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const currentItem = clonedItems[index];
    clonedItems[index] = clonedItems[swapIndex];
    clonedItems[swapIndex] = currentItem;
  }

  return clonedItems;
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

function buildTrigInstanceFromA(a: number) {
  const b = a + 1;

  return {
    statement: `$$\\lim_{x \\to 0} \\frac{\\tan(x)-${a}x}{x-${b}\\sin(x)}$$`,
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

function buildLogInstanceFromA(a: number) {
  const bNumerator = a + 1;
  const b = bNumerator / 2;

  return {
    statement:
      `$$\\lim_{x \\to 1} \\left[` +
      `\\frac{${a}x}{\\left(\\frac{${bNumerator}}{2}\\right)(x-1)}` +
      `-\\frac{${a}}{\\left(\\frac{${bNumerator}}{2}\\right)\\log(x)}` +
      `\\right]$$`,
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

function buildIntegralLogInstanceFromA(a: number) {
  const bNumerator = a + 1;
  const b = bNumerator / 2;

  return {
    statement:
      `$$\\int_{1}^{e} ` +
      `\\frac{${a}\\log(x)}{\\left(\\frac{${bNumerator}}{2}\\right)x}` +
      `\\,dx$$`,
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

function buildInverseQuadraticInstanceFromA(a: number) {
  const sqrtA = Math.sqrt(a);

  return {
    statement: `$$\\int_{0}^{${sqrtA}} \\frac{4}{${a}+x^2}\\,dx$$`,
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

function buildSeriesInstanceFromI(i: number) {
  const r = 1 / i;

  return {
    statement: `$$\\sum_{n=2}^{\\infty} \\left(\\frac{1}{${i}}\\right)^n$$`,
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
    variantKeys: A_VARIANTS,
    buildCanonicalStatement: buildTrigCanonicalStatement,
    buildInstanceFromVariantKey: buildTrigInstanceFromA,
  },
  [ParametricQuestionTemplateId.LIMIT_LOGARITHMIC]: {
    templateId: ParametricQuestionTemplateId.LIMIT_LOGARITHMIC,
    defaultTolerance: 0.01,
    variantKeys: A_VARIANTS,
    buildCanonicalStatement: buildLogCanonicalStatement,
    buildInstanceFromVariantKey: buildLogInstanceFromA,
  },
  [ParametricQuestionTemplateId.INTEGRAL_LOGARITHMIC]: {
    templateId: ParametricQuestionTemplateId.INTEGRAL_LOGARITHMIC,
    defaultTolerance: 0.01,
    variantKeys: A_VARIANTS,
    buildCanonicalStatement: buildIntegralLogCanonicalStatement,
    buildInstanceFromVariantKey: buildIntegralLogInstanceFromA,
  },
  [ParametricQuestionTemplateId.INTEGRAL_INVERSE_QUADRATIC]: {
    templateId: ParametricQuestionTemplateId.INTEGRAL_INVERSE_QUADRATIC,
    defaultTolerance: 0.01,
    variantKeys: INVERSE_QUADRATIC_ALLOWED_A_VALUES,
    buildCanonicalStatement: buildInverseQuadraticCanonicalStatement,
    buildInstanceFromVariantKey: buildInverseQuadraticInstanceFromA,
  },
  [ParametricQuestionTemplateId.SERIES_GEOMETRIC]: {
    templateId: ParametricQuestionTemplateId.SERIES_GEOMETRIC,
    defaultTolerance: 0.01,
    variantKeys: I_VARIANTS,
    buildCanonicalStatement: buildSeriesCanonicalStatement,
    buildInstanceFromVariantKey: buildSeriesInstanceFromI,
  },
};

function resolveTemplateDefinition(templateId: ParametricQuestionTemplateId) {
  return PARAMETRIC_TEMPLATE_DEFINITIONS[templateId];
}

function resolveTolerance(
  template: ParametricTemplateDefinition,
  config: ParametricQuestionConfig,
  options?: GenerateInstanceOptions,
): number {
  return Number(
    (
      options?.toleranceOverride ??
      config.tolerance ??
      template.defaultTolerance
    ).toFixed(6),
  );
}

function buildGeneratedInstance(
  template: ParametricTemplateDefinition,
  config: ParametricQuestionConfig,
  variantKey: number,
  options?: GenerateInstanceOptions,
): ParametricGeneratedQuestionInstance {
  return {
    templateId: template.templateId,
    tolerance: resolveTolerance(template, config, options),
    ...template.buildInstanceFromVariantKey(variantKey),
  };
}

export function getParametricTemplateVariantCount(
  templateId: ParametricQuestionTemplateId,
): number {
  return resolveTemplateDefinition(templateId).variantKeys.length;
}

export function buildCanonicalParametricStatement(
  templateId: ParametricQuestionTemplateId,
): string {
  return resolveTemplateDefinition(templateId).buildCanonicalStatement();
}

export function generateParametricQuestionInstance(
  config: ParametricQuestionConfig,
  options?: GenerateInstanceOptions,
): ParametricGeneratedQuestionInstance {
  const template = resolveTemplateDefinition(config.templateId);
  const variantKey = randomPick(template.variantKeys);

  return buildGeneratedInstance(template, config, variantKey, options);
}

export function generateDistinctParametricQuestionInstances(
  config: ParametricQuestionConfig,
  quantity: number,
  options?: GenerateInstanceOptions,
): ParametricGeneratedQuestionInstance[] | null {
  const template = resolveTemplateDefinition(config.templateId);

  if (quantity > template.variantKeys.length) {
    return null;
  }

  const selectedVariantKeys = shuffleItems(template.variantKeys).slice(
    0,
    quantity,
  );

  return selectedVariantKeys.map((variantKey) =>
    buildGeneratedInstance(template, config, variantKey, options),
  );
}

export function isParametricQuestionTemplateId(
  value: unknown,
): value is ParametricQuestionTemplateId {
  return Object.values(ParametricQuestionTemplateId).includes(
    value as ParametricQuestionTemplateId,
  );
}

export function buildCanonicalParametricQuestionStatement(
  config: ParametricQuestionConfig,
): string {
  return buildCanonicalParametricStatement(config.templateId);
}
