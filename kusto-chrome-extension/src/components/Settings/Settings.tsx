import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Sun, Moon, Monitor, Languages } from 'lucide-react'
import { useThemeMode } from '../../hooks/useTheme'
import {
  Container,
  Section,
  SectionTitle,
  SectionDescription,
  ThemeOptions,
  ThemeButton,
} from './Settings.style'
import type { ISettingsProps } from './Settings.types'

export const Settings: FC<ISettingsProps> = () => {
  const { t, i18n } = useTranslation()
  const { themeMode, setThemeMode } = useThemeMode()
  const currentLanguage = i18n.language

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang)
  }

  return (
    <Container>
      <Section>
        <SectionTitle>{t('settings.theme')}</SectionTitle>
        <SectionDescription>{t('settings.themeDescription')}</SectionDescription>
        <ThemeOptions>
          <ThemeButton
            $active={themeMode === 'light'}
            onClick={() => setThemeMode('light')}
          >
            <Sun size={16} />
            {t('settings.light')}
          </ThemeButton>
          <ThemeButton
            $active={themeMode === 'dark'}
            onClick={() => setThemeMode('dark')}
          >
            <Moon size={16} />
            {t('settings.dark')}
          </ThemeButton>
          <ThemeButton
            $active={themeMode === 'system'}
            onClick={() => setThemeMode('system')}
          >
            <Monitor size={16} />
            {t('settings.system')}
          </ThemeButton>
        </ThemeOptions>
      </Section>

      <Section>
        <SectionTitle>
          <Languages size={16} />
          {t('settings.language')}
        </SectionTitle>
        <SectionDescription>{t('settings.languageDescription')}</SectionDescription>
        <ThemeOptions>
          <ThemeButton
            $active={currentLanguage === 'en'}
            onClick={() => handleLanguageChange('en')}
          >
            {t('settings.english')}
          </ThemeButton>
          <ThemeButton
            $active={currentLanguage === 'he'}
            onClick={() => handleLanguageChange('he')}
          >
            {t('settings.hebrew')}
          </ThemeButton>
        </ThemeOptions>
      </Section>
    </Container>
  )
}
