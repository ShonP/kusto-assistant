import { FC, useEffect } from 'react'
import { Global, css, useTheme } from '@emotion/react'
import { useTranslation } from 'react-i18next'

interface IGlobalStylesProps {
  rootId: string
}

export const GlobalStyles: FC<IGlobalStylesProps> = ({ rootId }) => {
  const theme = useTheme()
  const { i18n } = useTranslation()

  const isRTL = i18n.language === 'he'

  useEffect(() => {
    const rootEl = document.getElementById(rootId)
    if (rootEl) {
      rootEl.dir = isRTL ? 'rtl' : 'ltr'
      rootEl.lang = i18n.language
    }
  }, [isRTL, i18n.language, rootId])

  return (
    <Global
      styles={css`
        #${rootId} {
          direction: ${isRTL ? 'rtl' : 'ltr'};
          font-family: ${theme.fontFamily};
          background-color: ${theme.colors.background};
          color: ${theme.colors.text};
        }

        #${rootId} *,
        #${rootId} *::before,
        #${rootId} *::after {
          box-sizing: border-box;
        }
      `}
    />
  )
}
