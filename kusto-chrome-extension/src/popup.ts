import { API_BASE_URL, API_PORT } from './config'

const DOCKER_COMMAND = `docker run -p ${API_PORT}:${API_PORT} kusto-agent`

interface IHealthCheckResponse {
  status: string
  message?: string
}

async function checkHealth(): Promise<{ healthy: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      return { healthy: false, message: `HTTP ${response.status}` }
    }

    const data: IHealthCheckResponse = await response.json()
    return { healthy: true, message: data.message || 'Service is running' }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        return { healthy: false, message: 'Connection timed out' }
      }
      return { healthy: false, message: 'Cannot connect to server' }
    }
    return { healthy: false, message: 'Unknown error' }
  }
}

function updateUI(healthy: boolean, message: string): void {
  const statusIndicator = document.getElementById('status-indicator')
  const statusDetails = document.getElementById('status-details')
  const dockerSection = document.getElementById('docker-section')

  if (!statusIndicator || !statusDetails || !dockerSection) return

  statusIndicator.classList.remove('loading', 'healthy', 'unhealthy')

  if (healthy) {
    statusIndicator.textContent = 'Healthy'
    statusIndicator.classList.add('healthy')
    statusDetails.textContent = message
    dockerSection.classList.add('hidden')
  } else {
    statusIndicator.textContent = 'Unhealthy'
    statusIndicator.classList.add('unhealthy')
    statusDetails.textContent = message
    dockerSection.classList.remove('hidden')
  }
}

async function performHealthCheck(): Promise<void> {
  const statusIndicator = document.getElementById('status-indicator')
  const refreshBtn = document.getElementById('refresh-btn')

  if (statusIndicator) {
    statusIndicator.classList.remove('healthy', 'unhealthy')
    statusIndicator.classList.add('loading')
    statusIndicator.textContent = 'Checking...'
  }

  if (refreshBtn) {
    refreshBtn.classList.add('spinning')
  }

  const result = await checkHealth()

  if (refreshBtn) {
    refreshBtn.classList.remove('spinning')
  }

  updateUI(result.healthy, result.message)
}

function copyDockerCommand(): void {
  const copyBtn = document.getElementById('copy-docker')
  
  navigator.clipboard.writeText(DOCKER_COMMAND).then(() => {
    if (copyBtn) {
      copyBtn.classList.add('copied')
      setTimeout(() => {
        copyBtn.classList.remove('copied')
      }, 2000)
    }
  })
}

function init(): void {
  // Display port info
  const portValue = document.getElementById('port-value')
  if (portValue) {
    portValue.textContent = String(API_PORT)
  }

  // Set up event listeners
  const refreshBtn = document.getElementById('refresh-btn')
  if (refreshBtn) {
    refreshBtn.addEventListener('click', performHealthCheck)
  }

  const copyBtn = document.getElementById('copy-docker')
  if (copyBtn) {
    copyBtn.addEventListener('click', copyDockerCommand)
  }

  // Perform initial health check
  performHealthCheck()
}

document.addEventListener('DOMContentLoaded', init)
