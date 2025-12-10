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

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`

const textShimmer = keyframes`
  0% {
    background-position: -100% 0;
  }
  100% {
    background-position: 200% 0;
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
  animation: ${slideInLeft} 0.3s cubic-bezier(0.16, 1, 0.3, 1);
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
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.textSecondary} 0%,
    ${({ theme }) => theme.colors.text} 50%,
    ${({ theme }) => theme.colors.textSecondary} 100%
  );
  background-size: 200% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${textShimmer} 2s linear infinite;
`
