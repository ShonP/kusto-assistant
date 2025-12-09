import type { IHealthCheckDetail } from '../../types/health.types'

export interface IHealthChecksListProps {
  details: Record<string, IHealthCheckDetail>
}
