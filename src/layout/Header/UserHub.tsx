import { IsoTile } from '../../components/IsoTile/IsoTile'
import { useModal } from '../../modals/modalContext'
import { avatarUrl } from '../../services/habbo'
import { DEFAULT_FIGURE } from '../../features/HabboImager/figure'
import { guestLinksLeft, guestLinksRight, habboAvatar, userLinksLeft, userLinksRight, type UserLink } from './menu'
import type { HeaderUser } from './Header'
import styles from './UserHub.module.css'

function LinkGroup({ links, side }: { links: UserLink[]; side: 'left' | 'right' }) {
  const { openModal } = useModal()
  return (
    <ul className={`${styles.panel} ${styles[side]}`}>
      {links.map((l) => (
        <li key={l.id}>
          {l.modal ? (
            <button
              type="button"
              className={`${styles.link} ${styles[l.color]}`}
              onClick={() => openModal(l.modal!)}
              aria-haspopup="dialog"
            >
              {l.label}
            </button>
          ) : (
            <a href={l.href} onClick={l.onClick} className={`${styles.link} ${styles[l.color]}`}>
              {l.label}
            </a>
          )}
        </li>
      ))}
    </ul>
  )
}

/** user = null: visitante (botões Entrar / Enquetes) */
export function UserHub({ user }: { user: HeaderUser | null }) {
  return (
    <div className={styles.hub}>
      <div className={styles.bubble}>
        Bem-vindo, <strong>{user ? user.nick : 'visitante'}!</strong>
      </div>

      <div className={styles.platform}>
        <IsoTile width={300} thickness={16} className={styles.platformTile} />
        <span className={`${styles.ring} ${styles.r1}`} />
        <span className={`${styles.ring} ${styles.r2}`} />
        <span className={`${styles.ring} ${styles.r3}`} />
        <img
          src={user ? habboAvatar(user.avatarNick ?? user.nick) : avatarUrl({ figure: DEFAULT_FIGURE, direction: 4, size: 'm' })}
          alt={user ? `Avatar de ${user.nick}` : ''}
          width={64}
          height={110}
          className={`${styles.avatar} pixel`}
        />
      </div>

      <LinkGroup links={user ? userLinksLeft : guestLinksLeft} side="left" />
      <LinkGroup links={user ? userLinksRight : guestLinksRight} side="right" />
    </div>
  )
}
