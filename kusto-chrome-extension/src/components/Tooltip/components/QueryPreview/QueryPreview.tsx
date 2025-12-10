import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Code } from 'lucide-react'
import { useThemeMode } from '../../../../hooks/useTheme'
import { tokenizeKql, getTokenColor } from '../../../../utils/kql-highlighter'
import { PreviewContainer, PreviewHeader, PreviewCode, TokenSpan } from './QueryPreview.style'
import type { IQueryPreviewProps } from './QueryPreview.types'

export const QueryPreview: FC<IQueryPreviewProps> = ({ query }) => {
  const { t } = useTranslation()
  const { isDark } = useThemeMode()
  const tokens = tokenizeKql(query)

  return (
    <PreviewContainer>
      <PreviewHeader>
        <Code size={12} />
        {t('tooltip.generatedQuery')}
      </PreviewHeader>
      <PreviewCode>
        {tokens.map((token, idx) => (
          <TokenSpan key={idx} $color={getTokenColor(token.type, isDark)}>
            {token.text}
          </TokenSpan>
        ))}
      </PreviewCode>
    </PreviewContainer>
  )
}
