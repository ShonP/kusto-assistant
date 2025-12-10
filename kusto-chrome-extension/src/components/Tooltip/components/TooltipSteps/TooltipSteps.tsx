import { useMemo, type FC } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { JsonView, darkStyles, defaultStyles } from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'
import { useThemeMode } from '../../../../hooks/useTheme'
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
} from './TooltipSteps.style'

const parseJsonData = (data: string): object | Array<unknown> => {
  try {
    return JSON.parse(data) as object | Array<unknown>
  } catch {
    return { raw: data }
  }
}

export const TooltipSteps: FC<ITooltipStepsProps> = ({ steps, expanded, onToggle, isComplete }) => {
  const { t } = useTranslation()
  const { isDark } = useThemeMode()

  const jsonStyle = useMemo(() => (isDark ? darkStyles : defaultStyles), [isDark])

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
          {reasonedLabel} · {toggleLabel}
        </span>
      </Toggle>
      <StepsListContainer $expanded={expanded}>
        {steps.map((step, index) => (
          <StepItemContainer key={index} $index={index}>
            <StepIconContainer>{step.icon}</StepIconContainer>
            <StepContentContainer>
              <StepTitleText>{step.title}</StepTitleText>
              {step.description && <StepDescription>{step.description}</StepDescription>}
              {step.data && (
                <StepDataContainer>
                  <JsonView data={parseJsonData(step.data)} style={jsonStyle} />
                </StepDataContainer>
              )}
            </StepContentContainer>
          </StepItemContainer>
        ))}
      </StepsListContainer>
    </StepsSectionContainer>
  )
}
