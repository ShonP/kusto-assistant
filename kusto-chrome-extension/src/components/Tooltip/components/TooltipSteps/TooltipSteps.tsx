import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronRight, ChevronDown } from 'lucide-react'
import type { ITooltipStepsProps } from './TooltipSteps.types'
import {
  StepsSectionContainer,
  Toggle,
  StepsListContainer,
  StepItemContainer,
  StepIconContainer,
  StepContentContainer,
  StepTitleText,
  StepDescription,
  StepDataBlock,
} from './TooltipSteps.style'

export const TooltipSteps: FC<ITooltipStepsProps> = ({ steps, expanded, onToggle }) => {
  const { t } = useTranslation()

  if (steps.length === 0) {
    return null
  }

  const stepsLabel = steps.length > 1 ? t('tooltip.steps') : t('tooltip.step')
  const toggleLabel = expanded ? t('common.collapse') : t('common.expand')

  return (
    <StepsSectionContainer>
      <Toggle onClick={onToggle}>
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span>
          {steps.length} {stepsLabel} ({toggleLabel})
        </span>
      </Toggle>
      <StepsListContainer $expanded={expanded}>
        {steps.map((step, index) => (
          <StepItemContainer key={index}>
            <StepIconContainer>{step.icon}</StepIconContainer>
            <StepContentContainer>
              <StepTitleText>{step.title}</StepTitleText>
              {step.description && <StepDescription>{step.description}</StepDescription>}
              {step.data && <StepDataBlock>{step.data}</StepDataBlock>}
            </StepContentContainer>
          </StepItemContainer>
        ))}
      </StepsListContainer>
    </StepsSectionContainer>
  )
}
