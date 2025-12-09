import styled from '@emotion/styled'

export const Container = styled.div`
  margin-block-start: ${({ theme }) => theme.spacing.md};
  padding-block-start: ${({ theme }) => theme.spacing.md};
  border-block-start: 1px solid ${({ theme }) => theme.colors.border};
`

export const Title = styled.div`
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-block-end: ${({ theme }) => theme.spacing.sm};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const Item = styled.div`
  display: grid;
  grid-template-columns: 20px 1fr auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSize.md};
  padding: 6px ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`

export const CheckIcon = styled.span<{ $isUp: boolean }>`
  font-weight: bold;
  text-align: center;
  color: ${({ theme, $isUp }) => ($isUp ? theme.colors.success : theme.colors.error)};
`

export const CheckName = styled.span`
  color: ${({ theme }) => theme.colors.text};
`

export const CheckStatus = styled.span<{ $isUp: boolean }>`
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: 500;
  padding-block: 2px;
  padding-inline: 6px;
  border-radius: 3px;
  background-color: ${({ theme, $isUp }) => ($isUp ? theme.colors.successBg : theme.colors.errorBg)};
  color: ${({ theme, $isUp }) => ($isUp ? theme.colors.success : theme.colors.error)};
`

export const CheckError = styled.div`
  grid-column: 1 / -1;
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.error};
  background-color: ${({ theme }) => theme.colors.errorBg};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: 3px;
  margin-block-start: ${({ theme }) => theme.spacing.xs};
  word-break: break-word;
`
