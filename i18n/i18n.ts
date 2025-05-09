import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import translationEN from "public/locales/en/translation.json";
import translationES from "public/locales/es/translation.json";
import translationET from "public/locales/et/translation.json";
import translationFR from "public/locales/fr/translation.json";
import translationID from "public/locales/id/translation.json";
import { initReactI18next } from "react-i18next";
import format from "./i18n-format";

const resources = {
  en: {
    translation: translationEN,
  },
  es: {
    translation: translationES,
  },
  id: {
    translation: translationID,
  },
  et: {
    translation: translationET,
  },
  fr: {
    translation: translationFR,
  },
};
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    react: {
      useSuspense: false,
    },
    fallbackLng: "en",
    interpolation: {
      format,
    },
    supportedLngs: ["es", "en", "id", "et", "fr"],
  });

export default i18n;
