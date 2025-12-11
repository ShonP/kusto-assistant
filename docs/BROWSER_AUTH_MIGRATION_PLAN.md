# Browser-Based Authentication Migration Plan

## Overview

This document outlines the browser-based authentication implementation for Kusto Assistant using MSAL (Microsoft Authentication Library). Users authenticate directly in the Chrome extension, and their tokens are passed to the backend for Kusto access via OBO (On-Behalf-Of) flow.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Chrome Extension                                 │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────────────────┐   │
│  │   MSAL.js   │───▶│ chrome.storage│───▶│ API Calls with Bearer   │   │
│  │  (Popup)    │    │   (cache)     │    │ Token                    │   │
│  └─────────────┘    └──────────────┘    └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Authorization: Bearer <token>
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Backend (NestJS)                                 │
│  ┌──────────────┐    ┌──────────────────┐    ┌────────────────────┐    │
│  │ BearerToken  │───▶│ Extract Token    │───▶│ Azure OpenAI Call  │    │
│  │ Guard        │    │ @UserToken()     │    │ (DefaultCredential)│    │
│  └──────────────┘    └──────────────────┘    └────────────────────┘    │
│                                                        │                │
│                                                        ▼                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              MCP Client (stdio mode)                             │   │
│  │              Pass access_token in tool args                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    fabric-rti-mcp (stdio mode)                          │
│  ┌──────────────┐    ┌──────────────────┐    ┌────────────────────┐    │
│  │ Extract Token│───▶│ OBO Flow         │───▶│ Kusto Query        │    │
│  │ from args    │    │ (Token Exchange) │    │ (with Kusto token) │    │
│  └──────────────┘    └──────────────────┘    └────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Azure AD App Registration

### Step 1.1: Create the App Registration

1. Go to [Azure Portal → App registrations](https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps)
2. Click **New registration**
3. Configure:
   - **Name**: `Kusto Assistant`
   - **Supported account types**: **"Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant)"**
   - **Redirect URI**: Leave empty (add after getting extension ID)
4. Click **Register**
5. Note down:
   - **Application (client) ID**
   - **Directory (tenant) ID**

### Step 1.2: Configure Authentication

1. Go to **Authentication** → **Add a platform** → **Single-page application**
2. Add Redirect URI: `https://<extension-id>.chromiumapp.org/`
3. Enable:
   - ☑️ Access tokens
   - ☑️ ID tokens
4. Under **Advanced settings**: Allow public client flows: **Yes**
5. Click **Save**

### Step 1.3: Configure API Permissions

1. Go to **API permissions** → **Add a permission**
2. Add **Azure Data Explorer**:
   - Microsoft APIs → Azure Data Explorer → Delegated → `user_impersonation`
3. Add **Microsoft Graph**:
   - Microsoft APIs → Microsoft Graph → Delegated → `openid`, `profile`, `email`, `User.Read`

### Step 1.4: Configure Token Claims (Optional)

1. Go to **Token configuration** → **Add optional claim**
2. Select **Access token** and add: `email`, `preferred_username`, `upn`

### Step 1.5: Expose an API (For OBO Flow)

1. Go to **Expose an API**
2. Set Application ID URI: `api://<client-id>`
3. **Add a scope**:
   - Scope name: `access_as_user`
   - Who can consent: Admins and users
   - Display names: "Access Kusto Assistant"
   - State: Enabled

### Step 1.6: Configure Federated Credentials (For Azure Deployment)

1. Go to **Certificates & secrets** → **Federated credentials**
2. Add credential for User-Assigned Managed Identity:
   - Issuer: `https://login.microsoftonline.com/<tenant-id>/v2.0`
   - Subject: Client ID of the Managed Identity

---

## Phase 2: Chrome Extension

### Files Created

- `src/auth/authConfig.ts` - MSAL configuration with environment variables
- `src/auth/authService.ts` - Login, logout, token management using `chrome.identity`
- `src/hooks/useAuth.tsx` - React hook for auth state
- `src/components/Credentials/` - Login/logout UI component
- `src/components/Tooltip/components/LoginRequiredState/` - Login prompt in tooltip
- `src/env.d.ts` - TypeScript definitions for Vite env variables
- `.env` / `.env.example` - Environment configuration

### Key Implementation Details

- Uses `chrome.identity.launchWebAuthFlow` for login popup
- Stores auth state in `chrome.storage.local` for sharing between popup and content script
- Axios interceptor adds `Authorization: Bearer <token>` to all API requests
- Token refresh handled automatically by re-authenticating when token expires

---

## Phase 3: Backend

### Files Created

