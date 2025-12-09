import type { FC } from 'react'
import { StatusContainer, Spinner, StatusText } from './TooltipStatus.style'
import type { ITooltipStatusProps } from './TooltipStatus.types'

export const TooltipStatus: FC<ITooltipStatusProps> = ({ status }) => {
  return (
    <StatusContainer>
      <Spinner />
      <StatusText>{status}</StatusText>
    </StatusContainer>
  )
}
