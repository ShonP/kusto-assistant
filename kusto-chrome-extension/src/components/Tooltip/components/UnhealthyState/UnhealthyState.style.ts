import styled from '@emotion/styled'

export const UnhealthyWrapper = styled.div`
  text-align: center;
`

export const ErrorIconWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-block-end: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.warning};
`

export const ErrorTitleText = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.error};
  margin-block-end: ${({ theme }) => theme.spacing.xs};
`

export const ErrorMessageText = styled.div`
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-block-end: ${({ theme }) => theme.spacing.md};
`

export const DockerBlockWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm};
  margin-block-end: ${({ theme }) => theme.spacing.md};
`

export const DockerCodeText = styled.code`
  font-family: ${({ theme }) => theme.fontFamilyMono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.code};
  word-break: break-all;
`

export const RetryActionButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.surfaceHover};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSize.sm};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.border};
  }
`
