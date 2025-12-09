import styled from '@emotion/styled'

export const Indicator = styled.span<{ $status: string }>`
  font-size: ${({ theme }) => theme.fontSize.lg};
  font-weight: 500;
  padding-block: 2px;
  padding-inline: 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};

  ${({ theme, $status }) => {
    switch ($status) {
      case 'loading':
        return `
          background-color: ${theme.colors.surfaceHover};
          color: ${theme.colors.textMuted};
        `
      case 'healthy':
        return `
          background-color: ${theme.colors.successBg};
          color: ${theme.colors.success};
        `
      case 'degraded':
        return `
          background-color: ${theme.colors.warningBg};
          color: ${theme.colors.warning};
        `
      case 'unhealthy':
        return `
          background-color: ${theme.colors.errorBg};
          color: ${theme.colors.error};
        `
      default:
        return ''
    }
  }}
`
