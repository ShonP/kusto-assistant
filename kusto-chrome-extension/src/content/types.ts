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

export interface IStep {
  icon: string
  title: string
  description: string
  data?: string
}
