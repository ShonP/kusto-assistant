import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useHealthQuery } from '../../queries/useHealthQuery'
import { useAgentStream, useDrag } from '../../hooks'
import type { IQueryResult, IChartData, AgentMode } from '../../types/content.types'

interface IUseTooltipParams {
  target: HTMLElement
  mode?: AgentMode
  isAuthenticated: boolean
}

interface IUseTooltipReturn {
  isHealthy: boolean | null
  healthMessage: string
  status: string
  result: string
  hasError: boolean
  steps: ReturnType<typeof useAgentStream>['steps']
  isComplete: boolean
  stepsExpanded: boolean
  copied: boolean
  position: { top: number; left: number }
  isDragging: boolean
  handleDragStart: (e: React.MouseEvent) => void
  queryPreview: string | null
  queryResult: IQueryResult | null
  chartData: IChartData | null
  handleRetry: () => void
  handleCopy: (content: string) => void
  toggleSteps: () => void
}

export const useTooltip = (args: IUseTooltipParams): IUseTooltipReturn => {
  const { target, mode = 'autocomplete', isAuthenticated } = args
  const { t } = useTranslation()

  const [stepsExpanded, setStepsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [initialPosition, setInitialPosition] = useState({ top: 0, left: 0 })
  const hasStartedRef = useRef(false)

  const { data: healthData, isLoading: isHealthLoading, refetch: refetchHealth } = useHealthQuery()

  const agentStream = useAgentStream({ target, mode })
  const abortStreamRef = useRef(agentStream.abortStream)
  abortStreamRef.current = agentStream.abortStream

  const isHealthy = isHealthLoading ? null : healthData?.status === 'healthy' || healthData?.status === 'degraded'
  const healthMessage = !isHealthy && !isHealthLoading ? t('tooltip.cannotConnect') : ''

  useEffect(() => {
    const rect = target.getBoundingClientRect()
    setInitialPosition({
      top: rect.bottom + 8,
      left: rect.left,
    })
  }, [target])

  const { position, isDragging, handleMouseDown: handleDragStart } = useDrag({ initialPosition })

  useEffect(() => {
    if (isHealthy && isAuthenticated && !hasStartedRef.current) {
      hasStartedRef.current = true
      agentStream.startStream()
    }
  }, [isHealthy, isAuthenticated, agentStream.startStream])

  useEffect(() => {
    return () => {
      abortStreamRef.current()
    }
  }, [])

  const handleRetry = useCallback(() => {
    agentStream.reset()
    hasStartedRef.current = false
    refetchHealth()
  }, [agentStream, refetchHealth])

  const handleCopy = useCallback(async (content: string) => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  const toggleSteps = useCallback(() => {
    setStepsExpanded((prev) => !prev)
  }, [])

  return {
    isHealthy,
    healthMessage,
    status: agentStream.status,
    result: agentStream.result,
    hasError: agentStream.hasError,
    steps: agentStream.steps,
    isComplete: agentStream.isComplete,
    stepsExpanded,
    copied,
    position,
    isDragging,
    handleDragStart,
    queryPreview: agentStream.queryPreview,
    queryResult: agentStream.queryResult,
    chartData: agentStream.chartData,
    handleRetry,
    handleCopy,
    toggleSteps,
  }
}
