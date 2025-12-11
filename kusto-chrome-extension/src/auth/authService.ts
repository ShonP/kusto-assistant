import {
  PublicClientApplication,
  type AccountInfo,
  type AuthenticationResult,
  InteractionRequiredAuthError,
} from '@azure/msal-browser'
import { msalConfig, loginRequest, AUTH_STORAGE_KEY } from './authConfig'
import type { IUser, IStoredAuthState, IAuthState } from '../types/auth.types'

let msalInstance: PublicClientApplication | null = null

const getMsalInstance = async (): Promise<PublicClientApplication> => {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig)
    await msalInstance.initialize()
  }
  return msalInstance
}

const mapAccountToUser = (account: AccountInfo): IUser => ({
  id: account.localAccountId,
  email: account.username,
  name: account.name ?? account.username,
  username: account.username,
})

const saveAuthState = async (args: { state: IStoredAuthState }): Promise<void> => {
  await chrome.storage.local.set({ [AUTH_STORAGE_KEY]: args.state })
}

const clearAuthState = async (): Promise<void> => {
  await chrome.storage.local.remove(AUTH_STORAGE_KEY)
}

export const getStoredAuthState = async (): Promise<IAuthState> => {
  const result = await chrome.storage.local.get(AUTH_STORAGE_KEY)
  const stored = result[AUTH_STORAGE_KEY] as IStoredAuthState | undefined

  if (!stored || !stored.accessToken || !stored.expiresAt) {
    return {
      isAuthenticated: false,
      user: null,
      accessToken: null,
      expiresAt: null,
    }
  }

  const isExpired = Date.now() > stored.expiresAt
  if (isExpired) {
    await clearAuthState()
    return {
      isAuthenticated: false,
      user: null,
      accessToken: null,
      expiresAt: null,
    }
  }

  return {
    isAuthenticated: true,
    user: stored.user,
    accessToken: stored.accessToken,
    expiresAt: stored.expiresAt,
  }
}

export const login = async (): Promise<IAuthState> => {
  const msal = await getMsalInstance()

  const redirectUri = msalConfig.auth.redirectUri as string

  const authResult = await new Promise<AuthenticationResult>(
    (resolve, reject) => {
      chrome.identity.launchWebAuthFlow(
        {
          url: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${msalConfig.auth.clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(loginRequest.scopes.join(' '))}&prompt=select_account`,
          interactive: true,
        },
        async (responseUrl) => {
          if (chrome.runtime.lastError || !responseUrl) {
            reject(new Error(chrome.runtime.lastError?.message ?? 'Auth failed'))
            return
          }

          const url = new URL(responseUrl)
          const hashParams = new URLSearchParams(url.hash.substring(1))
          const accessToken = hashParams.get('access_token')
          const expiresIn = hashParams.get('expires_in')

          if (!accessToken) {
            reject(new Error('No access token received'))
            return
          }

          try {
            const accounts = msal.getAllAccounts()
            let account = accounts[0]

            if (!account) {
              const tokenParts = accessToken.split('.')
              if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]))
                account = {
                  homeAccountId: payload.oid ?? payload.sub,
                  localAccountId: payload.oid ?? payload.sub,
                  username: payload.preferred_username ?? payload.email ?? '',
                  name: payload.name ?? '',
                  environment: 'login.microsoftonline.com',
                  tenantId: payload.tid ?? '',
                } as AccountInfo
              }
            }

            resolve({
              accessToken,
              account: account!,
              expiresOn: new Date(Date.now() + parseInt(expiresIn ?? '3600') * 1000),
              scopes: loginRequest.scopes,
              tokenType: 'Bearer',
              idToken: '',
              idTokenClaims: {},
              tenantId: account?.tenantId ?? '',
              uniqueId: account?.localAccountId ?? '',
              authority: msalConfig.auth.authority ?? '',
              fromCache: false,
              correlationId: '',
            })
          } catch (error) {
            reject(error)
          }
        }
      )
    }
  )

  const user = mapAccountToUser(authResult.account!)
  const expiresAt = authResult.expiresOn?.getTime() ?? Date.now() + 3600 * 1000

  await saveAuthState({
    state: {
      user,
      accessToken: authResult.accessToken,
      expiresAt,
    },
  })

  return {
    isAuthenticated: true,
    user,
    accessToken: authResult.accessToken,
    expiresAt,
  }
}

export const logout = async (): Promise<void> => {
  await clearAuthState()
  const msal = await getMsalInstance()
  const accounts = msal.getAllAccounts()

  for (const account of accounts) {
    await msal.logoutPopup({ account })
  }
}

export const getAccessToken = async (): Promise<string | null> => {
  const state = await getStoredAuthState()

  if (!state.isAuthenticated || !state.accessToken) {
    return null
  }

  if (state.expiresAt && Date.now() > state.expiresAt - 60000) {
    try {
      const newState = await login()
      return newState.accessToken
    } catch {
      await clearAuthState()
      return null
    }
  }

  return state.accessToken
}

export const onAuthStateChange = (
  callback: (state: IAuthState) => void
): (() => void) => {
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string
  ) => {
    if (areaName === 'local' && AUTH_STORAGE_KEY in changes) {
      getStoredAuthState().then(callback)
    }
  }

  chrome.storage.onChanged.addListener(listener)

  return () => {
    chrome.storage.onChanged.removeListener(listener)
  }
}
