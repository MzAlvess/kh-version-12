import { IsoTile } from '../../components/IsoTile/IsoTile'
import { useModal } from '../../modals/modalContext'
import { habboAvatar, userLinksLeft, userLinksRight, type UserLink } from './menu'
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

export function UserHub({ user }: { user: HeaderUser }) {
  return (
    <div className={styles.hub}>
      <div className={styles.bubble}>
        Bem-vindo, <strong>{user.nick}!</strong>
      </div>

      <div className={styles.platform}>
        <IsoTile width={300} thickness={16} className={styles.platformTile} />
        <span className={`${styles.ring} ${styles.r1}`} />
        <span className={`${styles.ring} ${styles.r2}`} />
        <span className={`${styles.ring} ${styles.r3}`} />
        <img
          src={user.avatarUrl ?? habboAvatar(user.nick)}
          alt={`Avatar de ${user.nick}`}
          width={64}
          height={110}
          className={`${styles.avatar} pixel`}
        />
      </div>

      <LinkGroup links={userLinksLeft} side="left" />
      <LinkGroup links={userLinksRight} side="right" />
    </div>
  )
}
