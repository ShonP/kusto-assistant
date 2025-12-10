import type { FC } from 'react'
import { Container, KeyBox, Plus } from './KeyboardHint.style'
import type { IKeyboardHintProps } from './KeyboardHint.types'

const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0

export const KeyboardHint: FC<IKeyboardHintProps> = ({ visible }) => {
  if (!visible) return null

  return (
    <Container $visible={visible}>
      <KeyBox>{isMac ? '⌘' : 'Alt'}</KeyBox>
      <Plus>+</Plus>
      <KeyBox>K</KeyBox>
    </Container>
  )
}
