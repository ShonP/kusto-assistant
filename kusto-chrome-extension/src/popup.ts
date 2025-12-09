import { API_BASE_URL, API_PORT } from './config'

const DOCKER_COMMAND = `docker run -p ${API_PORT}:${API_PORT} kusto-agent`

interface IHealthCheckDetail {
  status: string
  error?: string
  provider?: string
  model?: string
}

interface IHealthCheckData {
  status: string
  message?: string
  timestamp?: string
  uptime?: number
  version?: string
  details?: Record<string, IHealthCheckDetail>
}

interface IApiResponse {
  success: boolean
  data: IHealthCheckData
}

interface IHealthResult {
  healthy: boolean
  message: string
  details?: Record<string, IHealthCheckDetail>
  version?: string
}

async function checkHealth(): Promise<IHealthResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      return { healthy: false, message: `HTTP ${response.status}` }
    }

    const apiResponse: IApiResponse = await response.json()
    const data = apiResponse.data
    const isHealthy = data.status === 'ok'
    const isDegraded = data.status === 'degraded'
    
    return {
      healthy: isHealthy || isDegraded,
      message: isDegraded ? 'Service is degraded' : 'Service is running',
      details: data.details,
      version: data.version,
    }
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

function renderHealthChecks(details: Record<string, IHealthCheckDetail>): void {
  const healthChecksContainer = document.getElementById('health-checks')
  const healthChecksList = document.getElementById('health-checks-list')

  if (!healthChecksContainer || !healthChecksList) return

  healthChecksContainer.classList.remove('hidden')
  healthChecksList.innerHTML = ''

  const checkOrder = ['memory_heap', 'memory_rss', 'storage', 'llm']
  const checkLabels: Record<string, string> = {
    memory_heap: 'Memory (Heap)',
    memory_rss: 'Memory (RSS)',
    storage: 'Storage',
    llm: 'LLM Service',
  }

  for (const key of checkOrder) {
    const detail = details[key]
    if (!detail) continue

    const item = document.createElement('div')
    item.className = 'health-check-item'

    const isUp = detail.status === 'up'
    const statusClass = isUp ? 'check-up' : 'check-down'
    const statusIcon = isUp ? '✓' : '✗'

    item.innerHTML = `
      <span class="check-icon ${statusClass}">${statusIcon}</span>
      <span class="check-name">${checkLabels[key] || key}</span>
      <span class="check-status ${statusClass}">${isUp ? 'Up' : 'Down'}</span>
    `

    if (!isUp && detail.error) {
      const errorDiv = document.createElement('div')
      errorDiv.className = 'check-error'
      errorDiv.textContent = detail.error
      item.appendChild(errorDiv)
    }

    healthChecksList.appendChild(item)
  }
}

function updateUI(result: IHealthResult): void {
  const statusIndicator = document.getElementById('status-indicator')
  const statusDetails = document.getElementById('status-details')
  const dockerSection = document.getElementById('docker-section')
  const healthChecksContainer = document.getElementById('health-checks')

  if (!statusIndicator || !statusDetails || !dockerSection) return

  statusIndicator.classList.remove('loading', 'healthy', 'unhealthy', 'degraded')

  if (result.healthy) {
    const hasDegradedChecks = result.details && 
      Object.values(result.details).some(d => d.status !== 'up')
    
    if (hasDegradedChecks) {
      statusIndicator.textContent = 'Degraded'
      statusIndicator.classList.add('degraded')
    } else {
      statusIndicator.textContent = 'Healthy'
      statusIndicator.classList.add('healthy')
    }
    
    let detailText = result.message
    if (result.version && result.version !== 'unknown') {
      detailText += ` (v${result.version})`
    }
    statusDetails.textContent = detailText
    dockerSection.classList.add('hidden')

    if (result.details) {
      renderHealthChecks(result.details)
    }
  } else {
    statusIndicator.textContent = 'Unhealthy'
    statusIndicator.classList.add('unhealthy')
    statusDetails.textContent = result.message
    dockerSection.classList.remove('hidden')
    if (healthChecksContainer) {
      healthChecksContainer.classList.add('hidden')
    }
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

  updateUI(result)
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
