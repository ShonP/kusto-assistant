import { Configuration, LogLevel } from '@azure/msal-browser'

const CLIENT_ID = import.meta.env.VITE_AZURE_CLIENT_ID || ''
const TENANT_ID = import.meta.env.VITE_AZURE_TENANT_ID || 'common'

const getRedirectUri = (): string => {
  if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
    return `https://${chrome.runtime.id}.chromiumapp.org/`
  }
  return 'http://localhost:3000/auth/callback'
}

export const msalConfig: Configuration = {
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: getRedirectUri(),
    postLogoutRedirectUri: getRedirectUri(),
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message) => {
        if (level === LogLevel.Error) {
          console.error('[MSAL]', message)
        }
      },
      logLevel: LogLevel.Error,
    },
  },
}

export const loginRequest = {
  scopes: [
    `api://${CLIENT_ID}/access_as_user`,
  ],
}

export const AUTH_STORAGE_KEY = 'kusto_assistant_auth'
