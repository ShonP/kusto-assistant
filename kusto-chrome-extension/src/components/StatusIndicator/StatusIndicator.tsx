import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Indicator } from './StatusIndicator.style'
import type { IStatusIndicatorProps } from './StatusIndicator.types'

export const StatusIndicator: FC<IStatusIndicatorProps> = ({ status }) => {
  const { t } = useTranslation()

  return <Indicator $status={status}>{t(`status.${status}`)}</Indicator>
}
