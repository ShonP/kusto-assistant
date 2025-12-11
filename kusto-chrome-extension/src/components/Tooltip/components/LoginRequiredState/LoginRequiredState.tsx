import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { LogIn } from 'lucide-react'
import type { ILoginRequiredStateProps } from './LoginRequiredState.types'
import {
  Wrapper,
  IconWrapper,
  Title,
  Description,
  ActionButton,
} from './LoginRequiredState.style'

export const LoginRequiredState: FC<ILoginRequiredStateProps> = ({ onOpenPopup }) => {
  const { t } = useTranslation()

  return (
    <Wrapper>
      <IconWrapper>
        <LogIn size={28} />
      </IconWrapper>
      <Title>{t('credentials.loginRequired')}</Title>
      <Description>{t('credentials.loginRequiredDescription')}</Description>
      {onOpenPopup && (
        <ActionButton onClick={onOpenPopup}>
          {t('credentials.openPopup')}
        </ActionButton>
      )}
    </Wrapper>
  )
}
