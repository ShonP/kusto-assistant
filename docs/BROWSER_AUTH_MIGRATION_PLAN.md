# Browser-Based Authentication Migration Plan

## Overview

This document outlines the steps to migrate Kusto Assistant from machine-based credentials (`DefaultAzureCredential` via `az login`) to browser-based authentication using MSAL (Microsoft Authentication Library). This enables stateless authentication where users authenticate directly in the browser, and their tokens are passed to the backend.

## Current State

- **Backend**: Uses `DefaultAzureCredential` which reads tokens from mounted `~/.azure` folder
- **Chrome Extension**: No authentication, relies on backend having credentials
- **MCP Server (fabric-rti-mcp)**: Uses `DefaultAzureCredential`

## Target State

- **Chrome Extension**: Authenticates users via MSAL popup, acquires tokens for Azure OpenAI and Kusto
- **Backend**: Accepts Bearer tokens from requests, uses them for Azure OpenAI calls
- **MCP Server**: Accepts Bearer tokens via HTTP mode, uses OBO flow for Kusto access

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              User's Browser                              │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Chrome Extension                              │   │
│  │  ┌─────────────┐    ┌──────────────┐    ┌──────────────────┐   │   │
│  │  │   MSAL.js   │───▶│ Token Cache  │───▶│ API Calls with   │   │   │
│  │  │  (Popup)    │    │ (localStorage)│    │ Bearer Token     │   │   │
│  │  └─────────────┘    └──────────────┘    └──────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Authorization: Bearer <token>
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Backend (NestJS)                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────────┐    ┌────────────────────┐    │
│  │ Auth Guard   │───▶│ Token Validation │───▶│ Azure OpenAI Call  │    │
│  │ (Extract JWT)│    │ (Optional)       │    │ (with user token)  │    │
│  └──────────────┘    └──────────────────┘    └────────────────────┘    │
│                                                        │                │
│                                                        ▼                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    MCP Client (HTTP Mode)                        │   │
│  │                    Authorization: Bearer <token>                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    fabric-rti-mcp (HTTP Mode)                           │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────────┐    ┌────────────────────┐    │
│  │ Extract Token│───▶│ OBO Flow         │───▶│ Kusto Query        │    │
│  │ from Header  │    │ (Token Exchange) │    │ (with Kusto token) │    │
│  └──────────────┘    └──────────────────┘    └────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Azure AD App Registration (Manual Steps)

### Step 1.1: Create the App Registration

