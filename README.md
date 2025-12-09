# Kusto Assistant

An AI-powered assistant for Azure Data Explorer (Kusto) that helps you write and optimize KQL queries.

## Features

- 🤖 AI-powered KQL query generation
- 🔍 Query optimization suggestions
- 📊 Context-aware assistance based on your database schema
- 🔧 Chrome extension for seamless integration with Azure Data Explorer

## Quick Start

### Prerequisites

- [Docker](https://www.docker.com/get-started) installed
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) installed
- Azure OpenAI or OpenAI API access
- Azure Data Explorer cluster access

### 1. Login to Azure

The assistant needs Azure credentials to access your Kusto clusters:

```bash
az login
```

### 2. Pull and Run the Docker Image

```bash
# Pull the latest image
docker pull crkassistprodeus2001.azurecr.io/kusto-assistant-backend:latest
```

> **Windows users:** For now, skip pulling from ACR—clone the repo and build/run locally instead:
> ```powershell
> git clone https://github.com/ShonP/kusto-assistant.git
> cd kusto-assistant/backend
> docker build -t kusto-assistant-backend:local .
> # use the local image tag (see Windows commands below)
> ```

**Option A: Azure OpenAI with Managed Identity (uses `az login` credentials)**

**PowerShell (Windows):**
```powershell
docker run -d -p 3847:3847 `
  -e LLM_PROVIDER=azure-openai-identity `
  -e AZURE_OPENAI_ENDPOINT=https://your-openai.cognitiveservices.azure.com/ `
  -e AZURE_OPENAI_DEPLOYMENT=your-deployment-name `
  -e AZURE_OPENAI_API_VERSION=2024-12-01-preview `
  -e LLM_MODEL=gpt-5.1 `
  -v $env:USERPROFILE\.azure:/root/.azure `
  kusto-assistant-backend:local
```

**Bash/macOS/Linux:**
```bash
docker run -d -p 3847:3847 \
  -e LLM_PROVIDER=azure-openai-identity \
  -e AZURE_OPENAI_ENDPOINT=https://your-openai.cognitiveservices.azure.com/ \
  -e AZURE_OPENAI_DEPLOYMENT=your-deployment-name \
  -e AZURE_OPENAI_API_VERSION=2024-12-01-preview \
  -e LLM_MODEL=gpt-5.1 \
  -v ~/.azure:/root/.azure \
  crkassistprodeus2001.azurecr.io/kusto-assistant-backend:latest
```

**Option B: Azure OpenAI with API Key**

**PowerShell (Windows):**
```powershell
docker run -d -p 3847:3847 `
  -e LLM_PROVIDER=azure-openai-key `
  -e AZURE_OPENAI_ENDPOINT=https://your-openai.cognitiveservices.azure.com/ `
  -e AZURE_OPENAI_DEPLOYMENT=your-deployment-name `
  -e AZURE_OPENAI_API_KEY=your-api-key `
  -e AZURE_OPENAI_API_VERSION=2024-12-01-preview `
  -e LLM_MODEL=gpt-5.1 `
  -v $env:USERPROFILE\.azure:/root/.azure:ro `
  kusto-assistant-backend:local
```

**Bash/macOS/Linux:**
```bash
docker run -d -p 3847:3847 \
  -e LLM_PROVIDER=azure-openai-key \
  -e AZURE_OPENAI_ENDPOINT=https://your-openai.cognitiveservices.azure.com/ \
  -e AZURE_OPENAI_DEPLOYMENT=your-deployment-name \
  -e AZURE_OPENAI_API_KEY=your-api-key \
  -e AZURE_OPENAI_API_VERSION=2024-12-01-preview \
  -e LLM_MODEL=gpt-5.1 \
  -v ~/.azure:/root/.azure:ro \
  crkassistprodeus2001.azurecr.io/kusto-assistant-backend:latest
```

**Option C: OpenAI API**

**PowerShell (Windows):**
```powershell
docker run -d -p 3847:3847 `
  -e LLM_PROVIDER=openai `
  -e OPENAI_API_KEY=your-openai-api-key `
  -e LLM_MODEL=gpt-5.1 `
  -v $env:USERPROFILE\.azure:/root/.azure:ro `
  kusto-assistant-backend:local
```

**Bash/macOS/Linux:**
```bash
docker run -d -p 3847:3847 \
  -e LLM_PROVIDER=openai \
  -e OPENAI_API_KEY=your-openai-api-key \
  -e LLM_MODEL=gpt-5.1 \
  -v ~/.azure:/root/.azure:ro \
  crkassistprodeus2001.azurecr.io/kusto-assistant-backend:latest
```

> **Note:** The `-v ~/.azure:/root/.azure:ro` mount is required for all options to allow access to your Kusto clusters.

### 3. Install the Chrome Extension

1. Download the extension: [kusto-assistant-latest.zip](https://stkassistprodeus2001.blob.core.windows.net/extension/kusto-assistant-latest.zip)
2. Extract the zip file
3. Open Chrome and go to `chrome://extensions`
4. Enable **Developer mode** (top right)
5. Click **Load unpacked** and select the extracted folder

### 4. Verify the Backend is Healthy

Before using the assistant, make sure the backend service is running:

```bash
curl http://localhost:3847/api/v1/health
```

You should see a response like:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "details": {
      "memory_heap": { "status": "up" },
      "memory_rss": { "status": "up" },
      "storage": { "status": "up" },
      "llm": {
        "status": "up",
        "provider": "azure-openai",
        "model": "gpt-5.1"
      }
    }
  }
}
```

### 5. Use the Assistant

1. Open [Azure Data Explorer](https://dataexplorer.azure.com)
2. Write a comment describing what you want, e.g., `// get all logs from the last hour`
3. Press `Alt+K` (Windows) or `Cmd+K` (macOS) to activate the assistant
4. The AI will generate a KQL query based on your request

