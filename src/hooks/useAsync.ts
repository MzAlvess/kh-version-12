import { useCallback, useEffect, useRef, useState } from 'react'

interface AsyncState<T> {
  key: string | null
  data?: T
  error?: Error
}

/**
 * Carrega dados assíncronos identificados por `key` (null = não carregar).
 * Mudou a key → cancela a requisição anterior e busca de novo.
 * `previous` mantém o último resultado para não "piscar" durante a troca de página.
 */
export function useAsync<T>(key: string | null, loader: (signal: AbortSignal) => Promise<T>) {
  const [nonce, setNonce] = useState(0)
  const fullKey = key === null ? null : `${key}#${nonce}`
  const [state, setState] = useState<AsyncState<T>>({ key: null })

  const loaderRef = useRef(loader)
  useEffect(() => {
    loaderRef.current = loader
  })

  useEffect(() => {
    if (fullKey === null) return
    const ctrl = new AbortController()
    loaderRef.current(ctrl.signal).then(
      (data) => setState({ key: fullKey, data }),
      (error: Error) => {
        if (!ctrl.signal.aborted) setState({ key: fullKey, error })
      },
    )
    return () => ctrl.abort()
  }, [fullKey])

  const current = state.key === fullKey
  const reload = useCallback(() => setNonce((n) => n + 1), [])

  return {
    data: current ? state.data : undefined,
    error: current ? state.error : undefined,
    loading: fullKey !== null && !current,
    previous: state.data,
    reload,
  }
}
