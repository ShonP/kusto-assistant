import { apiClient } from './instance'
import type { IApiResponse, IHealthCheckData } from '../types/health.types'

export const healthApi = {
  getHealth: async (): Promise<IApiResponse<IHealthCheckData>> => {
    const response = await apiClient.get<IApiResponse<IHealthCheckData>>('/health')
    return response.data
  },
}
