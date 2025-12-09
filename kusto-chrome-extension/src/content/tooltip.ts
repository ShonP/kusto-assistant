import { getTooltipHTML, getUnhealthyTooltipHTML } from './styles'
import { getInputValue } from './utils'
import { sendMessageSSE, renderSteps, checkServerHealth, getDockerCommand } from './api'
import type { IStep } from './types'

let tooltip: HTMLDivElement | null = null
let abortController: AbortController | null = null
let currentTarget: HTMLInputElement | HTMLTextAreaElement | HTMLElement | null = null

function createTooltipContainer(target: HTMLElement): HTMLDivElement {
  const rect = target.getBoundingClientRect()
  
  const container = document.createElement('div')
  container.id = 'ctrlk-tooltip'
  container.style.cssText = `
    position: fixed;
    top: ${rect.bottom + 8}px;
    left: ${rect.left}px;
    padding: 12px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    z-index: 2147483647;
    width: 320px;
    max-width: 320px;
    box-sizing: border-box;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
  `
  
  return container
}

function showUnhealthyTooltip(target: HTMLElement, message: string): void {
  removeTooltip()
  currentTarget = target as HTMLInputElement | HTMLTextAreaElement | HTMLElement

  tooltip = createTooltipContainer(target)
  tooltip.innerHTML = getUnhealthyTooltipHTML(message, getDockerCommand())
  document.body.appendChild(tooltip)

  // Close button
  tooltip.querySelector('#close-btn')?.addEventListener('click', removeTooltip)

  // Copy docker command
  tooltip.querySelector('#copy-docker-btn')?.addEventListener('click', async () => {
    const btn = tooltip?.querySelector('#copy-docker-btn') as HTMLButtonElement
    try {
      await navigator.clipboard.writeText(getDockerCommand())
      if (btn) {
        btn.textContent = '✅'
        setTimeout(() => {
          btn.textContent = '📋'
        }, 2000)
      }
    } catch (err) {
      console.error('Copy failed:', err)
    }
  })

  // Retry button
  tooltip.querySelector('#retry-btn')?.addEventListener('click', () => {
    if (currentTarget) {
      openTooltip(currentTarget as HTMLInputElement | HTMLTextAreaElement)
    }
  })

  // ESC to close
  document.addEventListener('keydown', handleEsc)
}

export async function openTooltip(target: HTMLInputElement | HTMLTextAreaElement | HTMLElement): Promise<void> {
  removeTooltip()
  currentTarget = target

  // First, check server health
  const healthResult = await checkServerHealth()
  
  if (!healthResult.healthy) {
    showUnhealthyTooltip(target, healthResult.message)
    return
  }

  // Server is healthy, proceed with normal flow
  tooltip = createTooltipContainer(target)

  tooltip.innerHTML = getTooltipHTML()
  document.body.appendChild(tooltip)

  // Get elements
  const resultBox = tooltip.querySelector('#assistant-result') as HTMLElement
  const statusBox = tooltip.querySelector('#assistant-status') as HTMLElement
  const statusText = tooltip.querySelector('#status-text') as HTMLElement
  const buttonRow = tooltip.querySelector('#button-row') as HTMLElement
  const copyBtn = tooltip.querySelector('#copy-btn') as HTMLButtonElement
  const stepsSection = tooltip.querySelector('#steps-section') as HTMLElement
  const stepsToggle = tooltip.querySelector('#steps-toggle') as HTMLElement
  const stepsContainer = tooltip.querySelector('#steps-container') as HTMLElement
  const stepsSummary = tooltip.querySelector('#steps-summary') as HTMLElement
  const stepsArrow = tooltip.querySelector('#steps-arrow') as HTMLElement
  const expandText = tooltip.querySelector('#expand-text') as HTMLElement

  // Close button
  tooltip.querySelector('#close-btn')?.addEventListener('click', removeTooltip)

  // ESC to close
  document.addEventListener('keydown', handleEsc)

  // Setup toggle functionality
  let isExpanded = false
  stepsToggle?.addEventListener('click', () => {
    isExpanded = !isExpanded
    stepsContainer?.classList.toggle('expanded', isExpanded)
    if (stepsArrow) stepsArrow.textContent = isExpanded ? '▼' : '▶'
    if (expandText) expandText.textContent = isExpanded ? 'collapse' : 'expand'
  })

  // Start request
  abortController = new AbortController()
  const inputValue = getInputValue(target)
  let fullResponse = ''

  sendMessageSSE(inputValue, abortController, {
    onStatusUpdate: (text: string) => {
      if (statusText) statusText.textContent = text
    },
    onResult: (content: string) => {
      fullResponse = content
      if (statusBox) statusBox.style.display = 'none'
      if (resultBox) {
        resultBox.style.display = 'block'
        resultBox.textContent = content
        resultBox.scrollTop = resultBox.scrollHeight
      }
    },
    onError: (message: string) => {
      if (statusBox) statusBox.style.display = 'none'
      if (resultBox) {
        resultBox.style.display = 'block'
        resultBox.textContent = `Error: ${message}`
        resultBox.style.color = '#DC2626'
      }
    },
    onComplete: (steps: IStep[], stepCount: number) => {
      if (statusBox) statusBox.style.display = 'none'
      if (resultBox) resultBox.style.display = 'block'

      // Show steps section
      if (stepCount > 0 && stepsSection && stepsSummary && stepsContainer) {
        stepsSection.style.display = 'block'
        stepsSummary.textContent = `Reasoned in ${stepCount} step${stepCount > 1 ? 's' : ''}`
        renderSteps(stepsContainer, steps)
      }

      // Show copy button
      if (fullResponse && buttonRow && copyBtn) {
        buttonRow.style.display = 'flex'
        copyBtn.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(fullResponse)
            copyBtn.textContent = '✅ Copied!'
            copyBtn.style.background = '#059669'
            setTimeout(() => {
              copyBtn.innerHTML = '📋 Copy to Clipboard'
              copyBtn.style.background = '#10B981'
            }, 2000)
          } catch (err) {
            copyBtn.textContent = '❌ Failed to copy'
            console.error('Copy failed:', err)
          }
        })
      }
    },
  })
}

function handleEsc(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    removeTooltip()
  }
}

export function removeTooltip(): void {
  if (abortController) {
    abortController.abort()
    abortController = null
  }

  if (tooltip) {
    tooltip.remove()
    tooltip = null
  }
  document.removeEventListener('keydown', handleEsc)
}
