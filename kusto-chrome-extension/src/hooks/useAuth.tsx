import { useState, useEffect, useCallback } from 'react'
import type { IAuthState } from '../types/auth.types'
import {
  login as authLogin,
  logout as authLogout,
  getStoredAuthState,
  onAuthStateChange,
} from '../auth'

interface IUseAuthResult {
  authState: IAuthState
  isLoading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuth = (): IUseAuthResult => {
  const [authState, setAuthState] = useState<IAuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    expiresAt: null,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const state = await getStoredAuthState()
        setAuthState(state)
      } finally {
        setIsLoading(false)
      }
    }

    loadAuthState()

    const unsubscribe = onAuthStateChange((state) => {
      setAuthState(state)
    })

    return unsubscribe
  }, [])

  const login = useCallback(async () => {
    setIsLoading(true)
    try {
      const state = await authLogin()
      setAuthState(state)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await authLogout()
      setAuthState({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        expiresAt: null,
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    authState,
    isLoading,
    login,
    logout,
  }
}
