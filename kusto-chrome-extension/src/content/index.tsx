import { createRoot, type Root } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '../hooks/useTheme'
import { GlobalStyles } from '../styles'
import '../config/i18n'
import { Tooltip } from '../components/Tooltip'

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

const openTooltip = (target: HTMLInputElement | HTMLTextAreaElement | HTMLElement) => {
  removeTooltip()

  container = document.createElement('div')
  container.id = 'ctrlk-tooltip-root'
  document.body.appendChild(container)

  root = createRoot(container)
  root.render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Tooltip target={target} onClose={removeTooltip} />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

chrome.runtime.onMessage.addListener((msg: { action: string }) => {
  if (msg.action === 'open_popup') {
    const active = document.activeElement as HTMLElement

    if (
      active &&
      (active.tagName === 'INPUT' ||
        active.tagName === 'TEXTAREA' ||
        active.isContentEditable)
    ) {
      openTooltip(active as HTMLInputElement | HTMLTextAreaElement)
    }
  }
})

export {}
