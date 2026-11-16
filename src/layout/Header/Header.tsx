import { Link } from 'react-router-dom'
import { useModal } from '../../modals/modalContext'
import { CloudLayer } from './CloudLayer'
import { MenuBar } from './MenuBar'
import styles from './Header.module.css'

export interface HeaderUser {
  nick: string
  /** saldo de fichas; null quando a API não informa */
  fichas: number | null
  /** nick usado no habbo-imaging para o avatar (padrão: nick) */
  avatarNick?: string
}

interface HeaderProps {
  /** null = visitante */
  user: HeaderUser | null
  /** consultando a sessão: não mostra "Entrar" nem fichas para não piscar */
  authLoading?: boolean
  onOpenMenu?: () => void
}

export function Header({ user, authLoading, onOpenMenu }: HeaderProps) {
  const { openModal } = useModal()

  return (
    <header className={styles.header}>
      <CloudLayer />

      <div className={`container ${styles.top}`}>
        <Link to="/" className={styles.logo} aria-label="Kihabbo - página inicial">
          <img src="/assets/logo.png" alt="Kihabbo" width={270} height={77} />
        </Link>

        <div className={styles.right}>
          {!authLoading && (user ? user.fichas !== null : true) && (
            <img src="/assets/key.png" alt="" width={43} height={45} className={`${styles.key} pixel`} />
          )}

          {!authLoading && user && user.fichas !== null && (
            <button
              type="button"
              className={styles.pill}
              onClick={() => openModal('gerar-fichas')}
              aria-label={`${user.fichas} fichas`}
            >
              <span className={styles.coin}>F</span>
              <span className={styles.amount}>
                <strong>{user.fichas.toLocaleString('pt-BR')}</strong> fichas
              </span>
            </button>
          )}

          {!authLoading && !user && (
            <button type="button" className={`${styles.pill} ${styles.loginPill}`} onClick={() => openModal('entrar')}>
              <span className={styles.amount}>
                <strong>Entrar</strong>
              </span>
            </button>
          )}

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
