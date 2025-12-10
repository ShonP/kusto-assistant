import { createRoot, type Root } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '../hooks/useTheme'
import { GlobalStyles } from '../styles'
import '../config/i18n'
import { Tooltip } from '../components/Tooltip'
import { KeyboardHint } from '../components/KeyboardHint'
import type { AgentMode } from '../types/content.types'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
})

let root: Root | null = null
let container: HTMLDivElement | null = null
let hintRoot: Root | null = null
let hintContainer: HTMLDivElement | null = null

const removeHint = () => {
  if (hintRoot) {
    hintRoot.unmount()
    hintRoot = null
  }
  if (hintContainer) {
    hintContainer.remove()
    hintContainer = null
  }
}

const showKeyboardHint = () => {
  removeHint()

  hintContainer = document.createElement('div')
  hintContainer.id = 'ctrlk-hint-root'
  document.body.appendChild(hintContainer)

  hintRoot = createRoot(hintContainer)
  hintRoot.render(
    <ThemeProvider>
      <KeyboardHint visible={true} />
    </ThemeProvider>
  )

  setTimeout(removeHint, 1500)
}

const removeTooltip = () => {
  if (root) {
    root.unmount()
    root = null
  }
  if (container) {
    container.remove()
    container = null
  }
}

const openTooltip = (args: {
  target: HTMLInputElement | HTMLTextAreaElement | HTMLElement
  mode: AgentMode
}) => {
  const { target, mode } = args
  removeTooltip()

  container = document.createElement('div')
  container.id = 'ctrlk-tooltip-root'
  document.body.appendChild(container)

  root = createRoot(container)
  root.render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <GlobalStyles rootId="ctrlk-tooltip-root" />
        <Tooltip target={target} mode={mode} onClose={removeTooltip} />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

chrome.runtime.onMessage.addListener((msg: { action: string; mode?: AgentMode }) => {
  if (msg.action === 'open_popup') {
    const active = document.activeElement as HTMLElement

    if (
      active &&
      (active.tagName === 'INPUT' ||
        active.tagName === 'TEXTAREA' ||
        active.isContentEditable)
    ) {
      showKeyboardHint()
      openTooltip({
        target: active as HTMLInputElement | HTMLTextAreaElement,
        mode: msg.mode || 'autocomplete',
      })
    }
  }
})

export {}
