import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import language files
import enTranslations from './locales/en.json';
import frTranslations from './locales/fr.json';
import rwTranslations from './locales/rw.json';

const resources = {
  en: {
    translation: enTranslations
  },
  fr: {
    translation: frTranslations
  },
  rw: {
    translation: rwTranslations
  }
};

i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Default language
    debug: false, // Set to true for development
    
    interpolation: {
      escapeValue: false // React already escapes values
    },
    
    detection: {
      // Options for language detection
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;