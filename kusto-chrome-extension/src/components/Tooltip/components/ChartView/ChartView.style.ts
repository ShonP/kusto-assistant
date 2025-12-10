import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const growBar = keyframes`
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
`

const growPie = keyframes`
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
`

export const ChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  animation: ${fadeIn} 0.2s ease-out;
`

export const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.warning};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: 500;
`

export const ChartTitle = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSize.xs};
`

export const BarChartContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.xs};
  height: 100px;
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`

export const BarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  flex: 1;
  min-width: 0;
`

export const Bar = styled.div<{ $height: number; $delay: number }>`
  width: 100%;
  max-width: 40px;
  height: ${({ $height }) => $height}%;
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.accent} 0%,
    ${({ theme }) => theme.colors.success} 100%
  );
  border-radius: ${({ theme }) => theme.borderRadius.sm} ${({ theme }) => theme.borderRadius.sm} 0 0;
  transform-origin: bottom;
  animation: ${growBar} 0.4s ease-out ${({ $delay }) => $delay}ms both;
`

export const BarLabel = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const BarValue = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
`

export const PieChartContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`

export const PieChart = styled.div<{ $gradient: string }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: conic-gradient(${({ $gradient }) => $gradient});
  animation: ${growPie} 0.4s ease-out;
`

export const PieLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  flex: 1;
`

export const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSize.xs};
`

export const LegendColor = styled.div<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background-color: ${({ $color }) => $color};
`

export const LegendLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const LegendValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
`

export const LineChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`

export const LineChartSvg = styled.svg`
  width: 100%;
  height: 100px;
`

export const LineChartPath = styled.path`
  fill: none;
  stroke: ${({ theme }) => theme.colors.accent};
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
`

export const LineChartArea = styled.path`
  fill: ${({ theme }) => theme.colors.accent};
  opacity: 0.1;
`

export const LineChartDot = styled.circle`
  fill: ${({ theme }) => theme.colors.accent};
  stroke: ${({ theme }) => theme.colors.surface};
  stroke-width: 2;
`

export const LineChartLabels = styled.div`
  display: flex;
  justify-content: space-between;
  padding-inline: ${({ theme }) => theme.spacing.xs};
`

export const LineChartLabel = styled.span`
  font-size: 9px;
  color: ${({ theme }) => theme.colors.textMuted};
`