- `src/common/guards/bearer-token.guard.ts` - Extracts Bearer token from Authorization header
- `src/common/decorators/user-token.decorator.ts` - `@UserToken()` parameter decorator
- `src/common/decorators/public.decorator.ts` - `@Public()` to skip auth

### Files Modified

- `src/agent/controllers/agent.controller.ts` - Added `@UseGuards(BearerTokenGuard)` and `@UserToken()`
- `src/agent/services/agent.service.ts` - Passes `userToken` to MCP client
- `src/agent/services/mcp-client.service.ts` - Adds `access_token` to tool args when OBO enabled
- `src/agent/config/mcp-servers.config.ts` - Passes OBO env vars to MCP server
- `src/config/configuration.ts` - Added MCP configuration section

---

## Phase 4: MCP Server Configuration

The fabric-rti-mcp server runs in **stdio mode** and handles OBO internally when configured.

### Environment Variables (Backend `.env`)

```bash
# MCP Server Configuration
MCP_USE_OBO_FLOW=true
MCP_SERVER_URL=http://localhost:3001/mcp
MCP_AZURE_TENANT_ID=<your-tenant-id>
MCP_ENTRA_APP_CLIENT_ID=<your-client-id>
MCP_USER_MANAGED_IDENTITY_CLIENT_ID=<managed-identity-client-id>
MCP_FABRIC_API_BASE_URL=https://api.fabric.microsoft.com/v1
```

When `MCP_USE_OBO_FLOW=true`:
- MCP server spawns with OBO configuration env vars
- User token is passed via `access_token` argument in tool calls
- MCP server exchanges token for Kusto token using OBO flow

---

## Summary Checklist

### Azure Portal
- [x] Create App Registration (SPA, multi-tenant)
- [x] Add Redirect URI for Chrome extension
- [x] Enable "Allow public client flows"
- [x] Add API permissions (Azure Data Explorer, Microsoft Graph)
- [x] Expose an API with `access_as_user` scope
- [x] Configure Federated Credentials for managed identity

### Chrome Extension
- [x] Install `@azure/msal-browser`
- [x] Create auth configuration with Vite env variables
- [x] Create auth service with `chrome.identity` login flow
- [x] Create `useAuth` hook
- [x] Add Bearer token to API calls (axios interceptor)
- [x] Update `manifest.json` with `identity` permission
- [x] Add Credentials component with login/logout UI
- [x] Add LoginRequiredState for tooltip

### Backend
- [x] Create `BearerTokenGuard`
- [x] Create `@UserToken()` decorator
- [x] Update `AgentController` to use guard and extract token
- [x] Update `AgentService` to pass token through
- [x] Update `McpClientService` to pass `access_token` in tool args
- [x] Configure MCP env vars in `configuration.ts`

### Testing
- [x] Load extension and get Extension ID
- [x] Update Redirect URI in Azure Portal
- [x] Test login flow
- [x] Test API calls with token
- [x] Test OBO flow with Kusto queries
- [x] Token refresh (handled automatically by MSAL/chrome.identity)

---

## Environment Variables Reference

### Chrome Extension (`.env`)

```bash
VITE_AZURE_CLIENT_ID=<your-client-id>
VITE_AZURE_TENANT_ID=common
VITE_API_BASE_URL=http://localhost:3000
```

### Backend (`.env`)

```bash
# LLM Configuration
LLM_PROVIDER=azure-openai-identity
AZURE_OPENAI_ENDPOINT=https://your-openai.cognitiveservices.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-5.1
AZURE_OPENAI_API_VERSION=2024-12-01-preview
LLM_MODEL=gpt-5.1

# MCP Server Configuration
MCP_USE_OBO_FLOW=true
MCP_SERVER_URL=http://localhost:3001/mcp
MCP_AZURE_TENANT_ID=<your-tenant-id>
MCP_ENTRA_APP_CLIENT_ID=<your-client-id>
MCP_USER_MANAGED_IDENTITY_CLIENT_ID=<managed-identity-client-id>
MCP_FABRIC_API_BASE_URL=https://api.fabric.microsoft.com/v1
```

---

## Security Considerations

1. **Token Storage**: Auth state stored in `chrome.storage.local`, shared between popup and content script
2. **Token Validation**: Backend extracts token but relies on MCP server/Kusto for validation
3. **CORS**: Configured in backend for Chrome extension origins
4. **Scope Minimization**: Only requests `access_as_user` scope for Kusto access
5. **Token Lifetime**: ~1 hour, refresh handled by re-authentication
6. **OBO Flow**: User token exchanged for Kusto token server-side, user never sees Kusto token
