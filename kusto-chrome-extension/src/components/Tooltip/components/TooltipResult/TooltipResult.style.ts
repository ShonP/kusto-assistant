import styled from '@emotion/styled'

export const ResultContainer = styled.div<{ $hasError?: boolean }>`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-family: ${({ theme }) => theme.fontFamilyMono};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme, $hasError }) => ($hasError ? theme.colors.error : theme.colors.text)};
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
`
