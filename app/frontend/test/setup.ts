import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

export const tMock = (key: string, options?: { defaultValue?: string }) => {
  if (options && "defaultValue" in options) {
    return options.defaultValue ?? key;
  }

  return key;
};

export const mockI18n = {
  language: "es",
  resolvedLanguage: "es",
  changeLanguage: vi.fn(async () => undefined),
  on: vi.fn(),
  use: vi.fn().mockReturnThis(),
  init: vi.fn(async () => undefined),
};

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: tMock,
    i18n: mockI18n,
  }),
  initReactI18next: {
    type: "3rdParty",
    init: vi.fn(),
  },
}));

beforeEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();

  mockI18n.language = "es";
  mockI18n.resolvedLanguage = "es";
  mockI18n.changeLanguage.mockClear();
  mockI18n.on.mockClear();
  mockI18n.use.mockClear();
  mockI18n.use.mockReturnThis();
  mockI18n.init.mockClear();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
