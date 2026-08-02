import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      en: {
        translation: {
          "greeting": "Hello",
          "button.click": "Click Me",
          "description": "This is a component description."
        }
      },
      fr: {
        translation: {
          "greeting": "Bonjour",
          "button.click": "Cliquez-moi",
          "description": "Ceci est la description d'un composant."
        }
      }
    }
  });

export default i18n;
