import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Check } from 'lucide-react'
import { ActionRow, CopyActionButton } from './TooltipActions.style'
import type { ITooltipActionsProps } from './TooltipActions.types'

export const TooltipActions: FC<ITooltipActionsProps> = ({ copied, onCopy }) => {
  const { t } = useTranslation()

  return (
    <ActionRow>
      <CopyActionButton onClick={onCopy}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? t('common.copied') : t('common.copyToClipboard')}
      </CopyActionButton>
    </ActionRow>
  )
}
