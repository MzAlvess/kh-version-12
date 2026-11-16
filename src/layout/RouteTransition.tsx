import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import styles from './RouteTransition.module.css'

/**
 * Transição entre páginas: um véu com o cubo da Kihabbo pulsando cobre só a área do conteúdo
 * (header e rádio ficam parados) e some em ~0,7s, enquanto a página nova entra com fade.
 * Tudo em CSS: o `key` com o caminho recria o véu a cada troca de página.
 * `hold` (ex.: sessão ainda carregando na 1ª abertura) segura o véu até liberar.
 */
export function RouteTransition({ children, hold }: { children: ReactNode; hold?: boolean }) {
  const { pathname } = useLocation()

  return (
    <div className={styles.stage}>
      <div key={`page-${pathname}`} className={`${styles.page} ${hold ? styles.waiting : ''}`}>
        {children}
      </div>
      <div key={`veil-${pathname}`} className={`${styles.veil} ${hold ? styles.holding : ''}`} aria-hidden="true">
        <img src="/assets/menu/kihabbo.png" alt="" width={40} height={42} className={`${styles.cube} pixel`} />
      </div>
    </div>
  )
}
