const commonTheme = {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
  },
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
  },
  fontSize: {
    xs: '11px',
    sm: '12px',
    md: '13px',
    lg: '14px',
    xl: '18px',
  },
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
  fontFamilyMono: "'SF Mono', Monaco, 'Cascadia Code', monospace",
}

export const lightTheme = {
  ...commonTheme,
  colors: {
    background: '#ffffff',
    surface: '#f5f5f5',
    surfaceHover: '#e5e5e5',
    text: '#1a1a1a',
    textSecondary: '#666666',
    textMuted: '#808080',
    border: '#e5e5e5',
    accent: '#3b82f6',
    success: '#22c55e',
    successBg: 'rgba(34, 197, 94, 0.1)',
    warning: '#fbbf24',
    warningBg: 'rgba(251, 191, 36, 0.1)',
    error: '#ef4444',
    errorBg: 'rgba(239, 68, 68, 0.1)',
    code: '#1a1a1a',
    codeBg: '#f5f5f5',
  },
}

export const darkTheme = {
  ...commonTheme,
  colors: {
    background: '#1a1a1a',
    surface: '#252525',
    surfaceHover: '#3a3a3a',
    text: '#e5e5e5',
    textSecondary: '#a0a0a0',
    textMuted: '#808080',
    border: '#3a3a3a',
    accent: '#3b82f6',
    success: '#22c55e',
    successBg: 'rgba(34, 197, 94, 0.2)',
    warning: '#fbbf24',
    warningBg: 'rgba(251, 191, 36, 0.2)',
    error: '#ef4444',
    errorBg: 'rgba(239, 68, 68, 0.2)',
    code: '#22c55e',
    codeBg: '#1a1a1a',
  },
}

export type AppTheme = typeof darkTheme