![Kusto Assistant in action](images/example_usage.png)

## Configuration Options

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `LLM_PROVIDER` | Yes | LLM provider to use | `azure-openai-identity`, `azure-openai-key`, `openai` |
| `LLM_MODEL` | Yes | Model name | `gpt-5.1`, `gpt-5-mini`, `gpt-5-nano`, `gpt-5-pro`, `gpt-4.1` |
| `PORT` | No | Server port (default: 3847) | `3847` |

### Azure OpenAI with Managed Identity (Recommended)

Use Azure credentials from `az login`:

**Bash/macOS/Linux:**
```bash
docker run -d -p 3847:3847 \
  -e LLM_PROVIDER=azure-openai-identity \
  -e AZURE_OPENAI_ENDPOINT=https://your-openai.cognitiveservices.azure.com/ \
  -e AZURE_OPENAI_DEPLOYMENT=your-deployment-name \
  -e AZURE_OPENAI_API_VERSION=2024-12-01-preview \
  -e LLM_MODEL=gpt-5.1 \
  -v ~/.azure:/root/.azure:ro \
  crkassistprodeus2001.azurecr.io/kusto-assistant-backend:latest
```

**PowerShell (Windows):**
```powershell
docker run -d -p 3847:3847 `
  -e LLM_PROVIDER=azure-openai-identity `
  -e AZURE_OPENAI_ENDPOINT=https://your-openai.cognitiveservices.azure.com/ `
  -e AZURE_OPENAI_DEPLOYMENT=your-deployment-name `
  -e AZURE_OPENAI_API_VERSION=2024-12-01-preview `
  -e LLM_MODEL=gpt-5.1 `
  -v $env:USERPROFILE\.azure:/root/.azure:ro `
  crkassistprodeus2001.azurecr.io/kusto-assistant-backend:latest
```

### Azure OpenAI with API Key

**Bash/macOS/Linux:**
```bash
docker run -d -p 3847:3847 \
  -e LLM_PROVIDER=azure-openai-key \
  -e AZURE_OPENAI_ENDPOINT=https://your-openai.cognitiveservices.azure.com/ \
  -e AZURE_OPENAI_DEPLOYMENT=your-deployment-name \
  -e AZURE_OPENAI_API_KEY=your-api-key \
  -e AZURE_OPENAI_API_VERSION=2024-12-01-preview \
  -e LLM_MODEL=gpt-5.1 \
  -v ~/.azure:/root/.azure:ro \
  crkassistprodeus2001.azurecr.io/kusto-assistant-backend:latest
```

**PowerShell (Windows):**
```powershell
docker run -d -p 3847:3847 `
  -e LLM_PROVIDER=azure-openai-key `
  -e AZURE_OPENAI_ENDPOINT=https://your-openai.cognitiveservices.azure.com/ `
  -e AZURE_OPENAI_DEPLOYMENT=your-deployment-name `
  -e AZURE_OPENAI_API_KEY=your-api-key `
  -e AZURE_OPENAI_API_VERSION=2024-12-01-preview `
  -e LLM_MODEL=gpt-5.1 `
  -v $env:USERPROFILE\.azure:/root/.azure:ro `
  crkassistprodeus2001.azurecr.io/kusto-assistant-backend:latest
```

### OpenAI API

**Bash/macOS/Linux:**
```bash
docker run -d -p 3847:3847 \
  -e LLM_PROVIDER=openai \
  -e OPENAI_API_KEY=your-openai-api-key \
  -e LLM_MODEL=gpt-5.1 \
  -v ~/.azure:/root/.azure:ro \
  crkassistprodeus2001.azurecr.io/kusto-assistant-backend:latest
```

**PowerShell (Windows):**
```powershell
docker run -d -p 3847:3847 `
  -e LLM_PROVIDER=openai `
  -e OPENAI_API_KEY=your-openai-api-key `
  -e LLM_MODEL=gpt-5.1 `
  -v $env:USERPROFILE\.azure:/root/.azure:ro `
  crkassistprodeus2001.azurecr.io/kusto-assistant-backend:latest
```

> **Note:** The `-v ~/.azure:/root/.azure:ro` (or `$env:USERPROFILE\.azure` on Windows) mount is required for all providers to allow access to your Kusto clusters.

## Health Check

Verify the backend is running:

```bash
curl http://localhost:3847/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "details": {
      "memory_heap": { "status": "up" },
      "memory_rss": { "status": "up" },
      "storage": { "status": "up" },
      "llm": {
        "status": "up",
        "provider": "azure-openai",
        "model": "gpt-5.1"
      }
    }
  }
}
```

## Troubleshooting

### Cannot connect to Kusto cluster

Make sure you've run `az login` before starting the container:

```bash
az login
docker restart <container-id>
```

### Extension not connecting to backend

1. Check the backend is running: `curl http://localhost:3847/api/v1/health`
2. Click the extension icon and verify the status shows "Healthy"
3. Make sure port 3847 is not blocked

### LLM errors

- Verify your Azure OpenAI endpoint and deployment name are correct
- Check your API key or managed identity has access to the Azure OpenAI resource
- Ensure the model deployment is active in Azure

## Development

### Run locally without Docker

```bash
cd backend
npm install
npm run start:dev
```

### Build the extension

```bash
cd kusto-chrome-extension
npm install
npm run build
```

## License

MIT
