import { openTooltip } from './tooltip'

// Listen for Ctrl+K / Cmd+K
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
