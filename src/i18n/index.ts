import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';

export const resources = {
  en: { translation: en },
} as const;

export const SUPPORTED_LANGUAGES = Object.keys(resources);

function deviceLanguage(): string {
  try {
    const code = getLocales()[0]?.languageCode;
    return code && SUPPORTED_LANGUAGES.includes(code) ? code : 'en';
  } catch {
    return 'en';
  }
}

/** BCP-47 tag of the device locale, used for date formatting. */
export function deviceLocaleTag(): string {
  try {
    return getLocales()[0]?.languageTag ?? 'en';
  } catch {
    return 'en';
  }
}

const i18n = createInstance();

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
