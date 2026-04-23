import { describe, expect, it } from "vitest";
import {
  getParametricAnswerValidationMessage,
  validateParametricAnswerInput,
} from "../../../../../src/pages/quiz-access/utils/parametric-answer-validation.util";

describe("parametric-answer-validation.util", () => {
  it("accepts supported arithmetic expressions", () => {
    expect(validateParametricAnswerInput("sqrt(2)+pi/2")).toEqual({
      isValid: true,
      normalizedValue: "sqrt(2)+pi/2",
      reason: null,
    });
  });

  it("rejects unsupported identifiers, invalid characters and unbalanced parentheses", () => {
    expect(validateParametricAnswerInput("sin(2)")).toEqual({
      isValid: false,
      normalizedValue: "sin(2)",
      reason: "unsupported_identifier",
    });
    expect(validateParametricAnswerInput("2;<script>")).toEqual({
      isValid: false,
      normalizedValue: "2;<script>",
      reason: "invalid_characters",
    });
    expect(validateParametricAnswerInput("2+(")).toEqual({
      isValid: false,
      normalizedValue: "2+(",
      reason: "unbalanced_parentheses",
    });
  });

  it("maps empty values to null helper messages", () => {
    expect(getParametricAnswerValidationMessage("")).toBeNull();
    expect(getParametricAnswerValidationMessage("   ")).toBeNull();
    expect(getParametricAnswerValidationMessage("sin(2)")).toBe(
      "unsupported_identifier",
    );
  });
});
