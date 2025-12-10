import type { FC } from 'react'
import { StatusContainer, PulsingDotWrapper, PulsingDot, StatusText } from './TooltipStatus.style'
import type { ITooltipStatusProps } from './TooltipStatus.types'

export const TooltipStatus: FC<ITooltipStatusProps> = ({ status }) => {
  return (
    <StatusContainer>
      <PulsingDotWrapper>
        <PulsingDot />
      </PulsingDotWrapper>
      <StatusText>{status}</StatusText>
    </StatusContainer>
  )
}
