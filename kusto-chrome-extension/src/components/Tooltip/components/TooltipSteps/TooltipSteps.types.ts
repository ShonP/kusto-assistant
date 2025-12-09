import type { IStep } from '../../../../types/content.types'

export interface ITooltipStepsProps {
  steps: IStep[]
  expanded: boolean
  onToggle: () => void
}
