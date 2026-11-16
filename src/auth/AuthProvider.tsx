import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getMe, logout as apiLogout, type AuthUser } from '../services/kihabbo'
import { AuthContext, type AuthContextValue } from './authContext'

/**
 * Sessão do usuário (login pela missão do Habbo, igual ao kihabbo.com.br).
 * A sessão é um cookie HttpOnly da API; aqui só consultamos quem está logado.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ status: AuthContextValue['status']; user: AuthUser | null }>({
    status: 'loading',
    user: null,
  })

  const refresh = useCallback(async () => {
    try {
      const user = await getMe()
      setState({ status: user ? 'user' : 'guest', user })
      return user
    } catch {
      // API fora do ar: segue como visitante
      setState({ status: 'guest', user: null })
      return null
    }
  }, [])

  useEffect(() => {
    let alive = true
    getMe()
      .then((user) => alive && setState({ status: user ? 'user' : 'guest', user }))
      .catch(() => alive && setState({ status: 'guest', user: null }))
    return () => {
      alive = false
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } finally {
      setState({ status: 'guest', user: null })
    }
  }, [])

  const value = useMemo(() => ({ ...state, refresh, logout }), [state, refresh, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
