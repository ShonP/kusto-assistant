import { useState, type FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Check } from 'lucide-react'
import {
  Container,
  Title,
  Description,
  CodeBlock,
  Code,
  CopyButton,
} from './DockerSection.style'
import type { IDockerSectionProps } from './DockerSection.types'

export const DockerSection: FC<IDockerSectionProps> = ({ command, onCopy }) => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Container>
      <Title>{t('docker.title')}</Title>
      <Description>{t('docker.description')}</Description>
      <CodeBlock>
        <Code>{command}</Code>
        <CopyButton $copied={copied} onClick={handleCopy} aria-label={t('common.copy')}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </CopyButton>
      </CodeBlock>
    </Container>
  )
}
