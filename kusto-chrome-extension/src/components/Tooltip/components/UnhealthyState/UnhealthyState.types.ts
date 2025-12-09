export interface IUnhealthyStateProps {
  message: string
  dockerCommand: string
  onRetry: () => void
}
