import styled from '@emotion/styled'

export const TabsContainer = styled.div`
  display: flex;
  border-block-end: 1px solid ${({ theme }) => theme.colors.border};
  margin-block-end: ${({ theme }) => theme.spacing.md};
`

export const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: transparent;
  border: none;
  border-block-end: 2px solid ${({ theme, $active }) =>
    $active ? theme.colors.accent : 'transparent'};
  color: ${({ theme, $active }) => ($active ? theme.colors.text : theme.colors.textMuted)};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.surfaceHover};
  }
`
