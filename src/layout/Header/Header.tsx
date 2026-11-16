import { Link } from 'react-router-dom'
import { CloudLayer } from './CloudLayer'
import { MenuBar } from './MenuBar'
import styles from './Header.module.css'

export interface HeaderUser {
  nick: string
  fichas: number
  /** URL do avatar; se omitido usa o habbo-imaging com o nick */
  avatarUrl?: string
}

interface HeaderProps {
  user: HeaderUser
  onOpenMenu?: () => void
}

export function Header({ user, onOpenMenu }: HeaderProps) {
  return (
    <header className={styles.header}>
      <CloudLayer />

      <div className={`container ${styles.top}`}>
        <Link to="/" className={styles.logo} aria-label="Kihabbo - página inicial">
          <img src="/assets/logo.png" alt="Kihabbo" width={270} height={77} />
        </Link>

        <div className={styles.right}>
          <img src="/assets/key.png" alt="" width={43} height={45} className={`${styles.key} pixel`} />
          <a href="/fichas" className={styles.pill} aria-label={`${user.fichas} fichas`}>
            <span className={styles.coin}>F</span>
            <span className={styles.amount}>
              <strong>{user.fichas.toLocaleString('pt-BR')}</strong> fichas
            </span>
          </a>
          <button type="button" className={styles.menuBtn} onClick={onOpenMenu} aria-label="Abrir menu">
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <MenuBar user={user} />
    </header>
  )
}
