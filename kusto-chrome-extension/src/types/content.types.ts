import type { ReactNode } from 'react'

export interface IStep {
  icon: ReactNode
  title: string
  description: string
  data?: string
}

export interface ITooltipProps {
  target: HTMLElement
  onClose: () => void
}

export interface IAgentEvent {
  type: 'annotation' | 'tool_call' | 'tool_result' | 'message' | 'done' | 'error'
  title?: string
  description?: string
  data?: {
    content?: string
    finalAnswer?: string
    tool?: string
    input?: unknown
    output?: unknown
  }
  timestamp?: string
}

export interface IKustoContext {
  clusterName: string | null
  databaseName: string | null
}
