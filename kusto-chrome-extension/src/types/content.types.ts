import type { ReactNode } from 'react'

export interface IStep {
  icon: ReactNode
  title: string
  description: string
  data?: string
}

export interface ITooltipProps {
  target: HTMLElement
  mode?: AgentMode
  onClose: () => void
}

export interface IQueryColumn {
  name: string
  type: string
}

export interface IQueryResult {
  query: string
  columns: IQueryColumn[]
  rows: Array<Record<string, unknown>>
  rowCount: number
}

export interface IChartData {
  chartType: 'bar' | 'pie' | 'line'
  labels: string[]
  values: number[]
  title: string
}

export interface IAgentEvent {
  type:
    | 'annotation'
    | 'tool_call'
    | 'tool_result'
    | 'query_preview'
    | 'query_result'
    | 'chart_data'
    | 'message'
    | 'done'
    | 'error'
  title?: string
  description?: string
  data?: {
    content?: string
    finalAnswer?: string
    tool?: string
    input?: unknown
    output?: unknown
    query?: string
    isComplete?: boolean
    columns?: IQueryColumn[]
    rows?: Array<Record<string, unknown>>
    rowCount?: number
    chartType?: 'bar' | 'pie' | 'line'
    labels?: string[]
    values?: number[]
  }
  timestamp?: string
}

export interface IKustoContext {
  clusterName: string | null
  databaseName: string | null
}

export type AgentMode = 'autocomplete' | 'execute'
