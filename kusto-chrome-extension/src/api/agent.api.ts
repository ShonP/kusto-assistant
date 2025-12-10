import { apiClient } from './instance'
import type { IAgentEvent, IKustoContext } from '../types/content.types'

export interface IAgentAskParams {
  message: string
  clusterName: string
  databaseName: string
}

export interface IAgentStreamCallbacks {
  onEvent: (event: IAgentEvent) => void
  onError: (error: Error) => void
  onComplete: () => void
}

export const agentApi = {
  askStream: async (args: {
    params: IAgentAskParams
    callbacks: IAgentStreamCallbacks
    signal?: AbortSignal
  }): Promise<void> => {
    const { params, callbacks, signal } = args

    const response = await fetch(`${apiClient.defaults.baseURL}/agent/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No reader available')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          callbacks.onComplete()
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)) as IAgentEvent
              callbacks.onEvent(data)
              if (data.type === 'done') {
                callbacks.onComplete()
                return
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        callbacks.onError(error)
      }
    }
  },
}

export const getKustoContextFromUrl = (): IKustoContext => {
  const url = window.location.href
  const clusterMatch = url.match(/cluster[=:]([^&/]+)/i)
  const databaseMatch = url.match(/database[=:]([^&/]+)/i)

  return {
    clusterName: clusterMatch?.[1] || null,
    databaseName: databaseMatch?.[1] || null,
  }
}
