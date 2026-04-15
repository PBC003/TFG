import type { ParametricQuestionConfig } from "../types/question";

export type ParametricTemplateId = ParametricQuestionConfig["templateId"];

export type ParametricSampleInstance = {
  statement: string;
  correctAnswerLatex: string;
  tolerance: number;
};

const DEFAULT_INPUT_PLACEHOLDER = "Ej.: 1/2, pi/4 o 0.7854";
const DEFAULT_TOLERANCE = 0.01;
const INVERSE_QUADRATIC_ALLOWED_A_VALUES = [
  1, 4, 9, 16, 25, 36, 49, 64, 81, 100,
];

export const PARAMETRIC_TEMPLATE_IDS: ParametricTemplateId[] = [
  "limit_trigonometric",
  "limit_logarithmic",
  "integral_logarithmic",
  "integral_inverse_quadratic",
  "series_geometric",
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

function simplifyFraction(numerator: number, denominator: number) {
  const divisor = gcd(numerator, denominator);
  const normalizedNumerator = numerator / divisor;
  const normalizedDenominator = denominator / divisor;

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
  return value === 1 ? "\\pi" : `\\frac{\\pi}{${value}}`;
}

export function resolveParametricTolerance(
  config: Pick<ParametricQuestionConfig, "tolerance">,
): number {
  return Number((config.tolerance ?? DEFAULT_TOLERANCE).toFixed(6));
}

export function buildCanonicalParametricStatement(
  templateId: ParametricTemplateId,
): string {
  switch (templateId) {
    case "limit_trigonometric":
      return [
        "$$\\lim_{x \\to 0} \\frac{\\tan(x)-a x}{x-b\\sin(x)}$$",
        "$a \\in \\{1,2,\\ldots,25\\}$, $b = a + 1$.",
      ].join("\n");
    case "limit_logarithmic":
      return [
        "$$\\lim_{x \\to 1} \\left[\\frac{ax}{b(x-1)}-\\frac{a}{b\\log(x)}\\right]$$",
        "$a \\in \\{1,2,\\ldots,25\\}$, $b = \\frac{a+1}{2}$.",
      ].join("\n");
    case "integral_logarithmic":
      return [
        "$$\\int_{1}^{e} \\frac{a\\log(x)}{bx}\\,dx$$",
        "$a \\in \\{1,2,\\ldots,25\\}$, $b = \\frac{a+1}{2}$.",
      ].join("\n");
    case "integral_inverse_quadratic":
      return [
        "$$\\int_{0}^{\\sqrt{a}} \\frac{4}{a+x^2}\\,dx$$",
        "$a \\in \\{1,4,9,16,25,36,49,64,81,100\\}$.",
      ].join("\n");
    case "series_geometric":
      return [
        "$$\\sum_{n=2}^{\\infty} r^n$$",
        "$r = \\frac{1}{i}$, $i \\in \\{2,3,\\ldots,25\\}$.",
      ].join("\n");
  }
}

export function generateParametricSampleInstance(
  config: ParametricQuestionConfig,
): ParametricSampleInstance {
  const tolerance = resolveParametricTolerance(config);

  switch (config.templateId) {
    case "limit_trigonometric": {
      const a = randomInt(1, 25);
      const b = a + 1;

      return {
        statement: [
          `$$\\lim_{x \\to 0} \\frac{\\tan(x)-${a}x}{x-${b}\\sin(x)}$$`,
          `$a = ${a}$, $b = ${b}$.`,
        ].join("\n"),
        correctAnswerLatex: formatFractionLatex(a - 1, b - 1),
        tolerance,
      };
    }
    case "limit_logarithmic": {
      const a = randomInt(1, 25);
      const bNumerator = a + 1;

      return {
        statement: [
          `$$\\lim_{x \\to 1} \\left[\\frac{${a}x}{\\left(\\frac{${bNumerator}}{2}\\right)(x-1)}-\\frac{${a}}{\\left(\\frac{${bNumerator}}{2}\\right)\\log(x)}\\right]$$`,
          `$a = ${a}$, $b = \\frac{${bNumerator}}{2}$.`,
        ].join("\n"),
        correctAnswerLatex: formatFractionLatex(a, bNumerator),
        tolerance,
      };
    }
    case "integral_logarithmic": {
      const a = randomInt(1, 25);
      const bNumerator = a + 1;

      return {
        statement: [
          `$$\\int_{1}^{e} \\frac{${a}\\log(x)}{\\left(\\frac{${bNumerator}}{2}\\right)x}\\,dx$$`,
          `$a = ${a}$, $b = \\frac{${bNumerator}}{2}$.`,
        ].join("\n"),
        correctAnswerLatex: formatFractionLatex(a, bNumerator),
        tolerance,
      };
    }
    case "integral_inverse_quadratic": {
      const a = randomPick(INVERSE_QUADRATIC_ALLOWED_A_VALUES);
      const sqrtA = Math.sqrt(a);

      return {
        statement: [
          `$$\\int_{0}^{${sqrtA}} \\frac{4}{${a}+x^2}\\,dx$$`,
          `$a = ${a}$.`,
        ].join("\n"),
        correctAnswerLatex: formatPiOverIntegerLatex(sqrtA),
        tolerance,
      };
    }
    case "series_geometric": {
      const i = randomInt(2, 25);

      return {
        statement: [
          "$$\\sum_{n=2}^{\\infty} r^n$$",
          `$r = \\frac{1}{${i}}$, $i = ${i}$.`,
        ].join("\n"),
        correctAnswerLatex: formatFractionLatex(1, i * (i - 1)),
        tolerance,
      };
    }
  }
}

export const PARAMETRIC_INPUT_PLACEHOLDER = DEFAULT_INPUT_PLACEHOLDER;
