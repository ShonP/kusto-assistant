import styled from '@emotion/styled'

export const Container = styled.div`
  position: fixed;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 2147483647;
  width: 320px;
  max-width: 320px;
  box-sizing: border-box;
  overflow: hidden;
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: ${({ theme }) => theme.fontSize.lg};
`
