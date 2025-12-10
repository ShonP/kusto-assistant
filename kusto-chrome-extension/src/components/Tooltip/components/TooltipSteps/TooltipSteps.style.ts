import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'

const slideDown = keyframes`
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    max-height: 150px;
    transform: translateY(0);
  }
`

const stepFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`

const iconBounce = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
`

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
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  svg {
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  &:hover svg {
    transform: translateX(2px);
  }
`

export const StepsListContainer = styled.div<{ $expanded: boolean }>`
  display: ${({ $expanded }) => ($expanded ? 'block' : 'none')};
  margin-block-start: ${({ theme }) => theme.spacing.sm};
  max-height: 150px;
  overflow-y: auto;
  direction: ltr;
  animation: ${slideDown} 0.3s cubic-bezier(0.16, 1, 0.3, 1);
`

export const StepItemContainer = styled.div<{ $index?: number }>`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-block-end: 1px solid ${({ theme }) => theme.colors.border};
  max-height: 200px;
  overflow-y: auto;
  animation: ${stepFadeIn} 0.3s cubic-bezier(0.16, 1, 0.3, 1) ${({ $index = 0 }) => $index * 50}ms both;
  transition: background-color 0.15s ease;

  &:last-child {
    border-block-end: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.surface};
  }
`

export const StepIconContainer = styled.span`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  animation: ${iconBounce} 0.4s cubic-bezier(0.16, 1, 0.3, 1);
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

export const StepDataContainer = styled.div`
  margin-block-start: ${({ theme }) => theme.spacing.xs};
  max-height: 120px;
  overflow: auto;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.codeBg};
  padding: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSize.xs};
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent}66;
  }
`
