import styled from '@emotion/styled'

export const HeaderContainer = styled.div<{ $isDragging?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-block-end: ${({ theme }) => theme.spacing.sm};
  cursor: ${({ $isDragging }) => ($isDragging ? 'grabbing' : 'grab')};
  user-select: none;
`

export const Title = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

export const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text};
  }
`
