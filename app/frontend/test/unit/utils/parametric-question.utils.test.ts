import { describe, expect, it, vi } from "vitest";
import {
  buildCanonicalParametricStatement,
  DEFAULT_PARAMETRIC_TOLERANCE,
  generateParametricSampleInstance,
  getParametricTemplateVariantCount,
  PARAMETRIC_INPUT_PLACEHOLDER,
  PARAMETRIC_TEMPLATE_IDS,
  resolveParametricTolerance,
} from "../../../src/utils/parametric-question.utils";

describe("parametric-question.utils", () => {
  it("resolves tolerance using defaults and six decimal rounding", () => {
    expect(resolveParametricTolerance({} as never)).toBe(
      DEFAULT_PARAMETRIC_TOLERANCE,
    );
    expect(
      resolveParametricTolerance({ tolerance: 0.123456789 } as never),
    ).toBe(0.123457);
    expect(PARAMETRIC_INPUT_PLACEHOLDER).toContain("Ej.:");
  });

  it("returns canonical statements and variant counts for all supported templates", () => {
    const expectedCounts = {
      limit_trigonometric: 25,
      limit_logarithmic: 25,
      integral_logarithmic: 25,
      integral_inverse_quadratic: 10,
      series_geometric: 24,
    } as const;

    for (const templateId of PARAMETRIC_TEMPLATE_IDS) {
      const statement = buildCanonicalParametricStatement(templateId);
      expect(statement).toContain("$$");
      expect(getParametricTemplateVariantCount(templateId)).toBe(
        expectedCounts[templateId],
      );
    }
  });

  it("generates deterministic samples for every template family", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    expect(
      generateParametricSampleInstance({
        templateId: "limit_trigonometric",
      } as never),
    ).toEqual({
      statement: "$$\\lim_{x \\to 0} \\frac{\\tan(x)-1x}{x-2\\sin(x)}$$",
      correctAnswerLatex: "0",
      tolerance: DEFAULT_PARAMETRIC_TOLERANCE,
    });

    expect(
      generateParametricSampleInstance({
        templateId: "limit_logarithmic",
        tolerance: 0.5,
      } as never),
    ).toEqual({
      statement:
        "$$\\lim_{x \\to 1} \\left[\\frac{1x}{\\left(\\frac{2}{2}\\right)(x-1)}-\\frac{1}{\\left(\\frac{2}{2}\\right)\\log(x)}\\right]$$",
      correctAnswerLatex: "\\frac{1}{2}",
      tolerance: 0.5,
    });

    expect(
      generateParametricSampleInstance({
        templateId: "integral_logarithmic",
      } as never),
    ).toEqual({
      statement:
        "$$\\int_{1}^{e} \\frac{1\\log(x)}{\\left(\\frac{2}{2}\\right)x}\\,dx$$",
      correctAnswerLatex: "\\frac{1}{2}",
      tolerance: DEFAULT_PARAMETRIC_TOLERANCE,
    });

    expect(
      generateParametricSampleInstance({
        templateId: "integral_inverse_quadratic",
      } as never),
    ).toEqual({
      statement: "$$\\int_{0}^{1} \\frac{4}{1+x^2}\\,dx$$",
      correctAnswerLatex: "\\pi",
      tolerance: DEFAULT_PARAMETRIC_TOLERANCE,
    });

    expect(
      generateParametricSampleInstance({
        templateId: "series_geometric",
      } as never),
    ).toEqual({
      statement: "$$\\sum_{n=2}^{\\infty} \\left(\\frac{1}{2}\\right)^n$$",
      correctAnswerLatex: "\\frac{1}{2}",
      tolerance: DEFAULT_PARAMETRIC_TOLERANCE,
    });
  });

  it("can generate the last inverse quadratic and series variants", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999999);

    expect(
      generateParametricSampleInstance({
        templateId: "integral_inverse_quadratic",
      } as never),
    ).toEqual(
      expect.objectContaining({
        statement: "$$\\int_{0}^{10} \\frac{4}{100+x^2}\\,dx$$",
        correctAnswerLatex: "\\frac{\\pi}{10}",
      }),
    );

    expect(
      generateParametricSampleInstance({
        templateId: "series_geometric",
      } as never),
    ).toEqual(
      expect.objectContaining({
        statement: "$$\\sum_{n=2}^{\\infty} \\left(\\frac{1}{25}\\right)^n$$",
        correctAnswerLatex: "\\frac{1}{600}",
      }),
    );
  });
});
