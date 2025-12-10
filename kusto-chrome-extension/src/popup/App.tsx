import { useState, type FC } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw } from 'lucide-react'
import { Tabs } from '../components/Tabs'
import { Settings } from '../components/Settings'
import { StatusIndicator } from '../components/StatusIndicator'
import { HealthChecksList } from '../components/HealthChecksList'
import { DockerSection } from '../components/DockerSection'
import { useHealthQuery } from '../queries/useHealthQuery'
import { API_PORT } from '../config'
import {
  Container,
  Title,
  StatusSection,
  StatusHeader,
  StatusLabel,
  StatusDetails,
  Actions,
  RefreshButton,
  InfoSection,
  PortInfo,
} from './App.style'

const DOCKER_COMMAND = `docker run -p ${API_PORT}:${API_PORT} kusto-agent`

export const App: FC = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('status')
  const { data: health, isLoading, refetch, isFetching } = useHealthQuery()

  const status = isLoading ? 'loading' : health?.status ?? 'unhealthy'
  const message = health?.messageKey ? t(health.messageKey) : t('popup.checking')

  const handleCopyDocker = async () => {
    await navigator.clipboard.writeText(DOCKER_COMMAND)
  }

  const tabs = [
    { id: 'status', label: t('tabs.status') },
    { id: 'settings', label: t('tabs.settings') },
  ]

  return (
    <Container>
      <Title>{t('popup.title')}</Title>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'status' && (
        <>
          <StatusSection>
            <StatusHeader>
              <StatusLabel>{t('popup.apiStatus')}</StatusLabel>
              <StatusIndicator status={status} />
            </StatusHeader>
            <StatusDetails>
              {message}
              {health?.version && health.version !== 'unknown' && ` (${t('popup.version', { version: health.version })})`}
            </StatusDetails>
            {health?.details && status !== 'unhealthy' && (
              <HealthChecksList details={health.details} />
            )}
          </StatusSection>

          {status === 'unhealthy' && (
            <DockerSection command={DOCKER_COMMAND} onCopy={handleCopyDocker} />
          )}

          <Actions>
            <RefreshButton $spinning={isFetching} onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw size={16} />
              {t('common.refresh')}
            </RefreshButton>
          </Actions>

          <InfoSection>
            <PortInfo>
              {t('popup.port')} <span>{API_PORT}</span>
            </PortInfo>
          </InfoSection>
        </>
      )}

      {activeTab === 'settings' && <Settings />}
    </Container>
  )
}
