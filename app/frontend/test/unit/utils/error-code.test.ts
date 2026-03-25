import { describe, expect, it } from "vitest";
import type { TFunction } from "i18next";
import { ApiError } from "../../../src/services/http/api-client";
import { getErrorMessage } from "../../../src/utils/error-code";

function createTranslator(map: Record<string, string>): TFunction {
  return ((key: string, options?: { defaultValue?: string }) =>
    map[key] ?? options?.defaultValue ?? key) as TFunction;
}

describe("getErrorMessage", () => {
  it("returns translated api error code when available", () => {
    const t = createTranslator({
      "errors.codes.auth.unauthorized": "No autorizado",
      "errors.generic": "Genérico",
    });

    const message = getErrorMessage(
      t,
      new ApiError({
        statusCode: 401,
        code: "auth.unauthorized",
        message: "Authentication required",
      }),
    );

    expect(message).toBe("No autorizado");
  });

  it("falls back to generic translation for api error without translation", () => {
    const t = createTranslator({ "errors.generic": "Error genérico" });

    const message = getErrorMessage(
      t,
      new ApiError({
        statusCode: 500,
        code: "common.internal_error",
        message: "Unexpected error",
      }),
    );

    expect(message).toBe("Error genérico");
  });

  it("returns native error message for generic errors", () => {
    const t = createTranslator({ "errors.generic": "Error genérico" });

    expect(getErrorMessage(t, new Error("Fallo de red"))).toBe("Fallo de red");
  });

  it("returns generic translation for unknown values", () => {
    const t = createTranslator({ "errors.generic": "Error genérico" });

    expect(getErrorMessage(t, { bad: true })).toBe("Error genérico");
  });
});
