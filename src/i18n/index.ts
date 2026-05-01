import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from './locales/es.json'
import en from './locales/en.json'
import gl from './locales/gl.json'

const storedLocale = localStorage.getItem('locale') || 'es'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
      gl: { translation: gl },
    },
    lng: storedLocale,
    fallbackLng: 'es',
    interpolation: { escapeValue: false },
  })

export default i18n