1. Go to [Azure Portal → App registrations](https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps)
2. Click **New registration**
3. Configure:
   - **Name**: `Kusto Assistant`
   - **Supported account types**: Select **"Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant)"**
     > This allows users from any Azure AD tenant to sign in
   - **Redirect URI**: Leave empty for now (we'll add after getting extension ID)
4. Click **Register**
5. Note down:
   - **Application (client) ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - **Directory (tenant) ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (this is the "home" tenant where the app is registered)

### Step 1.2: Configure Authentication

1. Go to **Authentication** in your app registration
2. Click **Add a platform** → **Single-page application**
3. Add Redirect URIs:
   ```
   https://<extension-id>.chromiumapp.org/
   http://localhost:3000/auth/callback  (for local dev)
   ```
   > Note: You'll get the extension ID after loading the unpacked extension. Update this URI later.

4. Under **Implicit grant and hybrid flows**:
   - ☑️ Access tokens
   - ☑️ ID tokens

5. Under **Advanced settings**:
   - Allow public client flows: **Yes** (required for Chrome extension)

6. Click **Save**

### Step 1.3: Configure API Permissions

1. Go to **API permissions** → **Add a permission**

2. Add **Azure Cognitive Services** (for Azure OpenAI):
   - Microsoft APIs → Azure Cognitive Services
   - Delegated permissions → `user_impersonation`

3. Add **Azure Data Explorer** (for Kusto):
   - Microsoft APIs → Azure Data Explorer
   - Delegated permissions → `user_impersonation`

4. Add **Microsoft Graph** (for user info):
   - Microsoft APIs → Microsoft Graph
   - Delegated permissions → `openid`, `profile`, `email`, `User.Read`

5. **Admin Consent (Optional)**:
   - Click **Grant admin consent for [Your Org]** if you want to pre-approve for all users in your tenant
   - **If you skip this step**: Users will be prompted to consent individually when they first sign in
   - All the permissions above support **user consent**, so admin consent is not required
   
   > **Note for Multi-tenant**: Each tenant's users will consent on first login. Their tenant admin can optionally grant admin consent for their organization.

### Step 1.4: Configure Token Claims (Optional but Recommended)

1. Go to **Token configuration** → **Add optional claim**
2. Select **Access token**
3. Add claims:
   - `email`
   - `preferred_username`
   - `upn`

### Step 1.5: Expose an API (For OBO Flow with MCP)

1. Go to **Expose an API**
2. Click **Set** next to Application ID URI
3. Accept the default: `api://<client-id>` or customize
4. Click **Add a scope**:
   - Scope name: `access_as_user`
   - Who can consent: Admins and users
   - Admin consent display name: "Access Kusto Assistant"
   - Admin consent description: "Allows the app to access Kusto Assistant on behalf of the signed-in user"
   - User consent display name: "Access Kusto Assistant"
   - User consent description: "Allows the app to access Kusto Assistant on your behalf"
   - State: Enabled
5. Click **Add scope**

### Step 1.6: Configure Federated Credentials (For OBO in MCP Server)

If deploying MCP server to Azure (e.g., Azure Functions, Container Apps):

1. Go to **Certificates & secrets** → **Federated credentials**
2. Click **Add credential**
3. Select **Federated identity credential**:
   - For Azure Functions with User-Assigned Managed Identity:
     - Federated credential scenario: **Customer Managed Keys**
     - Issuer: `https://login.microsoftonline.com/<tenant-id>/v2.0`
     - Subject: The client ID of your User-Assigned Managed Identity
4. Click **Add**

---

## Phase 2: Chrome Extension Updates

### Step 2.1: Install MSAL Package

```bash
cd kusto-chrome-extension
npm install @azure/msal-browser
```

### Step 2.2: Create Auth Configuration

Create `src/auth/authConfig.ts`:

```typescript
import {
  PublicClientApplication,
  Configuration,
  AccountInfo,
  AuthenticationResult,
} from '@azure/msal-browser';

interface IAuthConfig {
  clientId: string;
}

const config: IAuthConfig = {
  clientId: '<YOUR_CLIENT_ID>',  // From Step 1.1
};

const msalConfig: Configuration = {
  auth: {
    clientId: config.clientId,
    // Use 'common' for multi-tenant - allows any Azure AD user to sign in
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: typeof chrome !== 'undefined' && chrome.runtime
      ? `https://${chrome.runtime.id}.chromiumapp.org/`
      : 'http://localhost:3000/auth/callback',
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL
export const initializeMsal = async (): Promise<void> => {
  await msalInstance.initialize();
};

// Login with popup
export const login = async (): Promise<AccountInfo | null> => {
  try {
    const response = await msalInstance.loginPopup({
      scopes: ['openid', 'profile', 'email'],
    });
    return response.account;
  } catch (error) {
    console.error('Login failed:', error);
    return null;
  }
};

// Logout
export const logout = async (): Promise<void> => {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    await msalInstance.logoutPopup({
      account: accounts[0],
    });
  }
};

// Get current account
export const getAccount = (): AccountInfo | null => {
  const accounts = msalInstance.getAllAccounts();
  return accounts.length > 0 ? accounts[0] : null;
};

