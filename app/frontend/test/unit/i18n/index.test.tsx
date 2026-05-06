import { beforeEach, describe, expect, it, vi } from "vitest";
import { LANGUAGE_STORAGE_KEY } from "../../../src/constants/app";
import { en } from "../../../src/i18n/resources/en";
import { es } from "../../../src/i18n/resources/es";

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

  it("contains the quiz access and groups import keys used by visible screens", () => {
    expect(es.quizAccess.parametricAnswerValidation.unsupported_identifier).toBe(
      "Solo se admiten pi, π y sqrt en respuestas paramétricas.",
    );
    expect(es.quizAccess.catalog.itemsExhausted).toBe(
      "No quedan intentos disponibles para este cuestionario.",
    );
    expect(es.groups.import.title).toBe("Importar estudiantes");
    expect(es.groups.import.rawTextLabel).toBe("CSV o texto plano");
    expect(es.groups.import.helper).toContain("identificadores UO");
    expect(es.groups.import.uploadAction).toBe("Subir archivo");
    expect(es.groups.import.importAction).toBe("Importar estudiantes");

    expect(en.quizAccess.parametricAnswerValidation.unsupported_identifier).toBe(
      "Only pi, π and sqrt are supported in parametric answers.",
    );
    expect(en.quizAccess.catalog.itemsExhausted).toBe(
      "There are no attempts remaining for this quiz.",
    );
    expect(en.groups.import.title).toBe("Import students");
  });
});
