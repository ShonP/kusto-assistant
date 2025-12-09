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
  StepDataContainer,
  StepDataBlock,
} from './TooltipSteps.style'

const formatJsonData = (data: string): string => {
  try {
    const parsed = JSON.parse(data)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return data
  }
}

export const TooltipSteps: FC<ITooltipStepsProps> = ({ steps, expanded, onToggle, isComplete }) => {
  const { t } = useTranslation()

  if (steps.length === 0 || !isComplete) {
    return null
  }

  const reasonedLabel = steps.length === 1
    ? t('tooltip.reasonedInStep', { count: steps.length })
    : t('tooltip.reasonedInSteps', { count: steps.length })
  const toggleLabel = expanded ? t('common.collapse') : t('common.expand')

  return (
    <StepsSectionContainer>
      <Toggle onClick={onToggle}>
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span>
          {reasonedLabel} ({toggleLabel})
        </span>
      </Toggle>
      <StepsListContainer $expanded={expanded}>
        {steps.map((step, index) => (
          <StepItemContainer key={index}>
            <StepIconContainer>{step.icon}</StepIconContainer>
            <StepContentContainer>
              <StepTitleText>{step.title}</StepTitleText>
              {step.description && <StepDescription>{step.description}</StepDescription>}
              {step.data && (
                <StepDataContainer>
                  <StepDataBlock>{formatJsonData(step.data)}</StepDataBlock>
                </StepDataContainer>
              )}
            </StepContentContainer>
          </StepItemContainer>
        ))}
      </StepsListContainer>
    </StepsSectionContainer>
  )
}
