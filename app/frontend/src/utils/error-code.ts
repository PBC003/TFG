import type { TFunction } from "i18next";
import { ApiError } from "../services/http/api-client.ts";

export function getErrorMessage(t: TFunction, error: unknown): string {
  if (error instanceof ApiError) {
    const translated = t(`errors.codes.${error.code}`, { defaultValue: "" });
    return translated || t("errors.generic");
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return t("errors.generic");
}
