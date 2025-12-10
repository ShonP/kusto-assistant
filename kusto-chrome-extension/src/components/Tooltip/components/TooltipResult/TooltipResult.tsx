import type { FC } from 'react'
import { useThemeMode } from '../../../../hooks/useTheme'
import { tokenizeKql, getTokenColor } from '../../../../utils/kql-highlighter'
import { ResultContainer, TokenSpan } from './TooltipResult.style'
import type { ITooltipResultProps } from './TooltipResult.types'

const looksLikeKql = (text: string): boolean => {
  const kqlPatterns = /\|\s*(where|project|summarize|extend|join|take|limit|top|count|render)/i
  return kqlPatterns.test(text)
}

export const TooltipResult: FC<ITooltipResultProps> = ({ result, hasError }) => {
  const { isDark } = useThemeMode()

  if (hasError || !looksLikeKql(result)) {
    return <ResultContainer $hasError={hasError}>{result}</ResultContainer>
  }

  const tokens = tokenizeKql(result)

  return (
    <ResultContainer $hasError={hasError}>
      {tokens.map((token, idx) => (
        <TokenSpan key={idx} $color={getTokenColor(token.type, isDark)}>
          {token.text}
        </TokenSpan>
      ))}
    </ResultContainer>
  )
}
