import { createContext, useContext } from 'react'
import type { AuthUser } from '../services/kihabbo'

export interface AuthContextValue {
  /** 'loading' enquanto consulta /auth/me ao abrir o site */
  status: 'loading' | 'guest' | 'user'
  user: AuthUser | null
  /** consulta /auth/me de novo (após login) */
  refresh: () => Promise<AuthUser | null>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue>({
  status: 'guest',
  user: null,
  refresh: async () => null,
  logout: async () => {},
})

export const useAuth = () => useContext(AuthContext)
