import type { SyntheticEvent } from 'react'

/** onError de <img>: troca para a imagem reserva uma única vez (evita loop se ela também falhar) */
export const swapToFallback = (fallback?: string) => (e: SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget
  if (fallback && img.dataset.fallback !== '1') {
    img.dataset.fallback = '1'
    img.src = fallback
  }
}
