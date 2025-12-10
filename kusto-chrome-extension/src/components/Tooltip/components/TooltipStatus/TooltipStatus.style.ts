import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.85;
  }
`

const ripple = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.4;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
`

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 4px 1px currentColor;
  }
  50% {
    box-shadow: 0 0 8px 2px currentColor;
  }
`

export const StatusContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  direction: ltr;
`

export const PulsingDotWrapper = styled.div`
  position: relative;
  width: 16px;
  height: 16px;
  min-width: 16px;
  min-height: 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const PulsingDot = styled.div`
  position: relative;
  width: 8px;
  height: 8px;
  background-color: ${({ theme }) => theme.colors.success};
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.success};
  animation: 
    ${pulse} 1.5s ease-in-out infinite,
    ${glow} 1.5s ease-in-out infinite;

  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.success};
  }

  &::before {
    animation: ${ripple} 1.5s ease-out infinite;
  }

  &::after {
    animation: ${ripple} 1.5s ease-out infinite 0.5s;
  }
`

export const StatusText = styled.span`
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`
