import { beforeEach, describe, expect, it, vi } from "vitest";
import { LANGUAGE_STORAGE_KEY } from "../../../src/constants/app";

describe("i18n index", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    localStorage.clear();
  });

  async function importModule() {
    let languageChangedHandler: ((nextLanguage: string) => void) | undefined;

    const i18nMock = {
      use: vi.fn().mockReturnThis(),
      init: vi.fn().mockResolvedValue(undefined),
      on: vi.fn((event: string, handler: (nextLanguage: string) => void) => {
        if (event === "languageChanged") {
          languageChangedHandler = handler;
        }

        return i18nMock;
      }),
    };

    vi.doMock("i18next", () => ({
      default: i18nMock,
    }));

    const initReactI18next = { type: "3rdParty", init: vi.fn() };
    vi.doMock("react-i18next", () => ({
      initReactI18next,
    }));

    const module = await import("../../../src/i18n/index");

    return {
      module,
      i18nMock,
      initReactI18next,
      triggerLanguageChanged(nextLanguage: string) {
        if (!languageChangedHandler) {
          throw new Error("languageChanged handler was not registered");
        }

        languageChangedHandler(nextLanguage);
      },
    };
  }

  it("initializes with the stored supported language", async () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, "en");

    const { module, i18nMock, initReactI18next } = await importModule();

    expect(module.default).toBe(i18nMock);
    expect(i18nMock.use).toHaveBeenCalledWith(initReactI18next);
    expect(i18nMock.init).toHaveBeenCalledWith(
      expect.objectContaining({
        lng: "en",
        fallbackLng: "es",
        interpolation: { escapeValue: false },
        resources: expect.objectContaining({
          en: expect.any(Object),
          es: expect.any(Object),
        }),
      }),
    );
    expect(i18nMock.on).toHaveBeenCalledWith(
      "languageChanged",
      expect.any(Function),
    );
  });

  it("falls back to spanish and persists language changes", async () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, "fr");

    const { i18nMock, triggerLanguageChanged } = await importModule();

    expect(i18nMock.init).toHaveBeenCalledWith(
      expect.objectContaining({
        lng: "es",
      }),
    );

    triggerLanguageChanged("en");

    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("en");
  });
});