// Get access token for a specific resource
export const getAccessToken = async (args: {
  resource: string;
}): Promise<string> => {
  const { resource } = args;
  const accounts = msalInstance.getAllAccounts();

  if (accounts.length === 0) {
    // No account, need to login first
    const loginResponse = await msalInstance.loginPopup({
      scopes: [`${resource}/.default`],
    });
    return loginResponse.accessToken;
  }

  try {
    // Try silent token acquisition first
    const response = await msalInstance.acquireTokenSilent({
      scopes: [`${resource}/.default`],
      account: accounts[0],
    });
    return response.accessToken;
  } catch (error) {
    // Silent acquisition failed, try popup
    const response = await msalInstance.acquireTokenPopup({
      scopes: [`${resource}/.default`],
      account: accounts[0],
    });
    return response.accessToken;
  }
};

// Resource URIs
export const RESOURCES = {
  COGNITIVE_SERVICES: 'https://cognitiveservices.azure.com',
  KUSTO: 'https://kusto.kusto.windows.net',
  GRAPH: 'https://graph.microsoft.com',
} as const;
```

### Step 2.3: Create Auth Hook

Create `src/hooks/useAuth.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { AccountInfo } from '@azure/msal-browser';
import {
  initializeMsal,
  login as msalLogin,
  logout as msalLogout,
  getAccount,
  getAccessToken,
  RESOURCES,
} from '../auth/authConfig';

interface IUseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  account: AccountInfo | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: (args: { resource: string }) => Promise<string>;
}

