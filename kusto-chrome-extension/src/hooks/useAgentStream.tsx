import { useState, useCallback, useRef, useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles, Wrench, CheckCircle, XCircle, Code, Database, BarChart3 } from 'lucide-react'
import { agentApi } from '../api/agent.api'
import { getKustoContext, getInputValue } from '../utils/content.utils'
import type { IStep, IAgentEvent, IQueryResult, IChartData, AgentMode } from '../types/content.types'

interface IUseAgentStreamParams {
  target: HTMLElement
  mode?: AgentMode
}

interface IUseAgentStreamReturn {
  status: string
  result: string
  hasError: boolean
  steps: IStep[]
  isComplete: boolean
  isStreaming: boolean
  queryPreview: string | null
  queryResult: IQueryResult | null
  chartData: IChartData | null
  startStream: () => void
  abortStream: () => void
  reset: () => void
}

export const useAgentStream = (args: IUseAgentStreamParams): IUseAgentStreamReturn => {
  const { target, mode = 'autocomplete' } = args
  const { t } = useTranslation()

  const [status, setStatus] = useState('')
  const [result, setResult] = useState('')
  const [hasError, setHasError] = useState(false)
  const [steps, setSteps] = useState<IStep[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [queryPreview, setQueryPreview] = useState<string | null>(null)
  const [queryResult, setQueryResult] = useState<IQueryResult | null>(null)
  const [chartData, setChartData] = useState<IChartData | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const targetRef = useRef(target)
  const modeRef = useRef(mode)
  const tRef = useRef(t)

  useEffect(() => {
    targetRef.current = target
    modeRef.current = mode
    tRef.current = t
  }, [target, mode, t])

  useEffect(() => {
    setStatus(t('tooltip.connecting'))
  }, [t])

  const addStep = useCallback(
    (icon: ReactNode, title: string, description?: string, data?: unknown) => {
      const dataStr = data
        ? typeof data === 'string'
          ? data
          : JSON.stringify(data, null, 2)
        : undefined
      setSteps((prev) => [...prev, { icon, title, description: description || '', data: dataStr }])
    },
    []
  )

  const processEvent = useCallback(
    (event: IAgentEvent) => {
      const translate = tRef.current
      switch (event.type) {
        case 'annotation':
          addStep(<Sparkles size={14} />, event.title || translate('tooltip.processing'), event.description)
          setStatus(event.description || translate('tooltip.processing'))
          break
        case 'tool_call':
          addStep(
            <Wrench size={14} />,
            event.title || translate('tooltip.callingTool'),
            event.description,
            event.data
          )
          setStatus(event.title || translate('tooltip.callingTool'))
          break
        case 'tool_result':
          addStep(
            <CheckCircle size={14} />,
            event.title || translate('tooltip.toolComplete'),
            event.description,
            event.data
          )
          setStatus(event.title || translate('tooltip.toolComplete'))
          break
        case 'query_preview':
          if (event.data?.query) {
            setQueryPreview(event.data.query)
            addStep(
              <Code size={14} />,
              translate('tooltip.queryGenerated'),
              translate('tooltip.queryPreviewDescription')
            )
            setStatus(translate('tooltip.queryGenerated'))
          }
          break
        case 'query_result':
          if (event.data?.columns && event.data?.rows) {
            setQueryResult({
              query: event.data.query || '',
              columns: event.data.columns,
              rows: event.data.rows,
              rowCount: event.data.rowCount || event.data.rows.length,
            })
            addStep(
              <Database size={14} />,
              translate('tooltip.queryExecuted'),
              translate('tooltip.rowsReturned', { count: event.data.rowCount || event.data.rows.length })
            )
            setStatus(translate('tooltip.queryExecuted'))
          }
          break
        case 'chart_data':
          if (event.data?.chartType && event.data?.labels && event.data?.values) {
            setChartData({
              chartType: event.data.chartType,
              labels: event.data.labels,
              values: event.data.values,
              title: event.title || '',
            })
            addStep(
              <BarChart3 size={14} />,
              translate('tooltip.chartReady'),
              event.title
            )
          }
          break
        case 'message':
          if (event.data?.content) {
            setResult(event.data.content)
          }
          break
        case 'error':
          addStep(<XCircle size={14} />, translate('tooltip.error'), event.description)
          setHasError(true)
          setResult(event.description || translate('tooltip.unknownError'))
          break
        case 'done':
          if (event.data?.finalAnswer) {
            setResult(event.data.finalAnswer)
          }
          setIsComplete(true)
          setIsStreaming(false)
          break
      }
    },
    [addStep]
  )

  const startStream = useCallback(async () => {
    const inputValue = getInputValue(targetRef.current)
    const kustoContext = getKustoContext()

    abortControllerRef.current = new AbortController()
    setIsStreaming(true)

    try {
      await agentApi.askStream({
        params: {
          message: inputValue,
          clusterName: kustoContext.clusterName,
          databaseName: kustoContext.databaseName,
        },
        callbacks: {
          onEvent: processEvent,
          onError: (error: Error) => {
            setHasError(true)
            setResult(error.message)
            setIsComplete(true)
            setIsStreaming(false)
          },
          onComplete: () => {
            setIsComplete(true)
            setIsStreaming(false)
          },
        },
        signal: abortControllerRef.current.signal,
      })
    } catch (error) {
      setHasError(true)
      setResult(error instanceof Error ? error.message : tRef.current('tooltip.unknownError'))
      setIsComplete(true)
      setIsStreaming(false)
    }
  }, [processEvent])

  const abortStream = useCallback(() => {
    abortControllerRef.current?.abort()
    setIsStreaming(false)
  }, [])

  const reset = useCallback(() => {
    abortStream()
    setStatus(tRef.current('tooltip.connecting'))
    setResult('')
    setHasError(false)
    setSteps([])
    setIsComplete(false)
    setQueryPreview(null)
    setQueryResult(null)
    setChartData(null)
  }, [abortStream])

  return {
    status,
    result,
    hasError,
    steps,
    isComplete,
    isStreaming,
    queryPreview,
    queryResult,
    chartData,
    startStream,
    abortStream,
    reset,
  }
}
