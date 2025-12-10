import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

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
  animation: ${fadeInUp} 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.accent}33;
  }
`

export const TokenSpan = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
`
