import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import styles from './RouteTransition.module.css'

/**
 * Transição entre páginas: um véu translúcido com o cubo da Kihabbo pulsando cobre o site
 * (que continua visível por trás) e some em ~0,8s. A rádio segue tocando.
 * Tudo em CSS: o `key` com o caminho recria o véu a cada troca de página.
 * `hold` (ex.: sessão ainda carregando na 1ª abertura) segura o véu até liberar.
 */
export function RouteTransition({ children, hold }: { children: ReactNode; hold?: boolean }) {
  const { pathname } = useLocation()

  return (
    <div className={styles.stage}>
      {children}
      <div key={`veil-${pathname}`} className={`${styles.veil} ${hold ? styles.holding : ''}`} aria-hidden="true">
        <img src="/assets/menu/kihabbo.png" alt="" width={40} height={42} className={`${styles.cube} pixel`} />
      </div>
    </div>
  )
}
