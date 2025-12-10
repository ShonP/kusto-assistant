export interface ITooltipHeaderProps {
  title: string
  onClose: () => void
  onDragStart?: (e: React.MouseEvent) => void
  isDragging?: boolean
}
