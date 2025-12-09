import { createContext, useContext, useState, useEffect, useCallback, type FC, type ReactNode } from 'react'
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react'
import { darkTheme, lightTheme, type AppTheme } from '../constants/theme'

type ThemeMode = 'light' | 'dark' | 'system'

interface IThemeContextValue {
  isDark: boolean
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
}

interface IThemeProviderProps {
  children: ReactNode
}

const THEME_STORAGE_KEY = 'ctrlk-theme-mode'

const getSystemPreference = (): boolean => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return true
}

const getStoredThemeMode = (): ThemeMode => {
  if (typeof window !== 'undefined' && typeof chrome !== 'undefined' && chrome.storage) {
    return 'system'
  }
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
  } catch {
    // localStorage not available
  }
  return 'system'
}

const ThemeContext = createContext<IThemeContextValue | null>(null)

export const ThemeProvider: FC<IThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getStoredThemeMode)
  const [systemIsDark, setSystemIsDark] = useState(getSystemPreference)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => setSystemIsDark(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get([THEME_STORAGE_KEY], (result) => {
        const stored = result[THEME_STORAGE_KEY]
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setThemeModeState(stored)
        }
      })

      const handleStorageChange = (
        changes: { [key: string]: chrome.storage.StorageChange },
        areaName: string
      ) => {
        if (areaName === 'local' && changes[THEME_STORAGE_KEY]) {
          const newValue = changes[THEME_STORAGE_KEY].newValue
          if (newValue === 'light' || newValue === 'dark' || newValue === 'system') {
            setThemeModeState(newValue)
          }
        }
      }

      chrome.storage.onChanged.addListener(handleStorageChange)
      return () => chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode)
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ [THEME_STORAGE_KEY]: mode })
    } else {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, mode)
      } catch {
        // localStorage not available
      }
    }
  }, [])

  const isDark = themeMode === 'system' ? systemIsDark : themeMode === 'dark'
  const theme = isDark ? darkTheme : lightTheme

  return (
    <ThemeContext.Provider value={{ isDark, themeMode, setThemeMode }}>
      <EmotionThemeProvider theme={theme}>{children}</EmotionThemeProvider>
    </ThemeContext.Provider>
  )
}

export const useThemeMode = (): IThemeContextValue => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider')
  }
  return context
}

declare module '@emotion/react' {
  export interface Theme extends AppTheme {}
}
