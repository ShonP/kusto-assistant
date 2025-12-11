export interface IUser {
  id: string
  email: string
  name: string
  username: string
}

export interface IAuthState {
  isAuthenticated: boolean
  user: IUser | null
  accessToken: string | null
  expiresAt: number | null
}

export interface IStoredAuthState {
  user: IUser | null
  accessToken: string | null
  expiresAt: number | null
}
