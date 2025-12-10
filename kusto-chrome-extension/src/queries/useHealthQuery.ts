import { useQuery } from '@tanstack/react-query'
import { healthApi } from '../api/health.api'
import type { IHealthResult, IHealthCheckDetail } from '../types/health.types'

export const useHealthQuery = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: async (): Promise<IHealthResult> => {
      try {
        const apiResponse = await healthApi.getHealth()
        const data = apiResponse.data
        const isHealthy = data.status === 'ok'
        const isDegraded = data.status === 'degraded'

        const hasDegradedChecks =
          data.details &&
          Object.values(data.details).some((d: IHealthCheckDetail) => d.status !== 'up')

        return {
          status: hasDegradedChecks
            ? 'degraded'
            : isHealthy
              ? 'healthy'
              : isDegraded
                ? 'degraded'
                : 'unhealthy',
          messageKey:
            isDegraded || hasDegradedChecks ? 'status.serviceDegraded' : 'status.serviceRunning',
          details: data.details,
          version: data.version,
        }
      } catch {
        return {
          status: 'unhealthy',
          messageKey: 'status.cannotConnect',
        }
      }
    },
    refetchInterval: false,
    retry: false,
  })
}
