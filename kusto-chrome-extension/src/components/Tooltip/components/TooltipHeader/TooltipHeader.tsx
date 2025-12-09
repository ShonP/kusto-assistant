import type { FC } from 'react'
import { X } from 'lucide-react'
import { HeaderContainer, Title, CloseButton } from './TooltipHeader.style'
import type { ITooltipHeaderProps } from './TooltipHeader.types'

export const TooltipHeader: FC<ITooltipHeaderProps> = ({ title, onClose }) => {
  return (
    <HeaderContainer>
      <Title>{title}</Title>
      <CloseButton onClick={onClose} aria-label="close">
        <X size={16} />
      </CloseButton>
    </HeaderContainer>
  )
}
