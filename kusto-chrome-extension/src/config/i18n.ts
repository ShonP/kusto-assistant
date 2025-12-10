import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '../locales/en.json'
import he from '../locales/he.json'

const LANGUAGE_STORAGE_KEY = 'ctrlk-language'

const getStoredLanguage = (): string => {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (stored === 'en' || stored === 'he') {
      return stored
    }
  } catch {
    // localStorage not available
  }
  return 'en'
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    he: { translation: he },
  },
  lng: getStoredLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lng)
  } catch {
    // localStorage not available
  }
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    chrome.storage.local.set({ [LANGUAGE_STORAGE_KEY]: lng })
  }
})

if (typeof chrome !== 'undefined' && chrome.storage?.local) {
  chrome.storage.local.get([LANGUAGE_STORAGE_KEY], (result) => {
    const stored = result[LANGUAGE_STORAGE_KEY]
    if ((stored === 'en' || stored === 'he') && stored !== i18n.language) {
      i18n.changeLanguage(stored)
    }
  })

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes[LANGUAGE_STORAGE_KEY]) {
      const newLang = changes[LANGUAGE_STORAGE_KEY].newValue
      if ((newLang === 'en' || newLang === 'he') && newLang !== i18n.language) {
        i18n.changeLanguage(newLang)
      }
    }
  })
}

export default i18n
