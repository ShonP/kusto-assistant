import type { FC } from 'react'
import { ResultContainer } from './TooltipResult.style'
import type { ITooltipResultProps } from './TooltipResult.types'

export const TooltipResult: FC<ITooltipResultProps> = ({ result, hasError }) => {
  return <ResultContainer $hasError={hasError}>{result}</ResultContainer>
}
