import type { TFunction } from "i18next";
export function createT(): TFunction {
  return ((key: string) => key) as unknown as TFunction;
}
