import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, X } from 'lucide-react'
import { HEALTH_CHECK_ORDER } from './HealthChecksList.constants'
import {
  Container,
  Title,
  List,
  Item,
  CheckIcon,
  CheckName,
  CheckStatus,
  CheckError,
} from './HealthChecksList.style'
import type { IHealthChecksListProps } from './HealthChecksList.types'

export const HealthChecksList: FC<IHealthChecksListProps> = ({ details }) => {
  const { t } = useTranslation()

  return (
    <Container>
      <Title>{t('healthChecks.title')}</Title>
      <List>
        {HEALTH_CHECK_ORDER.map((key) => {
          const detail = details[key]
          if (!detail) return null

          const isUp = detail.status === 'up'

          return (
            <Item key={key}>
              <CheckIcon $isUp={isUp}>
                {isUp ? <Check size={12} /> : <X size={12} />}
              </CheckIcon>
              <CheckName>{t(`healthChecks.${key}`, { defaultValue: key })}</CheckName>
              <CheckStatus $isUp={isUp}>
                {isUp ? t('common.up') : t('common.down')}
              </CheckStatus>
              {!isUp && detail.error && <CheckError>{detail.error}</CheckError>}
            </Item>
          )
        })}
      </List>
    </Container>
  )
}
