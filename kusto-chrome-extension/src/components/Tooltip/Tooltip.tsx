import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { API_PORT } from '../../config'
import type { ITooltipProps } from '../../types/content.types'
import { useAuth } from '../../hooks'
import { useTooltip } from './Tooltip.hooks'
import { Container } from './Tooltip.style'
import {
  TooltipHeader,
  TooltipStatus,
  TooltipResult,
  TooltipSteps,
  TooltipActions,
  UnhealthyState,
  LoginRequiredState,
  QueryPreview,
  QueryResults,
  ChartView,
} from './components'

const DOCKER_COMMAND = `docker run -p ${API_PORT}:${API_PORT} kusto-agent`

export const Tooltip: FC<ITooltipProps> = ({ target, mode = 'autocomplete', onClose }) => {
  const { t } = useTranslation()
  const { authState, isLoading: isAuthLoading } = useAuth()

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
    isDragging,
    handleDragStart,
    queryPreview,
    queryResult,
    chartData,
    handleRetry,
    handleCopy,
    toggleSteps,
  } = useTooltip({ target, mode, isAuthenticated: authState.isAuthenticated })

  if (!isAuthLoading && !authState.isAuthenticated) {
    return (
      <Container style={{ top: position.top, left: position.left }}>
        <TooltipHeader
          title={t('tooltip.title')}
          onClose={onClose}
          onDragStart={handleDragStart}
          isDragging={isDragging}
        />
        <LoginRequiredState />
      </Container>
    )
  }

  if (isHealthy === false) {
    return (
      <Container style={{ top: position.top, left: position.left }}>
        <TooltipHeader title={t('tooltip.title')} onClose={onClose} onDragStart={handleDragStart} isDragging={isDragging} />
        <UnhealthyState
          message={healthMessage}
          dockerCommand={DOCKER_COMMAND}
          onRetry={handleRetry}
        />
      </Container>
    )
  }

  const showQueryPreview = queryPreview && !result
  const copyableContent = result || queryPreview
  const isStreaming = !isComplete

  return (
    <Container style={{ top: position.top, left: position.left }}>
      <TooltipHeader title={t('tooltip.title')} onClose={onClose} onDragStart={handleDragStart} isDragging={isDragging} />

      {isStreaming && <TooltipStatus status={status} />}

      {showQueryPreview && <QueryPreview query={queryPreview} />}

      {result && <TooltipResult result={result} hasError={hasError} />}

      {chartData && <ChartView chartData={chartData} />}

      {queryResult && <QueryResults queryResult={queryResult} />}

      <TooltipSteps steps={steps} expanded={stepsExpanded} onToggle={toggleSteps} isComplete={isComplete} />

      {(isComplete || queryPreview) && copyableContent && !hasError && (
        <TooltipActions result={copyableContent} copied={copied} onCopy={handleCopy} />
      )}
    </Container>
  )
}