export const useAuth = (): IUseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState<AccountInfo | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeMsal();
        const currentAccount = getAccount();
        setAccount(currentAccount);
        setIsAuthenticated(!!currentAccount);
      } catch (error) {
        console.error('MSAL initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const login = useCallback(async () => {
    setIsLoading(true);
    try {
      const acc = await msalLogin();
      setAccount(acc);
      setIsAuthenticated(!!acc);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await msalLogout();
      setAccount(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getToken = useCallback(async (args: { resource: string }): Promise<string> => {
    return getAccessToken(args);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    account,
    login,
    logout,
    getToken,
  };
};
```

### Step 2.4: Update API Calls

Update `src/content/api.ts` to include Bearer token:

```typescript
import { getAccessToken, RESOURCES } from '../auth/authConfig';

interface IAskAgentParams {
  message: string;
  clusterName: string;
  databaseName: string;
}

export const askAgent = async (params: IAskAgentParams): Promise<Response> => {
  const { message, clusterName, databaseName } = params;

  // Get token for Cognitive Services (Azure OpenAI)
  const token = await getAccessToken({ resource: RESOURCES.COGNITIVE_SERVICES });

  const response = await fetch('http://localhost:3847/api/v1/agent/ask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ message, clusterName, databaseName }),
  });

  return response;
};
```

### Step 2.5: Update Manifest

Update `manifest.json`:

```json
{
  "manifest_version": 3,
  "name": "Kusto Assistant",
  "version": "1.0.0",
  "permissions": [
    "storage",
    "identity"
  ],
  "host_permissions": [
    "http://localhost:3847/*",
    "https://*.kusto.windows.net/*"
  ],
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  },
  "web_accessible_resources": [
    {
      "resources": ["*.html"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

### Step 2.6: Add Login UI to Popup

Update `src/components/Settings/Settings.tsx` to include auth:

```typescript
import { FC } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User } from 'lucide-react';

export const Settings: FC = () => {
  const { isAuthenticated, isLoading, account, login, logout } = useAuth();

  return (
    <div>
      <h3>Authentication</h3>
      
      {isLoading ? (
        <p>Loading...</p>
      ) : isAuthenticated ? (
        <div>
          <div className="flex items-center gap-2">
            <User size={16} />
            <span>{account?.username}</span>
          </div>
          <Button onClick={logout} variant="outline">
            <LogOut size={16} />
            Sign Out
          </Button>
        </div>
      ) : (
        <Button onClick={login}>
          <LogIn size={16} />
          Sign In with Microsoft
        </Button>
      )}
    </div>
  );
};
```

---

## Phase 3: Backend Updates

### Step 3.1: Create Auth Guard

Create `src/common/guards/bearer-token.guard.ts`:

```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class BearerTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.substring(7);
    if (!token) {
      throw new UnauthorizedException('Empty token');
    }

    // Attach token to request for later use
    (request as Request & { userToken: string }).userToken = token;
    return true;
  }
}
```

### Step 3.2: Create Token Decorator

Create `src/common/decorators/user-token.decorator.ts`:

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const UserToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request & { userToken?: string }>();
    return request.userToken;
  },
);
```

### Step 3.3: Update Agent Controller

Update `src/agent/controllers/agent.controller.ts`:

```typescript
import { Controller, Post, Body, Res, UseGuards, Headers } from '@nestjs/common';
import { BearerTokenGuard } from '../../common/guards/bearer-token.guard';
import { UserToken } from '../../common/decorators/user-token.decorator';
// ... other imports

@ApiTags('Agent')
@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('ask')
  @UseGuards(BearerTokenGuard)
  @ApiOperation({ summary: 'Ask the KQL autocomplete agent' })
  async ask(
    @Body() body: AskAgentDto,
    @Res() res: Response,
    @UserToken() userToken: string,
  ): Promise<void> {
    const { message, clusterName, databaseName } = body;

    const kustoContext: KustoContext = {
      clusterUri: buildClusterUri(clusterName),
      databaseName,
    };

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    try {
      for await (const event of this.agentService.runAgent(
        message,
        kustoContext,
        userToken,  // Pass token to service
      )) {
        const sseData = `data: ${JSON.stringify(event)}\n\n`;
        res.write(sseData);
      }
    } catch (error) {
      // ... error handling
    } finally {
      res.end();
    }
  }
}
```

### Step 3.4: Update Agent Service

Update `src/agent/services/agent.service.ts` to use user token:

```typescript
import { AzureOpenAI } from 'openai';

@Injectable()
export class AgentService {
  private createOpenAIClient(args: { userToken?: string }): AzureOpenAI {
    const { userToken } = args;

    if (userToken) {
      // Use user's token directly
      return new AzureOpenAI({
        endpoint: this.configService.get('AZURE_OPENAI_ENDPOINT'),
        apiVersion: this.configService.get('AZURE_OPENAI_API_VERSION'),
        azureADTokenProvider: async () => userToken,
      });
    }

    // Fallback to DefaultAzureCredential (for backward compatibility)
    return new AzureOpenAI({
      endpoint: this.configService.get('AZURE_OPENAI_ENDPOINT'),
      apiVersion: this.configService.get('AZURE_OPENAI_API_VERSION'),
      // ... existing credential provider
    });
  }

  async *runAgent(
    message: string,
    kustoContext: KustoContext,
    userToken?: string,
  ): AsyncGenerator<AgentEvent> {
    const client = this.createOpenAIClient({ userToken });
    // ... rest of the method
  }
}
```

---

## Phase 4: MCP Server Updates (fabric-rti-mcp)

The fabric-rti-mcp server already supports HTTP mode and OBO flow. You need to:

### Step 4.1: Deploy MCP Server in HTTP Mode

Set environment variables:

```bash
FABRIC_RTI_TRANSPORT=http
FABRIC_RTI_HTTP_HOST=0.0.0.0
FABRIC_RTI_HTTP_PORT=3001
FABRIC_RTI_HTTP_PATH=/mcp
FABRIC_RTI_STATELESS_HTTP=true
```

### Step 4.2: Enable OBO Flow

Set environment variables for OBO:

```bash
USE_OBO_FLOW=true
FABRIC_RTI_MCP_AZURE_TENANT_ID=<your-tenant-id>
FABRIC_RTI_MCP_ENTRA_APP_CLIENT_ID=<your-client-id>
```

### Step 4.3: Update Backend MCP Client

Update `src/agent/services/mcp-client.service.ts` to pass token:

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

@Injectable()
export class McpClientService {
  async createClient(args: { userToken: string }): Promise<Client> {
    const { userToken } = args;

    const transport = new StreamableHTTPClientTransport(
      new URL('http://localhost:3001/mcp'),
      {
        requestInit: {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
        },
      },
    );

    const client = new Client({
      name: 'kusto-assistant',
      version: '1.0.0',
    });

    await client.connect(transport);
    return client;
  }
}
```

---

## Phase 5: Testing & Validation

### Step 5.1: Get Extension ID

1. Load the unpacked extension in Chrome (`chrome://extensions`)
2. Note the **Extension ID** (32 characters)
3. Update Azure AD App Registration with correct Redirect URI:
   ```
   https://<extension-id>.chromiumapp.org/
   ```

### Step 5.2: Test Authentication Flow

1. Open the extension popup
2. Click "Sign In with Microsoft"
3. Complete the login in the popup window
4. Verify you see your username in Settings

### Step 5.3: Test API Calls

1. Open Azure Data Explorer in a tab
2. Write a comment with a query request
3. Press Alt+K / Cmd+K
4. Verify the query is generated (check browser console for token usage)

### Step 5.4: Test Token Refresh

1. Wait for token to expire (typically 1 hour)
2. Make another query request
3. Verify silent token refresh works (or popup appears if needed)

---

## Summary Checklist

### Azure Portal (Manual)
- [ ] Create App Registration (SPA)
- [ ] Note Client ID and Tenant ID
- [ ] Add Redirect URI after getting Extension ID
- [ ] Enable "Allow public client flows"
- [ ] Add API permissions (Cognitive Services, Azure Data Explorer, Graph)
- [ ] Grant admin consent
- [ ] Expose an API with `access_as_user` scope
- [ ] Configure Federated Credentials (if using OBO with managed identity)

### Chrome Extension (Code)
- [ ] Install `@azure/msal-browser`
- [ ] Create `authConfig.ts` with client ID and tenant ID
- [ ] Create `useAuth` hook
- [ ] Update API calls to include Bearer token
- [ ] Update `manifest.json` with permissions
- [ ] Add login/logout UI to Settings

### Backend (Code)
- [ ] Create `BearerTokenGuard`
- [ ] Create `UserToken` decorator
- [ ] Update `AgentController` to accept token
- [ ] Update `AgentService` to use token for Azure OpenAI

### MCP Server
- [ ] Deploy in HTTP mode
- [ ] Configure OBO flow environment variables
- [ ] Update backend MCP client to pass token

### Testing
- [ ] Load extension and get Extension ID
- [ ] Update Redirect URI in Azure Portal
- [ ] Test login flow
- [ ] Test API calls with token
- [ ] Test token refresh

---

## Environment Variables Reference

### Chrome Extension (build-time)
```
VITE_AZURE_CLIENT_ID=<your-client-id>
# No tenant ID needed - using 'common' authority for multi-tenant
```

### Backend
```
# Existing
AZURE_OPENAI_ENDPOINT=https://your-openai.cognitiveservices.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-5.1
AZURE_OPENAI_API_VERSION=2024-12-01-preview
LLM_MODEL=gpt-5.1

# New (optional - for backward compatibility)
REQUIRE_AUTH=true  # Set to false to allow anonymous access
```

### MCP Server (fabric-rti-mcp)
```
FABRIC_RTI_TRANSPORT=http
FABRIC_RTI_HTTP_HOST=0.0.0.0
FABRIC_RTI_HTTP_PORT=3001
FABRIC_RTI_HTTP_PATH=/mcp
FABRIC_RTI_STATELESS_HTTP=true
USE_OBO_FLOW=true
FABRIC_RTI_MCP_AZURE_TENANT_ID=<your-tenant-id>
FABRIC_RTI_MCP_ENTRA_APP_CLIENT_ID=<your-client-id>
```

---

## Security Considerations

1. **Token Storage**: Tokens are stored in `localStorage` via MSAL. Consider using `sessionStorage` for higher security.

2. **Token Validation**: The backend should validate tokens if exposed publicly. Use `@azure/identity` or JWT libraries.

3. **CORS**: Ensure proper CORS configuration in production.

4. **Scope Minimization**: Request only the scopes needed for each operation.

5. **Token Lifetime**: Access tokens expire after ~1 hour. MSAL handles refresh automatically.

6. **Admin Consent**: Some permissions require admin consent. Coordinate with your Azure AD admin.
