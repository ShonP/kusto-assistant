import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { LogIn, LogOut, User } from 'lucide-react'
import { useAuth } from '../../hooks'
import type { ICredentialsProps } from './Credentials.types'
import {
  Container,
  UserCard,
  Avatar,
  UserInfo,
  UserName,
  UserEmail,
  LoginSection,
  LoginIcon,
  LoginTitle,
  LoginDescription,
  Button,
  Actions,
  StatusBadge,
} from './Credentials.style'

export const Credentials: FC<ICredentialsProps> = ({ onLoginSuccess }) => {
  const { t } = useTranslation()
  const { authState, isLoading, login, logout } = useAuth()

  const handleLogin = async () => {
    await login()
    onLoginSuccess?.()
  }

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <Container>
        <LoginSection>
          <LoginDescription>{t('credentials.loading')}</LoginDescription>
        </LoginSection>
      </Container>
    )
  }

  if (!authState.isAuthenticated) {
    return (
      <Container>
        <LoginSection>
          <LoginIcon>
            <User size={32} />
          </LoginIcon>
          <LoginTitle>{t('credentials.notLoggedIn')}</LoginTitle>
          <LoginDescription>{t('credentials.loginDescription')}</LoginDescription>
          <Button onClick={handleLogin} disabled={isLoading}>
            <LogIn size={16} />
            {t('credentials.signIn')}
          </Button>
        </LoginSection>
      </Container>
    )
  }

  const user = authState.user

  return (
    <Container>
      <UserCard>
        <Avatar>{user ? getInitials(user.name) : '?'}</Avatar>
        <UserInfo>
          <UserName>{user?.name}</UserName>
          <UserEmail>{user?.email}</UserEmail>
          <StatusBadge $status="connected">{t('credentials.connected')}</StatusBadge>
        </UserInfo>
      </UserCard>
      <Actions>
        <Button $variant="secondary" onClick={logout} disabled={isLoading}>
          <LogOut size={16} />
          {t('credentials.signOut')}
        </Button>
        <Button onClick={handleLogin} disabled={isLoading}>
          <LogIn size={16} />
          {t('credentials.switchAccount')}
        </Button>
      </Actions>
    </Container>
  )
}
