import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { API_PORT } from '../../config'
import type { ITooltipProps } from '../../types/content.types'
import { useTooltip } from './Tooltip.hooks'
import { Container } from './Tooltip.style'
import {
  TooltipHeader,
  TooltipStatus,
  TooltipResult,
  TooltipSteps,
  TooltipActions,
  UnhealthyState,
} from './components'

const DOCKER_COMMAND = `docker run -p ${API_PORT}:${API_PORT} kusto-agent`

export const Tooltip: FC<ITooltipProps> = ({ target, onClose }) => {
  const { t } = useTranslation()

  const {
    isHealthy,
    healthMessage,
    status,
    result,
    hasError,
    steps,
    isComplete,
    stepsExpanded,
    copied,
    position,
    handleRetry,
    handleCopy,
    toggleSteps,
  } = useTooltip({ target })

  if (isHealthy === false) {
    return (
      <Container style={{ top: position.top, left: position.left }}>
        <TooltipHeader title={t('tooltip.title')} onClose={onClose} />
        <UnhealthyState
          message={healthMessage}
          dockerCommand={DOCKER_COMMAND}
          onRetry={handleRetry}
        />
      </Container>
    )
  }

  return (
    <Container style={{ top: position.top, left: position.left }}>
      <TooltipHeader title={t('tooltip.title')} onClose={onClose} />

      {!isComplete && !result && <TooltipStatus status={status} />}

      {result && <TooltipResult result={result} hasError={hasError} />}

      <TooltipSteps steps={steps} expanded={stepsExpanded} onToggle={toggleSteps} />

      {isComplete && result && !hasError && (
        <TooltipActions result={result} copied={copied} onCopy={handleCopy} />
      )}
    </Container>
  )
}
