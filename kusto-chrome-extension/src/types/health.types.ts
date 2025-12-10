export interface IHealthCheckDetail {
  status: string
  error?: string
  provider?: string
  model?: string
}

export interface IHealthCheckData {
  status: string
  message?: string
  timestamp?: string
  uptime?: number
  version?: string
  details?: Record<string, IHealthCheckDetail>
}

export interface IApiResponse<T> {
  success: boolean
  data: T
}

export interface IHealthResult {
  status: 'loading' | 'healthy' | 'degraded' | 'unhealthy'
  messageKey: string
  details?: Record<string, IHealthCheckDetail>
  version?: string
}
