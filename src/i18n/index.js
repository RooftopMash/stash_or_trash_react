import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

// All unique language codes from your countryLanguageMap.js, plus English ('en') for fallback
const supportedLngs = [
  "en", "ps", "sv", "sq", "ar", "sm", "ca", "pt", "hy", "nl", "de", "az", "bn", "be", "es", "fr", "dz",
  "bs", "tn", "no", "ms", "bg", "rn", "km", "zh", "rar", "hr", "el", "cs", "da", "aa", "ti", "et", "am",
  "fo", "fj", "fi", "wo", "ka", "ak", "kl", "ch", "gu", "ht", "is", "hi", "id", "fa", "ga", "gv", "he",
  "jam", "ja", "kk", "sw", "gil", "ko", "ky", "lo", "lv", "st", "kpe", "lb", "mg", "ny", "dv", "bm",
  "mt", "mh", "ro", "mn", "sr", "my", "af", "na", "ne", "mi", "niu", "mk", "ur", "pau", "tpi", "gn",
  "tl", "pl", "lg", "uk", "cy", "bem", "sn", "si", "ss", "sk", "sl", "pis", "so", "zu", "tet", "tk",
  "tvl", "bi", "vi", "crs", "men", "kea", "kwy", "srl", "bem", "bem", "bem", "bem"
  // If your mapping has any new/rare codes, just add them here!
];

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs,
    interpolation: { escapeValue: false },
    backend: {
      loadPath: "/locales/{{lng}}.json"
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag", "querystring", "cookie"],
      caches: ["localStorage"]
    }
  });

export default i18n;
