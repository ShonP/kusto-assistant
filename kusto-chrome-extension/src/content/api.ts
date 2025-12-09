import axios from 'axios'
import type { IAgentEvent, IStep } from './types'
import { getKustoContext, escapeHtml } from './utils'
import { API_BASE_URL, API_PORT } from '../config'

export async function checkServerHealth(): Promise<{ healthy: boolean; message: string }> {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 5000,
    })

    if (response.status !== 200) {
      return { healthy: false, message: `HTTP ${response.status}` }
    }

    return { healthy: true, message: 'Service is running' }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return { healthy: false, message: 'Connection timed out' }
      }
      return { healthy: false, message: error.message || 'Cannot connect to server' }
    }
    return { healthy: false, message: 'Unknown error' }
  }
}

export function getDockerCommand(): string {
  return `docker run -p ${API_PORT}:${API_PORT} kusto-agent`
}

interface ISSECallbacks {
  onStatusUpdate: (text: string) => void
  onResult: (content: string) => void
  onError: (message: string) => void
  onComplete: (steps: IStep[], stepCount: number) => void
}

export function sendMessageSSE(
  message: string,
  abortController: AbortController,
  callbacks: ISSECallbacks
): void {
  let fullResponse = ''
  let stepCount = 0
  const steps: IStep[] = []

  const kustoContext = getKustoContext()

  fetch(`${API_BASE_URL}/agent/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      clusterName: kustoContext.clusterName,
      databaseName: kustoContext.databaseName,
    }),
    signal: abortController.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No reader available')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          callbacks.onComplete(steps, stepCount)
          break
        }

        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)) as IAgentEvent
              processEvent(data)

              if (data.type === 'done') {
                callbacks.onComplete(steps, stepCount)
                return
              }
            } catch {
              // Ignore parse errors for incomplete JSON
            }
          }
        }
      }
    })
    .catch((error) => {
      if (error.name !== 'AbortError') {
        callbacks.onError(error.message)
      }
    })

  function addStep(icon: string, title: string, description?: string, data?: unknown): void {
    stepCount++
    const dataStr = data
      ? typeof data === 'string'
        ? data
        : JSON.stringify(data, null, 2)
      : undefined
    steps.push({ icon, title, description: description || '', data: dataStr })
  }

  function processEvent(event: IAgentEvent): void {
    switch (event.type) {
      case 'annotation':
        addStep('✨', event.title || 'Processing', event.description)
        callbacks.onStatusUpdate(event.description || 'Processing...')
        break

      case 'tool_call':
        addStep('🔧', event.title || 'Calling tool', event.description, event.data)
        callbacks.onStatusUpdate(`🔧 ${event.title || 'Calling tool...'}`)
        break

      case 'tool_result':
        addStep('✅', event.title || 'Tool complete', event.description, event.data)
        callbacks.onStatusUpdate(`✅ ${event.title || 'Tool complete'}`)
        break

      case 'message':
        if (event.data?.content) {
          fullResponse = event.data.content
          callbacks.onResult(fullResponse)
        }
        break

      case 'error':
        addStep('❌', 'Error', event.description)
        callbacks.onError(event.description || 'Unknown error')
        break

      case 'done':
        if (event.data?.finalAnswer) {
          fullResponse = event.data.finalAnswer
          callbacks.onResult(fullResponse)
        }
        break
    }
  }
}

export function renderSteps(container: HTMLElement, steps: IStep[]): void {
  if (steps.length === 0) return

  container.innerHTML = ''
  for (const step of steps) {
    const stepDiv = document.createElement('div')
    stepDiv.className = 'step-item'

    let dataHtml = ''
    if (step.data) {
      dataHtml = `<div class="step-data">${escapeHtml(step.data)}</div>`
    }

    stepDiv.innerHTML = `
      <div class="step-header">
        <span class="step-icon">${step.icon}</span>
        <div class="step-content">
          <div class="step-title">${escapeHtml(step.title)}</div>
          ${step.description ? `<div class="step-desc">${escapeHtml(step.description)}</div>` : ''}
          ${dataHtml}
        </div>
      </div>
    `
    container.appendChild(stepDiv)
  }
}
