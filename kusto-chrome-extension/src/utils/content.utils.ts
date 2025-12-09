import type { IKustoContext } from '../types/content.types'

export const getKustoContext = (): IKustoContext => {
  let clusterName: string | null = null
  let databaseName: string | null = null

  const contextLabel = document.querySelector('[data-testid="cluster-in-context-label"]')
  if (contextLabel) {
    const labelText = contextLabel.getAttribute('aria-label') || contextLabel.textContent || ''
    const parts = labelText.split('/')
    if (parts.length >= 2) {
      clusterName = parts[0].trim()
      databaseName = parts[1].trim()
    }
  }

  if (!clusterName || !databaseName) {
    const url = window.location.href
    const clusterMatch = url.match(/cluster=([^&]+)/)
    if (clusterMatch) {
      clusterName = decodeURIComponent(clusterMatch[1])
    }
    const dbMatch = url.match(/database=([^&]+)/)
    if (dbMatch) {
      databaseName = decodeURIComponent(dbMatch[1])
    }
  }

  return { clusterName, databaseName }
}

export const getInputValue = (element: HTMLElement): string => {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return element.value
  }
  if (element.isContentEditable) {
    return element.textContent || ''
  }
  return ''
}

export const escapeHtml = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
