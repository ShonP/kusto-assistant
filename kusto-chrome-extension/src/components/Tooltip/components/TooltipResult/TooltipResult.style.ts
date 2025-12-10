import styled from '@emotion/styled'

export const ResultContainer = styled.div<{ $hasError?: boolean }>`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.codeBg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-family: ${({ theme }) => theme.fontFamilyMono};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme, $hasError }) => ($hasError ? theme.colors.error : theme.colors.code)};
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
  line-height: 1.5;
  direction: ltr;
`

export const TokenSpan = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
`
