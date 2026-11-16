import type { ReactNode } from 'react'
import styles from './PageGrid.module.css'

/** Grade padrão das páginas: coluna principal (860px) + lateral (310px), igual à home do layout */
export function PageGrid({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <main className={`container ${styles.grid}`} id="conteudo">
      <div className={styles.main}>{children}</div>
      {aside && <aside className={styles.side}>{aside}</aside>}
    </main>
  )
}
