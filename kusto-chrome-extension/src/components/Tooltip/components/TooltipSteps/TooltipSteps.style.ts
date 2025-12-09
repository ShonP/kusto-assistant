import styled from '@emotion/styled'

export const StepsSectionContainer = styled.div`
  margin-block-start: ${({ theme }) => theme.spacing.sm};
`

export const Toggle = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs} 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSize.sm};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`

export const StepsListContainer = styled.div<{ $expanded: boolean }>`
  display: ${({ $expanded }) => ($expanded ? 'block' : 'none')};
  margin-block-start: ${({ theme }) => theme.spacing.sm};
  max-height: 150px;
  overflow-y: auto;
`

export const StepItemContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xs} 0;
  border-block-end: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-block-end: none;
  }
`

export const StepIconContainer = styled.span`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
`

export const StepContentContainer = styled.div`
  flex: 1;
  min-width: 0;
`

export const StepTitleText = styled.div`
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`

export const StepDescription = styled.div`
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`

export const StepDataBlock = styled.pre`
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  margin-block-start: ${({ theme }) => theme.spacing.xs};
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
`
