import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { LANGUAGE_STORAGE_KEY } from "../constants/app";
import { en } from "./resources/en";
import { es } from "./resources/es";

const fallbackLanguage = "es";
const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
const language =
  storedLanguage === "en" || storedLanguage === "es"
    ? storedLanguage
    : fallbackLanguage;

void i18n.use(initReactI18next).init({
  lng: language,
  fallbackLng: fallbackLanguage,
  interpolation: {
    escapeValue: false,
  },
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
});

i18n.on("languageChanged", (nextLanguage) => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
});

export default i18n;
