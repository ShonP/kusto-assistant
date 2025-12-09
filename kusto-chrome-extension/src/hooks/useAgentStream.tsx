import { useState, useCallback, useRef, useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles, Wrench, CheckCircle, XCircle } from 'lucide-react'
import { agentApi } from '../api/agent.api'
import { getKustoContext, getInputValue } from '../utils/content.utils'
import type { IStep, IAgentEvent } from '../types/content.types'

interface IUseAgentStreamParams {
  target: HTMLElement
}

interface IUseAgentStreamReturn {
  status: string
  result: string
  hasError: boolean
  steps: IStep[]
  isComplete: boolean
  isStreaming: boolean
  startStream: () => void
  abortStream: () => void
  reset: () => void
}

export const useAgentStream = (args: IUseAgentStreamParams): IUseAgentStreamReturn => {
  const { target } = args
  const { t } = useTranslation()

  const [status, setStatus] = useState('')
  const [result, setResult] = useState('')
  const [hasError, setHasError] = useState(false)
  const [steps, setSteps] = useState<IStep[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)

  const abortControllerRef = useRef<AbortController | null>(null)
  const targetRef = useRef(target)
  const tRef = useRef(t)

  useEffect(() => {
    targetRef.current = target
    tRef.current = t
  }, [target, t])

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
  }, [abortStream])

  return {
    status,
    result,
    hasError,
    steps,
    isComplete,
    isStreaming,
    startStream,
    abortStream,
    reset,
  }
}
