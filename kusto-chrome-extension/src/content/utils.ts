import type { IKustoContext } from './types'

export function getKustoContext(): IKustoContext {
  // Look for the cluster context label in Azure Data Explorer
  // Format: "clusterName/databaseName"
  const contextLabel = document.querySelector('[data-testid="cluster-in-context-label"]')

  if (contextLabel) {
    const text = contextLabel.textContent || ''
    const parts = text.split('/')
    if (parts.length === 2) {
      return {
        clusterName: parts[0].trim(),
        databaseName: parts[1].trim(),
      }
    }
  }

  return {
    clusterName: null,
    databaseName: null,
  }
}

export function getInputValue(target: HTMLElement): string {
  // Check if this is a Monaco Editor
  const monacoEditor = target.closest('.monaco-editor')
  if (monacoEditor) {
    // Get text from Monaco's view-lines
    const viewLines = monacoEditor.querySelector('.view-lines')
    if (viewLines) {
      return viewLines.textContent || ''
    }
  }

  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    return target.value
  }
  if (target.isContentEditable) {
    return target.innerText
  }
  return ''
}

export async function setInputValue(target: HTMLElement, value: string): Promise<void> {
  // Check if this is a Monaco Editor
  const monacoEditor = target.closest('.monaco-editor')
  if (monacoEditor) {
    // For Monaco Editor, we need to use clipboard to paste
    const textarea = monacoEditor.querySelector('textarea.inputarea') as HTMLTextAreaElement
    if (textarea) {
      textarea.focus()
      document.execCommand('selectAll', false)
      try {
        await navigator.clipboard.writeText(value)
        document.execCommand('paste')
      } catch {
        document.execCommand('insertText', false, value)
      }
      return
    }
  }

  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    target.value = value
    target.dispatchEvent(new Event('input', { bubbles: true }))
  } else if (target.isContentEditable) {
    target.innerText = value
    target.dispatchEvent(new Event('input', { bubbles: true }))
  }
}

export function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
