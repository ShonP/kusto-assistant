import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import type { IUnhealthyStateProps } from './UnhealthyState.types'
import {
  UnhealthyWrapper,
  ErrorIconWrapper,
  ErrorTitleText,
  ErrorMessageText,
  DockerBlockWrapper,
  DockerCodeText,
  RetryActionButton,
} from './UnhealthyState.style'

export const UnhealthyState: FC<IUnhealthyStateProps> = ({ message, dockerCommand, onRetry }) => {
  const { t } = useTranslation()

  return (
    <UnhealthyWrapper>
      <ErrorIconWrapper>
        <AlertTriangle size={32} />
      </ErrorIconWrapper>
      <ErrorTitleText>{t('tooltip.serverUnavailable')}</ErrorTitleText>
      <ErrorMessageText>{message}</ErrorMessageText>
      <DockerBlockWrapper>
        <DockerCodeText>{dockerCommand}</DockerCodeText>
      </DockerBlockWrapper>
      <RetryActionButton onClick={onRetry}>{t('common.retry')}</RetryActionButton>
    </UnhealthyWrapper>
  )
}
